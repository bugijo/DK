@echo off
echo ========================================
echo    DUNGEON KEEPER - N8N AUTOMATION
echo ========================================
echo.
echo Iniciando n8n para automacao de testes...
echo.
echo Acesse: http://localhost:5678
echo Usuario: admin
echo Senha: admin123
echo.
echo Pressione Ctrl+C para parar
echo ========================================
echo.

cd /d "%~dp0"
docker-compose up -d

echo.
echo ✅ N8N iniciado com sucesso!
echo.
echo 📋 Proximos passos:
echo 1. Acesse http://localhost:5678
echo 2. Faca login com admin/admin123
echo 3. Importe o workflow 'dungeon-keeper-tests.json'
echo 4. Ative o workflow para testes automaticos
echo.
echo 🔄 Para parar: execute 'stop-n8n.bat'
echo.
pause