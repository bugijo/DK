const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    // baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
      })
    },
    
    env: {
      // Variáveis de ambiente para os testes
      apiUrl: 'http://localhost:8080',
      testUser: 'usuario_teste',
      testPassword: 'senha_teste'
    },
    
    // Configurações de retry
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    // Padrões de arquivos de teste
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    // Configurações de browser
    chromeWebSecurity: false,
    
    // Configurações de screenshots e vídeos
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    
    // Configurações experimentais
    experimentalStudio: true
  },
})