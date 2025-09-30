# 🔍 Checklist: FastAPI Para Após Cada Requisição

## 1. ✅ Verificar Método de Inicialização

### Problema Comum: Usar uvicorn.run() dentro do script
- [ ] **Teste via CLI**: Use sempre `uvicorn trae_wrapper:app --host 127.0.0.1 --port 8000`
- [ ] **Evite**: `if __name__=="__main__": uvicorn.run(...)`
- [ ] **Motivo**: Problemas de importação ou loop de evento

```bash
# ✅ CORRETO
uvicorn trae_wrapper:app --host 127.0.0.1 --port 8000

# ❌ EVITAR
python trae_wrapper.py  # se tiver uvicorn.run() interno
```

## 2. 🧪 Teste com Exemplo Mínimo Isolado

### Criar arquivo minimal.py
- [ ] **Criar**: `minimal.py` com código básico
- [ ] **Testar**: Em ambiente virtual limpo
- [ ] **Verificar**: Se para após primeira requisição

```python
# minimal.py
from fastapi import FastAPI
app = FastAPI()

@app.get("/ping")
def ping():
    return {"pong": True}
```

```bash
# Teste
uvicorn minimal:app --host 127.0.0.1 --port 8001
curl http://127.0.0.1:8001/ping  # Teste 2-3 vezes
```

**Resultado**:
- Se parar → Problema de ambiente/instalação
- Se não parar → Problema no código do wrapper

## 3. 🔍 Verificar Logs e Exceções

### Ativar debug detalhado
- [ ] **Comando**: `uvicorn trae_wrapper:app --host 127.0.0.1 --port 8000 --log-level debug`
- [ ] **Procurar**: Erros não capturados, sys.exit(), exceções silenciosas
- [ ] **Verificar**: Handlers que podem causar saída do processo

### Sinais de problema:
```
# ❌ Problemas comuns nos logs
ERROR: Exception in ASGI application
INFO: Shutting down
INFO: Finished server process
```

## 4. 🔄 Recriar Ambiente Virtual

### Ambiente limpo
- [ ] **Deletar**: Pasta venv atual
- [ ] **Criar**: Novo ambiente virtual
- [ ] **Instalar**: Apenas fastapi e uvicorn

```bash
# Windows
python -m venv .venv_test
.venv_test\Scripts\activate
pip install fastapi uvicorn

# Teste novamente
uvicorn minimal:app --host 127.0.0.1 --port 8001
```

## 5. 📦 Verificar Dependências

### Conflitos de versões
- [ ] **Listar**: `pip freeze` para ver versões
- [ ] **Instalar**: Versões recomendadas
- [ ] **Testar**: Com uvicorn[standard]

```bash
pip install "uvicorn[standard]" fastapi
# Inclui httptools, uvloop, etc.
```

## 6. 🖥️ Ambiente Operacional

### Windows
- [ ] **Antivírus**: Pode estar matando processos que escutam portas
- [ ] **Firewall**: Pode interferir com loops de evento
- [ ] **Teste**: Desabilitar temporariamente para diagnóstico

### Alternativas
- [ ] **Docker**: Testar em container para isolar interferências
- [ ] **Outra máquina**: Verificar se é específico do ambiente

## 7. 🔄 Testar Outros Servidores ASGI

### Hypercorn
```bash
pip install hypercorn
hypercorn trae_wrapper:app --bind 127.0.0.1:8000
```

### Gunicorn + Uvicorn
```bash
pip install gunicorn uvicorn
gunicorn -k uvicorn.workers.UvicornWorker trae_wrapper:app --bind 127.0.0.1:8000
```

**Se funcionar**: Problema específico do uvicorn puro

## 8. 🔍 Inspecionar Código

### Procurar chamadas problemáticas
- [ ] **sys.exit()**: Termina processo
- [ ] **os._exit()**: Termina processo
- [ ] **subprocess.run(..., check=True)**: Pode lançar exceção não capturada
- [ ] **Threads mal configuradas**: Podem fechar loop principal

### Middleware e eventos
- [ ] **startup/shutdown events**: Não devem fechar aplicação
- [ ] **middleware custom**: Pode ter lógica que termina processo
- [ ] **on_request_finish**: Verificar se não fecha aplicação

## 9. ⚙️ Configurações de Reload

### Problema: Auto-reload desnecessário
- [ ] **Testar sem reload**: `uvicorn trae_wrapper:app --host 127.0.0.1 --port 8000` (sem --reload)
- [ ] **Verificar**: Scripts que modificam arquivos após requests
- [ ] **Confirmar**: Não há mudanças automáticas de arquivos

## 10. 🐳 Teste em Container Docker

### Dockerfile mínimo
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY minimal.py .
RUN pip install fastapi uvicorn
CMD ["uvicorn", "minimal:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t test-fastapi .
docker run -p 8000:8000 test-fastapi
```

**Resultado**:
- Se parar → Problema externo (Docker host, rede)
- Se não parar → Problema no código local

## 11. 🔧 Isolamento Gradual do Wrapper

### Estratégia incremental
- [ ] **Passo 1**: Só endpoint `/health` com return fixo
- [ ] **Passo 2**: Adicionar `/trae-command` sem lógica
- [ ] **Passo 3**: Adicionar middleware um por vez
- [ ] **Passo 4**: Adicionar lógica completa gradualmente

**Teste após cada passo**: Múltiplas requisições

## 12. 📝 Verificar Logging

### Handlers problemáticos
- [ ] **RotatingFileHandler**: Pode lançar exceção (permissões, espaço)
- [ ] **Permissões**: Verificar acesso a arquivos de log
- [ ] **Espaço em disco**: Confirmar disponibilidade

## 13. 🐍 Versão do Python

### Compatibilidade
- [ ] **Versão**: Use Python 3.9+ (recomendado 3.10+)
- [ ] **Dependências**: Verificar compatibilidade com versão Python
- [ ] **Features async**: Versões mais novas podem exigir dependências específicas

## 14. 👀 Monitorar Processo

### Ferramentas de monitoramento
- [ ] **Windows**: Task Manager para ver se processo morre ou reinicia
- [ ] **Linux**: `ps aux | grep python`
- [ ] **Logs do sistema**: systemd, Docker, supervisord
- [ ] **Healthcheck**: Verificar se não está matando processo

## 15. 🚫 Desabilitar Middlewares

### Teste mínimo
- [ ] **Remover**: Todos middlewares custom
- [ ] **Desabilitar**: CORS, logging extra, autenticação
- [ ] **Testar**: FastAPI puro
- [ ] **Reintroduzir**: Um middleware por vez

## 16. 🔍 Issues Conhecidas

### Pesquisa direcionada
- [ ] **GitHub**: FastAPI/Uvicorn issues "server stops after one request"
- [ ] **Ambiente específico**: Windows, Docker, versões específicas
- [ ] **Bugs conhecidos**: Versões específicas com problemas

---

## 🎯 Ordem de Execução Recomendada

1. **Teste mínimo** (item 2) - Isola se é código ou ambiente
2. **Método de inicialização** (item 1) - Correção mais comum
3. **Logs detalhados** (item 3) - Identifica causa específica
4. **Ambiente limpo** (item 4) - Elimina conflitos de dependência
5. **Isolamento gradual** (item 11) - Encontra código problemático
6. **Outros servidores** (item 7) - Confirma se é específico do uvicorn

## ✅ Critérios de Sucesso

- [ ] Servidor permanece ativo após múltiplas requisições
- [ ] Logs não mostram shutdown inesperado
- [ ] Processo não morre ou reinicia automaticamente
- [ ] Endpoints respondem consistentemente

---

**💡 Dica**: Comece sempre pelo teste mínimo. Se ele funcionar, o problema está no seu código. Se não funcionar, é ambiente/instalação.