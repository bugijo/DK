<<<<<<< HEAD
# Dungeon Keeper

Um jogo de RPG com sistemas modulares e extensíveis para personagens, combate, inventário e magia.

## Integração com Supabase

Para conectar a API Node/TypeScript a um projeto Supabase, siga `docs/SUPABASE_SETUP.md`, que lista as variáveis necessárias (`SUPABASE_URL`, `SUPABASE_ANON_KEY` e opcionalmente `SUPABASE_SERVICE_KEY`) e o passo a passo para validar a conexão. O backend Python também aceita `DATABASE_URL` ou os campos `DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME`, montando a URL de forma segura.

## Sistemas Implementados

### Sistema de Personagens
- Atributos básicos
- Sistema básico de níveis
- Gerenciamento de recursos
- Classes e habilidades (em progresso)

### Sistema de Combate
- Sistema de iniciativa
- Condições e efeitos
- Tipos de dano e resistências
- Sistema de rounds e ações
- Reações e oportunidades

### Sistema de Inventário
- Sistema básico de itens
- Gerenciamento de inventário
- Sistema de equipamentos (em progresso)

### Sistema de Magias
- Sistema básico de magias
- Efeitos e condições
- Sistema de custos (em progresso)

## Estrutura do Projeto

```
src/
  systems/
    character/       # Sistema de personagens
    combat/         # Sistema de combate
    inventory/      # Sistema de inventário
    magic/         # Sistema de magias
```

## 📋 Pré-requisitos

- Python 3.7 ou superior
- Conta no Telegram
- Bot do Telegram criado via @BotFather
- Trae IDE em execução

## 🚀 Instalação e Configuração

### 1. Clone ou baixe os arquivos

```bash
# Se usando git
git clone <seu-repositorio>
cd <diretorio-do-projeto>

# Ou simplesmente baixe os arquivos para uma pasta
```

### 2. Instale as dependências

```bash
pip install -r requirements_telegram.txt
```

### 3. Configure o arquivo .env.telegram

```bash
# Copie o arquivo de exemplo
cp .env.telegram.example .env.telegram

# Edite o arquivo .env.telegram com suas configurações
```

**⚠️ IMPORTANTE: Verifique formatação de .env: sem quebras de linha no token.**

**Configurações necessárias:**

```env
# Token do seu bot (obtenha em @BotFather)
TELEGRAM_TOKEN=seu_token_aqui

# ID do chat autorizado (obtenha executando get_chat_id_async.py)
TELEGRAM_CHAT_ID=seu_chat_id_numerico

# URL da API do Trae IDE
TRAE_API_URL=http://localhost:8000/trae-command

# Configurações opcionais
TIMEOUT_REQUESTS=30
MAX_RETRIES=3
```

### 4. Obtenha seu Chat ID

```bash
# Execute o script para obter seu chat_id
python get_chat_id_async.py

# Envie uma mensagem para o bot no Telegram
# O script mostrará seu chat_id
# Depois de inserir CHAT_ID, rode novamente para verificar:
python get_chat_id_async.py
```

### 5. Inicie o bot

```bash
# Usando o script de inicialização (recomendado)
python start_telegram_bot.py

# Ou diretamente
python telegram_bot.py
```

## Uso

Para implementar um novo sistema:

```bash
python scripts/implement_system.py <nome_do_sistema>
```

Sistemas disponíveis:
- Character
- Combat
- Inventory
- Magic

## 🧪 Testes

### Teste básico do bot
```bash
# Inicie o bot e teste no Telegram
python start_telegram_bot.py

# Comandos para testar:
/start
/status
/help
```

### Teste de conectividade com Trae IDE
```bash
# Teste a API do Trae antes de usar no bot
curl -X POST http://localhost:8000/trae-command \
  -H "Content-Type: application/json" \
  -d '{"command": "status"}'

# Ou use Postman para testar a API
```

## 🔗 Integração Trae IDE

### Se não tiver endpoint HTTP
Se o Trae IDE usar JSON-RPC em socket/stdio, você pode criar um micro-servidor HTTP local:

```python
# Exemplo com FastAPI
from fastapi import FastAPI
import json

app = FastAPI()

@app.post("/trae-command")
async def trae_proxy(command: dict):
    # Converte REST para JSON-RPC interno
    # Envia para Trae via socket/stdio
    # Retorna resposta
    pass
```

### Configuração avançada
- Use VPN/SSH túnel se expor porta
- Restrinja FastAPI local a localhost
- Configure webhooks para callbacks do Trae

## 🔒 Segurança

- Bot só responde ao CHAT_ID configurado
- Tokens carregados de variáveis de ambiente
- Use VPN/SSH túnel para acesso remoto
- Nunca commite arquivos .env

## 📊 Logs e Monitoramento

```python
# Configure logs rotativos para debug
import logging
from logging.handlers import RotatingFileHandler

handler = RotatingFileHandler('bot.log', maxBytes=10485760, backupCount=5)
logging.basicConfig(handlers=[handler], level=logging.INFO)
```

### Health-check opcional
```bash
# Use systemd (Linux) ou serviço Windows para reiniciar se travar
# Exemplo systemd:
[Unit]
Description=Telegram Bot Trae IDE

[Service]
ExecStart=/usr/bin/python3 /path/to/start_telegram_bot.py
Restart=always

[Install]
WantedBy=multi-user.target
```

## 🚀 Características Técnicas

### Bot Telegram
- **Compatibilidade**: python-telegram-bot v20+ (assíncrono)
- **Wrapper Simplificado**: Interface limpa para comandos do Trae
- **Validação**: Verificação de variáveis de ambiente essenciais
- **Segurança**: Restrição por CHAT_ID para acesso controlado
- **Robustez**: Tratamento de exceções e timeouts configuráveis
- **Logs Rotativos**: Sistema de logging com rotação automática
- **Monitoramento**: Métricas e estatísticas de uso

### Wrapper FastAPI
- **API RESTful**: Endpoints HTTP para integração com Trae IDE
- **Autenticação**: Token-based authentication para segurança
- **Middleware**: Logging, CORS e headers de segurança
- **Observabilidade**: Métricas no formato Prometheus
- **Timeouts**: Configuração dinâmica baseada no tipo de comando
- **Validação**: Bloqueio de comandos potencialmente perigosos

## 🔧 Wrapper FastAPI (Opcional)

Se o Trae IDE não expõe uma API HTTP diretamente, use o wrapper FastAPI incluído:

### Configuração Rápida

1. **Configurar o wrapper**:
   ```bash
   python setup_wrapper.py
   ```

2. **Ou configurar manualmente**:
   ```bash
   cp .env.wrapper.example .env.wrapper
   # Edite as configurações necessárias
   ```

3. **Iniciar o wrapper**:
   ```bash
   python trae_wrapper.py
   ```

### Endpoints Disponíveis

- **POST `/trae-command`** - Executa comandos no Trae (requer autenticação)
- **GET `/health`** - Verificação de saúde (público)
- **GET `/stats`** - Estatísticas detalhadas (requer autenticação)
- **GET `/metrics`** - Métricas Prometheus (público)
- **GET `/docs`** - Documentação interativa da API

### Exemplo de Uso

```bash
# Health check
curl http://localhost:8000/health

# Executar comando (com autenticação)
curl -X POST http://localhost:8000/trae-command \
     -H "Authorization: Bearer SEU_TOKEN_AQUI" \
     -H "Content-Type: application/json" \
     -d '{"command":"status", "timeout":30}'
```

### Configuração no Bot

Após configurar o wrapper, atualize o bot para usar a API local:

```bash
# No .env.telegram, configure:
TRAE_API_URL=http://localhost:8000
TRAE_API_TOKEN=seu_token_do_wrapper
```

## 📋 Próximos Passos

### Configuração Básica

1. **Configurar `.env.telegram`**:
   ```bash
   cp .env.telegram.example .env.telegram
   # Edite com seus dados reais
   ```

2. **Obter Chat ID**:
   ```bash
   python get_chat_id_async.py
   ```

3. **Escolher método de integração**:
   - **Direto**: Se Trae tem API HTTP nativa
   - **Wrapper**: Use `python setup_wrapper.py` para configurar

4. **Testar conectividade**:
   ```bash
   # Teste direto com Trae
   curl -X POST http://localhost:8000/api/command \
        -H "Content-Type: application/json" \
        -d '{"command":"status"}'
   
   # Ou teste com wrapper
   curl http://localhost:8000/health
   ```

5. **Iniciar o bot**:
   ```bash
   python start_telegram_bot.py
   ```

6. **Testar comandos**:
   - `/start` - Verificar se o bot responde
   - `/status` - Testar comunicação com Trae
   - `/help` - Ver todos os comandos disponíveis

## 🚀 Próximos Features

## 🔧 Produção e Monitoramento

### Instalação como Serviço

**Linux (systemd)**:
```bash
# Copiar arquivo de serviço
sudo cp telegram-bot.service /etc/systemd/system/
sudo cp trae-wrapper.service /etc/systemd/system/

# Habilitar e iniciar
sudo systemctl enable telegram-bot trae-wrapper
sudo systemctl start telegram-bot trae-wrapper

# Verificar status
sudo systemctl status telegram-bot trae-wrapper
```

**Windows**:
```powershell
# Execute como Administrador
.\install_service_windows.ps1
.\install_wrapper_service_windows.ps1

# Iniciar serviços
net start TelegramBot
net start TraeWrapper
```

### Monitoramento

1. **Logs em tempo real**:
   ```bash
   # Bot
   tail -f telegram_bot.log
   
   # Wrapper
   tail -f trae_wrapper.log
   ```

2. **Métricas e estatísticas**:
   ```bash
   # Executar monitor
   python monitor_bot.py
   
   # Relatório único
   python monitor_bot.py --report
   
   # Métricas Prometheus
   curl http://localhost:8000/metrics
   ```

3. **Health checks**:
   ```bash
   # Bot (via wrapper)
   curl http://localhost:8000/health
   
   # Estatísticas detalhadas
   curl -H "Authorization: Bearer SEU_TOKEN" \
        http://localhost:8000/stats
   ```

### Segurança

- ✅ **Tokens seguros**: Geração automática de tokens criptográficos
- ✅ **Autenticação**: Bearer token para API e Chat ID para bot
- ✅ **Validação**: Bloqueio de comandos perigosos
- ✅ **Logs auditáveis**: Registro de todas as ações
- ✅ **Headers de segurança**: Proteção contra ataques comuns
- ✅ **Acesso restrito**: Apenas localhost por padrão

### Backup e Recuperação

```bash
# Backup de configurações
tar -czf telegram-bot-backup.tar.gz \
    .env.telegram .env.wrapper \
    *.log *.service *.ps1

# Restaurar configurações
tar -xzf telegram-bot-backup.tar.gz
```

### Upload/Download de arquivos
```python
# Use update.message.document e bot.send_document
async def handle_document(update, context):
    file = await update.message.document.get_file()
    await file.download_to_drive('received_file')
```

### Menus inline
```python
# Botões para comandos frequentes
from telegram import InlineKeyboardButton, InlineKeyboardMarkup

keyboard = [[InlineKeyboardButton("Status", callback_data='status')]]
reply_markup = InlineKeyboardMarkup(keyboard)
```

### Fluxos de confirmação
```python
# "Quer realmente deletar?" com botões Sim/Não
keyboard = [
    [InlineKeyboardButton("✅ Sim", callback_data='confirm_delete')],
    [InlineKeyboardButton("❌ Não", callback_data='cancel_delete')]
]
```

### Supervisão automática
```python
# Envie mensagem quando evento importante ocorrer no Trae
# Requer Trae chamar seu script ou polling
async def notify_build_failed():
    await bot.send_message(chat_id=CHAT_ID, text="🚨 Build falhou!")
```

## 🚀 Próximos Features

### Funcionalidades Planejadas
- **Upload/Download de arquivos** via Telegram
- **Menus inline** para confirmação de ações críticas
- **Notificações proativas** do Trae IDE
- **Suporte a múltiplos projetos/workspaces**
- **Interface web** complementar
- **Integração com CI/CD** pipelines

### Melhorias Técnicas
- **Webhook mode** para o bot (alternativa ao polling)
- **Rate limiting** para prevenir spam
- **Cache de comandos** frequentes
- **Backup automático** de configurações
- **Dashboard web** para monitoramento
- **Alertas automáticos** via email/Slack

## 🔧 Solução de Problemas

### Bot não responde
- Verifique se o token está correto (sem quebras de linha)
- Confirme se o chat_id está configurado e é numérico
- Verifique se o bot está em execução

### Erro de conexão com Trae IDE
- Confirme se o Trae IDE está rodando
- Verifique a URL da API no .env.telegram
- Teste com curl antes de usar no bot

### Problemas de dependências
- Atualize o pip: `pip install --upgrade pip`
- Reinstale as dependências: `pip install -r requirements_telegram.txt --force-reinstall`

## 📝 Resumo Rápido

1. **Ajuste .env**: token sem quebra de linha, coloque CHAT_ID obtido
2. **Use get_chat_id_async.py** para pegar ID
3. **Use template async** para telegram_bot.py (aiohttp + python-telegram-bot v20+)
4. **Verifique TRAE_API_URL** responde corretamente (testar com curl)
5. **Rode python start_telegram_bot.py** e teste comandos
6. **Refine enviar_para_trae** conforme método real do Trae (HTTP, CLI ou JSON-RPC)
7. **Garanta segurança e logs**

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Crie um Pull Request

## Status do Projeto

Veja o arquivo [progress.md](progress.md) para o status detalhado de cada sistema.

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.
=======
# Clínica Veterinária - Sistema de Gestão

API REST completa para sistema de gestão de clínica veterinária, desenvolvida com Node.js, TypeScript, Express e Supabase.

## 🚀 Funcionalidades

### 👥 Gestão de Usuários
- ✅ Autenticação JWT
- ✅ Controle de acesso baseado em roles (Admin, Veterinário, Atendente)
- ✅ CRUD completo de usuários
- ✅ Alteração de senhas
- ✅ Perfis de usuário

### 🧑‍⚕️ Gestão de Clientes
- ✅ Cadastro completo de clientes
- ✅ Validação de CPF
- ✅ Busca por CPF, nome, email
- ✅ Paginação e filtros
- ✅ Soft delete
- ✅ Estatísticas de clientes

### 🐾 Gestão de Pets
- ✅ Cadastro completo de pets
- ✅ Controle de microchip único
- ✅ Vinculação com clientes
- ✅ Busca por microchip, nome, espécie
- ✅ Controle de aniversários
- ✅ Estatísticas por espécie

### 🔒 Segurança
- ✅ Rate limiting
- ✅ Helmet para headers de segurança
- ✅ CORS configurável
- ✅ Validação de dados com Joi
- ✅ Hash de senhas com bcrypt
- ✅ Middleware de autenticação e autorização

### 📚 Documentação
- ✅ Swagger/OpenAPI 3.0
- ✅ Documentação interativa
- ✅ Exemplos de requisições

## 🛠️ Tecnologias

- **Node.js** - Runtime JavaScript
- **TypeScript** - Tipagem estática
- **Express** - Framework web
- **Supabase** - Backend as a Service (PostgreSQL)
- **JWT** - Autenticação
- **Joi** - Validação de dados
- **Jest** - Testes unitários
- **Swagger** - Documentação da API
- **Winston** - Logging
- **Helmet** - Segurança
- **CORS** - Cross-Origin Resource Sharing

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/bugijo/DK.git
cd DK
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Execute o projeto:
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com coverage
npm run test:coverage
```

## 📖 Documentação da API

Após iniciar o servidor, acesse:
- Documentação Swagger: `http://localhost:3000/api-docs`
- Health Check: `http://localhost:3000/health`

## 🚀 Deploy

O projeto está configurado para deploy em plataformas como Heroku, Vercel, Railway, etc.

## 📝 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.
>>>>>>> 46b8bc3480afc4f4a5be71272e310d797b4c88f4
