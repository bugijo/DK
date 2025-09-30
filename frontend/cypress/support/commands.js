// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Comando customizado para login (se necessário)
Cypress.Commands.add('login', (username, password) => {
  cy.get('input[name="username"], input[name="email"], #username, #email')
    .clear()
    .type(username)
  
  cy.get('input[name="password"], #password')
    .clear()
    .type(password)
  
  cy.get('button[type="submit"], .login-btn, #login-btn')
    .click()
})

// Comando para aguardar carregamento da página
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible')
  cy.wait(1000)
})

// Comando para capturar screenshot com timestamp
Cypress.Commands.add('screenshotWithTimestamp', (name) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  cy.screenshot(`${name}-${timestamp}`)
})

// Comando para verificar se elemento existe sem falhar o teste
Cypress.Commands.add('elementExists', (selector) => {
  return cy.get('body').then($body => {
    return $body.find(selector).length > 0
  })
})

// Comando para preencher formulário automaticamente
Cypress.Commands.add('fillForm', (formData = {}) => {
  // Preenche campos de texto
  cy.get('input[type="text"]').each(($input) => {
    const name = $input.attr('name') || $input.attr('id')
    const value = formData[name] || 'Teste'
    cy.wrap($input).clear().type(value)
  })
  
  // Preenche emails
  cy.get('input[type="email"]').each(($input) => {
    const name = $input.attr('name') || $input.attr('id')
    const value = formData[name] || 'teste@exemplo.com'
    cy.wrap($input).clear().type(value)
  })
  
  // Preenche senhas
  cy.get('input[type="password"]').each(($input) => {
    const name = $input.attr('name') || $input.attr('id')
    const value = formData[name] || 'senha123'
    cy.wrap($input).clear().type(value)
  })
  
  // Preenche textareas
  cy.get('textarea').each(($textarea) => {
    const name = $textarea.attr('name') || $textarea.attr('id')
    const value = formData[name] || 'Texto de teste'
    cy.wrap($textarea).clear().type(value)
  })
})

// Comando para navegar e voltar
Cypress.Commands.add('navigateAndReturn', (selector) => {
  cy.get(selector).click()
  cy.wait(2000)
  cy.go('back')
  cy.wait(1000)
})

// Comando para verificar responsividade
Cypress.Commands.add('checkResponsive', () => {
  const viewports = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1920, height: 1080, name: 'desktop' }
  ]
  
  viewports.forEach(viewport => {
    cy.viewport(viewport.width, viewport.height)
    cy.get('body').should('be.visible')
    cy.screenshot(`responsive-${viewport.name}`)
    cy.wait(500)
  })
})