const sessions = [
  { title: 'A Mina Perdida', players: 4, status: 'Sincronizado', scene: 'Taverna', start: '19:30' },
  { title: 'Marés Carmesim', players: 5, status: 'Sincronizado', scene: 'Navio Pirata', start: '20:15' },
  { title: 'Fronteiras de Gelo', players: 3, status: 'Aguardando', scene: 'Acampamento', start: '21:00' }
];

const steps = [
  { title: '1. Confirmar Fichas', text: 'Revise atributos, itens e magias. Fichas incompletas recebem preenchimento seguro para evitar erros.' },
  { title: '2. Checar Conexão', text: 'Verifique áudio/vídeo e latência. O painel mostra o status de sincronização em tempo real.' },
  { title: '3. Selecionar Cena', text: 'Escolha a cena inicial (exploração, combate, social) e defina a trilha sonora compartilhada.' },
  { title: '4. Abrir Sessão', text: 'Inicie a sala com WebSocket ativo para chat, mapa, iniciativa e compartilhamento de recursos.' }
];

function renderSessions() {
  const list = document.getElementById('session-list');
  list.innerHTML = '';
  sessions.forEach((session) => {
    const li = document.createElement('li');
    li.className = 'session-item';
    li.innerHTML = `
      <div>
        <strong>${session.title}</strong>
        <div class="meta">Cena: ${session.scene} · Jogadores: ${session.players}</div>
      </div>
      <div>
        <div class="status">${session.status}</div>
        <div class="meta">Início ${session.start}</div>
      </div>
    `;
    list.appendChild(li);
  });
}

function renderSteps() {
  const container = document.getElementById('entry-steps');
  container.innerHTML = '';
  steps.forEach((step) => {
    const card = document.createElement('div');
    card.className = 'step-card';
    card.innerHTML = `<p class="eyebrow">${step.title.split('.')[0]}</p><h4>${step.title.split('. ')[1]}</h4><p>${step.text}</p>`;
    container.appendChild(card);
  });
}

function updateSyncTime() {
  const lastSync = document.getElementById('last-sync');
  if (!lastSync) return;
  const now = new Date();
  lastSync.textContent = `Atualizado às ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

function pulseStatus(message) {
  const status = document.getElementById('session-status');
  status.textContent = message;
  status.classList.add('active');
  setTimeout(() => status.classList.remove('active'), 1200);
}

document.addEventListener('DOMContentLoaded', () => {
  renderSessions();
  renderSteps();
  updateSyncTime();
  setInterval(updateSyncTime, 45000);

  const syncButton = document.getElementById('simulate-sync');
  if (syncButton) {
    syncButton.addEventListener('click', () => {
      sessions[0].status = 'Sincronizado';
      pulseStatus('Sincronização forçada concluída');
      renderSessions();
      updateSyncTime();
    });
  }
});
