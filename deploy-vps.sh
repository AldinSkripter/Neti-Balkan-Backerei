#!/usr/bin/env bash
###############################################################################
# NETI Balkan Bäckerei — jedan klik: potpuna instalacija na Ubuntu + Plesk
#
# KORIŠTENJE (kao root, na vašem VPS-u):
#   1. Uploadajte projekt (git clone ili zip) u /var/www/vhosts/VASA-DOMENA/neti
#   2. Pokrenite:  bash /var/www/vhosts/VASA-DOMENA/neti/deploy-vps.sh
#
# Skripta sama: instalira Node 20, Python 3.11 venv, MongoDB, yarn,
# builda frontend, konfigurira systemd servis i Nginx proxy.
###############################################################################

set -euo pipefail

# ============================ PODESITE OVO ==================================
DOMAIN="neti-balkan.de"                  # <-- VAŠA DOMENA (bez https://)
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ADMIN_EMAIL="owner@neti-balkan.de"
ADMIN_PASSWORD="Neti2026!"               # <-- PROMIJENITE prije produkcije!
DB_NAME="neti_balkan"
BACKEND_PORT=8001
# ============================================================================

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[!!]${NC} $1"; }
fail() { echo -e "${RED}[GRESKA]${NC} $1"; exit 1; }

[[ $EUID -ne 0 ]] && fail "Pokrenite kao root: sudo bash deploy-vps.sh"
[[ ! -d "$APP_DIR/backend" || ! -d "$APP_DIR/frontend" ]] && \
  fail "Skripta mora biti u korijenu projekta (gdje su backend/ i frontend/)."

log "Projekt: $APP_DIR | Domena: $DOMAIN"

# --------------------------------------------------------------------------
# 1. Sistemski paketi
# --------------------------------------------------------------------------
log "Instaliram sistemske pakete..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq curl gnupg ca-certificates build-essential python3.11 \
  python3.11-venv python3-pip nginx ufw >/dev/null

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
# 3. MongoDB 7
# --------------------------------------------------------------------------
if ! command -v mongod >/dev/null; then
  log "Instaliram MongoDB 7..."
  . /etc/os-release
  UBUNTU_CODENAME="${VERSION_CODENAME:-jammy}"
  curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
    gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
  echo "deb [signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg] \
https://repo.mongodb.org/apt/ubuntu ${UBUNTU_CODENAME}/mongodb-org/7.0 multiverse" \
    > /etc/apt/sources.list.d/mongodb-org-7.0.list
  apt-get update -qq
  apt-get install -y -qq mongodb-org >/dev/null
fi
systemctl enable mongod >/dev/null 2>&1
systemctl start mongod 2>/dev/null || systemctl restart mongod
log "MongoDB radi."

# --------------------------------------------------------------------------
# 4. Backend (Python venv + paketi + .env)
# --------------------------------------------------------------------------
log "Podešavam backend..."
cd "$APP_DIR/backend"
[[ ! -d .venv ]] && python3.11 -m venv .venv
.venv/bin/pip install -q --upgrade pip
.venv/bin/pip install -q -r requirements.txt

JWT_SECRET="$(openssl rand -hex 32)"
cat > .env <<EOF
MONGO_URL="mongodb://localhost:27017"
DB_NAME="$DB_NAME"
CORS_ORIGINS="https://$DOMAIN,https://www.$DOMAIN"
JWT_SECRET="$JWT_SECRET"
ADMIN_EMAIL="$ADMIN_EMAIL"
ADMIN_PASSWORD="$ADMIN_PASSWORD"
LOCAL_UPLOAD_STORAGE="true"
LOCAL_UPLOAD_DIR="$APP_DIR/backend/uploads"
EOF
mkdir -p "$APP_DIR/backend/uploads"
log "Backend .env kreiran (novi JWT_SECRET generiran)."

# --------------------------------------------------------------------------
# 5. Frontend (yarn build)
# --------------------------------------------------------------------------
log "Buildam frontend (može potrajati par minuta)..."
cd "$APP_DIR/frontend"
cat > .env <<EOF
REACT_APP_BACKEND_URL=https://$DOMAIN
EOF
yarn install --silent
yarn build
log "Frontend build gotov."

# --------------------------------------------------------------------------
# 6. Systemd servis
# --------------------------------------------------------------------------
log "Kreiram systemd servis..."
cat > /etc/systemd/system/neti-backend.service <<EOF
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
systemctl enable neti-backend >/dev/null 2>&1
systemctl restart neti-backend
sleep 3
systemctl is-active --quiet neti-backend || fail "Backend se nije pokrenuo. Provjerite: journalctl -u neti-backend -n 50"
curl -sf "http://127.0.0.1:$BACKEND_PORT/api/settings" >/dev/null || fail "Backend API ne odgovara."
log "Backend servis radi na portu $BACKEND_PORT."

# --------------------------------------------------------------------------
# 7. Nginx (Plesk-kompatibilan: zaseban config, ne dira Plesk)
# --------------------------------------------------------------------------
log "Podešavam Nginx..."
cat > /etc/nginx/conf.d/neti-balkan.conf <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    root $APP_DIR/frontend/build;
    index index.html;

    # Statika (React build)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API -> FastAPI
    location /api/ {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 90s;
        client_max_body_size 10m;
    }

    # Keširanje statičnih resursa
    location ~* \.(js|css|png|jpg|jpeg|webp|svg|ico|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }
}
EOF
nginx -t >/dev/null || fail "Nginx config greška: nginx -t"
systemctl reload nginx
log "Nginx aktivan."

# --------------------------------------------------------------------------
# 8. Firewall
# --------------------------------------------------------------------------
ufw allow 'Nginx Full' >/dev/null 2>&1 || true
ufw allow OpenSSH >/dev/null 2>&1 || true

# --------------------------------------------------------------------------
# GOTOVO
# --------------------------------------------------------------------------
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  INSTALACIJA GOTOVA!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo "  Stranica:     http://$DOMAIN"
echo "  Admin panel:  http://$DOMAIN/admin/login"
echo "  E-mail:       $ADMIN_EMAIL"
echo "  Lozinka:      $ADMIN_PASSWORD  (PROMIJENITE u .env i restartajte!)"
echo ""
echo -e "${YELLOW}  PREOSTALO RUČNO:${NC}"
echo "  1. DNS: A-record domene -> IP ovog servera"
echo "  2. HTTPS: Plesk > Websites & Domains > $DOMAIN > SSL/TLS > Let's Encrypt"
echo "     (ili: apt install certbot python3-certbot-nginx && certbot --nginx -d $DOMAIN)"
echo "  3. Uploadane slike (logo/favicon) čuvaju se u: $APP_DIR/backend/uploads/"
echo "     Backup redovito kopirajte ovaj folder + MongoDB dump."
echo ""
echo "  Logovi:  journalctl -u neti-backend -f"
echo "  Restart: systemctl restart neti-backend"
echo ""
