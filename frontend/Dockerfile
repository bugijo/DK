# Frontend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala dependências
RUN npm ci

# Copia o código fonte
COPY . .

# Expõe a porta
EXPOSE 3001

# Comando padrão
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3001"]