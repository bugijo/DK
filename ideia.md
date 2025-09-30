# Dungeon Keeper: Plataforma Modular para RPG de Mesa Online

## Visão Geral

Dungeon Keeper é uma plataforma modular para auxiliar jogos de RPG de mesa, com foco inicial no sistema D&D 5e. A versão 1.0 é direcionada para uso presencial, servindo como ferramenta de apoio para jogadores e mestres durante sessões físicas. O objetivo é aumentar a eficiência do jogo sem comprometer a emoção, a imersão e a socialização típicas do RPG presencial.

## Objetivo Atual

Construir uma base sólida de sistemas essenciais (personagem, combate, inventário, magia), totalmente adaptados às regras do D&D 5e, com código limpo, modular e bem documentado. O sistema deve ser um auxílio prático, facilitando consultas, cálculos e organização, sem automatizar tudo ou substituir a experiência social do RPG.

## Sistema de Mesas e Solicitações

### Dinâmica de Criação e Participação em Mesas

#### Criação de Mesa:
- **Mestre Automático**: Quem cria a mesa automaticamente se torna o mestre/narrador
- **Controle de Nível**: O mestre define requisitos de nível para personagens:
  - Nível mínimo (ex: apenas personagens nível 5+)
  - Nível máximo (ex: nenhum personagem acima do nível 2)
  - Faixa específica (ex: personagens entre nível 3-7)
- **Configurações da Mesa**: Data, hora, local, descrição da campanha
- **Limite de Jogadores**: Número máximo de participantes

#### Sistema de Solicitações:
- **Solicitação para Participar**: Jogadores enviam pedidos para entrar na mesa
- **Seleção de Personagem**: Ao solicitar, o jogador deve escolher qual personagem usará
- **Validação Automática**: Sistema verifica se o personagem atende aos requisitos de nível
- **Dados do Solicitante**: Mestre recebe informações completas:
  - Ficha completa do personagem escolhido
  - Nível de experiência do jogador
  - Conquistas e histórico
  - Número de mesas já jogadas
  - Avaliações de outros mestres (se disponível)

#### Processo de Aprovação:
- **Análise do Mestre**: Mestre avalia se o jogador/personagem se encaixa na mesa
- **Aprovação/Rejeição**: Decisão baseada em compatibilidade com grupo existente
- **Notificações Automáticas**: 
  - Aprovado: Jogador recebe confirmação + data/hora nos compromissos
  - Rejeitado: Jogador recebe feedback (opcional) sobre o motivo
- **Gestão de Vagas**: Sistema controla limite de participantes

#### Funcionalidades Complementares:
- **Lista de Espera**: Para mesas lotadas
- **Substituições**: Sistema para substituir jogadores que saíram
- **Histórico de Mesas**: Registro de participações anteriores
- **Sistema de Avaliações**: Jogadores e mestres podem se avaliar mutuamente
- **Calendário Integrado**: Sincronização com agenda pessoal
- **Lembretes**: Notificações antes das sessões

### Benefícios do Sistema:
- **Para Mestres**: Controle total sobre composição do grupo e balanceamento
- **Para Jogadores**: Transparência no processo e feedback sobre adequação
- **Para Comunidade**: Formação de grupos compatíveis e experiências melhores

## Roadmap e Futuro

- ✅ Finalizar sistemas principais (personagem, combate, inventário, magia) para D&D 5e
- 🔄 **Implementar sistema completo de mesas e solicitações**
- 🔄 **Desenvolver sistema de notificações e compromissos**
- 📋 Adicionar sistemas complementares (NPCs, quests, mundo dinâmico)
- 📋 Criar interface de usuário intuitiva para uso em mesa presencial
- 📋 Implementar recursos de chat, rolagem de dados, anotações rápidas e suporte ao mestre
- 📋 Garantir que todas as funcionalidades reforcem a imersão e interação entre os participantes
- 📋 Sistema de avaliações e reputação da comunidade
- 📋 Polir, testar e preparar para contribuições da comunidade

## Princípios

- Foco em D&D 5e e jogos presenciais/online híbridos
- Auxílio à imersão e socialização, nunca substituição
- Modularidade e extensibilidade
- Código limpo e testável
- Documentação detalhada
- Manutenção e evolução contínua
- **Transparência e fairness** no sistema de formação de grupos
- **Controle do mestre** sobre a composição e dinâmica da mesa

## Tecnologias Utilizadas

- **Backend**: Python + FastAPI + SQLAlchemy + PostgreSQL
- **Frontend**: React + TypeScript + Tailwind CSS
- **Autenticação**: JWT + OAuth2
- **Real-time**: WebSockets para notificações
- **Deploy**: Docker + GitHub Actions

Este documento serve como referência para o alinhamento da visão do projeto com sua implementação real, guiando decisões técnicas e estratégicas.