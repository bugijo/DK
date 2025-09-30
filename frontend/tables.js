document.addEventListener('DOMContentLoaded', () => {
    const createTableBtn = document.querySelector('.create-table-btn');
    const modal = document.getElementById('createTableModal');
    const closeButton = document.querySelector('.close-button');
    const createTableForm = document.getElementById('createTableForm');

    if (createTableBtn) {
        createTableBtn.addEventListener('click', () => {
            modal.style.display = 'block';
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    if (createTableForm) {
        createTableForm.addEventListener('submit', (event) => {
            event.preventDefault();
            // Aqui você pode adicionar a lógica para enviar os dados do formulário
            const tableName = document.getElementById('tableName').value;
            const tableStory = document.getElementById('tableStory').value;
            const playerCount = document.getElementById('playerCount').value;
            const duration = document.getElementById('duration').value;
            const tableDate = document.getElementById('tableDate').value;
            const tableTime = document.getElementById('tableTime').value;
            const synopsis = document.getElementById('synopsis').value;

            console.log({
                tableName,
                tableStory,
                playerCount,
                duration,
                tableDate,
                tableTime,
                synopsis
            });

            alert('Mesa criada com sucesso! (Dados no console)');
            modal.style.display = 'none';
            createTableForm.reset();
            
            // Adicionar a nova mesa à lista (simulação)
            addTableToGrid({
                name: tableName,
                players: playerCount,
                duration: duration,
                date: tableDate,
                time: tableTime,
                synopsis: synopsis
            });
        });
    }
    
    // Função para adicionar mesa ao grid
    function addTableToGrid(tableData) {
        const tablesGrid = document.querySelector('.tables-grid');
        if (!tablesGrid) return;
        
        const tableCard = document.createElement('div');
        tableCard.className = 'table-card';
        tableCard.innerHTML = `
            <h2>${tableData.name}</h2>
            <p><strong>Jogadores:</strong> ${tableData.players}</p>
            <p><strong>Duração:</strong> ${tableData.duration}</p>
            <p><strong>Data:</strong> ${new Date(tableData.date).toLocaleDateString('pt-BR')}</p>
            <p><strong>Horário:</strong> ${tableData.time}</p>
            <p><strong>Sinopse:</strong> ${tableData.synopsis}</p>
            <div class="card-actions">
                <button class="btn-manage" onclick="manageTable('${tableData.name}')">Gerenciar</button>
                <button class="btn-details" onclick="viewTableDetails('${tableData.name}')">Ver Detalhes</button>
            </div>
        `;
        
        tablesGrid.appendChild(tableCard);
    }
    
    // Adicionar event listeners para botões existentes
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-manage')) {
            const tableName = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
            manageTable(tableName);
        }
        
        if (e.target.classList.contains('btn-details')) {
            const tableName = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
            viewTableDetails(tableName);
        }
    });
});

// Função para gerenciar mesa
function manageTable(tableName) {
    // Criar modal de gerenciamento
    const managementModal = createManagementModal(tableName);
    document.body.appendChild(managementModal);
    managementModal.style.display = 'block';
    
    // Adicionar event listener para fechar modal
    const closeBtn = managementModal.querySelector('.close-button');
    closeBtn.addEventListener('click', () => {
        managementModal.remove();
    });
    
    // Fechar modal clicando fora
    managementModal.addEventListener('click', (e) => {
        if (e.target === managementModal) {
            managementModal.remove();
        }
    });
}

// Função para criar modal de gerenciamento
function createManagementModal(tableName) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content management-modal">
            <span class="close-button">&times;</span>
            <h2>Gerenciar Mesa: ${tableName}</h2>
            <div class="management-sections">
                <div class="management-section">
                    <h3>Configurações da Mesa</h3>
                    <div class="management-actions">
                        <button class="btn-action" onclick="editTableSettings('${tableName}')">
                            <i class="icon-edit"></i> Editar Configurações
                        </button>
                        <button class="btn-action" onclick="manageTablePlayers('${tableName}')">
                            <i class="icon-users"></i> Gerenciar Jogadores
                        </button>
                    </div>
                </div>
                
                <div class="management-section">
                    <h3>Sessões</h3>
                    <div class="management-actions">
                        <button class="btn-action btn-primary" onclick="startGameSession('${tableName}')">
                            <i class="icon-play"></i> Iniciar Sessão
                        </button>
                        <button class="btn-action" onclick="viewSessionHistory('${tableName}')">
                            <i class="icon-history"></i> Histórico de Sessões
                        </button>
                    </div>
                </div>
                
                <div class="management-section">
                    <h3>Recursos</h3>
                    <div class="management-actions">
                        <button class="btn-action" onclick="manageTableResources('${tableName}')">
                            <i class="icon-book"></i> Gerenciar Recursos
                        </button>
                        <button class="btn-action" onclick="viewTableStats('${tableName}')">
                            <i class="icon-stats"></i> Estatísticas
                        </button>
                    </div>
                </div>
                
                <div class="management-section danger-section">
                    <h3>Ações Avançadas</h3>
                    <div class="management-actions">
                        <button class="btn-action btn-warning" onclick="archiveTable('${tableName}')">
                            <i class="icon-archive"></i> Arquivar Mesa
                        </button>
                        <button class="btn-action btn-danger" onclick="deleteTable('${tableName}')">
                            <i class="icon-delete"></i> Excluir Mesa
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

// Função para ver detalhes da mesa
function viewTableDetails(tableName) {
    // Mostrar modal com detalhes completos
    const detailsModal = createDetailsModal(tableName);
    document.body.appendChild(detailsModal);
    detailsModal.style.display = 'block';
    
    // Adicionar event listeners para fechar modal
    const closeBtn = detailsModal.querySelector('.close-button');
    closeBtn.addEventListener('click', () => {
        detailsModal.remove();
    });
    
    detailsModal.addEventListener('click', (e) => {
        if (e.target === detailsModal) {
            detailsModal.remove();
        }
    });
}

// Funções auxiliares para ações de gerenciamento
function editTableSettings(tableName) {
    alert(`Editando configurações da mesa: ${tableName}\n\nEm breve: Interface para editar nome, descrição, regras, etc.`);
}

function manageTablePlayers(tableName) {
    alert(`Gerenciando jogadores da mesa: ${tableName}\n\nEm breve: Interface para adicionar/remover jogadores, definir permissões, etc.`);
}

function startGameSession(tableName) {
    // Redirecionar para a página de sessão de jogo
    const confirmed = confirm(`Iniciar sessão de jogo para a mesa: ${tableName}?\n\nIsso redirecionará você para a interface de jogo.`);
    if (confirmed) {
        window.location.href = `game-session.html?table=${encodeURIComponent(tableName)}`;
    }
}

function viewSessionHistory(tableName) {
    alert(`Histórico de sessões da mesa: ${tableName}\n\nEm breve: Lista de todas as sessões anteriores com estatísticas.`);
}

function manageTableResources(tableName) {
    alert(`Gerenciando recursos da mesa: ${tableName}\n\nEm breve: Interface para adicionar mapas, NPCs, itens, etc.`);
}

function viewTableStats(tableName) {
    alert(`Estatísticas da mesa: ${tableName}\n\nEm breve: Gráficos e dados sobre a campanha.`);
}

function archiveTable(tableName) {
    const confirmed = confirm(`Arquivar a mesa: ${tableName}?\n\nA mesa será movida para o arquivo e não aparecerá na lista principal.`);
    if (confirmed) {
        alert(`Mesa ${tableName} arquivada com sucesso!`);
        // Aqui você implementaria a lógica para arquivar
    }
}

function deleteTable(tableName) {
    const confirmed = confirm(`ATENÇÃO: Excluir permanentemente a mesa: ${tableName}?\n\nEsta ação não pode ser desfeita!`);
    if (confirmed) {
        const doubleConfirm = confirm(`Tem certeza absoluta? Todos os dados da mesa ${tableName} serão perdidos!`);
        if (doubleConfirm) {
            alert(`Mesa ${tableName} excluída permanentemente.`);
            // Aqui você implementaria a lógica para excluir
        }
    }
}

// Função para entrar em uma mesa como jogador
function joinTable(tableName) {
    const confirmed = confirm(`Entrar na mesa: ${tableName} como jogador?\n\nVocê será redirecionado para a interface do jogador.`);
    if (confirmed) {
        window.location.href = `game-session.html?table=${encodeURIComponent(tableName)}&role=player`;
    }
}

// Função para criar modal de detalhes
function createDetailsModal(tableName) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content details-modal">
            <span class="close-button">&times;</span>
            <h2>Detalhes da Mesa: ${tableName}</h2>
            <div class="table-details">
                <div class="details-section">
                    <h3>Informações Gerais</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Status:</span>
                            <span class="info-value status-active">Ativa</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Mestre:</span>
                            <span class="info-value">Você</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Sistema:</span>
                            <span class="info-value">D&D 5e</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Vagas:</span>
                            <span class="info-value">3/5 jogadores</span>
                        </div>
                    </div>
                </div>
                
                <div class="details-section">
                    <h3>Jogadores Ativos</h3>
                    <div class="players-list">
                        <div class="player-item">
                            <div class="player-avatar"><img src="/icons/Escudo.png" alt="Guerreiro" style="width: 20px; height: 20px;" /></div>
                            <div class="player-info">
                                <span class="player-name">Aragorn</span>
                                <span class="player-class">Guerreiro Humano - Nível 5</span>
                            </div>
                            <span class="player-status online">Online</span>
                        </div>
                        <div class="player-item">
                            <div class="player-avatar"><img src="/icons/Magia.png" alt="Mago" style="width: 20px; height: 20px;" /></div>
                            <div class="player-info">
                                <span class="player-name">Gandalf</span>
                                <span class="player-class">Mago Élfico - Nível 5</span>
                            </div>
                            <span class="player-status offline">Offline</span>
                        </div>
                        <div class="player-item">
                            <div class="player-avatar"><img src="/icons/Equipamentos.png" alt="Ladino" style="width: 20px; height: 20px;" /></div>
                            <div class="player-info">
                                <span class="player-name">Bilbo</span>
                                <span class="player-class">Ladino Halfling - Nível 4</span>
                            </div>
                            <span class="player-status online">Online</span>
                        </div>
                    </div>
                </div>
                
                <div class="details-section">
                    <h3>Próxima Sessão</h3>
                    <div class="session-info">
                        <div class="session-item">
                            <span class="session-label"><img src="/icons/Calendário.png" alt="Data" style="width: 14px; height: 14px; display: inline; margin-right: 4px;" />Data:</span>
                            <span class="session-value">Sábado, 15 de Dezembro</span>
                        </div>
                        <div class="session-item">
                            <span class="session-label">🕐 Horário:</span>
                            <span class="session-value">19:00 - 23:00</span>
                        </div>
                        <div class="session-item">
                            <span class="session-label">📍 Local:</span>
                            <span class="session-value">Online (Discord)</span>
                        </div>
                    </div>
                </div>
                
                <div class="details-section">
                    <h3>Ações Disponíveis</h3>
                    <div class="modal-actions">
                        <button class="btn-action btn-primary" onclick="manageTable('${tableName}'); this.closest('.modal').remove();">
                            <i class="icon-manage"></i> Gerenciar Mesa
                        </button>
                        <button class="btn-action btn-success" onclick="joinTable('${tableName}'); this.closest('.modal').remove();">
                            <i class="icon-join"></i> Entrar na Mesa
                        </button>
                        <button class="btn-action btn-info" onclick="startGameSession('${tableName}'); this.closest('.modal').remove();">
                            <i class="icon-play"></i> Iniciar Sessão
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

// Adicionar estilos para o modal de detalhes
const detailsStyles = document.createElement('style');
detailsStyles.textContent = `
    .table-details h3 {
        color: #ffcc00;
        margin-top: 20px;
        margin-bottom: 10px;
        font-size: 1.1em;
    }
    
    .table-details ul {
        list-style-type: none;
        padding-left: 0;
    }
    
    .table-details li {
        background-color: #333;
        margin: 5px 0;
        padding: 8px 12px;
        border-radius: 4px;
        border-left: 3px solid #8a2be2;
    }
    
    .modal-actions {
        display: flex;
        gap: 10px;
        margin-top: 20px;
        flex-wrap: wrap;
    }
    
    .modal-actions button {
        flex: 1;
        min-width: 120px;
    }
    
    @media (max-width: 480px) {
        .modal-actions {
            flex-direction: column;
        }
        
        .modal-actions button {
            width: 100%;
        }
    }
`;
document.head.appendChild(detailsStyles);