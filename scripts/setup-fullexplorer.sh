#!/usr/bin/env bash
# ==============================================================================
# Planet One FullExplorer (w8io) Setup & Debranding Script
# ==============================================================================
# Sets up the SQL-backed lightweight FullExplorer (deemru/w8io) for Planet One,
# completely rebranding the interface, endpoints, tokens, and networks.
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

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${SCRIPT_DIR}/../fullexplorer"

echo -e "${color_primary}"
echo "======================================================================"
echo "          PLANET ONE - FULLEXPLORER AUTOMATED SETUP SCRIPT            "
echo "======================================================================"
echo -e "${color_reset}"

# 1. Verification of system requirements
log_info "Verifying system dependencies..."
for cmd in git php sed curl; do
    if ! command -v "$cmd" &> /dev/null; then
        log_error "Required command '$cmd' is not installed. Please install it first."
        exit 1
    fi
done
log_success "All system dependencies are present."

# 2. Clone the D-H-O-R-A/planetone-explorer repository if not already cloned
if [ ! -d "$TARGET_DIR" ]; then
    log_info "Cloning D-H-O-R-A/planetone-explorer blockchain indexer into '${TARGET_DIR}'..."
    git clone https://github.com/D-H-O-R-A/planetone-explorer.git "$TARGET_DIR"
    log_success "Successfully cloned D-H-O-R-A/planetone-explorer."
else
    log_info "Target directory '${TARGET_DIR}' already exists. Pulling latest changes..."
    cd "$TARGET_DIR"
    git pull || log_warning "Failed to pull latest changes from git. Continuing with existing code."
fi

cd "$TARGET_DIR"

# 3. Handle Configuration creation and debranding
log_info "Configuring Planet One environment variables in config.php..."

if [ -f "config.sample.php" ] && [ ! -f "config.php" ]; then
    cp config.sample.php config.php
    log_info "Created config.php from config.sample.php."
elif [ ! -f "config.php" ]; then
    # Create fallback config.php if sample doesn't exist
    log_warning "config.sample.php not found. Creating default config.php..."
    cat << 'EOF' > config.php
<?php
define( 'W8IO_NODE', 'https://nodes.planetone.io' );
define( 'W8IO_COIN', 'PLO' );
define( 'W8IO_NETWORK', 'P' ); // Mainnet 'P'
define( 'W8IO_DB_DIR', __DIR__ . '/db/' );
define( 'W8IO_LIMIT', 100 );
EOF
fi

# Apply direct configuration changes in config.php
if [ -f "config.php" ]; then
    # Replace Nodes URL
    sed -i "s|https://nodes.wavesnodes.com|https://nodes.planetone.io|g" config.php
    sed -i "s|nodes.wavesnodes.com|nodes.planetone.io|g" config.php
    sed -i "s|'W'|'P'|g" config.php # Rebrand Chain network character 'W' to 'P'
    sed -i "s|\"W\"|\"P\"|g" config.php
    sed -i "s|'Waves'|'Planet One'|g" config.php
    sed -i "s|'WAVES'|'PLO'|g" config.php
    sed -i "s|\"WAVES\"|\"PLO\"|g" config.php
    log_success "Updated config.php with Planet One node endpoints and chain specifications."
fi

# 4. Global Debranding of Waves & AMZ
log_info "Running global search-and-replace to de-brand 'Waves' / 'AMZ' in all indexer source files..."

find . -type f \( -name "*.php" -o -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.md" \) -not -path "*/.git/*" | while read -r file; do
    # Replace Waves with Planet One (except for library paths or variables that shouldn't change, but let's be thorough and replace visual labels)
    sed -i "s/Waves Explorer/Planet One FullExplorer/g" "$file" 2>/dev/null || true
    sed -i "s/Waves nodes/Planet One Nodes/g" "$file" 2>/dev/null || true
    sed -i "s/Waves Platform/Planet One Blockchain/g" "$file" 2>/dev/null || true
    sed -i "s/Waves network/Planet One network/g" "$file" 2>/dev/null || true
    sed -i "s/Waves Cryptographic/Planet One Cryptographic/g" "$file" 2>/dev/null || true
    sed -i "s/Waves/Planet One/g" "$file" 2>/dev/null || true
    sed -i "s/WAVES/PLO/g" "$file" 2>/dev/null || true
    sed -i "s/waves/plo/g" "$file" 2>/dev/null || true
    sed -i "s/AMZ1/VERDE/g" "$file" 2>/dev/null || true
    sed -i "s/AMZ/PLO/g" "$file" 2>/dev/null || true
    sed -i "s/AMZX/PLO/g" "$file" 2>/dev/null || true
    sed -i "s/Amazonic/Planet One/g" "$file" 2>/dev/null || true
done

log_success "Global search-and-replace completed. All user-visible labels are branded for Planet One."

# 5. Visual styling custom adjustments (Inject CSS style matching deep black / blue and green glow)
log_info "Injecting Planet One styling variables and overrides into indexer templates..."

# Search for main CSS file in the cloned repository
# w8io usually compiles styles or uses style tags or style.css
main_css=$(find . -name "style.css" -o -name "main.css" | head -n 1)

if [ -n "$main_css" ]; then
    log_info "CSS file found at: $main_css. Applying color palette overrides..."
    # Inject custom styles or replace color codes
    # Waves Blue `#0055FF` or similar -> Planet Blue `#0066FF`, background to OLED black `#020408`
    cat << 'EOF' >> "$main_css"

/* ==========================================================================
   PLANET ONE COSMIC COSMETIC OVERRIDES
   ========================================================================== */
body {
    background-color: #020408 !important;
    color: #f3f4f6 !important;
    font-family: 'SF Mono', Monaco, Consolas, 'Liberation Mono', monospace !important;
}
a {
    color: #00c2ff !important;
    text-shadow: 0 0 8px rgba(0, 194, 255, 0.2);
}
a:hover {
    color: #00e054 !important;
    text-shadow: 0 0 10px rgba(0, 224, 84, 0.4);
}
.header, .footer, table, tr, th, td, div, section, card, input {
    background-color: rgba(2, 4, 8, 0.7) !important;
    border-color: rgba(0, 102, 255, 0.15) !important;
}
th {
    color: #00e054 !important;
    border-bottom: 2px solid rgba(0, 224, 84, 0.2) !important;
}
input, button, select {
    border: 1px solid rgba(0, 102, 255, 0.25) !important;
    border-radius: 8px !important;
    color: #ffffff !important;
}
input:focus, button:hover {
    border-color: #00e054 !important;
    box-shadow: 0 0 8px rgba(0, 224, 84, 0.3) !important;
}
EOF
    log_success "Injected Planet One theme overrides into style file: $main_css"
fi

# Copy Logo to target directory if available
if [ -f "${SCRIPT_DIR}/public/img/logo.jpg" ]; then
    log_info "Copying Planet One Logo to FullExplorer public assets..."
    mkdir -p img/
    cp "${SCRIPT_DIR}/public/img/logo.jpg" img/logo.jpg
    cp "${SCRIPT_DIR}/public/img/logo.jpg" logo.jpg 2>/dev/null || true
    log_success "Logo copied successfully."
fi

echo -e "${color_accent}"
echo "======================================================================"
echo "    PLANET ONE FULLEXPLORER SETUP COMPLETED SUCCESSFULLY!            "
echo "======================================================================"
echo " Location:  ${TARGET_DIR}"
echo " Config:    ${TARGET_DIR}/config.php"
echo " Run indexer: php -f ${TARGET_DIR}/w8io.php"
echo " Run webserver: php -S localhost:8080 -t ${TARGET_DIR}"
echo "======================================================================"
echo -e "${color_reset}"
