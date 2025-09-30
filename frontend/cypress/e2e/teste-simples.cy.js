describe('Teste Simples', () => {
  it('Deve passar - teste básico', () => {
    expect(true).to.be.true;
    expect(1 + 1).to.equal(2);
    expect('cypress').to.be.a('string');
  });

  it('Deve testar arrays', () => {
    const arr = [1, 2, 3];
    expect(arr).to.have.length(3);
    expect(arr).to.include(2);
  });

  it('Deve testar objetos', () => {
    const obj = { name: 'Cypress', version: '13.17.0' };
    expect(obj).to.have.property('name');
    expect(obj.name).to.equal('Cypress');
  });
});