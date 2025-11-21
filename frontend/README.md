# Frontend - Dungeon Keeper

Interface web interativa para o sistema de jogo D&D online.

## Funcionalidades Implementadas

### Sistema de Sessão de Jogo
- **Interface de jogo completa** (`game-session.html`)
- **Sistema de turnos** com iniciativa automática
- **Movimentação de personagens** com mapa simples
- **Chat em tempo real** para comunicação
- **Controles de mestre** para gerenciar a sessão
- **Sistema de status** de jogadores (online/offline)
- **Efeitos visuais e animações**
- **Sistema de sons** para imersão

### Páginas Principais
- **Login/Registro** - Entrada no sistema
- **Home** - Dashboard principal
- **Criação de Personagens** - Sistema completo de criação
- **Inventário** - Gerenciamento de itens
- **Criação de Conteúdo** - Ferramentas para mestres
- **Entrada de Sessão** - Lobby guiado para sincronizar mesas e escolher visão de mestre ou jogadores
- **Console Administrativo** - Painel exclusivo com chave mestre para monitorar saúde da plataforma, sessões e filas

## Estrutura de Arquivos

```
frontend/
├── game-session.html     # Interface principal do jogo
├── game-session.js       # Lógica da sessão de jogo
├── game-session.css      # Estilos da interface de jogo
├── index.html           # Página de login
├── home.html            # Dashboard principal
├── session-entry.html   # Lobby da mesa com sincronização e checklist
├── create-character.html # Criação de personagens
├── inventory.html       # Sistema de inventário
└── assets/              # Recursos visuais
```

## Como Usar

1. Abra `index.html` no navegador
2. Navegue para `game-session.html` para iniciar uma sessão
3. Use os controles de mestre para gerenciar o jogo
4. Jogadores podem se mover no mapa e usar o chat
5. Para governança completa, acesse `admin-console.html` e insira a chave mestre (padrão: `KEEPER-ROOT-001`)

### Pré-visualização rápida (servidor estático)

1. Rode `node frontend/static-server.js` na raiz do projeto.
2. Abra `http://localhost:8080/session-entry.html` para ver o lobby guiado (mestre e jogadores).
3. Abra `http://localhost:8080/admin-console.html`, digite `KEEPER-ROOT-001` e clique em **Entrar** para acessar o console administrativo.
4. Utilize os atalhos de navegação do header para inspecionar as demais páginas (home, criação de personagem, loja e sessão).

## Tecnologias

- HTML5 Canvas para renderização do mapa
- CSS3 com animações e efeitos visuais
- JavaScript vanilla para lógica do jogo
- Web Audio API para sistema de sons
- LocalStorage para persistência de dados
- React para componentes dinâmicos

## Scripts Disponíveis

No diretório do projeto, você pode rodar:

### `npm start`
Roda o app em modo desenvolvimento.
Abra [http://localhost:3000](http://localhost:3000) para ver no navegador.

### `npm test`
Executa os testes automatizados.

### `npm run build`
Gera a versão de produção na pasta `build`.

### `npm run eject`
Remove a configuração padrão do Create React App (irreversível).

## Próximas Funcionalidades

- Integração com backend
- Sistema de combate visual
- Mapas mais complexos
- Sistema de magias visuais
- Multiplayer em tempo real

## Saiba Mais

Você pode aprender mais na [documentação do Create React App](https://facebook.github.io/create-react-app/docs/getting-started).
Para aprender React, acesse a [documentação oficial do React](https://reactjs.org/).
