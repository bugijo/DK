describe('Teste da Aplicação Dungeon Keeper', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('Deve carregar a página principal', () => {
    // Verifica se a página carregou
    cy.url().should('include', 'localhost:3000')
    
    // Verifica se o título ou texto principal está visível
    cy.get('body').should('be.visible')
    
    // Tenta encontrar elementos comuns da página
    cy.get('h1, h2, .title, #title, [data-testid="title"]').should('exist')
  })

  it('Deve validar elementos da interface', () => {
    // Verifica se há botões na página
    cy.get('button, .btn, input[type="button"], input[type="submit"]')
      .should('have.length.greaterThan', 0)
    
    // Testa cliques nos botões principais
    cy.get('button, .btn').each(($btn) => {
      // Verifica se o botão está visível antes de clicar
      if ($btn.is(':visible')) {
        cy.wrap($btn).click({ force: true })
        cy.wait(500) // Aguarda um pouco após o clique
      }
    })
  })

  it('Deve navegar pelas páginas', () => {
    // Testa navegação por links
    cy.get('a[href], .nav-link, .menu-item').each(($link) => {
      const href = $link.attr('href')
      if (href && !href.startsWith('http') && !href.startsWith('mailto:')) {
        cy.wrap($link).click({ force: true })
        cy.wait(1000)
        // Volta para a página inicial
        cy.visit('http://localhost:3000')
      }
    })
  })

  it('Deve preencher formulários se existirem', () => {
    // Procura por formulários na página
    cy.get('form').then(($forms) => {
      if ($forms.length > 0) {
        // Preenche campos de texto
        cy.get('input[type="text"], input[type="email"], input[type="password"]').each(($input) => {
          const type = $input.attr('type')
          let value = 'teste'
          
          if (type === 'email') {
            value = 'teste@exemplo.com'
          } else if (type === 'password') {
            value = 'senha123'
          }
          
          cy.wrap($input).clear().type(value)
        })
        
        // Preenche textareas
        cy.get('textarea').each(($textarea) => {
          cy.wrap($textarea).clear().type('Texto de teste para textarea')
        })
        
        // Seleciona opções em selects
        cy.get('select').each(($select) => {
          cy.wrap($select).select(0) // Seleciona a primeira opção
        })
        
        // Marca checkboxes
        cy.get('input[type="checkbox"]').each(($checkbox) => {
          cy.wrap($checkbox).check({ force: true })
        })
        
        // Seleciona radio buttons
        cy.get('input[type="radio"]').first().check({ force: true })
      }
    })
  })

  it('Deve capturar screenshots em caso de erro', () => {
    // Testa uma ação que pode falhar e captura screenshot
    cy.get('body').then(() => {
      cy.screenshot('pagina-principal')
    })
    
    // Testa elementos que podem não existir
    cy.get('.elemento-inexistente').should('not.exist')
  })

  // Teste de responsividade
  it('Deve funcionar em diferentes tamanhos de tela', () => {
    // Testa em mobile
    cy.viewport(375, 667)
    cy.get('body').should('be.visible')
    cy.screenshot('mobile-view')
    
    // Testa em tablet
    cy.viewport(768, 1024)
    cy.get('body').should('be.visible')
    cy.screenshot('tablet-view')
    
    // Testa em desktop
    cy.viewport(1920, 1080)
    cy.get('body').should('be.visible')
    cy.screenshot('desktop-view')
  })
})

// Configuração para capturar falhas
Cypress.on('fail', (error) => {
  cy.screenshot('erro-' + Date.now())
  console.log('Erro capturado:', error.message)
  throw error
})