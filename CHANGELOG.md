# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-03

### 🎉 Lançamento Inicial - Dungeon Keeper v1.0.0

Primeira versão estável da plataforma Dungeon Keeper, uma ferramenta completa para auxiliar jogos de RPG de mesa D&D 5e.

### ✨ Funcionalidades Principais

#### 🎭 Sistema de Personagens
- **Classes D&D 5e Completas**: Guerreiro, Mago, Ladino, Clérigo, Bárbaro, Bardo, Druida, Feiticeiro, Paladino, Patrulheiro, Bruxo, Monge
- **Raças D&D 5e**: Humano, Elfo, Anão, Halfling, Draconato, Gnomo, Meio-elfo, Meio-orc, Tiefling
- **Sistema de Atributos**: Força, Destreza, Constituição, Inteligência, Sabedoria, Carisma
- **Progressão de Níveis**: Sistema completo de XP e habilidades por nível
- **Antecedentes**: Acólito, Criminoso, Artista, Eremita, Nobre, Sábio, Soldado, Artesão
- **Sistema de Talentos**: Feats completos do D&D 5e

#### ⚔️ Sistema de Combate
- **Iniciativa Automática**: Rolagem e ordenação de turnos
- **Condições de Status**: Cego, Surdo, Amedrontado, Paralisado, Envenenado, etc.
- **Tipos de Dano**: Cortante, Perfurante, Contundente, Elemental
- **Mecânicas Táticas**: Cobertura, terreno, ataques de oportunidade
- **Sistema de Combos**: Interações entre habilidades

#### 🎒 Sistema de Inventário
- **Itens Completos**: Armas, armaduras, consumíveis, ferramentas
- **Sistema de Slots**: Equipamentos por posição corporal
- **Itens Mágicos**: Sistema de encantamentos e efeitos
- **Economia**: Peso, durabilidade, craft e comércio

#### 🔮 Sistema de Magia
- **Escolas de Magia**: Todas as 8 escolas do D&D 5e
- **Níveis de Magia**: Truques (0) até 9º nível
- **Componentes**: Verbal, Somático, Material
- **Sistema de Slots**: Recuperação conforme D&D 5e
- **Magias Rituais**: Tempo estendido de conjuração

#### 🛠️ Arsenal do Criador (12 Ferramentas)
1. **Gerenciar Itens** - Criação de armas e equipamentos
2. **Gerenciar Monstros** - Bestiário completo
3. **Gerenciar NPCs** - Personagens não-jogadores
4. **Gerenciar Histórias** - Narrativas e campanhas
5. **Sistema de Mesas** - Criação e gestão de sessões
6. **Gerenciar Quests** - Missões e objetivos
7. **Sistema de Dados** - Rolagem avançada
8. **Anotações Rápidas** - Notas colaborativas
9. **Gerenciar Mapas** - Mapas táticos interativos
10. **Mundo Dinâmico** - Ambientes evolutivos
11. **Chat de Mesa** - Comunicação em tempo real
12. **Calendário & Eventos** - Organização de sessões

#### 🎯 Sistema de Mesas Avançado
- **Criação de Mesa**: Mestre automático com controle total
- **Controle de Níveis**: Requisitos mínimos/máximos de personagem
- **Sistema de Solicitações**: Pedidos para participar com aprovação
- **Validação Automática**: Verificação de requisitos
- **Lista de Espera**: Para mesas lotadas
- **Sistema de Avaliações**: Reputação da comunidade

#### 🗺️ Mapa Tático Interativo
- **Canvas Renderizado**: Grid visual com tokens
- **Drag & Drop**: Movimentação fluida de personagens
- **Sincronização Real-time**: WebSocket para múltiplos jogadores
- **Performance Otimizada**: Debounce e snap-to-grid

#### 💬 Chat em Tempo Real
- **WebSocket Estruturado**: Eventos tipados
- **Mensagens Persistentes**: Histórico salvo
- **Interface Responsiva**: Layout adaptativo
- **Controle de Acesso**: Por mesa específica

### 🔐 Segurança e Performance

#### Rate Limiting
- **Login**: 5 tentativas por minuto por IP
- **Registro**: 3 tentativas por minuto por IP
- **WebSocket Chat**: 20 mensagens por 10 segundos por usuário
- **WebSocket Dados**: 20 rolagens por 10 segundos por usuário
- **WebSocket Mapa**: 10 movimentos por 5 segundos por token

#### Autenticação Avançada
- **JWT Tokens**: Access tokens com 30 minutos de duração
- **Refresh Tokens**: 7 dias de duração com rotação automática
- **Blacklist JTI**: Sistema de revogação de tokens
- **Logout Seguro**: Invalidação de tokens
- **Proteção WebSocket**: Autenticação via query parameter

#### Observabilidade
- **Sentry Integration**: Rastreamento de erros e performance
- **Request ID**: Correlação única para cada requisição
- **Métricas**: Endpoint `/metrics` para monitoramento
- **Logs Estruturados**: JSON com contexto completo
- **Health Check**: Endpoint `/health` para verificação de status

### 🏗️ Infraestrutura

#### Banco de Dados
- **Desenvolvimento**: SQLite para facilidade local
- **Produção**: PostgreSQL com Docker Compose
- **Migrações**: Alembic para versionamento de schema
- **Conexão Flexível**: Configuração via variáveis de ambiente

#### Docker & Deploy
- **Multi-serviços**: PostgreSQL + FastAPI + React
- **Health Checks**: Verificação de dependências
- **Volumes Persistentes**: Dados do PostgreSQL
- **Variáveis de Ambiente**: Configuração segura

#### Frontend Moderno
- **React + TypeScript**: Interface tipada e robusta
- **Tailwind CSS**: Estilização responsiva
- **Axios Interceptors**: Headers automáticos e tratamento de erros
- **WebSocket Client**: Comunicação bidirecional
- **Canvas API**: Renderização de mapas táticos

### 📚 Documentação e Licenças

#### Licenciamento
- **Código Original**: MIT License
- **Conteúdo SRD 5.1**: Creative Commons Attribution 4.0
- **LICENSE-SRD.md**: Atribuições específicas do D&D
- **CREDITS.md**: Reconhecimento de todas as dependências

#### Documentação
- **README.md**: Guia completo de instalação e uso
- **API Documentation**: Swagger/OpenAPI em `/docs`
- **Guias D&D 5e**: Referência rápida para mestres e jogadores
- **CONTRIBUTING.md**: Guia para contribuidores

### 🧪 Qualidade e Testes

#### Testes Automatizados
- **Backend**: Pytest com >80% de cobertura
- **Sistemas Core**: Personagem, combate, inventário, magia
- **API Integration**: Endpoints testados
- **WebSocket**: Comunicação em tempo real

#### Qualidade de Código
- **TypeScript**: Tipagem completa no frontend
- **Pydantic**: Validação de dados no backend
- **Modularidade**: Código organizado e reutilizável
- **Performance**: Otimizações para uso em tempo real

### 🎮 Experiência do Usuário

#### Interface
- **Design Responsivo**: Desktop, tablet e mobile
- **Tema Medieval/RPG**: Visual imersivo
- **Logo Personalizado**: SVG escalável
- **Avatar Dinâmico**: Upload e exibição em tempo real
- **Navegação Intuitiva**: UX otimizada para sessões de RPG

#### Funcionalidades de Mesa
- **Fluxo Completo**: Login → Mesa → Chat → Mapa → Dados
- **Sincronização**: Estado compartilhado entre todos os jogadores
- **Performance**: Resposta instantânea para ações críticas
- **Escalabilidade**: Suporte a múltiplas mesas simultâneas

### 🔧 Tecnologias Utilizadas

#### Backend
- **FastAPI 0.116.1** - Framework web moderno
- **SQLAlchemy 2.0.43** - ORM avançado
- **Pydantic** - Validação de dados
- **Alembic** - Migrações de banco
- **SlowAPI** - Rate limiting
- **Sentry SDK** - Observabilidade
- **psycopg2** - Driver PostgreSQL
- **python-jose** - JWT tokens
- **passlib** - Hash de senhas

#### Frontend
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS
- **Axios** - Cliente HTTP
- **Vite** - Build tool moderno

#### Infraestrutura
- **Docker & Docker Compose** - Containerização
- **PostgreSQL 15** - Banco de dados
- **WebSocket** - Comunicação real-time

### 📊 Estatísticas do Release

- **Linhas de Código**: ~15.000+ linhas
- **Arquivos**: 100+ arquivos
- **Commits**: 50+ commits
- **Funcionalidades**: 12 ferramentas principais
- **Endpoints API**: 25+ endpoints
- **Testes**: 80%+ cobertura
- **Documentação**: 100% completa

### 🚀 URLs e Acesso

- **Repositório**: https://github.com/bugijo/DK
- **Frontend Local**: http://localhost:3001
- **Backend Local**: http://127.0.0.1:8000
- **API Docs**: http://127.0.0.1:8000/docs
- **Health Check**: http://127.0.0.1:8000/health
- **Métricas**: http://127.0.0.1:8000/metrics

---

## Próximas Versões

### [1.1.0] - Planejado
- Fog of War com vision cones
- Templates de magia para shortcuts no mapa
- Backups por mesa (export/import JSON)
- Permissões granulares (assistente de DM, espectador)
- Sistema de concentração persistente

### [1.2.0] - Planejado
- Integração com APIs externas (D&D Beyond)
- Sistema de campanhas multi-mesa
- Marketplace de conteúdo da comunidade
- Mobile app nativo

---

**Dungeon Keeper v1.0.0 - Onde a Magia do RPG Encontra a Tecnologia! 🏰🎲**