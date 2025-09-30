import requests

try:
    r = requests.get('http://127.0.0.1:8000/')
    print(f'Status: {r.status_code}')
    print('Resposta:', r.json())
    print('✅ Servidor está funcionando!')
except Exception as e:
    print(f'❌ Erro: {e}')