# 🌍 Planet One Blockchain Explorer Suite

Este repositório contém a suíte completa de exploradores de blocos da rede **Planet One (PLO)**. A suíte é dividida em dois componentes principais que trabalham de forma coordenada:

1. **Planet One Explorer (Frontend)**: Uma aplicação web moderna, rápida e esteticamente premium construída em **React, TypeScript, Vite e Tailwind CSS**.
2. **Planet One Full Explorer (Indexador e API)**: Um backend robusto e leve construído em **PHP e SQLite**, responsável por indexar toda a blockchain em banco de dados relacional SQL, fornecer APIs REST completas e uma interface de terminal técnica.

---

## 🚀 Componente 1: Planet One Explorer (Frontend)

O frontend é a interface premium do usuário para inspecionar blocos, transações de usuários, contratos inteligentes (Ride), balanços de endereços, validadores/consenso e transações pendentes em tempo real (Mempool).

### ✨ Funcionalidades do Frontend
* **Design Premium & Glassmorphic**: Interface visual impecável compatível com os modos Light e Dark.
* **Barra de Dados Unificada (*Sleek Data Bar*)**: Exibição simétrica em 6 colunas de estatísticas de rede em tempo real.
* **Seção de Transações Pendentes (Mempool)**: Monitoramento em tempo real de transações na fila do nó aguardando inclusão em novos blocos.
* **Integração de APIs Inteligente**: Consome gRPC/RPC diretamente do nó da rede e possui fallback automático para a API do Full Explorer SQL para pesquisas retroativas, contagens de endereços e transações totais.
* **Mapeador EVM/PLO**: Conversor visual de endereços de formato PLO/Bech32 para EVM/Hexadecimal para interações de contratos inteligentes.
* **Visualização de Contratos Inteligentes**: Interface dedicada para verificar scripts Ride instalados e suas chamadas de função.

### 💻 Como Iniciar o Frontend Localmente

#### Pré-requisitos
* Node.js (v18+) e npm ou bun instalados.

#### Passos
1. Entre na pasta do explorer:
   ```bash
   cd explorer
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento Vite local:
   ```bash
   npm run dev
   ```
   A aplicação estará disponível em `http://localhost:5173`.

4. Para compilar o bundle estático de produção:
   ```bash
   npm run build
   ```

---

## ⚡ Componente 2: Planet One Full Explorer (Indexador & API Backend)

Localizado em `./fullexplorer`, o Full Explorer é um daemon de indexação on-chain extremamente rápido e leve baseado em PHP e SQLite. Ele escuta cada bloco gerado pelo nó da blockchain, normaliza, analisa e popula tabelas SQL locais.

### ✨ Funcionalidades do Backend
* **Indexação Incremental de Alta Velocidade**: Sincroniza blocos inteiros em frações de segundos.
* **API REST Nativa**: Fornece endpoints rápidos para consultar estatísticas de endereços ativos, ranking de moedas em circulação, transações, blocos de forma detalhada e transações internas.
* **Baixo Consumo de Recursos**: Sem necessidade de dependências pesadas, utilizando apenas SQLite como base de dados relacional.

### 💻 Como Iniciar o Full Explorer Localmente

#### Pré-requisitos
* PHP (v7.4 - v8.3) instalado.
* Extensões do PHP habilitadas: `sqlite3`, `curl`, `json`, `mbstring`.

#### Passos
1. Para instalar e configurar o ambiente de forma automática pela primeira vez:
   ```bash
   npm run setup:fullexplorer
   ```
2. Para iniciar o indexador e o servidor local de desenvolvimento na porta `8000`:
   ```bash
   npm run start:fullexplorer
   ```
   * O servidor web PHP estará ativo em `http://localhost:8000` fornecendo as APIs de dados históricos.
   * O daemon de sincronização em segundo plano estará ativado populando o arquivo de banco de dados SQLite.

3. Para ler os logs de sincronização local do Full Explorer:
   ```bash
   npm run logs:fullexplorer
   ```

---

## 🛠️ Scripts Úteis (package.json)

Dentro do diretório `explorer`, os seguintes comandos estão prontos para uso através do seu gerenciador de pacotes:

| Comando | Descrição |
|:---|:---|
| `npm run dev` | Inicia o servidor local de desenvolvimento do frontend React/Vite. |
| `npm run build` | Compila o frontend de produção otimizado na pasta `dist/`. |
| `npm run start:explorer` | Executa o script interativo de inicialização do frontend. |
| `npm run setup:fullexplorer` | Instala dependências do Composer e inicializa pastas para o Full Explorer. |
| `npm run start:fullexplorer` | Executa o painel interativo para iniciar o indexador e servidor PHP localmente. |
| `npm run logs:fullexplorer` | Monitora em tempo real a sincronização e logs do indexador de blocos do Full Explorer. |
| `npm run preview` | Inicia um servidor local para visualizar a build de produção compilada. |

---

## 🌐 Implantação em Servidor de Produção

### 1. Publicando o Frontend (Explorer)
O build estático gerado por `npm run build` pode ser servido por qualquer servidor web moderno de arquivos estáticos como Nginx, Apache ou Firebase Hosting.
* **Firebase Hosting**: Já vem pré-configurado. Para publicar, basta executar `npx firebase deploy` caso as credenciais estejam ativas.

### 2. Publicando o Backend (Full Explorer)

#### Configuração do Nginx (VirtualHost)
Para servir a API do Full Explorer no subdomínio `fullexplorer.planetone.io` utilizando PHP-FPM, adicione o seguinte bloco no seu Nginx:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name fullexplorer.planetone.io;

    root /home/diegooris/Documentos/planetone/explorer/fullexplorer;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php-fpm.sock; # ajuste para sua versão do PHP
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location /var {
        deny all;
        return 403;
    }
}
```

#### Serviço de Background com Systemd (Para manter o Indexador Rodando)
Crie o arquivo `/etc/systemd/system/planetone-indexer.service` para manter o indexador ativo em segundo plano sincronizando blocos ininterruptamente:
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
Ative e inicie o serviço:
```bash
sudo systemctl daemon-reload
sudo systemctl enable planetone-indexer.service
sudo systemctl start planetone-indexer.service
```

---

## 📝 Direitos Autorais e Licença

**Licença de Uso - Planet One Explorer Suite (Estudo e Transparência)**

Copyright (c) 2026 **Diego Henrique Roa Antunes** (Diego Oris). Todos os direitos reservados.

O código-fonte desta suíte de exploradores de blocos é disponibilizado publicamente e deixado em aberto como um compromisso com a **transparência total, descentralização e facilidade de auditoria** da infraestrutura tecnológica da rede blockchain Planet One (PLO), além de servir de material educativo e de estudo pessoal para desenvolvedores da comunidade.

Ao acessar este repositório, você concorda expressamente com os seguintes termos:
1. **Transparência e Estudo**: Você possui permissão total para ler, depurar, auditar e estudar este código-fonte para fins pessoais, acadêmicos ou de pesquisa.
2. **Proibição de Comercialização**: É estritamente proibida qualquer exploração comercial, licenciamento, sublicenciamento ou venda deste software (completo ou em partes) para fins lucrativos de terceiros.
3. **Restrição de Uso em Produção**: É proibido implantar ou executar este software de forma pública ou em redes concorrentes sem autorização prévia por escrito de Diego Henrique Roa Antunes.
4. **Modificação e Créditos**: Alterações e clonagem do código-fonte para fins públicos exigem a manutenção explícita dos direitos autorais originais, atribuindo os devidos créditos de autoria intelectual ao autor original Diego Henrique Roa Antunes (Diego Oris).

Para obter permissões especiais além destas diretrizes de transparência, entre em contato diretamente com o titular dos direitos autorais.
