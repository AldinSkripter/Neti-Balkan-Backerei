#!/usr/bin/env bash
###############################################################################
# NETI Balkan Bäckerei — instalacija na Ubuntu VPS s Pleskom
#
# Pokrenuti JEDNOM kao root, iz Plesk Git deploy foldera (httpdocs):
#   bash /var/www/vhosts/<DOMENA>/httpdocs/deploy-vps.sh
#
# Skripta:
#   - prepoznaje domenu i Plesk korisnika iz putanje
#   - instalira Node 20 + Yarn, Python venv, MongoDB (ako nedostaju)
#   - kreira backend/.env (pita lozinku admina samo prvi put, ne mijenja postojeći)
#   - builda frontend
#   - pokreće systemd servis "neti-backend" na 127.0.0.1:8001
#   - postavlja Plesk: document root -> frontend/build, /api -> backend, SPA fallback
#   - instalira /usr/local/bin/neti-deploy za Plesk "Additional deployment actions"
###############################################################################

set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[!!]${NC} $1"; }
fail() { echo -e "${RED}[GRESKA]${NC} $1"; exit 1; }

[[ $EUID -ne 0 ]] && fail "Pokrenite kao root."

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[[ ! -d "$APP_DIR/backend" || ! -d "$APP_DIR/frontend" ]] && \
  fail "Skripta mora biti u korijenu projekta (gdje su backend/ i frontend/)."

# Domena iz putanje: /var/www/vhosts/<DOMENA>/httpdocs
if [[ "$APP_DIR" =~ ^/var/www/vhosts/([^/]+)/(.+)$ ]]; then
  DOMAIN="${BASH_REMATCH[1]}"
  REL_DIR="${BASH_REMATCH[2]}"      # npr. httpdocs
else
  fail "Očekivana putanja /var/www/vhosts/<domena>/httpdocs, dobiveno: $APP_DIR"
fi
SYS_USER="$(stat -c %U "$APP_DIR")"
PLESK_CONF_DIR="/var/www/vhosts/system/$DOMAIN/conf"
[[ -d "$PLESK_CONF_DIR" ]] || fail "Plesk config folder ne postoji: $PLESK_CONF_DIR"

DB_NAME="neti_balkan"
SERVICE="neti-backend"

# Port: zapamćen u backend/.env (BACKEND_PORT), inače prvi slobodan od 8001 naviše
systemctl stop $SERVICE 2>/dev/null || true
BACKEND_PORT="$(grep -oP '^BACKEND_PORT="?\K[0-9]+' "$APP_DIR/backend/.env" 2>/dev/null || true)"
if [[ -z "$BACKEND_PORT" ]]; then
  BACKEND_PORT=8001
  while ss -ltn "( sport = :$BACKEND_PORT )" | grep -q LISTEN; do BACKEND_PORT=$((BACKEND_PORT+1)); done
fi
if ss -ltn "( sport = :$BACKEND_PORT )" | grep -q LISTEN; then
  fail "Port $BACKEND_PORT je zauzet drugim programom. Promijenite BACKEND_PORT u $APP_DIR/backend/.env i ponovite."
fi

log "Projekt: $APP_DIR"
log "Domena:  $DOMAIN  | Plesk korisnik: $SYS_USER | Backend port: $BACKEND_PORT"

# --------------------------------------------------------------------------
# 1. Sistemski paketi
# --------------------------------------------------------------------------
export DEBIAN_FRONTEND=noninteractive
log "Instaliram sistemske pakete..."
apt-get update -qq
apt-get install -y -qq curl gnupg ca-certificates build-essential python3 python3-venv python3-pip >/dev/null

# --------------------------------------------------------------------------
# 2. Node.js 20 + Yarn
# --------------------------------------------------------------------------
if ! command -v node >/dev/null || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 18 ]]; then
  log "Instaliram Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null
  apt-get install -y -qq nodejs >/dev/null
fi
command -v yarn >/dev/null || npm install -g yarn >/dev/null
log "Node $(node -v), Yarn $(yarn -v)"

# --------------------------------------------------------------------------
# 3. MongoDB 8
# --------------------------------------------------------------------------
if ! command -v mongod >/dev/null; then
  log "Instaliram MongoDB 8..."
  . /etc/os-release
  curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
    gpg --dearmor --yes -o /usr/share/keyrings/mongodb-server-8.0.gpg
  echo "deb [signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg] https://repo.mongodb.org/apt/ubuntu ${VERSION_CODENAME}/mongodb-org/8.0 multiverse" \
    > /etc/apt/sources.list.d/mongodb-org-8.0.list
  apt-get update -qq
  apt-get install -y -qq mongodb-org >/dev/null
fi
systemctl enable mongod >/dev/null 2>&1
systemctl start mongod 2>/dev/null || systemctl restart mongod
log "MongoDB radi."

# --------------------------------------------------------------------------
# 4. Backend .env (samo prvi put) + venv
# --------------------------------------------------------------------------
cd "$APP_DIR/backend"
if [[ ! -f .env ]]; then
  echo ""
  echo "Prvi put: postavite pristup za admin panel (upisuje se samo ovdje na serveru)."
  read -r -p "Admin e-mail: " ADMIN_EMAIL
  while true; do
    read -r -s -p "Admin lozinka (min 10 znakova): " ADMIN_PASSWORD; echo
    [[ ${#ADMIN_PASSWORD} -ge 10 ]] && break
    warn "Prekratka lozinka."
  done
  JWT_SECRET="$(openssl rand -hex 32)"
  cat > .env <<EOF
MONGO_URL="mongodb://localhost:27017"
DB_NAME="$DB_NAME"
CORS_ORIGINS="https://$DOMAIN,https://www.$DOMAIN"
JWT_SECRET="$JWT_SECRET"
ADMIN_EMAIL="$ADMIN_EMAIL"
ADMIN_PASSWORD="$ADMIN_PASSWORD"
LOCAL_UPLOAD_STORAGE="true"
LOCAL_UPLOAD_DIR="/var/www/vhosts/$DOMAIN/neti-uploads"
BACKEND_PORT="$BACKEND_PORT"
EOF
  chmod 600 .env
  log "backend/.env kreiran."
else
  log "backend/.env već postoji — ne diram."
  grep -q '^BACKEND_PORT=' .env || echo "BACKEND_PORT=\"$BACKEND_PORT\"" >> .env
fi
mkdir -p "/var/www/vhosts/$DOMAIN/neti-uploads"

[[ -d .venv ]] || python3 -m venv .venv
.venv/bin/pip install -q --upgrade pip
.venv/bin/pip install -q -r requirements-vps.txt
log "Backend paketi instalirani."

# --------------------------------------------------------------------------
# 5. Frontend build
# --------------------------------------------------------------------------
cd "$APP_DIR/frontend"
echo "REACT_APP_BACKEND_URL=https://$DOMAIN" > .env
log "Buildam frontend (par minuta)..."
yarn install --silent --frozen-lockfile 2>/dev/null || yarn install --silent
yarn build
chown -R "$SYS_USER":psacln "$APP_DIR/frontend/build"
log "Frontend build gotov."

# --------------------------------------------------------------------------
# 6. Systemd servis
# --------------------------------------------------------------------------
cat > /etc/systemd/system/$SERVICE.service <<EOF
[Unit]
Description=NETI Balkan Bäckerei Backend
After=network.target mongod.service
Requires=mongod.service

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR/backend
Environment="PATH=$APP_DIR/backend/.venv/bin:/usr/local/bin:/usr/bin:/bin"
ExecStart=$APP_DIR/backend/.venv/bin/uvicorn server:app --host 127.0.0.1 --port $BACKEND_PORT
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable $SERVICE >/dev/null 2>&1
systemctl restart $SERVICE
sleep 4
systemctl is-active --quiet $SERVICE || fail "Backend se nije pokrenuo: journalctl -u $SERVICE -n 50"
curl -sf "http://127.0.0.1:$BACKEND_PORT/api/settings" >/dev/null || fail "Backend API ne odgovara na portu $BACKEND_PORT."
log "Backend servis radi (127.0.0.1:$BACKEND_PORT)."

# --------------------------------------------------------------------------
# 7. Plesk: document root, nginx /api proxy, Apache SPA fallback
# --------------------------------------------------------------------------
log "Podešavam Plesk za $DOMAIN..."
plesk bin domain --update "$DOMAIN" -www-root "$REL_DIR/frontend/build" >/dev/null \
  || warn "Nisam uspio promijeniti document root — postavite ručno u Plesku: Hosting Settings > Document root = $REL_DIR/frontend/build"

cat > "$PLESK_CONF_DIR/vhost_nginx.conf" <<EOF
location ^~ /api/ {
    proxy_pass http://127.0.0.1:$BACKEND_PORT;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_read_timeout 90s;
    client_max_body_size 10m;
}
EOF
chown root:nginx "$PLESK_CONF_DIR/vhost_nginx.conf" 2>/dev/null || true
chmod 600 "$PLESK_CONF_DIR/vhost_nginx.conf"

for f in vhost.conf vhost_ssl.conf; do
  echo "FallbackResource /index.html" > "$PLESK_CONF_DIR/$f"
  chmod 600 "$PLESK_CONF_DIR/$f"
done

plesk sbin httpdmng --reconfigure-domain "$DOMAIN" || fail "Plesk reconfigure nije uspio."
nginx -t >/dev/null 2>&1 || fail "nginx -t javlja grešku."
log "Plesk web konfiguracija primijenjena."

# --------------------------------------------------------------------------
# 8. Deploy helper za Plesk Git "Additional deployment actions"
# --------------------------------------------------------------------------
cat > /usr/local/bin/neti-deploy <<EOF
#!/usr/bin/env bash
set -euo pipefail
cd "$APP_DIR/backend" && .venv/bin/pip install -q -r requirements-vps.txt
cd "$APP_DIR/frontend" && yarn install --silent && yarn build
chown -R "$SYS_USER":psacln "$APP_DIR/frontend/build"
systemctl restart $SERVICE
echo "NETI deploy OK \$(date)"
EOF
chmod 755 /usr/local/bin/neti-deploy
echo "$SYS_USER ALL=(root) NOPASSWD: /usr/local/bin/neti-deploy" > /etc/sudoers.d/neti-deploy
chmod 440 /etc/sudoers.d/neti-deploy
visudo -cf /etc/sudoers.d/neti-deploy >/dev/null || fail "sudoers greška."
log "neti-deploy instaliran."

# --------------------------------------------------------------------------
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  INSTALACIJA GOTOVA${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo "  Stranica:     https://$DOMAIN"
echo "  Admin panel:  https://$DOMAIN/admin/login"
echo ""
echo -e "${YELLOW}  U PLESKU (jednom):${NC}"
echo "  1. SSL/TLS Certificates > Let's Encrypt (ako već nije)"
echo "  2. Git > Repository settings > Additional deployment actions:"
echo "       sudo /usr/local/bin/neti-deploy"
echo "  3. Web Hosting Access > SSH access = /bin/bash  (NE chrooted, inače sudo ne radi)"
echo ""
echo "  Uploadane slike: /var/www/vhosts/$DOMAIN/neti-uploads/"
echo "  Logovi:  journalctl -u $SERVICE -f"
echo ""
