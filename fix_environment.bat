@echo off
echo === SOLUCAO 1: Criando novo ambiente virtual ===

REM Remove ambiente antigo se existir
if exist venv_limpo rmdir /s /q venv_limpo

REM Cria novo ambiente
echo Criando novo ambiente virtual...
python -m venv venv_limpo

REM Ativa o novo ambiente
echo Ativando novo ambiente...
call venv_limpo\Scripts\activate.bat

REM Instala dependencias minimas
echo Instalando FastAPI e Uvicorn...
pip install fastapi uvicorn[standard]

REM Testa o servidor minimo
echo Testando servidor minimo...
start /b uvicorn minimal:app --host 127.0.0.1 --port 8001

REM Aguarda 3 segundos
timeout /t 3 /nobreak

REM Testa requisicao
echo Testando requisicao...
python -c "import requests; r = requests.get('http://127.0.0.1:8001/ping'); print(f'Status: {r.status_code}, Response: {r.json()}')"

REM Aguarda mais 2 segundos
timeout /t 2 /nobreak

REM Testa segunda requisicao
echo Testando segunda requisicao...
python -c "import requests; r = requests.get('http://127.0.0.1:8001/ping'); print(f'Status: {r.status_code}, Response: {r.json()}')"

echo === FIM DO TESTE ===
pause