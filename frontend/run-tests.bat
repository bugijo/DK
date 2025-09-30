@echo off
echo ===================================
echo  Cypress Test Runner - Dungeon Keeper
echo ===================================
echo.

echo Verificando se o Node.js esta instalado...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado. Instale o Node.js primeiro.
    pause
    exit /b 1
)

echo Node.js encontrado!
echo.

echo Verificando se o npm esta disponivel...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: npm nao encontrado.
    pause
    exit /b 1
)

echo npm encontrado!
echo.

echo Instalando dependencias (incluindo Cypress)...
npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha na instalacao das dependencias.
    pause
    exit /b 1
)

echo.
echo Dependencias instaladas com sucesso!
echo.

echo Verificando se a aplicacao esta rodando em localhost:3000...
echo (Se nao estiver, inicie com 'npm start' em outro terminal)
echo.

echo Aguardando 3 segundos...
timeout /t 3 /nobreak >nul

echo.
echo Executando testes do Cypress...
echo.

npx cypress run

echo.
echo ===================================
echo  Testes finalizados!
echo ===================================
echo.
echo Para abrir o Cypress em modo interativo, execute:
echo npx cypress open
echo.
echo Para ver os resultados:
echo - Screenshots: cypress\screenshots\
echo - Videos: cypress\videos\
echo.
pause