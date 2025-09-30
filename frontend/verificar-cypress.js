const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('=== Verificação do Setup Cypress ===\n');

// 1. Verificar se o package.json tem o Cypress
console.log('1. Verificando package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  if (packageJson.devDependencies && packageJson.devDependencies.cypress) {
    console.log('✅ Cypress encontrado no package.json:', packageJson.devDependencies.cypress);
  } else {
    console.log('❌ Cypress não encontrado no package.json');
  }
  
  if (packageJson.scripts && packageJson.scripts['cypress:run']) {
    console.log('✅ Scripts do Cypress encontrados no package.json');
  } else {
    console.log('❌ Scripts do Cypress não encontrados no package.json');
  }
} catch (error) {
  console.log('❌ Erro ao ler package.json:', error.message);
}

// 2. Verificar se a pasta cypress existe
console.log('\n2. Verificando estrutura de pastas...');
const cypressDir = './cypress';
if (fs.existsSync(cypressDir)) {
  console.log('✅ Pasta cypress encontrada');
  
  const e2eDir = path.join(cypressDir, 'e2e');
  if (fs.existsSync(e2eDir)) {
    console.log('✅ Pasta cypress/e2e encontrada');
    
    const testFile = path.join(e2eDir, 'teste.cy.js');
    if (fs.existsSync(testFile)) {
      console.log('✅ Arquivo de teste encontrado: teste.cy.js');
    } else {
      console.log('❌ Arquivo de teste não encontrado');
    }
  } else {
    console.log('❌ Pasta cypress/e2e não encontrada');
  }
  
  const supportDir = path.join(cypressDir, 'support');
  if (fs.existsSync(supportDir)) {
    console.log('✅ Pasta cypress/support encontrada');
  } else {
    console.log('❌ Pasta cypress/support não encontrada');
  }
} else {
  console.log('❌ Pasta cypress não encontrada');
}

// 3. Verificar se o cypress.config.js existe
console.log('\n3. Verificando arquivo de configuração...');
if (fs.existsSync('./cypress.config.js')) {
  console.log('✅ cypress.config.js encontrado');
} else {
  console.log('❌ cypress.config.js não encontrado');
}

// 4. Verificar se node_modules existe
console.log('\n4. Verificando instalação...');
if (fs.existsSync('./node_modules')) {
  console.log('✅ Pasta node_modules encontrada');
  
  const cypressModule = './node_modules/cypress';
  if (fs.existsSync(cypressModule)) {
    console.log('✅ Módulo Cypress instalado');
  } else {
    console.log('❌ Módulo Cypress não instalado');
  }
} else {
  console.log('❌ Pasta node_modules não encontrada - execute npm install');
}

console.log('\n=== Resumo ===');
console.log('Se todos os itens estão ✅, o Cypress está configurado corretamente!');
console.log('Se há itens ❌, execute: npm install');
console.log('\nPara testar: npm run cypress:open ou npm run cypress:run');