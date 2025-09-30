# Testes E2E com Cypress - Dungeon Keeper

Este diretório contém os testes end-to-end (E2E) para a aplicação Dungeon Keeper usando Cypress.

## Estrutura dos Arquivos

```
cypress/
├── e2e/
│   └── teste.cy.js          # Teste principal da aplicação
├── support/
│   ├── commands.js          # Comandos customizados
│   └── e2e.js              # Configurações globais
└── README.md               # Este arquivo
```

## Pré-requisitos

1. **Servidor da aplicação rodando**: Certifique-se de que a aplicação está rodando em `http://localhost:3000`
2. **Node.js instalado**: Versão 14 ou superior
3. **Cypress instalado**: Execute `npm install` para instalar as dependências

## Como Executar os Testes

### Opção 1: Scripts NPM (Recomendado)

```bash
# Executar testes em modo headless (sem interface gráfica)
npm run cypress:run

# Abrir interface gráfica do Cypress
npm run cypress:open

# Executar testes E2E
npm run test:e2e
```

### Opção 2: Comandos Diretos do Cypress

```bash
# Executar testes em modo headless
npx cypress run

# Abrir interface gráfica
npx cypress open

# Executar teste específico
npx cypress run --spec "cypress/e2e/teste.cy.js"
```

### Opção 3: Script Personalizado

```bash
# Executar com script personalizado (instala Cypress se necessário)
node test-runner.js

# Abrir em modo interativo
node test-runner.js --open
```

## O que os Testes Verificam

### 1. Carregamento da Página
- ✅ Verifica se a página carrega corretamente
- ✅ Valida a URL
- ✅ Confirma que elementos básicos estão visíveis

### 2. Interface do Usuário
- ✅ Testa presença de botões e elementos interativos
- ✅ Verifica cliques em botões principais
- ✅ Valida responsividade em diferentes tamanhos de tela

### 3. Navegação
- ✅ Testa navegação entre páginas
- ✅ Verifica links funcionais
- ✅ Confirma retorno à página inicial

### 4. Formulários
- ✅ Preenche campos de texto automaticamente
- ✅ Testa diferentes tipos de input (email, password, textarea)
- ✅ Verifica seleção em dropdowns e checkboxes

### 5. Captura de Erros
- ✅ Screenshots automáticos em falhas
- ✅ Logs detalhados de erros
- ✅ Testes de responsividade com capturas

## Configurações

### Arquivo `cypress.config.js`
- **baseUrl**: `http://localhost:3000`
- **Timeouts**: 10-30 segundos para diferentes operações
- **Screenshots**: Habilitados em falhas
- **Vídeos**: Gravação automática dos testes
- **Retries**: 2 tentativas em modo de execução

### Comandos Customizados

O arquivo `cypress/support/commands.js` inclui comandos úteis:

- `cy.login(username, password)` - Login automático
- `cy.waitForPageLoad()` - Aguarda carregamento completo
- `cy.screenshotWithTimestamp(name)` - Screenshot com timestamp
- `cy.fillForm(formData)` - Preenchimento automático de formulários
- `cy.checkResponsive()` - Teste de responsividade

## Resultados dos Testes

### Screenshots
As capturas de tela são salvas em:
- `cypress/screenshots/` - Screenshots de falhas
- Nomeação automática com timestamp

### Vídeos
Gravações dos testes são salvas em:
- `cypress/videos/` - Vídeos completos dos testes

### Logs
Logs detalhados são exibidos no console durante a execução.

## Solução de Problemas

### Erro: "Cypress não encontrado"
```bash
npm install cypress --save-dev
```

### Erro: "Aplicação não está rodando"
1. Inicie o servidor React: `npm start`
2. Aguarde a aplicação carregar em `http://localhost:3000`
3. Execute os testes novamente

### Erro: "Timeout na página"
- Verifique se a aplicação está respondendo
- Aumente os timeouts em `cypress.config.js` se necessário

### Testes falhando
- Verifique os screenshots em `cypress/screenshots/`
- Analise os vídeos em `cypress/videos/`
- Verifique os logs no console

## Adicionando Novos Testes

1. Crie um novo arquivo `.cy.js` em `cypress/e2e/`
2. Use a estrutura básica:

```javascript
describe('Novo Teste', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('deve fazer algo específico', () => {
    // Seu teste aqui
  })
})
```

3. Execute com: `npx cypress run --spec "cypress/e2e/seu-teste.cy.js"`

## Melhores Práticas

1. **Use seletores estáveis**: Prefira `data-testid` ou IDs únicos
2. **Aguarde elementos**: Use `cy.wait()` ou `should('be.visible')`
3. **Capture evidências**: Screenshots e logs em pontos importantes
4. **Testes independentes**: Cada teste deve funcionar isoladamente
5. **Cleanup**: Limpe dados de teste após execução

## Integração Contínua

Para CI/CD, use:
```bash
npm run cypress:run:headless
```

Este comando executa os testes sem interface gráfica, ideal para pipelines automatizados.