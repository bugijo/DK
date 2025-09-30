# 🧪 Guia Rápido - Testes Cypress

## ✅ O que foi configurado:

1. **Cypress instalado** e configurado no projeto
2. **Teste completo** criado em `cypress/e2e/teste.cy.js`
3. **Scripts NPM** adicionados ao package.json
4. **Configurações** otimizadas em `cypress.config.js`
5. **Comandos customizados** em `cypress/support/commands.js`

## 🚀 Como executar os testes:

### Opção 1: Script Automático (Windows)
```bash
# Execute o arquivo batch
run-tests.bat
```

### Opção 2: Comandos NPM
```bash
# 1. Instalar dependências (se ainda não instalou)
npm install

# 2. Iniciar a aplicação React (em um terminal separado)
npm start

# 3. Executar testes (em outro terminal)
npm run cypress:run

# OU abrir interface gráfica
npm run cypress:open
```

### Opção 3: Comandos Diretos
```bash
# Executar testes sem interface
npx cypress run

# Abrir interface do Cypress
npx cypress open
```

## 📋 O que o teste verifica:

✅ **Carregamento da página** em http://localhost:3000  
✅ **Elementos visíveis** (títulos, botões, formulários)  
✅ **Cliques em botões** principais  
✅ **Navegação** entre páginas  
✅ **Preenchimento de formulários** automaticamente  
✅ **Responsividade** em mobile, tablet e desktop  
✅ **Screenshots** automáticos em falhas  
✅ **Logs detalhados** de erros  

## 📁 Onde encontrar os resultados:

- **Screenshots**: `cypress/screenshots/`
- **Vídeos**: `cypress/videos/`
- **Logs**: No console durante execução

## ⚠️ Pré-requisitos importantes:

1. **Aplicação rodando**: A aplicação React DEVE estar rodando em `http://localhost:3000`
2. **Node.js**: Versão 14 ou superior instalada
3. **Dependências**: Execute `npm install` antes dos testes

## 🔧 Solução de problemas:

### "Cypress não encontrado"
```bash
npm install cypress --save-dev
```

### "Aplicação não responde"
1. Abra outro terminal
2. Execute: `npm start`
3. Aguarde carregar em http://localhost:3000
4. Execute os testes novamente

### "Testes falhando"
1. Verifique screenshots em `cypress/screenshots/`
2. Analise vídeos em `cypress/videos/`
3. Leia logs no console

## 📝 Comandos úteis:

```bash
# Executar teste específico
npx cypress run --spec "cypress/e2e/teste.cy.js"

# Executar em browser específico
npx cypress run --browser chrome

# Executar sem vídeo (mais rápido)
npx cypress run --config video=false

# Modo debug
npx cypress open --config watchForFileChanges=true
```

## 🎯 Próximos passos:

1. **Execute os testes** seguindo as instruções acima
2. **Analise os resultados** nos screenshots e vídeos
3. **Ajuste o teste** conforme necessário em `cypress/e2e/teste.cy.js`
4. **Adicione novos testes** para funcionalidades específicas

---

**💡 Dica**: Para desenvolvimento, use `npm run cypress:open` para ver os testes executando em tempo real!