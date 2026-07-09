#!/usr/bin/env bash
# ==============================================================================
# Planet One FullExplorer (w8io) Startup & Running Script
# ==============================================================================
# Verifies setup, starts the PHP blockchain indexing daemon, and serves the
# web frontend on a designated port.
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
FULLEXPLORER_DIR="${SCRIPT_DIR}/fullexplorer"

echo -e "${color_primary}"
echo "======================================================================"
echo "          PLANET ONE - FULLEXPLORER RUNNING & INDEXING DAEMON        "
echo "======================================================================"
echo -e "${color_reset}"

# Check if setup has been done
if [ ! -d "$FULLEXPLORER_DIR" ] || [ ! -f "${FULLEXPLORER_DIR}/config.php" ]; then
    log_warning "FullExplorer is not set up or configured yet. Running setup-fullexplorer.sh first..."
    bash "${SCRIPT_DIR}/setup-fullexplorer.sh"
fi

cd "$FULLEXPLORER_DIR"

# Verify system dependencies
if ! command -v php &> /dev/null; then
    log_error "PHP is required to run FullExplorer. Please install it."
    exit 1
fi

PORT=8080
DAEMON_MODE=true

while [[ $# -gt 0 ]]; do
    case "$1" in
        --port)
            PORT="$2"
            shift 2
            ;;
        --foreground)
            DAEMON_MODE=false
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Usage: ./start-fullexplorer.sh [--port <number>] [--foreground]"
            exit 1
            ;;
    esac
done

# Start indexing process
log_info "Starting Planet One FullExplorer database indexing engine..."
if [ "$DAEMON_MODE" = true ]; then
    # Run the indexer in background loop
    log_info "Launching indexer process in the background..."
    nohup php -f w8_updater.php > indexer.log 2>&1 &
    INDEXER_PID=$!
    log_success "Indexer daemon started successfully! (PID: ${INDEXER_PID}). Logs: ${FULLEXPLORER_DIR}/indexer.log"
else
    log_warning "Starting indexer in foreground mode. Press Ctrl+C to terminate."
    php -f w8_updater.php
    exit 0
fi

# Serve the frontend
log_info "Starting built-in PHP web server to serve FullExplorer frontend on port ${PORT}..."
log_success "Access FullExplorer at http://localhost:${PORT}"
log_info "Press Ctrl+C to terminate both web server and indexer daemon."

# Trap to kill background indexer when script exits
cleanup() {
    log_warning "Shutting down web server and indexer process (PID: ${INDEXER_PID})..."
    kill "$INDEXER_PID" 2>/dev/null || true
    log_success "Shutdown complete."
}
trap cleanup EXIT

# Run PHP Built-in server
php -S 0.0.0.0:"$PORT"
