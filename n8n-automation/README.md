# 🤖 Automação de Testes - Dungeon Keeper

## 📋 Visão Geral

Esta automação utiliza **n8n** (uma ferramenta gratuita de automação) para executar testes automatizados no projeto Dungeon Keeper a cada 6 horas, verificando:

- ✅ **Login da API** (autenticação JWT)
- ✅ **Endpoints de Itens** (criação e listagem)
- ✅ **Endpoints de Monstros** (criação e listagem)
- ✅ **Endpoints de NPCs** (criação e listagem)
- ✅ **Endpoints de Histórias** (criação e listagem)
- ✅ **Frontend React** (disponibilidade)

## 🚀 Como Usar

### 1. Pré-requisitos

- **Docker** instalado no sistema
- **Dungeon Keeper** rodando (backend na porta 8000, frontend na porta 3001)

### 2. Iniciar a Automação

```bash
# Execute o script de inicialização
./start-n8n.bat
```

### 3. Configurar o Workflow

1. Acesse: **http://localhost:5678**
2. Faça login:
   - **Usuário:** `admin`
   - **Senha:** `admin123`
3. Importe o workflow:
   - Vá em **Workflows** → **Import**
   - Selecione o arquivo `workflows/dungeon-keeper-tests.json`
4. **Ative o workflow** para iniciar os testes automáticos

### 4. Parar a Automação

```bash
# Execute o script de parada
./stop-n8n.bat
```

## 📋 Workflows Disponíveis

### 1. **dungeon-keeper-tests.json**
- **Função:** Testes automatizados completos do sistema
- **Frequência:** A cada 6 horas
- **Testes:** Login, itens, monstros, NPCs, histórias, frontend
- **Relatório:** Sucesso/falha com detalhes

### 2. **populate-test-data.json**
- **Função:** Criação automática de dados de teste
- **Execução:** Manual ou agendada
- **Criação:** Itens, monstros, NPCs, histórias
- **Resultado:** Relatório de entidades criadas

### 3. **human-like-interface-testing.json** 🆕
- **Função:** Automação de interface como usuário real
- **Frequência:** A cada 2 horas
- **Simulação:** Navegação, cliques, preenchimento de formulários
- **Validação:** Screenshots, interações, usabilidade
- **Diferencial:** Testa a interface exatamente como um humano usaria

## 📊 Funcionalidades do Workflow

### 🕐 Agendamento
- **Frequência:** A cada 6 horas
- **Cron:** `0 */6 * * *`
- **Personalização:** Pode ser alterado no n8n

### 🧪 Testes Executados

1. **Teste de Login**
   - Endpoint: `POST /api/v1/token`
   - Verifica: Recebimento do token JWT

2. **Teste de Itens**
   - Endpoint: `GET /api/v1/items/`
   - Verifica: Lista de itens não vazia

3. **Teste de Monstros**
   - Endpoint: `GET /api/v1/monsters/`
   - Verifica: Lista de monstros não vazia

4. **Teste de NPCs**
   - Endpoint: `GET /api/v1/npcs/`
   - Verifica: Lista de NPCs não vazia

5. **Teste de Histórias**
   - Endpoint: `GET /api/v1/stories/`
   - Verifica: Lista de histórias não vazia

6. **Teste do Frontend**
   - URL: `http://localhost:3001`
   - Verifica: Disponibilidade da aplicação

### 📈 Relatórios

- **Score Geral:** X/6 testes passaram
- **Percentual:** % de sucesso
- **Status Individual:** PASS/FAIL para cada teste
- **Timestamp:** Data/hora da execução

## 🔧 Personalização

### Alterar Frequência dos Testes

1. No n8n, edite o nó **"Executar a cada 6 horas"** (ou **"Schedule Every 2 Hours"** para UI)
2. Modifique a expressão cron:
   - `0 */1 * * *` = A cada hora
   - `0 */12 * * *` = A cada 12 horas
   - `0 0 * * *` = Diariamente à meia-noite

### Adicionar Novos Testes

1. Adicione um novo nó **HTTP Request** (para testes de API)
2. Adicione nós **Puppeteer** (para testes de interface)
3. Configure endpoints, seletores e dados
4. Conecte ao nó **"Processar Resultados"**
5. Atualize o código JavaScript para incluir o novo teste

### Configurar Notificações

- **Slack:** Adicione nó Slack após "Verificar Falhas"
- **Email:** Adicione nó Email após "Verificar Falhas"
- **Discord:** Adicione nó Discord após "Verificar Falhas"
- **Telegram:** Adicione nó Telegram após "Verificar Falhas"

## 🤖 Automação de Interface Humana

O workflow **human-like-interface-testing.json** revoluciona os testes ao simular um usuário real:

### 🎭 Como Funciona
- **Puppeteer:** Controla um navegador real (Chrome/Chromium)
- **Interações Reais:** Cliques, digitação, navegação como humano
- **Validação Visual:** Screenshots para verificar interface
- **Tempo Realista:** Pausas entre ações simulando pensamento

### 🔍 O que é Testado
1. **Registro de Usuário:** Preenche formulário completo
2. **Criação de Personagens:** Múltiplos personagens com dados únicos
3. **Criação de Mesas:** Como mestre, cria mesa de jogo
4. **Interações de Jogador:** Chat, rolagem de dados, navegação
5. **Validação Visual:** Capturas de tela de todas as seções

### 🎯 Vantagens sobre Testes de API
- **Visão Real:** Testa exatamente o que o usuário vê
- **UX Validation:** Verifica usabilidade e responsividade
- **Bugs Visuais:** Detecta problemas de CSS, layout, elementos
- **Fluxo Completo:** Testa jornada completa do usuário
- **Screenshots:** Evidência visual dos testes

### ⚙️ Configuração Avançada
```javascript
// Exemplo de seletor personalizado
await page.waitForSelector('.meu-botao-customizado');
await page.click('.meu-botao-customizado');

// Exemplo de validação visual
const screenshot = await page.screenshot({ fullPage: true });

// Exemplo de interação realista
await page.type('#campo-texto', 'Minha mensagem', { delay: 100 });
```

## 🐛 Solução de Problemas

### N8N não inicia
```bash
# Verificar se Docker está rodando
docker --version

# Verificar logs
docker-compose logs n8n
```

### Testes falhando
1. Verifique se o backend está rodando na porta 8000
2. Verifique se o frontend está rodando na porta 3001
3. Confirme que o usuário `admin` existe no banco
4. Execute manualmente: `python test_data_creation.py`

### Problemas de conectividade
- O n8n roda em Docker e usa `host.docker.internal` para acessar localhost
- No Windows, certifique-se que o Docker Desktop está configurado corretamente

## 📁 Estrutura de Arquivos

```
n8n-automation/
├── docker-compose.yml          # Configuração do Docker
├── workflows/
│   └── dungeon-keeper-tests.json  # Workflow do n8n
├── start-n8n.bat              # Script para iniciar
├── stop-n8n.bat               # Script para parar
└── README.md                  # Este arquivo
```

## 🎯 Benefícios

- ✅ **Detecção Precoce:** Identifica problemas antes que afetem usuários
- ✅ **Monitoramento 24/7:** Testes contínuos sem intervenção manual
- ✅ **Relatórios Detalhados:** Visibilidade completa do status do sistema
- ✅ **Gratuito:** n8n é open-source e gratuito
- ✅ **Flexível:** Fácil de personalizar e expandir
- ✅ **Visual:** Interface gráfica intuitiva para gerenciar automações

## 🔗 Links Úteis

- **n8n Documentation:** https://docs.n8n.io/
- **n8n Community:** https://community.n8n.io/
- **Docker Documentation:** https://docs.docker.com/

---

🎮 **Dungeon Keeper** - Sistema de RPG com testes automatizados!