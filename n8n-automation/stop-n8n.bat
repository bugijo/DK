@echo off
echo ========================================
echo    PARANDO N8N AUTOMATION
echo ========================================
echo.
echo Parando containers do n8n...
echo.

cd /d "%~dp0"
docker-compose down

echo.
echo ✅ N8N parado com sucesso!
echo.
pause