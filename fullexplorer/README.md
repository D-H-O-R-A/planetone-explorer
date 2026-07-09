# ⚡ Planet One Full Explorer (API & Indexador Backend)

O **Planet One Full Explorer** é um indexador de blockchain de alto desempenho e servidor de API leve e veloz baseado em PHP e SQLite. 

Ele atua como o cérebro relacional para a rede **Planet One (PLO)**. O indexador escuta a blockchain em tempo real, normaliza, analisa e armazena os blocos, transações de consenso, transferências, balanços de endereços e interações de contratos inteligentes em tabelas SQLite locais altamente otimizadas. Isso permite consultas de API REST instantâneas para alimentar o frontend premium e fornecer dados históricos que o nó gRPC bruto não consegue responder com eficiência relacional.

---

## 🛠️ Requisitos de Ambiente

Para executar o indexador e a API localmente ou em produção, você precisará de:
* **PHP**: Versão 7.4, 8.0, 8.1, 8.2 ou 8.3 instalado.
* **Extensões PHP Habilitadas**:
  * `sqlite3` (Banco de dados de armazenamento local)
  * `curl` (Para realizar requisições HTTP rápidas ao nó de consenso)
  * `json` (Tratamento estruturado de dados das respostas do nó)
  * `mbstring` (Tratamento e codificação de strings UTF-8)

---

## 💻 Como Iniciar e Testar Localmente

### 1. Inicializar Diretórios e Permissões
Antes do primeiro uso, certifique-se de criar a estrutura de pastas temporárias necessárias e dar permissões de gravação ao PHP:
```bash
mkdir -p var/db var/log var/tmp
chmod -R 775 var
```

### 2. Iniciar a Sincronização da Blockchain (Indexer)
O script `w8_updater.php` é o daemon que se conecta ao nó RPC e faz o download incremental de todos os blocos:

* **Sincronização Padrão (Incrementar blocos)**:
  ```bash
  php w8_updater.php
  ```
* **Sincronização Manual por Argumento**:
  ```bash
  php w8_updater.php indexer
  ```
* **Rollback de Blocos (Se necessário)**:
  Para reverter a indexação até um bloco específico em caso de bifurcações ou reorganização de rede:
  ```bash
  php w8_updater.php rollback <numero_do_bloco>
  ```

Os logs de sincronização serão gravados em tempo real em `var/log/updater.log`.

### 3. Iniciar o Servidor Web da API Localmente
Você pode utilizar o servidor embutido do PHP para levantar o endpoint da API na porta `8000`:
```bash
php -S 0.0.0.0:8000 -t .
```
A API REST e os endpoints de dados do Full Explorer estarão disponíveis localmente em `http://localhost:8000`.

---

## 🌐 Implantação em Servidor de Produção (Acesso Público)

Para expor o Full Explorer de forma profissional em subdomínios como `fullexplorer.planetone.io` utilizando o Nginx e o PHP-FPM, siga as instruções abaixo:

### 1. VirtualHost no Nginx
Crie ou edite um arquivo de configuração no diretório de sites do Nginx (ex: `/etc/nginx/sites-available/fullexplorer`):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name fullexplorer.planetone.io;

    # Altere para o caminho absoluto do seu projeto
    root /home/diegooris/Documentos/planetone/explorer/fullexplorer;
    index index.php index.html;

    location / {
        # Redireciona todas as rotas amigáveis da API para o script central index.php
        try_files $uri $uri/ /index.php?$args;
    }

    # Proxy para o PHP-FPM
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        # Altere o caminho do socket para a versão do seu PHP-FPM instalada
        fastcgi_pass unix:/var/run/php/php-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Bloqueio de segurança para impedir acesso direto ao arquivo do banco de dados SQLite
    location /var {
        deny all;
        return 403;
    }
}
```
*Após configurar, valide e recarregue o Nginx:*
```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 2. Serviço de Segundo Plano no Systemd (Daemonizador)
Para que a blockchain continue indexando em segundo plano continuamente sem depender do seu terminal aberto, crie o arquivo de serviço `/etc/systemd/system/planetone-indexer.service`:

```ini
[Unit]
Description=Planet One Archival Indexer Service
After=network.target

[Service]
Type=simple
User=diegooris
WorkingDirectory=/home/diegooris/Documentos/planetone/explorer/fullexplorer
ExecStart=/usr/bin/php /home/diegooris/Documentos/planetone/explorer/fullexplorer/w8_updater.php
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=planetone-indexer

[Install]
WantedBy=multi-user.target
```

Habilite e inicie o indexador para rodar no boot da máquina:
```bash
sudo systemctl daemon-reload
sudo systemctl enable planetone-indexer.service
sudo systemctl start planetone-indexer.service
```

Para inspecionar o status do indexador ativo:
```bash
sudo systemctl status planetone-indexer.service
```

---

## 📝 Direitos Autorais e Licença

**Proprietary Software License**

Copyright (c) 2026 **Diego Henrique Roa Antunes** (Diego Oris). Todos os direitos reservados.

Este indexador e API customizados fazem parte do ecossistema proprietário Planet One, licenciado exclusivamente para a **Zarra Digital** sob os termos contratuais do "Contrato Particular de Associação Estratégica, Licenciamento Exclusivo de Tecnologia, Participação nos Resultados, Governança da Propriedade Intelectual e Outras Avenças", firmado em 28 de Junho de 2026.

---

## 👥 Créditos e Agradecimentos

Este projeto utiliza como motor central de indexação uma versão estendida e customizada do motor open-source de alto desempenho **W8IO**, concebido e desenvolvido originalmente pelo desenvolvedor **Dmitrii Pichulin** ([deemru](https://github.com/deemru) / [github.com/deemru](https://github.com/deemru)), distribuído sob os termos da Licença MIT.

Deixamos registrado o nosso sincero agradecimento e reconhecimento ao autor Dmitrii por sua excelente arquitetura open-source que serviu como base sólida para esta implementação.
