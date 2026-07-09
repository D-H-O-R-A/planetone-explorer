#!/usr/bin/env bash
# ==============================================================================
# Planet One Block Explorer Startup Script
# ==============================================================================
# Easily installs dependencies, builds, or spins up the development server
# for the standard React-based block explorer.
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
cd "$SCRIPT_DIR"

echo -e "${color_primary}"
echo "======================================================================"
echo "          PLANET ONE - BLOCK EXPLORER CONVENTIONAL STARTUP            "
echo "======================================================================"
echo -e "${color_reset}"

# Verify node/npm dependencies
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    log_error "Node.js and npm are required to run the conventional explorer. Please install them."
    exit 1
fi

log_success "Node.js environment detected."

# Check if node_modules are installed
if [ ! -d "node_modules" ]; then
    log_warning "node_modules not found. Executing 'npm install' to fetch dependencies..."
    npm install
    log_success "Dependencies installed successfully."
fi

# Parse options
MODE="dev"
PORT=5173

while [[ $# -gt 0 ]]; do
    case "$1" in
        --build)
            MODE="build"
            shift
            ;;
        --preview)
            MODE="preview"
            shift
            ;;
        --port)
            PORT="$2"
            shift 2
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Usage: ./start-explorer.sh [--build] [--preview] [--port <number>]"
            exit 1
            ;;
    esac
done

if [ "$MODE" = "build" ]; then
    log_info "Building the production static bundle..."
    npm run build
    log_success "Production compile build completed successfully inside dist/."
elif [ "$MODE" = "preview" ]; then
    log_info "Building and previewing on port ${PORT}..."
    npm run build
    log_info "Starting preview server..."
    npx vite preview --port "$PORT" --host
else
    log_info "Spinning up Vite development server on port ${PORT}..."
    npx vite --port "$PORT" --host
fi
