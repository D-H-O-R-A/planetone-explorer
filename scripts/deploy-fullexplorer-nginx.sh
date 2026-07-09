#!/usr/bin/env bash
# ==============================================================================
# Planet One FullExplorer Nginx & Certbot Server Production Deployment Script
# ==============================================================================
# Installs and configures Nginx, PHP-FPM, Certbot SSL, and sets up the subdomain
# for production deployment of the FullExplorer PHP API backend.
# ==============================================================================

set -euo pipefail

# Output coloring helpers
color_primary="\033[1;34m"   # Blue
color_accent="\033[1;32m"    # Green
color_warning="\033[1;33m"   # Yellow
color_error="\033[1;31m"     # Red
color_reset="\033[0m"

log_info() {
    echo -e "${color_primary}[INFO]${color_reset} $1"
}

log_success() {
    echo -e "${color_accent}[SUCCESS]${color_reset} $1"
}

log_warning() {
    echo -e "${color_warning}[WARNING]${color_reset} $1"
}

log_error() {
    echo -e "${color_error}[ERROR]${color_reset} $1"
}

echo -e "${color_primary}"
echo "======================================================================"
echo "          PLANET ONE - FULLEXPLORER NGINX & SSL DEPLOYMENT            "
echo "======================================================================"
echo -e "${color_reset}"

# Verify root access
if [ "$EUID" -ne 0 ]; then
    log_error "This deployment script must be run as root (sudo bash deploy-fullexplorer-nginx.sh)."
    exit 1
fi

# Verify input domain
if [ $# -lt 1 ]; then
    log_error "Missing domain name argument."
    echo -e "Usage: sudo bash deploy-fullexplorer-nginx.sh <main_domain_name> [--testnet]"
    echo -e "Example: sudo bash deploy-fullexplorer-nginx.sh planetone.io"
    exit 1
fi

MAIN_DOMAIN="$1"
IS_TESTNET=false

if [ $# -eq 2 ] && [ "$2" = "--testnet" ]; then
    IS_TESTNET=true
fi

# Determine subdomain and pathing
if [ "$IS_TESTNET" = true ]; then
    SUBDOMAIN="testnet-fullexplorer.${MAIN_DOMAIN}"
else
    SUBDOMAIN="fullexplorer.${MAIN_DOMAIN}"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FULLEXPLORER_DIR="$(cd "${SCRIPT_DIR}/fullexplorer" && pwd)"

log_info "Deploying FullExplorer API Service to: https://${SUBDOMAIN}"
log_info "Local FullExplorer directory: ${FULLEXPLORER_DIR}"

# 1. Install system dependencies if missing
log_info "Updating package lists & checking system packages..."
apt-get update -y

log_info "Installing Nginx, PHP, PHP-FPM, SQLite3 and Certbot..."
apt-get install -y nginx certbot python3-certbot-nginx php-fpm php-sqlite3 php-gmp php-curl php-cli php-mbstring php-xml unzip git

# 2. Automatically find active PHP-FPM socket version
log_info "Detecting active PHP-FPM socket version..."
FPM_SOCKET=$(find /var/run/php/ -name "php*-fpm.sock" | head -n 1)

if [ -z "$FPM_SOCKET" ]; then
    log_warning "PHP-FPM socket not found in /var/run/php/. Attempting to start php-fpm service..."
    systemctl start php*-fpm || true
    FPM_SOCKET=$(find /var/run/php/ -name "php*-fpm.sock" | head -n 1)
fi

if [ -z "$FPM_SOCKET" ]; then
    log_error "Could not detect PHP-FPM socket. Please verify that PHP-FPM is installed and running."
    exit 1
fi

log_success "Detected active PHP-FPM socket: ${FPM_SOCKET}"

# 3. Create or verify target deployment folders and permissions
log_info "Setting correct folder permissions for web server access..."
# Ensure SQLite directory exists and is writable by nginx (www-data)
mkdir -p "${FULLEXPLORER_DIR}/var/db"
chown -R www-data:www-data "${FULLEXPLORER_DIR}"
chmod -R 775 "${FULLEXPLORER_DIR}"

# 4. Generate Nginx Server Block Configuration
log_info "Creating Nginx configuration block for: ${SUBDOMAIN}..."

NGINX_CONF="/etc/nginx/sites-available/${SUBDOMAIN}"

cat << EOF > "$NGINX_CONF"
server {
    listen 80;
    listen [::]: 80;
    server_name ${SUBDOMAIN};
    root ${FULLEXPLORER_DIR};

    index index.php index.html;

    # Set maximum upload size if needed
    client_max_body_size 32M;

    # CORS Headers configuration
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;

    location / {
        # Redirect all requests to index.php if file/dir not found (standard router)
        try_files \$uri \$uri/ /index.php?\$args;
    }

    # Pass PHP scripts to PHP-FPM socket
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:${FPM_SOCKET};
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        include fastcgi_params;
    }

    # Deny access to hidden database / git files
    location ~ /\.(git|env|sqlite|db) {
        deny all;
        return 404;
    }

    # Deny direct access to db folders
    location /var/ {
        deny all;
        return 404;
    }
}
EOF

log_success "Nginx server block written to: ${NGINX_CONF}"

# 5. Enable the site and test configuration
log_info "Enabling configuration via symbolic link..."
ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/"

log_info "Testing Nginx configuration syntax..."
nginx -t

log_info "Restarting Nginx to apply changes..."
systemctl restart nginx

log_success "Nginx restarted. HTTP service is now live on port 80."

# 6. Automate Let's Encrypt SSL Configuration with Certbot
log_info "Requesting Let's Encrypt SSL certificate for ${SUBDOMAIN}..."
set +e # Certbot can fail if DNS is not yet pointed, allow script to continue
certbot --nginx -d "$SUBDOMAIN" --non-interactive --agree-tos -m "admin@${MAIN_DOMAIN}" --redirect
CERTBOT_STATUS=$?
set -e

if [ $CERTBOT_STATUS -eq 0 ]; then
    log_success "SSL certificate configured successfully! Reverse HTTPS proxy enabled."
else
    log_warning "Certbot was unable to configure SSL for ${SUBDOMAIN}."
    log_warning "Make sure your domain's DNS A Record points to this server's public IP address before running Certbot."
    log_warning "To retry manually, run: sudo certbot --nginx -d ${SUBDOMAIN}"
fi

# 7. Start the Indexer Daemon Systemd Services
log_info "Setting up FullExplorer background indexing processes as systemd services..."

SERVICE_FILE="/etc/systemd/system/fullexplorer-${SUBDOMAIN}.service"

cat << EOF > "$SERVICE_FILE"
[Unit]
Description=Planet One FullExplorer Blockchain Indexer Daemon (${SUBDOMAIN})
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=${FULLEXPLORER_DIR}
ExecStart=/usr/bin/php -f ${FULLEXPLORER_DIR}/w8_updater.php
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=fullexplorer-${SUBDOMAIN}

[Install]
WantedBy=multi-user.target
EOF

HEADERS_SERVICE_FILE="/etc/systemd/system/fullexplorer-headers-${SUBDOMAIN}.service"

cat << EOF > "$HEADERS_SERVICE_FILE"
[Unit]
Description=Planet One FullExplorer Blockchain Headers Indexer Daemon (${SUBDOMAIN})
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=${FULLEXPLORER_DIR}
ExecStart=/usr/bin/php -f ${FULLEXPLORER_DIR}/w8_updater_headers.php
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=fullexplorer-headers-${SUBDOMAIN}

[Install]
WantedBy=multi-user.target
EOF

log_success "Created systemd service files: ${SERVICE_FILE} and ${HEADERS_SERVICE_FILE}"

# Reload systemd, enable and start service
systemctl daemon-reload
systemctl enable "fullexplorer-${SUBDOMAIN}.service"
systemctl restart "fullexplorer-${SUBDOMAIN}.service"
systemctl enable "fullexplorer-headers-${SUBDOMAIN}.service"
systemctl restart "fullexplorer-headers-${SUBDOMAIN}.service"

log_success "FullExplorer background indexer and headers services are running under systemd!"
log_info "You can monitor the indexers using: journalctl -u fullexplorer-${SUBDOMAIN}.service -f"
log_info "and: journalctl -u fullexplorer-headers-${SUBDOMAIN}.service -f"

echo -e "${color_accent}"
echo "======================================================================"
echo "    PLANET ONE FULLEXPLORER SERVER DEPLOYMENT COMPLETED!             "
echo "======================================================================"
echo " URL:         https://${SUBDOMAIN}"
echo " Path:        ${FULLEXPLORER_DIR}"
echo " PHP-FPM:     ${FPM_SOCKET}"
echo " Status:      Active & Running"
echo "======================================================================"
echo -e "${color_reset}"
