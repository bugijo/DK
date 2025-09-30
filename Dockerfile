# Dockerfile para testar FastAPI em ambiente limpo
FROM python:3.11-slim

# Define diretório de trabalho
WORKDIR /app

# Instala dependências
RUN pip install --no-cache-dir fastapi uvicorn[standard]

# Copia arquivos
COPY minimal.py .

# Expõe porta
EXPOSE 8000

# Comando para iniciar servidor
CMD ["uvicorn", "minimal:app", "--host", "0.0.0.0", "--port", "8000"]