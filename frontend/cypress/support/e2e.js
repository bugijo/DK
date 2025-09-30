// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Configurações globais
Cypress.on('uncaught:exception', (err, runnable) => {
  // Previne que erros JavaScript não capturados falhem os testes
  console.log('Erro não capturado:', err.message)
  return false
})

// Configuração para screenshots automáticos em falhas
Cypress.on('fail', (error, runnable) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  cy.screenshot(`falha-${timestamp}`)
  throw error
})

// Configuração para logs detalhados
beforeEach(() => {
  cy.log('Iniciando teste:', Cypress.currentTest.title)
})

afterEach(() => {
  cy.log('Finalizando teste:', Cypress.currentTest.title)
})

// Configuração para aguardar carregamento da página
Cypress.Commands.overwrite('visit', (originalFn, url, options) => {
  return originalFn(url, {
    ...options,
    onBeforeLoad: (win) => {
      // Adiciona logs para debug
      win.console.log = cy.log
      if (options && options.onBeforeLoad) {
        options.onBeforeLoad(win)
      }
    },
    onLoad: (win) => {
      // Aguarda a página carregar completamente
      cy.wait(1000)
      if (options && options.onLoad) {
        options.onLoad(win)
      }
    }
  })
})