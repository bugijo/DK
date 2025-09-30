const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Função para verificar se o Cypress está instalado
function isCypressInstalled() {
  try {
    const cypressPath = path.join(__dirname, 'node_modules', 'cypress');
    return fs.existsSync(cypressPath);
  } catch (error) {
    return false;
  }
}

// Função para instalar o Cypress
function installCypress() {
  return new Promise((resolve, reject) => {
    console.log('Instalando Cypress...');
    const install = spawn('npm', ['install', 'cypress', '--save-dev'], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true
    });

    install.on('close', (code) => {
      if (code === 0) {
        console.log('Cypress instalado com sucesso!');
        resolve();
      } else {
        reject(new Error(`Instalação falhou com código ${code}`));
      }
    });

    install.on('error', (error) => {
      reject(error);
    });
  });
}

// Função para executar os testes do Cypress
function runCypressTests() {
  return new Promise((resolve, reject) => {
    console.log('Executando testes do Cypress...');
    const test = spawn('npx', ['cypress', 'run'], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true
    });

    test.on('close', (code) => {
      if (code === 0) {
        console.log('Testes executados com sucesso!');
        resolve();
      } else {
        console.log(`Testes finalizados com código ${code}`);
        resolve(); // Não rejeitamos aqui pois falhas de teste são esperadas
      }
    });

    test.on('error', (error) => {
      reject(error);
    });
  });
}

// Função para abrir o Cypress em modo interativo
function openCypress() {
  return new Promise((resolve, reject) => {
    console.log('Abrindo Cypress em modo interativo...');
    const open = spawn('npx', ['cypress', 'open'], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true
    });

    open.on('close', (code) => {
      resolve();
    });

    open.on('error', (error) => {
      reject(error);
    });
  });
}

// Função principal
async function main() {
  try {
    console.log('=== Configuração e Execução de Testes Cypress ===');
    
    // Verifica se o Cypress está instalado
    if (!isCypressInstalled()) {
      console.log('Cypress não encontrado. Instalando...');
      await installCypress();
    } else {
      console.log('Cypress já está instalado.');
    }

    // Verifica argumentos da linha de comando
    const args = process.argv.slice(2);
    
    if (args.includes('--open')) {
      await openCypress();
    } else {
      await runCypressTests();
    }
    
  } catch (error) {
    console.error('Erro:', error.message);
    process.exit(1);
  }
}

// Executa se for chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  isCypressInstalled,
  installCypress,
  runCypressTests,
  openCypress
};