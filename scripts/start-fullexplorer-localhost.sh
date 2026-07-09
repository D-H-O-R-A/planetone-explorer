#!/usr/bin/env bash
# ==============================================================================
# Planet One FullExplorer Localhost Startup Script (100% Complete & Auto-Healing)
# ==============================================================================
# Automatiza instalação de dependências, inicia o indexador daemon e servidor
# API em background, valida o sucesso da inicialização e diagnostica o status
# de sincronização em tempo real comparando as alturas on-chain.
# ==============================================================================

set -euo pipefail

# Output coloring helpers
color_primary="\033[1;34m"   # Blue
color_accent="\033[1;32m"    # Green
color_warning="\033[1;33m"   # Yellow
color_error="\033[1;31m"     # Red
color_bold="\033[1;37m"
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
FULLEXPLORER_DIR="$(cd "${SCRIPT_DIR}/../fullexplorer" && pwd)"

echo -e "${color_primary}"
echo "======================================================================"
echo "          PLANET ONE - LOCAL FULLEXPLORER BACKGROUND SERVICE          "
echo "======================================================================"
echo -e "${color_reset}"

# 1. Verification of local files & configurations
if [ ! -d "$FULLEXPLORER_DIR" ] || [ ! -f "${FULLEXPLORER_DIR}/config.php" ]; then
    log_warning "FullExplorer directory or config.php is missing. Running automated setup..."
    if [ -f "${SCRIPT_DIR}/setup-fullexplorer.sh" ]; then
        bash "${SCRIPT_DIR}/setup-fullexplorer.sh"
    else
        log_error "setup-fullexplorer.sh not found. Cannot auto-heal configuration files."
        exit 1
    fi
fi

cd "$FULLEXPLORER_DIR"

# Verify PHP installation
if ! command -v php &> /dev/null; then
    log_warning "PHP não está instalado no sistema. Tentando instalar via sudo apt-get..."
    if sudo apt-get update && sudo apt-get install -y php-cli; then
        log_success "PHP-CLI instalado com sucesso!"
    else
        log_error "Não foi possível instalar o PHP automaticamente. Por favor, instale o PHP manualmente."
        exit 1
    fi
fi

# Verify required PHP extensions are present
log_info "Verificando módulos requeridos do PHP..."
MISSING_EXTS=()
for ext in gmp sqlite3 curl mbstring xml zip; do
    if ! php -m | grep -qi "$ext"; then
        MISSING_EXTS+=("php-$ext")
    fi
done

# Check if system unzip command is available
if ! command -v unzip &> /dev/null; then
    MISSING_EXTS+=("unzip" "zip")
fi

if [ ${#MISSING_EXTS[@]} -gt 0 ]; then
    log_warning "Os seguintes módulos PHP ou ferramentas necessárias estão faltando: ${MISSING_EXTS[*]}"
    log_info "Tentando instalar automaticamente usando sudo..."
    if sudo apt-get update && sudo apt-get install -y "${MISSING_EXTS[@]}"; then
        log_success "Módulos e ferramentas instalados com sucesso!"
    else
        log_error "Não foi possível instalar os módulos de forma automática."
        log_warning "Por favor, execute o comando manualmente no seu terminal:"
        echo -e "${color_bold}  sudo apt-get update && sudo apt-get install -y ${MISSING_EXTS[*]}${color_reset}"
        exit 1
    fi
fi

# Automatic file ownership corrective repair if files are owned by root
if [ "$(stat -c '%U' "${FULLEXPLORER_DIR}/index.php" 2>/dev/null || echo "root")" = "root" ]; then
    log_warning "Arquivos do FullExplorer detectados sob propriedade do root."
    log_info "Ajustando propriedade dos arquivos para o usuário atual ($USER) usando sudo..."
    if sudo chown -R "$USER:$USER" "$FULLEXPLORER_DIR"; then
        log_success "Propriedade dos arquivos corrigida com sucesso!"
    else
        log_error "Falha ao corrigir permissões de arquivo. Prossiga com cuidado."
    fi
fi

# 2. Check and Auto-Install Composer Dependencies
if [ ! -f "vendor/autoload.php" ]; then
    log_warning "Composer dependencies (vendor/autoload.php) are missing. Starting automatic installation..."
    
    if [ ! -f "composer.phar" ]; then
        log_info "Downloading Composer local binary (composer.phar)..."
        curl -sS https://getcomposer.org/installer | php
    fi
    
    log_info "Installing PHP dependencies (ignoring local platform requirements for speed)..."
    php composer.phar update --ignore-platform-reqs --no-audit
    log_success "Composer dependencies successfully installed!"
fi

PORT=8080
LOG_FILE="${FULLEXPLORER_DIR}/fullexplorer_local.log"

# Clean up any process already occupying the target port before starting
if lsof -i :$PORT -t &>/dev/null || fuser $PORT/tcp &>/dev/null; then
    log_warning "Port $PORT is already in use! Attempting to terminate the occupying process..."
    OCCUPYING_PID=$(lsof -t -i:$PORT 2>/dev/null)
    if [ ! -z "$OCCUPYING_PID" ]; then
        kill -9 $OCCUPYING_PID 2>/dev/null || true
    fi
    fuser -k $PORT/tcp 2>/dev/null || true
    
    # Check if we successfully freed the port
    sleep 1
    if lsof -i :$PORT -t &>/dev/null; then
        log_error "Failed to free port $PORT! The process might be owned by another user (e.g. root/www-data)."
        log_warning "DIAGNÓSTICO: Por favor, execute o comando abaixo no seu terminal para liberar a porta $PORT:"
        echo -e "${color_bold}  sudo fuser -k ${PORT}/tcp${color_reset}"
        exit 1
    else
        log_success "Successfully freed port $PORT!"
    fi
fi

# Clean old process if exists
log_info "Stopping any previously running FullExplorer and API server on localhost..."
pkill -f "bash updater.sh" || true
pkill -f "bash updater_headers.sh" || true
pkill -f "php -f w8_updater.php" || true
pkill -f "php -f w8_updater_headers.php" || true
pkill -f "php -S localhost:${PORT}" || true
pkill -f "php -S 127.0.0.1:${PORT}" || true
rm -f "$LOG_FILE"
touch "$LOG_FILE"

# Eliminate any existing database files to prevent permission/overwrite/corrupt issues and force clean state
log_info "Eliminating previous SQLite database repository files to avoid overwriting or lock issues..."
rm -f "${FULLEXPLORER_DIR}/var/db/blockchain.sqlite3"* 2>/dev/null || true

# Make updater scripts executable
chmod +x updater.sh updater_headers.sh 2>/dev/null || true

# 3. Spin up services in background (using updater loops)
log_info "Initializing database indexer daemon loop in background..."
nohup bash updater.sh >> "$LOG_FILE" 2>&1 &
disown

log_info "Initializing headers indexer daemon loop in background..."
nohup bash updater_headers.sh >> "$LOG_FILE" 2>&1 &
disown

log_info "Starting PHP Built-in API server on http://127.0.0.1:${PORT} in background..."
nohup php -S 127.0.0.1:"$PORT" >> "$LOG_FILE" 2>&1 &
disown

# 4. Success Verification Loop
log_info "Waiting for services to initialize (4 seconds)..."
sleep 4

# Check log file for obvious fatal errors
if grep -qi "Fatal error" "$LOG_FILE" || grep -qi "PDOException" "$LOG_FILE" || grep -qi "Permission denied" "$LOG_FILE" || grep -qi "readonly database" "$LOG_FILE" || grep -qi "Failed to listen" "$LOG_FILE"; then
    log_error "FullExplorer failed to start! Errors found in log file:"
    echo -e "${color_warning}"
    grep -i -E "Fatal error|PDOException|driver|Permission denied|readonly|Failed to listen" "$LOG_FILE" | head -n 10 || true
    echo -e "${color_reset}"
    
    # Check specifically for SQLite driver issue
    if grep -qi "could not find driver" "$LOG_FILE"; then
        log_warning "DIAGNÓSTICO: O driver SQLite para o PHP está faltando no seu sistema!"
        log_warning "Para corrigir este erro, execute o comando abaixo no terminal da sua máquina e reinicie:"
        echo -e "${color_bold}  sudo apt-get update && sudo apt-get install -y php8.3-sqlite3 php8.3-curl php8.3-mbstring php8.3-xml${color_reset}"
    fi

    # Check specifically for SQLite Permission / Readonly database issues
    if grep -qi "Permission denied" "$LOG_FILE" || grep -qi "readonly database" "$LOG_FILE"; then
        log_warning "DIAGNÓSTICO: Arquivos de banco de dados do FullExplorer estão com permissão protegida/propriedade do root!"
        log_warning "Para corrigir a permissão dos arquivos, execute o seguinte comando no seu terminal e reinicie:"
        echo -e "${color_bold}  sudo chown -R \$USER:\$USER ${FULLEXPLORER_DIR}/${color_reset}"
    fi

    # Check specifically for Address already in use
    if grep -qi "Address already in use" "$LOG_FILE"; then
        log_warning "DIAGNÓSTICO: A porta ${PORT} já está sendo utilizada por outro processo do PHP/Nginx!"
        log_warning "Para liberar a porta ${PORT} de forma forçada, execute o seguinte comando no seu terminal e reinicie:"
        echo -e "${color_bold}  sudo fuser -k ${PORT}/tcp${color_reset}"
    fi
    exit 1
fi

# Verify connection to local API and check sync progress
log_info "Verifying API server status and checking blockchain synchronization..."

# Run PHP helper script to query API and Node height
SYNC_CHECK=$(php -r '
    $stats_url = "http://127.0.0.1:8080/api/stats";
    $node_url = "https://nodes.planetone.io/blocks/height";
    
    // Fetch local stats
    $ctx_local = stream_context_create(["http" => ["timeout" => 2]]);
    $stats_raw = @file_get_contents($stats_url, false, $ctx_local);
    $stats = $stats_raw ? json_decode($stats_raw, true) : null;
    
    // Fetch remote node height
    $ctx_remote = stream_context_create(["http" => ["timeout" => 3]]);
    $node_raw = @file_get_contents($node_url, false, $ctx_remote);
    $node = $node_raw ? json_decode($node_raw, true) : null;
    
    if (!$stats) {
        echo "API_ERROR\n";
    } else {
        $local_height = isset($stats["height"]) ? (int)$stats["height"] : 0;
        $remote_height = isset($node["height"]) ? (int)$node["height"] : 0;
        
        if ($remote_height === 0) {
            echo "NODE_ERROR|$local_height\n";
        } elseif ($local_height >= $remote_height) {
            echo "SYNC_COMPLETE|$local_height|$remote_height\n";
        } else {
            echo "SYNC_PENDING|$local_height|$remote_height\n";
        }
    }
' 2>/dev/null || echo "PHP_EXEC_ERROR")

case "$SYNC_CHECK" in
    SYNC_COMPLETE*)
        local_h=$(echo "$SYNC_CHECK" | cut -d'|' -f2)
        remote_h=$(echo "$SYNC_CHECK" | cut -d'|' -f3)
        log_success "Planet One FullExplorer está ONLINE e ativo!"
        log_success "STATUS: Totalmente sincronizado com a blockchain! (Bloco $local_h de $remote_h)"
        ;;
    SYNC_PENDING*)
        local_h=$(echo "$SYNC_CHECK" | cut -d'|' -f2)
        remote_h=$(echo "$SYNC_CHECK" | cut -d'|' -f3)
        pct=$(php -r "echo number_format(($local_h / $remote_h) * 100, 2);")
        log_success "Planet One FullExplorer está ONLINE e ativo!"
        log_warning "STATUS: Sincronização em andamento... $pct% completo (Bloco local: $local_h / Nó remoto: $remote_h)"
        log_warning "O indexador daemon continuará importando novos blocos silenciosamente em background."
        ;;
    NODE_ERROR*)
        local_h=$(echo "$SYNC_CHECK" | cut -d'|' -f2)
        log_success "Planet One FullExplorer está ONLINE e ativo!"
        log_warning "STATUS: Sincronização pendente. Não foi possível consultar a altura do nó remoto, mas o indexador local está no bloco $local_h."
        ;;
    API_ERROR)
        log_error "Falha ao conectar na API local do FullExplorer em http://127.0.0.1:8080/api/stats."
        log_error "Por favor, verifique o arquivo de log para diagnosticar o erro: $LOG_FILE"
        exit 1
        ;;
    *)
        log_warning "FullExplorer iniciado, porém a verificação de status retornou um formato inesperado."
        log_info "Dica: Você pode verificar os logs a qualquer momento com: npm run logs:fullexplorer"
        ;;
esac

# Register trap to kill child processes when exiting/interrupted
cleanup() {
    echo ""
    log_warning "Encerrando servidores e indexadores do FullExplorer..."
    pkill -f "bash updater.sh" || true
    pkill -f "bash updater_headers.sh" || true
    pkill -f "php -f w8_updater.php" || true
    pkill -f "php -f w8_updater_headers.php" || true
    pkill -f "php -S 127.0.0.1:${PORT}" || true
    pkill -f "php -S localhost:${PORT}" || true
    log_success "Todos os processos do FullExplorer foram finalizados."
    exit 0
}
trap cleanup INT TERM EXIT

echo -e "${color_accent}"
echo "======================================================================"
echo "    PLANET ONE FULLEXPLORER INICIALIZADO COM SUCESSO!                 "
echo "======================================================================"
echo " URL local:   http://127.0.0.1:8080/"
echo " Monitorando logs em tempo real abaixo (Pressione Ctrl+C para encerrar)..."
echo "======================================================================"
echo -e "${color_reset}"

# Tail logs indefinitely to keep the process block active
tail -n 20 -f "$LOG_FILE"
