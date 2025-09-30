describe('Teste com Arquivo HTML', () => {
  it('Deve carregar e testar arquivo HTML local', () => {
    // Visita o arquivo HTML local
    cy.visit('cypress/fixtures/teste.html');
    
    // Verifica se o título está correto
    cy.get('#titulo').should('contain', 'Dungeon Keeper - Teste');
    
    // Verifica se os botões estão visíveis
    cy.get('#botao-jogar').should('be.visible');
    cy.get('#botao-opcoes').should('be.visible');
    cy.get('#botao-sair').should('be.visible');
    
    // Testa clique nos botões
    cy.get('#botao-jogar').click();
    
    // Verifica se o formulário existe
    cy.get('#formulario').should('exist');
    
    // Preenche o formulário
    cy.get('#nome').type('Jogador Teste');
    cy.get('#nome').should('have.value', 'Jogador Teste');
    
    cy.get('#email').type('teste@email.com');
    cy.get('#email').should('have.value', 'teste@email.com');
    
    // Testa envio do formulário
    cy.get('input[type="submit"]').click();
  });
  
  it('Deve testar navegação e elementos da interface', () => {
    cy.visit('cypress/fixtures/teste.html');
    
    // Verifica se todos os elementos principais existem
    cy.get('h1').should('exist');
    cy.get('p').should('contain', 'Bem-vindo ao mundo das masmorras!');
    
    // Testa se os botões têm o texto correto
    cy.get('#botao-jogar').should('contain', 'Jogar');
    cy.get('#botao-opcoes').should('contain', 'Opções');
    cy.get('#botao-sair').should('contain', 'Sair');
    
    // Verifica se o formulário tem os campos necessários
    cy.get('#nome').should('have.attr', 'placeholder', 'Digite seu nome');
    cy.get('#email').should('have.attr', 'placeholder', 'Digite seu email');
  });
});