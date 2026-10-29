from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import io
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

import bcrypt
import jwt
import requests
from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, UploadFile, File
from fastapi.responses import Response as RawResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

JWT_ALGORITHM = "HS256"

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "neti-balkan-baeckerei"
storage_key = None


def init_storage(force: bool = False):
    global storage_key
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120,
    )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
        "type": "access",
    }
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Nicht angemeldet")
    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Ungültiges Token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sitzung abgelaufen")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Ungültiges Token")
    user = await db.users.find_one({"_id": payload["sub"]})
    if not user:
        raise HTTPException(status_code=401, detail="Benutzer nicht gefunden")
    user.pop("password_hash", None)
    return user


PLACEHOLDER = "Wird in Kürze ergänzt"

DEFAULT_SETTINGS = {
    "id": "site",
    "logo_storage_path": "",
    "favicon_storage_path": "",
    "hero_image": "/assets/store-dusk.webp",
    "gallery_images": [
        {"src": "/assets/hero-burek.webp", "alt": "Frisch gebackener Burek vor der NETI Balkan Bäckerei"},
        {"src": "/assets/store-terrasse.webp", "alt": "Außenbereich der NETI Balkan Bäckerei am Abend"},
        {"src": "/assets/store-dusk.webp", "alt": "Beleuchteter Eingang der NETI Balkan Bäckerei"},
    ],
    "contact": {
        "address_street": PLACEHOLDER,
        "address_city": PLACEHOLDER,
        "phone": "",
        "email": "",
        "maps_url": "",
    },
    "opening_hours": [
        {"days": "Montag – Freitag", "hours": PLACEHOLDER},
        {"days": "Samstag", "hours": PLACEHOLDER},
        {"days": "Sonntag", "hours": PLACEHOLDER},
    ],
    "categories": [
        {
            "id": "burek-pite",
            "name": "Burek & Pite",
            "tagline": "Knusprige Teigtaschen mit herzhafter Füllung",
            "image": "/assets/hero-burek.webp",
            "items": [],
        },
        {"id": "pizza", "name": "Pizza", "tagline": "Frisch aus dem Ofen", "image": "/assets/store-dusk.webp", "items": []},
        {"id": "burger", "name": "Burger", "tagline": "Saftig und reichhaltig belegt", "image": "/assets/store-terrasse.webp", "items": []},
        {"id": "brot-broetchen", "name": "Brot & Brötchen", "tagline": "Täglich frisch gebacken", "image": "/assets/hero-burek.webp", "items": []},
        {"id": "cevapcici-grill", "name": "Ćevapčići & Grill", "tagline": "Vom Grill, direkt auf den Teller", "image": "/assets/store-terrasse.webp", "items": []},
    ],
    "about_text": (
        "Die NETI Balkan Bäckerei bringt die Aromen des Balkans in Ihre Nähe: knuspriger Burek, "
        "frisch gebackene Pite, Pizza, Burger, Brot und Brötchen sowie Ćevapčići vom Grill. "
        "Bei uns erhalten Sie herzhafte Balkan-Spezialitäten und klassische Backwaren an einem Ort – "
        "freundlich, unkompliziert und zum Mitnehmen oder Genießen vor Ort."
    ),
    "impressum_text": (
        "Angaben gemäß § 5 TMG und § 18 Abs. 2 MStV\n\n"
        "NETI Balkan Bäckerei\n[Registrierter Name / Rechtsform wird ergänzt]\n"
        "[Straße und Hausnummer]\n[PLZ und Ort]\n\n"
        "Vertreten durch: [Name des Inhabers / Geschäftsführers]\n\n"
        "Kontakt:\nTelefon: [Telefonnummer]\nE-Mail: [E-Mail-Adresse]\n\n"
        "Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:\n[USt-IdNr., falls vorhanden]\n\n"
        "Zuständige Aufsichtsbehörde / Kammer: [falls zutreffend]\n\n"
        "Hinweis: Diese Angaben müssen vor Veröffentlichung mit den tatsächlichen "
        "Firmendaten vervollständigt werden."
    ),
    "datenschutz_text": (
        "1. Verantwortlicher\n\n"
        "Verantwortlich für die Datenverarbeitung auf dieser Website ist:\n\n"
        "NETI Balkan Bäckerei\n[Straße und Hausnummer]\n[PLZ und Ort]\nE-Mail: [E-Mail-Adresse]\n\n"
        "2. Hosting und Server-Logfiles\n\n"
        "Diese Website wird bei einem Hosting-Anbieter betrieben. Beim Aufruf der Website "
        "werden automatisch Informationen in sogenannten Server-Logfiles gespeichert, die Ihr "
        "Browser an uns übermittelt. Dies sind insbesondere IP-Adresse, Datum und Uhrzeit des "
        "Zugriffs, aufgerufene Seite, Referrer-URL, Browsertyp und -version sowie das "
        "verwendete Betriebssystem. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 "
        "lit. f DSGVO (berechtigtes Interesse am sicheren und stabilen Betrieb der Website). "
        "Eine Zusammenführung dieser Daten mit anderen Datenquellen findet nicht statt.\n\n"
        "3. Kontaktaufnahme per Telefon oder E-Mail\n\n"
        "Wenn Sie uns per Telefon oder E-Mail kontaktieren, verarbeiten wir Ihre Angaben "
        "(z. B. Name, E-Mail-Adresse, Inhalt Ihrer Anfrage) zur Bearbeitung Ihrer Anfrage "
        "gemäß Art. 6 Abs. 1 lit. b DSGVO. Die Daten werden gelöscht, sobald sie für die "
        "Bearbeitung nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten "
        "entgegenstehen.\n\n"
        "4. Cookies und Tracking\n\n"
        "Diese Website verwendet keine Analyse- oder Marketing-Cookies und kein "
        "Tracking durch Dritte. Es werden ausschließlich technisch notwendige Verbindungen "
        "aufgebaut. Eine Einwilligung per Cookie-Banner ist daher nicht erforderlich.\n\n"
        "5. Externe Links (Google Maps)\n\n"
        "Diese Website enthält einen Link zu Google Maps. Erst wenn Sie diesen Link aktiv "
        "anklicken, wird eine Verbindung zu Google hergestellt. Dabei gelten die "
        "Datenschutzbestimmungen von Google. Beim bloßen Besuch unserer Website werden keine "
        "Daten an Google übertragen.\n\n"
        "6. Ihre Rechte\n\n"
        "Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16 DSGVO), "
        "Löschung (Art. 17 DSGVO), Einschränkung der Verarbeitung (Art. 18 DSGVO), "
        "Datenübertragbarkeit (Art. 20 DSGVO) sowie Widerspruch gegen die Verarbeitung "
        "(Art. 21 DSGVO). Zudem besteht ein Beschwerderecht bei einer Datenschutz-"
        "Aufsichtsbehörde (Art. 77 DSGVO).\n\n"
        "Hinweis: Diese Erklärung muss vor Veröffentlichung mit den tatsächlichen "
        "Firmendaten und dem tatsächlichen Hosting-Anbieter vervollständigt werden."
    ),
    "updated_at": "",
}


class LoginBody(BaseModel):
    email: str
    password: str


class ContactModel(BaseModel):
    address_street: str = ""
    address_city: str = ""
    phone: str = ""
    email: str = ""
    maps_url: str = ""


class OpeningHour(BaseModel):
    days: str
    hours: str


class GalleryImage(BaseModel):
    src: str
    alt: str = ""


class MenuItem(BaseModel):
    name: str
    description: str = ""
    price: str = ""


class Category(BaseModel):
    id: str
    name: str
    tagline: str = ""
    image: str = ""
    items: list[MenuItem] = []


class SettingsBody(BaseModel):
    hero_image: str = "/assets/hero-burek.webp"
    gallery_images: list[GalleryImage] = []
    contact: ContactModel = ContactModel()
    opening_hours: list[OpeningHour] = []
    categories: list[Category] = []
    about_text: str = ""
    impressum_text: str = ""
    datenschutz_text: str = ""


@api_router.get("/")
async def root():
    return {"message": "NETI Balkan Bäckerei API"}


@api_router.get("/settings")
async def get_settings():
    doc = await db.settings.find_one({"id": "site"}, {"_id": 0})
    if not doc:
        return DEFAULT_SETTINGS
    return doc


@api_router.put("/settings")
async def update_settings(body: SettingsBody, request: Request):
    await get_current_user(request)
    doc = body.model_dump()
    doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.settings.update_one({"id": "site"}, {"$set": doc}, upsert=True)
    saved = await db.settings.find_one({"id": "site"}, {"_id": 0})
    return saved


@api_router.post("/auth/login")
async def login(body: LoginBody, response: Response, request: Request):
    email = body.email.strip().lower()
    identifier = f"{request.client.host if request.client else 'unknown'}:{email}"
    attempts = await db.login_attempts.find_one({"identifier": identifier})
    if attempts and attempts.get("count", 0) >= 5:
        locked_since = attempts.get("last_attempt")
        if locked_since and datetime.now(timezone.utc) - datetime.fromisoformat(locked_since) < timedelta(minutes=15):
            raise HTTPException(status_code=429, detail="Zu viele Versuche. Bitte versuchen Sie es später erneut.")
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"last_attempt": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="E-Mail oder Passwort ist falsch")
    await db.login_attempts.delete_one({"identifier": identifier})
    token = create_access_token(user["_id"], email)
    response.set_cookie(
        key="access_token", value=token, httponly=True, secure=True,
        samesite="lax", max_age=12 * 3600, path="/",
    )
    return {"email": user["email"], "name": user.get("name", ""), "role": user.get("role", "admin")}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me")
async def me(request: Request):
    user = await get_current_user(request)
    return {"email": user["email"], "name": user.get("name", ""), "role": user.get("role", "admin")}


ALLOWED_TYPES = {"image/png", "image/jpeg", "image/webp", "image/x-icon", "image/vnd.microsoft.icon", "image/svg+xml"}


@api_router.post("/upload")
async def upload(request: Request, kind: str = "image", file: UploadFile = File(...)):
    await get_current_user(request)
    if kind not in ("logo", "favicon", "image"):
        raise HTTPException(status_code=400, detail="Ungültiger Upload-Typ")
    content_type = file.content_type or "application/octet-stream"
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Nur Bilddateien (PNG, JPG, WebP, SVG, ICO) sind erlaubt")
    data = await file.read()
    if len(data) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Datei ist größer als 5 MB")
    ext = (file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "png").lower()
    path = f"{APP_NAME}/uploads/{kind}/{uuid.uuid4()}.{ext}"
    try:
        result = put_object(path, data, content_type)
    except Exception as e:
        logger.error(f"Storage upload failed: {e}")
        raise HTTPException(status_code=502, detail="Upload fehlgeschlagen. Bitte erneut versuchen.")
    storage_path = result["path"]
    if kind in ("logo", "favicon"):
        await db.settings.update_one({"id": "site"}, {"$set": {f"{kind}_storage_path": storage_path}}, upsert=True)
    return {"storage_path": storage_path, "url": f"/api/files/{storage_path}"}


@api_router.get("/files/{path:path}")
async def download_file(path: str):
    try:
        data, content_type = get_object(path)
    except Exception:
        raise HTTPException(status_code=404, detail="Datei nicht gefunden")
    return RawResponse(content=data, media_type=content_type, headers={"Cache-Control": "public, max-age=86400"})


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    admin_email = os.environ.get("ADMIN_EMAIL")
    admin_password = os.environ.get("ADMIN_PASSWORD")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "_id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Inhaber",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Admin user seeded")
    existing_settings = await db.settings.find_one({"id": "site"})
    if existing_settings is None:
        doc = dict(DEFAULT_SETTINGS)
        doc["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.settings.insert_one(doc)
        logger.info("Default settings seeded")
    try:
        init_storage()
        logger.info("Object storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
