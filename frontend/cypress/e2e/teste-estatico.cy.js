describe('Teste de Página Estática', () => {
  it('Deve testar uma página HTML simples', () => {
    // Cria uma página HTML simples em memória
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Teste Dungeon Keeper</title>
        </head>
        <body>
          <h1 id="titulo">Dungeon Keeper</h1>
          <button id="botao-jogar">Jogar</button>
          <button id="botao-opcoes">Opções</button>
          <form id="formulario">
            <input type="text" id="nome" placeholder="Digite seu nome" />
            <input type="submit" value="Enviar" />
          </form>
        </body>
      </html>
    `;
    
    // Visita uma página de dados
    cy.visit('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    
    // Verifica se os elementos existem
    cy.get('#titulo').should('contain', 'Dungeon Keeper');
    cy.get('#botao-jogar').should('be.visible');
    cy.get('#botao-opcoes').should('be.visible');
    
    // Testa interação com botões
    cy.get('#botao-jogar').click();
    cy.get('#botao-opcoes').click();
    
    // Testa preenchimento de formulário
    cy.get('#nome').type('Jogador Teste');
    cy.get('#nome').should('have.value', 'Jogador Teste');
  });
});