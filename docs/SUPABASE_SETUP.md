# Integração com Supabase

Este projeto usa o Supabase (Postgres + PostgREST) como backend de dados para a API Node/TypeScript. Use este guia para configurar variáveis, validar a conexão e saber quais informações enviar para conectar um ambiente existente.

## O que você precisa me enviar
- `SUPABASE_URL`: URL do projeto (ex.: `https://xxxx.supabase.co`).
- `SUPABASE_ANON_KEY`: chave anônima (public) para operações da API.
- `SUPABASE_SERVICE_KEY` (opcional, mas recomendada para tarefas administrativas, seeds e migrações automatizadas).
- **Opcional:** nome do schema caso não seja `public` e URLs permitidas para CORS.

Com esses valores consigo conectar o projeto ao seu Supabase ou a outro Postgres exposto via Supabase/PostgREST compatível.

## Passo a passo para configurar localmente
1. Crie um projeto gratuito no [Supabase](https://supabase.com/).
2. Na aba **API**, copie `Project URL` e `anon public key` (e `service_role key` se quiser permitir seeds/admin).
3. Duplique o arquivo `.env.example` para `.env` e preencha:
   ```env
   SUPABASE_URL=...
   SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_KEY=... # opcional
   CORS_ORIGIN=http://localhost:3000
   ```
4. Rode a API Node:
   ```bash
   npm install
   npm run dev
   ```
5. Verifique a saúde do serviço: `GET http://localhost:3000/health` deve retornar status `OK`.

## Estrutura esperada no banco
As rotas atuais usam tabelas como `users`, `clients`, `pets`, `suppliers`, `products`, `stock_movements`, `accounts_payable`, `accounts_receivable`, `appointments` e `medical_records`. Garanta que elas existam no schema `public` com colunas coerentes aos modelos (`src/models/*.ts`). Se preferir, podemos subir migrações ou scripts SQL para criar/ajustar essas tabelas usando a `service_role key`.

## Uso com outro banco gratuito
Se quiser usar outro Postgres gratuito (ex.: Neon, Railway) é necessário expor uma camada compatível com PostgREST ou ajustar o código para usar um driver SQL padrão em vez do cliente Supabase. O caminho mais rápido é manter o Supabase no plano gratuito, pois já oferece PostgREST, autenticação e storage sem mudanças no código.

## Dicas de segurança
- Nunca faça commit das chaves; mantenha-as apenas no `.env` ou como segredos do GitHub Actions.
- Restrinja `CORS_ORIGIN` às URLs do frontend e do admin console em produção.
- Prefira usar a `anon key` no frontend e a `service_role key` apenas em rotinas backend/CI.
