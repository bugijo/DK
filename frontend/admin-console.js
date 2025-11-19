const ADMIN_KEY = 'KEEPER-ROOT-001';
const STORAGE_KEY = 'dk_admin_key';

const summary = {
  online: 182,
  mesas: 14,
  personagens: 76,
  itens: 312,
  mapas: 22,
  missoes: 31
};

const tables = [
  { nome: 'A Mina Perdida', jogadores: 6, fila: 2, status: 'Ao vivo', atraso: 'Normal', proximaCena: 'Trilha costeira' },
  { nome: 'Marés Carmesim', jogadores: 5, fila: 1, status: 'Ao vivo', atraso: 'Baixo', proximaCena: 'Deck principal' },
  { nome: 'Fronteiras de Gelo', jogadores: 4, fila: 0, status: 'Standby', atraso: 'Baixo', proximaCena: 'Acampamento' },
  { nome: 'Ecos do Abismo', jogadores: 5, fila: 3, status: 'Com alerta', atraso: 'Alto', proximaCena: 'Porta da masmorra' }
];

const health = [
  { titulo: 'Latência média', valor: '62 ms', progresso: 42, detalhe: 'Abaixo da meta de 80 ms' },
  { titulo: 'Sincronização WebSocket', valor: '99.1%', progresso: 91, detalhe: 'Sem perdas reportadas' },
  { titulo: 'Fila de eventos', valor: 'Normal', progresso: 55, detalhe: 'Consumidores estáveis' }
];

const queue = [
  { titulo: 'Pedidos de personagem', detalhe: '12 aguardando aprovação', risco: 'baixo' },
  { titulo: 'Atualização de mapas', detalhe: '3 assets grandes em processamento', risco: 'medio' },
  { titulo: 'Fila de recompensas', detalhe: '6 entregas pendentes de loja', risco: 'alto' }
];

const audit = [
  { titulo: 'Liberada mesa Marés Carmesim', detalhe: 'Chamada de voz restabelecida', horario: '19:22' },
  { titulo: 'Aplicado hotfix de tokens', detalhe: 'Sprites atualizados na CDN', horario: '19:10' },
  { titulo: 'Forçado resync', detalhe: 'Lobby e sessão alinhados', horario: '18:58' },
  { titulo: 'Exportado relatório semanal', detalhe: 'CSV enviado para /exports', horario: '18:35' }
];

const snapshots = [
  { titulo: 'Inventário global', detalhe: '312 itens ativos · 47 lendários', horario: 'Atualizado há 3 min' },
  { titulo: 'Biblioteca de monstros', detalhe: '86 criaturas com tokens validados', horario: 'Atualizado há 8 min' },
  { titulo: 'Quests em andamento', detalhe: '31 missões · 9 épicas', horario: 'Atualizado há 12 min' },
  { titulo: 'Mapas prontos', detalhe: '22 mapas com visão de mestre/jogador', horario: 'Atualizado há 15 min' }
];

function renderStats() {
  const container = document.getElementById('top-stats');
  container.innerHTML = '';
  const stats = [
    { rotulo: 'Jogadores online', valor: summary.online, meta: 'tempo real' },
    { rotulo: 'Mesas ativas', valor: summary.mesas, meta: 'ao vivo' },
    { rotulo: 'Personagens', valor: summary.personagens, meta: 'prontos' },
    { rotulo: 'Itens/Equipamentos', valor: summary.itens, meta: 'inventário' },
    { rotulo: 'Mapas', valor: summary.mapas, meta: 'com tokens' },
    { rotulo: 'Missões', valor: summary.missoes, meta: 'publicadas' }
  ];

  stats.forEach((stat) => {
    const card = document.createElement('div');
    card.className = 'panel stat-card';
    card.innerHTML = `
      <h3>${stat.rotulo}</h3>
      <div class="value">${stat.valor}</div>
      <div class="meta">${stat.meta}</div>
      <div class="progress"><span style="width:${Math.min(100, 45 + Math.random() * 45)}%"></span></div>
    `;
    container.appendChild(card);
  });
}

function renderTables() {
  const grid = document.getElementById('tables-grid');
  grid.innerHTML = `
    <thead>
      <tr>
        <th>Mesa</th>
        <th>Jogadores</th>
        <th>Fila</th>
        <th>Status</th>
        <th>Próxima cena</th>
        <th>Atraso</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const body = grid.querySelector('tbody');

  tables.forEach((row) => {
    const tr = document.createElement('tr');
    const statusClass = row.status === 'Ao vivo' ? 'live' : row.status === 'Com alerta' ? 'alert' : 'idle';
    tr.innerHTML = `
      <td>${row.nome}</td>
      <td>${row.jogadores} jogadores</td>
      <td>${row.fila || '-'} fila</td>
      <td><span class="status ${statusClass}">${row.status}</span></td>
      <td>${row.proximaCena}</td>
      <td>${row.atraso}</td>
    `;
    body.appendChild(tr);
  });
}

function renderHealth() {
  const container = document.getElementById('health-cards');
  container.innerHTML = '';

  health.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'panel health-card';
    card.innerHTML = `
      <h4>${item.titulo}</h4>
      <div class="value">${item.valor}</div>
      <p>${item.detalhe}</p>
      <div class="progress"><span style="width:${item.progresso}%"></span></div>
    `;
    container.appendChild(card);
  });
}

function renderList(list, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  list.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'list-item';
    li.innerHTML = `<strong>${item.titulo}</strong><small>${item.detalhe || item.horario}</small>${item.horario ? `<span class="subtle">${item.horario}</span>` : ''}`;
    container.appendChild(li);
  });
}

function renderQueue() {
  const list = document.getElementById('queue-list');
  list.innerHTML = '';
  queue.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'list-item';
    const riskColor = item.risco === 'alto' ? 'var(--danger)' : item.risco === 'medio' ? 'var(--gold)' : 'var(--success)';
    li.innerHTML = `
      <div class="inline" style="justify-content: space-between;">
        <div>
          <strong>${item.titulo}</strong>
          <small>${item.detalhe}</small>
        </div>
        <span style="color:${riskColor}; font-weight:700; text-transform: capitalize;">${item.risco}</span>
      </div>`;
    list.appendChild(li);
  });
}

function setCommandFeedback(message) {
  const feedback = document.getElementById('command-feedback');
  feedback.textContent = message;
}

function toggleMaintenance(state) {
  const label = document.getElementById('maintenance-label');
  label.textContent = state ? 'Modo manutenção ativado para novos logins' : 'Modo manutenção desativado';
}

function unlockConsole() {
  document.body.classList.remove('locked');
  document.getElementById('auth-gate').classList.add('hidden');
}

function checkSavedKey() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === ADMIN_KEY) {
    unlockConsole();
  }
}

function bindActions() {
  document.getElementById('enter-console').addEventListener('click', () => {
    const input = document.getElementById('admin-key').value.trim();
    const feedback = document.getElementById('auth-feedback');
    if (input === ADMIN_KEY) {
      localStorage.setItem(STORAGE_KEY, input);
      unlockConsole();
      feedback.textContent = '';
    } else {
      feedback.textContent = 'Chave inválida. Confirme a credencial e tente novamente.';
    }
  });

  document.getElementById('refresh-metrics').addEventListener('click', () => {
    summary.online = Math.max(120, Math.round(summary.online * (0.92 + Math.random() * 0.16)));
    summary.mesas = Math.max(8, summary.mesas + (Math.random() > 0.5 ? 1 : -1));
    renderStats();
    setCommandFeedback('Métricas recalculadas a partir do heartbeat ativo.');
  });

  document.getElementById('toggle-maintenance').addEventListener('click', () => {
    const active = document.body.classList.toggle('maintenance');
    toggleMaintenance(active);
  });

  document.getElementById('force-sync').addEventListener('click', () => {
    const label = document.getElementById('last-sync-label');
    label.textContent = 'Sincronização forçada agora mesmo';
    setCommandFeedback('Sincronização concluída para lobby, mesas e game-session.');
  });

  document.getElementById('lockdown').addEventListener('click', () => {
    toggleMaintenance(true);
    setCommandFeedback('Novas mesas travadas temporariamente.');
  });

  document.getElementById('broadcast').addEventListener('click', () => setCommandFeedback('Broadcast enviado para todas as mesas ativas.'));
  document.getElementById('reload-chat').addEventListener('click', () => setCommandFeedback('Canais de chat reiniciados com sucesso.'));
  document.getElementById('reload-assets').addEventListener('click', () => setCommandFeedback('Assets recarregados e cache invalidado.'));
  document.getElementById('simulate-issue').addEventListener('click', () => setCommandFeedback('Alerta simulado: fila de recompensas atrasada.'));
  document.getElementById('clear-queues').addEventListener('click', () => setCommandFeedback('Filas limpas e reprocessamento iniciado.'));

  document.getElementById('export-report').addEventListener('click', () => setCommandFeedback('Relatório CSV gerado em /exports/admin-report.csv'));
}

function init() {
  renderStats();
  renderTables();
  renderHealth();
  renderQueue();
  renderList(audit, 'audit-log');
  renderList(snapshots, 'content-snapshots');
  bindActions();
  checkSavedKey();
}

document.addEventListener('DOMContentLoaded', init);
