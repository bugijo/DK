// Game Session JavaScript
class GameSession {
    constructor() {
        this.currentUser = {
            id: 'player1',
            name: 'Jogador Teste',
            role: 'player', // 'player' ou 'master'
            character: {
                name: 'Aragorn',
                class: 'Ranger',
                race: 'Humano',
                level: 5,
                hp: { current: 45, max: 55 },
                ac: 16,
                attributes: {
                    str: { value: 16, mod: 3 },
                    dex: { value: 14, mod: 2 },
                    con: { value: 15, mod: 2 },
                    int: { value: 12, mod: 1 },
                    wis: { value: 16, mod: 3 },
                    cha: { value: 10, mod: 0 }
                },
                avatar: 'https://via.placeholder.com/80x80/8B4513/FFFFFF?text=A'
            }
        };
        
        this.gameState = {
            mode: 'exploration', // 'exploration' ou 'combat'
            currentScene: 'Taverna do Javali Dourado',
            narrative: 'Vocês estão na taverna, observando os outros aventureiros...',
            combat: {
                active: false,
                round: 0,
                turn: 0,
                initiative: []
            }
        };
        
        this.partyMembers = [
            {
                id: 'player1',
                name: 'Aragorn',
                class: 'Ranger',
                level: 5,
                hp: { current: 45, max: 55 },
                avatar: 'https://via.placeholder.com/40x40/8B4513/FFFFFF?text=A',
                online: true
            },
            {
                id: 'player2',
                name: 'Legolas',
                class: 'Ranger',
                level: 5,
                hp: { current: 42, max: 48 },
                avatar: 'https://via.placeholder.com/40x40/228B22/FFFFFF?text=L',
                online: true
            },
            {
                id: 'player3',
                name: 'Gimli',
                class: 'Guerreiro',
                level: 5,
                hp: { current: 58, max: 62 },
                avatar: 'https://via.placeholder.com/40x40/B8860B/FFFFFF?text=G',
                online: false
            }
        ];
        
        this.chatMessages = [
            {
                id: 1,
                type: 'system',
                sender: 'Sistema',
                message: 'Sessão iniciada. Bem-vindos à aventura!',
                timestamp: new Date()
            },
            {
                id: 2,
                type: 'master',
                sender: 'Mestre',
                message: 'Vocês chegaram à taverna após uma longa jornada...',
                timestamp: new Date()
            }
        ];
        
        this.masterData = {
            currentStory: 'A Busca pelo Artefato Perdido',
            scenes: [
                'Taverna do Javali Dourado',
                'Floresta Sombria',
                'Ruínas Antigas',
                'Covil do Dragão'
            ],
            npcs: [
                { name: 'Bartender Joe', type: 'Aliado', visible: true },
                { name: 'Goblin Espião', type: 'Inimigo', visible: false },
                { name: 'Sábio Eldrin', type: 'Neutro', visible: true }
            ],
            images: [
                { name: 'Taverna', url: 'https://via.placeholder.com/300x200/8B4513/FFFFFF?text=Taverna' },
                { name: 'Floresta', url: 'https://via.placeholder.com/300x200/228B22/FFFFFF?text=Floresta' },
                { name: 'Ruínas', url: 'https://via.placeholder.com/300x200/696969/FFFFFF?text=Ruinas' }
            ],
            music: [
                { name: 'Taverna Ambiente', file: 'tavern-ambient.mp3' },
                { name: 'Combate Épico', file: 'epic-battle.mp3' },
                { name: 'Mistério', file: 'mystery-theme.mp3' }
            ]
        };
        
        this.canvas = null;
        this.ctx = null;
        this.gridSize = 30;
        this.tokens = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateInterface();
        this.initializeCanvas();
        this.loadChatMessages();
        this.updatePartyList();
        this.startAnimations();
        this.setupTooltips();
        this.initSoundEffects();
        this.setupKeyboardShortcuts();
        this.setupAccessibility();
        
        // Verificar role do usuário
        if (this.currentUser.role === 'master') {
            this.showMasterInterface();
        } else {
            this.showPlayerInterface();
        }
    }
    
    setupEventListeners() {
        // Role selector
        const roleSelect = document.getElementById('user-role');
        if (roleSelect) {
            roleSelect.addEventListener('change', (e) => {
                this.currentUser.role = e.target.value;
                this.updateInterface();
                this.showNotification(`Mudou para: ${e.target.value === 'master' ? 'Mestre' : 'Jogador'}`, 'info');
            });
        }
        
        // Game mode buttons
        document.querySelectorAll('.explore-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleExplorationAction(e.target.textContent);
            });
        });
        
        // Quick actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.textContent.trim();
                this.handleQuickAction(action);
                this.showActionFeedback(action);
            });
        });
        
        // Chat
        const chatInput = document.getElementById('chat-input');
        const chatSend = document.getElementById('chat-send');
        
        if (chatInput && chatSend) {
            chatSend.addEventListener('click', () => this.sendChatMessage());
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
            
            // Auto-focus chat on Ctrl+Enter
            chatInput.addEventListener('focus', () => {
                chatInput.style.borderColor = '#d4af37';
            });
            
            chatInput.addEventListener('blur', () => {
                chatInput.style.borderColor = '';
            });
        }
        
        // Party member clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.party-member')) {
                const memberId = e.target.closest('.party-member').dataset.memberId;
                this.showCharacterModal(memberId);
            }
        });
        
        // Modal close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close') || e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });
        
        // Master controls
        this.setupMasterControls();
        
        // Dice roller
        this.setupDiceRoller();
        
        // Combat controls
        this.setupCombatControls();
        
        // Party member interactions
        document.querySelectorAll('.party-member').forEach(member => {
            member.addEventListener('mouseenter', (e) => {
                e.target.style.transform = 'translateX(5px) scale(1.02)';
            });
            
            member.addEventListener('mouseleave', (e) => {
                e.target.style.transform = '';
            });
        });
    }
    
    setupMasterControls() {
        // Scene change
        const sceneSelect = document.getElementById('scene-select');
        if (sceneSelect) {
            sceneSelect.addEventListener('change', (e) => {
                this.changeScene(e.target.value);
            });
        }
        
        // Image display
        document.querySelectorAll('.image-thumb').forEach(thumb => {
            thumb.addEventListener('click', (e) => {
                const imageName = e.target.closest('.image-thumb').dataset.image;
                this.displayImageToPlayers(imageName);
            });
        });
        
        // Music controls
        const musicSelect = document.getElementById('music-select');
        const playMusicBtn = document.getElementById('play-music');
        const stopMusicBtn = document.getElementById('stop-music');
        
        if (playMusicBtn) {
            playMusicBtn.addEventListener('click', () => {
                const selectedMusic = musicSelect.value;
                this.playMusic(selectedMusic);
            });
        }
        
        if (stopMusicBtn) {
            stopMusicBtn.addEventListener('click', () => {
                this.stopMusic();
            });
        }
        
        // Combat toggle
        const combatToggle = document.getElementById('toggle-combat');
        if (combatToggle) {
            combatToggle.addEventListener('click', () => {
                this.toggleCombatMode();
            });
        }
        
        // NPC controls
        document.querySelectorAll('.npc-controls button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.textContent;
                const npcName = e.target.closest('.npc-item').querySelector('.npc-name').textContent;
                this.handleNPCAction(npcName, action);
            });
        });
    }
    
    setupDiceRoller() {
        document.querySelectorAll('.dice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const diceType = e.target.dataset.dice;
                this.rollDice(diceType);
            });
        });
    }
    
    setupCombatControls() {
        const nextTurnBtn = document.getElementById('next-turn');
        if (nextTurnBtn) {
            nextTurnBtn.addEventListener('click', () => {
                this.nextTurn();
            });
        }
    }
    
    updateInterface() {
        if (this.currentUser.role === 'master') {
            this.showMasterInterface();
        } else {
            this.showPlayerInterface();
        }
        
        this.updateGameMode();
        this.updateCharacterInfo();
    }
    
    showPlayerInterface() {
        document.querySelector('.player-interface').classList.remove('hidden');
        document.querySelector('.master-interface').classList.add('hidden');
    }
    
    showMasterInterface() {
        document.querySelector('.player-interface').classList.add('hidden');
        document.querySelector('.master-interface').classList.remove('hidden');
        this.loadMasterData();
    }
    
    updateGameMode() {
        document.querySelectorAll('.game-mode').forEach(mode => {
            mode.classList.remove('active');
        });
        
        const currentMode = document.getElementById(`${this.gameState.mode}-mode`);
        if (currentMode) {
            currentMode.classList.add('active');
        }
    }
    
    updateCharacterInfo() {
        const character = this.currentUser.character;
        
        // Update character card
        document.getElementById('char-name').textContent = character.name;
        document.getElementById('char-class').textContent = `${character.class} ${character.race}`;
        document.getElementById('char-level').textContent = `Nível ${character.level}`;
        document.getElementById('char-avatar').src = character.avatar;
        
        // Update HP bar
        const hpPercentage = (character.hp.current / character.hp.max) * 100;
        document.querySelector('.hp-current').style.width = `${hpPercentage}%`;
        document.querySelector('.hp-text').textContent = `${character.hp.current}/${character.hp.max}`;
        
        // Update attributes
        Object.keys(character.attributes).forEach(attr => {
            const attrElement = document.querySelector(`[data-attr="${attr}"]`);
            if (attrElement) {
                attrElement.querySelector('.attr-value').textContent = character.attributes[attr].value;
                attrElement.querySelector('.attr-mod').textContent = 
                    character.attributes[attr].mod >= 0 ? `+${character.attributes[attr].mod}` : character.attributes[attr].mod;
            }
        });
    }
    
    initializeCanvas() {
        this.canvas = document.getElementById('combat-canvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
            
            this.canvas.addEventListener('click', (e) => {
                this.handleCanvasClick(e);
            });
            
            this.drawGrid();
            this.loadTokens();
        }
    }
    
    drawGrid() {
        if (!this.ctx) return;
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        this.ctx.clearRect(0, 0, width, height);
        
        // Draw grid
        this.ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
        
        // Draw tokens
        this.drawTokens();
    }
    
    loadTokens() {
        this.tokens = [
            {
                id: 'player1',
                name: 'Aragorn',
                type: 'player',
                x: 3,
                y: 3,
                color: '#2ecc71',
                avatar: 'A'
            },
            {
                id: 'player2',
                name: 'Legolas',
                type: 'player',
                x: 4,
                y: 3,
                color: '#3498db',
                avatar: 'L'
            },
            {
                id: 'enemy1',
                name: 'Goblin',
                type: 'enemy',
                x: 8,
                y: 5,
                color: '#e74c3c',
                avatar: 'G'
            }
        ];
    }
    
    drawTokens() {
        if (!this.ctx) return;
        
        this.tokens.forEach(token => {
            const x = token.x * this.gridSize + this.gridSize / 2;
            const y = token.y * this.gridSize + this.gridSize / 2;
            const radius = this.gridSize / 2 - 2;
            
            // Draw token circle
            this.ctx.fillStyle = token.color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Draw border
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw avatar letter
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(token.avatar, x, y);
        });
    }
    
    handleCanvasClick(e) {
        if (this.currentUser.role !== 'master') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const gridX = Math.floor(x / this.gridSize);
        const gridY = Math.floor(y / this.gridSize);
        
        // Check if clicked on a token
        const clickedToken = this.tokens.find(token => 
            token.x === gridX && token.y === gridY
        );
        
        if (clickedToken) {
            this.selectToken(clickedToken);
        }
    }
    
    selectToken(token) {
        console.log('Token selecionado:', token.name);
        // Implementar seleção de token
    }
    
    loadChatMessages() {
        const chatContainer = document.getElementById('chat-messages');
        if (!chatContainer) return;
        
        chatContainer.innerHTML = '';
        
        this.chatMessages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            chatContainer.appendChild(messageElement);
        });
        
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    createMessageElement(message) {
        const div = document.createElement('div');
        div.className = `message ${message.type}`;
        
        const timestamp = message.timestamp.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        div.innerHTML = `
            <span class="timestamp">${timestamp}</span>
            <span class="sender">${message.sender}:</span>
            <span class="content">${message.message}</span>
        `;
        
        return div;
    }
    
    sendChatMessage() {
        const input = document.getElementById('chat-input');
        if (!input || !input.value.trim()) return;
        
        const message = {
            id: this.chatMessages.length + 1,
            type: this.currentUser.role === 'master' ? 'master' : 'player',
            sender: this.currentUser.name,
            message: input.value.trim(),
            timestamp: new Date()
        };
        
        this.chatMessages.push(message);
        this.loadChatMessages();
        this.animateNewMessage();
        this.playSound('message');
        
        input.value = '';
        
        // Auto-scroll para a última mensagem
        setTimeout(() => {
            const chatContainer = document.getElementById('chat-messages');
            if (chatContainer) {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }, 100);
    }
    
    updatePartyList() {
        const partyContainer = document.getElementById('party-members');
        if (!partyContainer) return;
        
        partyContainer.innerHTML = '';
        
        this.partyMembers.forEach(member => {
            const memberElement = this.createPartyMemberElement(member);
            partyContainer.appendChild(memberElement);
        });
    }
    
    createPartyMemberElement(member) {
        const div = document.createElement('div');
        div.className = 'party-member';
        div.dataset.memberId = member.id;
        
        const hpPercentage = (member.hp.current / member.hp.max) * 100;
        const statusClass = member.online ? 'online' : 'offline';
        const statusText = member.online ? 'Online' : 'Offline';
        
        div.innerHTML = `
            <img src="${member.avatar}" alt="${member.name}">
            <div class="member-info">
                <span class="member-name">${member.name}</span>
                <span class="member-class">${member.class} Nível ${member.level}</span>
                <div class="hp-bar small">
                    <div class="hp-current" style="width: ${hpPercentage}%"></div>
                    <div class="hp-text">${member.hp.current}/${member.hp.max}</div>
                </div>
            </div>
        `;
        
        return div;
    }
    
    showCharacterModal(memberId) {
        const member = this.partyMembers.find(m => m.id === memberId);
        if (!member) return;
        
        const modal = document.getElementById('character-modal');
        if (!modal) return;
        
        // Populate modal with character data
        modal.querySelector('.modal-content h2').textContent = member.name;
        
        // Show modal
        modal.style.display = 'block';
    }
    
    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
    
    handleQuickAction(action) {
        console.log(`Ação executada: ${action}`);
        
        // Show loading for action
        this.simulateLoading(`Executando ${action}`, 1000);
        
        // Execute action after loading
        setTimeout(() => {
            this.showActionFeedback(action);
            
            switch (action) {
                case 'Atacar':
                    this.showDiceRoller();
                    this.animateCharacterAction('attack');
                    break;
                case 'Usar Magia':
                    this.showSpellModal();
                    break;
                case 'Inventário':
                    this.showInventoryModal();
                    break;
                case 'Descansar':
                    this.rest();
                    this.animateCharacterAction('rest');
                    break;
            }
        }, 1000);
    }
    
    handleExplorationAction(action) {
        const message = {
            id: this.chatMessages.length + 1,
            type: 'player',
            sender: this.currentUser.name,
            message: `${action}`,
            timestamp: new Date()
        };
        
        this.chatMessages.push(message);
        this.loadChatMessages();
    }
    
    showDiceRoller() {
        const modal = document.getElementById('dice-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    }
    
    rollDice(diceType) {
        const sides = parseInt(diceType.substring(1)); // Remove 'd' prefix
        const result = Math.floor(Math.random() * sides) + 1;
        
        const resultElement = document.getElementById('dice-result');
        if (resultElement) {
            resultElement.textContent = `${diceType}: ${result}`;
        }
        
        // Add to chat
        const message = {
            id: this.chatMessages.length + 1,
            type: 'system',
            sender: 'Sistema',
            message: `${this.currentUser.name} rolou ${diceType} e obteve ${result}`,
            timestamp: new Date()
        };
        
        this.chatMessages.push(message);
        this.loadChatMessages();
    }
    
    // Master functions
    loadMasterData() {
        // Load story
        document.getElementById('current-story').textContent = this.masterData.currentStory;
        
        // Load scenes
        const sceneSelect = document.getElementById('scene-select');
        if (sceneSelect) {
            sceneSelect.innerHTML = '';
            this.masterData.scenes.forEach(scene => {
                const option = document.createElement('option');
                option.value = scene;
                option.textContent = scene;
                sceneSelect.appendChild(option);
            });
        }
        
        // Load music
        const musicSelect = document.getElementById('music-select');
        if (musicSelect) {
            musicSelect.innerHTML = '';
            this.masterData.music.forEach(music => {
                const option = document.createElement('option');
                option.value = music.file;
                option.textContent = music.name;
                musicSelect.appendChild(option);
            });
        }
        
        // Load images
        const imageGallery = document.querySelector('.image-gallery');
        if (imageGallery) {
            imageGallery.innerHTML = '';
            this.masterData.images.forEach(image => {
                const thumb = document.createElement('div');
                thumb.className = 'image-thumb';
                thumb.dataset.image = image.name;
                thumb.innerHTML = `
                    <img src="${image.url}" alt="${image.name}">
                    <span>${image.name}</span>
                `;
                imageGallery.appendChild(thumb);
            });
        }
        
        // Load NPCs
        const npcList = document.querySelector('.npc-list');
        if (npcList) {
            npcList.innerHTML = '';
            this.masterData.npcs.forEach(npc => {
                const npcElement = document.createElement('div');
                npcElement.className = 'npc-item';
                npcElement.innerHTML = `
                    <span class="npc-name">${npc.name}</span>
                    <div class="npc-controls">
                        <button>Mostrar</button>
                        <button>Ocultar</button>
                    </div>
                `;
                npcList.appendChild(npcElement);
            });
        }
    }
    
    changeScene(sceneName) {
        this.gameState.currentScene = sceneName;
        document.getElementById('current-scene').textContent = sceneName;
        
        // Notify players
        const message = {
            id: this.chatMessages.length + 1,
            type: 'system',
            sender: 'Sistema',
            message: `Cena alterada para: ${sceneName}`,
            timestamp: new Date()
        };
        
        this.chatMessages.push(message);
        this.loadChatMessages();
    }
    
    displayImageToPlayers(imageName) {
        const image = this.masterData.images.find(img => img.name === imageName);
        if (!image) return;
        
        // Notify players
        const message = {
            id: this.chatMessages.length + 1,
            type: 'system',
            sender: 'Sistema',
            message: `Mestre compartilhou imagem: ${imageName}`,
            timestamp: new Date()
        };
        
        this.chatMessages.push(message);
        this.loadChatMessages();
        
        console.log('Exibindo imagem para jogadores:', imageName);
    }
    
    playMusic(musicFile) {
        console.log('Tocando música:', musicFile);
        
        const message = {
            id: this.chatMessages.length + 1,
            type: 'system',
            sender: 'Sistema',
            message: `♪ Música iniciada`,
            timestamp: new Date()
        };
        
        this.chatMessages.push(message);
        this.loadChatMessages();
    }
    
    stopMusic() {
        console.log('Parando música');
        
        const message = {
            id: this.chatMessages.length + 1,
            type: 'system',
            sender: 'Sistema',
            message: `♪ Música parada`,
            timestamp: new Date()
        };
        
        this.chatMessages.push(message);
        this.loadChatMessages();
    }
    
    toggleCombatMode() {
        this.gameState.mode = this.gameState.mode === 'combat' ? 'exploration' : 'combat';
        this.updateGameMode();
        
        if (this.gameState.mode === 'combat') {
            this.initializeCombat();
        }
        
        const message = {
            id: this.chatMessages.length + 1,
            type: 'system',
            sender: 'Sistema',
            message: this.gameState.mode === 'combat' ? '<img src="/icons/Equipamentos.png" alt="Combate" style="width: 16px; height: 16px; display: inline; margin-right: 6px;" />Combate iniciado!' : '<img src="/icons/Paz.png" alt="Paz" style="width: 16px; height: 16px; display: inline; margin-right: 6px;" />Combate finalizado',
            timestamp: new Date()
        };
        
        this.chatMessages.push(message);
        this.loadChatMessages();
    }
    
    initializeCombat() {
        // Initialize combat with sample data
        this.gameState.combat = {
            active: true,
            round: 1,
            turn: 0,
            initiative: [
                { name: 'Legolas', initiative: 18, type: 'player', active: true },
                { name: 'Aragorn', initiative: 15, type: 'player', active: false },
                { name: 'Goblin', initiative: 12, type: 'enemy', active: false },
                { name: 'Gimli', initiative: 8, type: 'player', active: false }
            ]
        };
        
        this.updateInitiativeTracker();
        this.drawGrid();
    }
    
    updateInitiativeTracker() {
        const initiativeList = document.getElementById('initiative-list');
        if (!initiativeList) return;
        
        initiativeList.innerHTML = '';
        
        this.gameState.combat.initiative.forEach((character, index) => {
            const item = document.createElement('div');
            item.className = `initiative-item ${character.active ? 'active' : ''}`;
            
            item.innerHTML = `
                <div class="init-order">${index + 1}</div>
                <div class="init-name">${character.name}</div>
                <div class="init-value">${character.initiative}</div>
            `;
            
            initiativeList.appendChild(item);
        });
    }
    
    nextTurn() {
        if (!this.gameState.combat.active) return;
        
        // Mark current character as inactive
        this.gameState.combat.initiative[this.gameState.combat.turn].active = false;
        
        // Move to next turn
        this.gameState.combat.turn++;
        
        // Check if round is complete
        if (this.gameState.combat.turn >= this.gameState.combat.initiative.length) {
            this.gameState.combat.turn = 0;
            this.gameState.combat.round++;
        }
        
        // Mark new character as active
        this.gameState.combat.initiative[this.gameState.combat.turn].active = true;
        
        this.updateInitiativeTracker();
        
        const currentCharacter = this.gameState.combat.initiative[this.gameState.combat.turn];
        const message = {
            id: this.chatMessages.length + 1,
            type: 'system',
            sender: 'Sistema',
            message: `Turno de ${currentCharacter.name} (Rodada ${this.gameState.combat.round})`,
            timestamp: new Date()
        };
        
        this.chatMessages.push(message);
        this.loadChatMessages();
    }
    
    handleNPCAction(npcName, action) {
        const message = {
            id: this.chatMessages.length + 1,
            type: 'system',
            sender: 'Sistema',
            message: `${action} NPC: ${npcName}`,
            timestamp: new Date()
        };
        
        this.chatMessages.push(message);
        this.loadChatMessages();
    }
    
    rest() {
        // Restore some HP
        const character = this.currentUser.character;
        const healAmount = Math.floor(character.hp.max * 0.1);
        character.hp.current = Math.min(character.hp.current + healAmount, character.hp.max);
        
        this.updateCharacterInfo();
        this.showNotification('😴 Descansando...', 'info');
        
        const message = {
            id: this.chatMessages.length + 1,
            type: 'system',
            sender: 'Sistema',
            message: `${character.name} descansou e recuperou ${healAmount} pontos de vida`,
            timestamp: new Date()
        };
        
        this.chatMessages.push(message);
        this.loadChatMessages();
        
        // Simular recuperação de HP
        setTimeout(() => {
            this.showNotification('✨ Você se sente revigorado!', 'success');
        }, 2000);
    }
}

// Initialize game session when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.gameSession = new GameSession();
});

// Métodos auxiliares para animações e efeitos
GameSession.prototype.startAnimations = function() {
    // Animação de pulso para elementos importantes
    setInterval(() => {
        this.pulseImportantElements();
    }, 3000);
    
    // Atualização periódica da interface
    setInterval(() => {
        this.updateDynamicElements();
    }, 1000);
};

GameSession.prototype.setupTooltips = function() {
    // Adicionar tooltips informativos
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            this.showTooltip(e.target, e.target.dataset.tooltip);
        });
        
        element.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });
    });
};

GameSession.prototype.initSoundEffects = function() {
    this.sounds = {
        click: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'),
        hover: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'),
        message: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'),
        notification: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
    };
};

GameSession.prototype.playSound = function(type) {
    if (this.sounds && this.sounds[type]) {
        this.sounds[type].currentTime = 0;
        this.sounds[type].volume = 0.1;
        this.sounds[type].play().catch(() => {});
    }
};

GameSession.prototype.setupKeyboardShortcuts = function() {
    document.addEventListener('keydown', (e) => {
        // Only trigger if not typing in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            if (e.ctrlKey && e.key === 'Enter') {
                document.getElementById('chat-input')?.focus();
            }
            return;
        }

        if (e.ctrlKey) {
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    this.handleQuickAction('Atacar');
                    break;
                case '2':
                    e.preventDefault();
                    this.handleQuickAction('Defender');
                    break;
                case '3':
                    e.preventDefault();
                    this.handleQuickAction('Usar Magia');
                    break;
                case 'Enter':
                    e.preventDefault();
                    document.getElementById('chat-input')?.focus();
                    break;
            }
        }

        // Function keys and special shortcuts
         switch(e.key) {
             case 'F1':
                 e.preventDefault();
                 if (e.shiftKey) {
                     this.toggleHelpPanel();
                 } else {
                     this.switchMode('exploration');
                 }
                 break;
             case 'F2':
                 e.preventDefault();
                 this.switchMode('combat');
                 break;
             case 'F3':
                 e.preventDefault();
                 this.switchMode('social');
                 break;
             case 'Escape':
                 this.closeAllModals();
                 break;
             case 'h':
                 if (e.ctrlKey) {
                     e.preventDefault();
                     this.toggleHelpPanel();
                 }
                 break;
         }
    });
};

GameSession.prototype.setupAccessibility = function() {
    // Add ARIA labels and improve keyboard navigation
    document.querySelectorAll('.action-btn').forEach((btn, index) => {
        btn.setAttribute('aria-label', btn.textContent.trim());
        btn.setAttribute('tabindex', index + 1);
    });

    // Improve focus indicators
    document.querySelectorAll('button, select, input').forEach(element => {
        element.addEventListener('focus', (e) => {
            e.target.style.outline = '2px solid #d4af37';
            e.target.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', (e) => {
            e.target.style.outline = '';
            e.target.style.outlineOffset = '';
        });
    });
};

GameSession.prototype.switchMode = function(mode) {
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        }
    });
    this.gameState.mode = mode;
    this.updateGameMode();
    this.showNotification(`Modo alterado para: ${this.getModeDisplayName(mode)}`, 'info');
};

GameSession.prototype.getModeDisplayName = function(mode) {
    const modes = {
        'exploration': 'Exploração',
        'combat': 'Combate',
        'social': 'Social'
    };
    return modes[mode] || mode;
};

GameSession.prototype.closeAllModals = function() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    
    // Also close help panel
    const helpPanel = document.getElementById('help-panel');
    if (helpPanel) {
        helpPanel.style.display = 'none';
    }
};

GameSession.prototype.toggleHelpPanel = function() {
    const helpPanel = document.getElementById('help-panel');
    if (helpPanel) {
        if (helpPanel.style.display === 'none' || !helpPanel.style.display) {
            helpPanel.style.display = 'flex';
            this.showNotification('Painel de ajuda aberto', 'info');
        } else {
            helpPanel.style.display = 'none';
        }
    }
};

GameSession.prototype.showLoadingOverlay = function(message = 'Carregando...') {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        const loadingText = overlay.querySelector('p');
        if (loadingText) {
            loadingText.textContent = message;
        }
        overlay.style.display = 'flex';
    }
};

GameSession.prototype.hideLoadingOverlay = function() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
};

GameSession.prototype.simulateLoading = function(action, duration = 2000) {
    this.showLoadingOverlay(`${action}...`);
    
    setTimeout(() => {
        this.hideLoadingOverlay();
        this.showNotification(`${action} concluído!`, 'success');
    }, duration);
};

GameSession.prototype.showNotification = function(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${this.getNotificationIcon(type)}</span>
        <span class="notification-text">${message}</span>
        <button class="notification-close">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Animação de entrada
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Botão de fechar
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
    
    this.playSound('notification');
};

GameSession.prototype.animateNewMessage = function() {
    const messages = document.querySelectorAll('.message');
    const lastMessage = messages[messages.length - 1];
    if (lastMessage) {
        lastMessage.style.transform = 'translateX(-20px)';
        lastMessage.style.opacity = '0';
        setTimeout(() => {
            lastMessage.style.transform = 'translateX(0)';
            lastMessage.style.opacity = '1';
        }, 50);
    }
};

GameSession.prototype.animateCharacterAction = function(action) {
    const avatar = document.querySelector('#char-avatar');
    if (avatar) {
        switch(action) {
            case 'attack':
                avatar.style.filter = 'hue-rotate(0deg) brightness(1.2)';
                break;
            case 'defense':
                avatar.style.filter = 'hue-rotate(240deg) brightness(1.1)';
                break;
            case 'rest':
                avatar.style.filter = 'hue-rotate(120deg) brightness(0.8)';
                break;
        }
        
        setTimeout(() => {
            avatar.style.filter = '';
        }, 1000);
    }
};

GameSession.prototype.showActionFeedback = function(action) {
    const feedback = document.createElement('div');
    feedback.className = 'action-feedback';
    feedback.textContent = action;
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(212, 175, 55, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        font-weight: bold;
        z-index: 1000;
        animation: fadeInOut 2s ease-in-out;
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => feedback.remove(), 2000);
};

GameSession.prototype.getNotificationIcon = function(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '<img src="/icons/Alerta-Aviso.png" alt="Aviso" style="width: 16px; height: 16px; display: inline;" />',
        info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
};

GameSession.prototype.pulseImportantElements = function() {
    const elements = document.querySelectorAll('.hp-bar, #char-avatar');
    elements.forEach(el => {
        el.style.animation = 'none';
        setTimeout(() => {
            el.style.animation = 'pulse 0.5s ease-in-out';
        }, 10);
    });
};

GameSession.prototype.updateDynamicElements = function() {
    // Atualizar timestamp, status, etc.
    const timeElements = document.querySelectorAll('.timestamp');
    timeElements.forEach(el => {
        // Atualizar tempo relativo se necessário
    });
};

GameSession.prototype.showTooltip = function(element, text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    tooltip.style.cssText = `
        position: absolute;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 5px 10px;
        border-radius: 3px;
        font-size: 12px;
        z-index: 1000;
        pointer-events: none;
    `;
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
    
    this.currentTooltip = tooltip;
};

GameSession.prototype.hideTooltip = function() {
    if (this.currentTooltip) {
        this.currentTooltip.remove();
        this.currentTooltip = null;
    }
};