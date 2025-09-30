class StoryCreator {
    constructor() {
        this.initializeEventListeners();
        this.storyData = {};
    }

    initializeEventListeners() {
        // Botões principais
        document.getElementById('previewStory').addEventListener('click', () => this.previewStory());
        document.getElementById('saveStory').addEventListener('click', () => this.saveStory());
        document.getElementById('createStory').addEventListener('click', () => this.createStory());
        document.getElementById('cancelStory').addEventListener('click', () => this.cancelStory());

        // Form submission
        document.getElementById('storyForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createStory();
        });

        // Image upload
        document.getElementById('storyImage').addEventListener('change', (e) => this.handleImageUpload(e));
        document.getElementById('storyImagePreview').addEventListener('click', () => {
            document.getElementById('storyImage').click();
        });
    }

    // Funções para adicionar/remover NPCs
    addNPC() {
        const npcList = document.getElementById('npcList');
        const newNPC = document.createElement('div');
        newNPC.className = 'list-item';
        newNPC.innerHTML = `
            <input type="text" name="npcName[]" placeholder="Nome do NPC" class="npc-name">
            <input type="text" name="npcRole[]" placeholder="Papel na história" class="npc-role">
            <textarea name="npcDescription[]" placeholder="Descrição do NPC" rows="2" class="npc-description"></textarea>
            <button type="button" class="btn-remove" onclick="removeNPC(this)">Remover</button>
        `;
        npcList.appendChild(newNPC);
    }

    removeNPC(button) {
        button.parentElement.remove();
    }

    // Funções para adicionar/remover Locais
    addLocation() {
        const locationList = document.getElementById('locationList');
        const newLocation = document.createElement('div');
        newLocation.className = 'list-item';
        newLocation.innerHTML = `
            <input type="text" name="locationName[]" placeholder="Nome do local" class="location-name">
            <textarea name="locationDescription[]" placeholder="Descrição do local" rows="2" class="location-description"></textarea>
            <button type="button" class="btn-remove" onclick="removeLocation(this)">Remover</button>
        `;
        locationList.appendChild(newLocation);
    }

    removeLocation(button) {
        button.parentElement.remove();
    }

    // Funções para adicionar/remover Encontros
    addEncounter() {
        const encounterList = document.getElementById('encounterList');
        const newEncounter = document.createElement('div');
        newEncounter.className = 'list-item';
        newEncounter.innerHTML = `
            <input type="text" name="encounterType[]" placeholder="Tipo de encontro" class="encounter-type">
            <textarea name="encounterDescription[]" placeholder="Descrição do encontro/desafio" rows="2" class="encounter-description"></textarea>
            <button type="button" class="btn-remove" onclick="removeEncounter(this)">Remover</button>
        `;
        encounterList.appendChild(newEncounter);
    }

    removeEncounter(button) {
        button.parentElement.remove();
    }

    // Funções para adicionar/remover Recompensas
    addReward() {
        const rewardList = document.getElementById('rewardList');
        const newReward = document.createElement('div');
        newReward.className = 'list-item';
        newReward.innerHTML = `
            <input type="text" name="rewardType[]" placeholder="Tipo de recompensa" class="reward-type">
            <textarea name="rewardDescription[]" placeholder="Descrição da recompensa" rows="2" class="reward-description"></textarea>
            <button type="button" class="btn-remove" onclick="removeReward(this)">Remover</button>
        `;
        rewardList.appendChild(newReward);
    }

    removeReward(button) {
        button.parentElement.remove();
    }

    // Função para lidar com upload de imagem
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validar tipo de arquivo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            alert('Por favor, selecione apenas arquivos de imagem (PNG, JPG, GIF)');
            return;
        }

        // Validar tamanho (5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB em bytes
        if (file.size > maxSize) {
            alert('A imagem deve ter no máximo 5MB');
            return;
        }

        // Criar preview da imagem
        const reader = new FileReader();
        reader.onload = (e) => {
            this.displayImagePreview(e.target.result, file.name);
        };
        reader.readAsDataURL(file);
    }

    // Exibir preview da imagem
    displayImagePreview(imageSrc, fileName) {
        const previewContainer = document.getElementById('storyImagePreview');
        previewContainer.innerHTML = `
            <img src="${imageSrc}" alt="Preview" class="preview-image">
            <button type="button" class="image-remove-btn" onclick="storyCreator.removeImage()" title="Remover imagem">
                ×
            </button>
        `;
        
        // Armazenar dados da imagem
        this.storyData.imageData = {
            src: imageSrc,
            name: fileName
        };
    }

    // Remover imagem
    removeImage() {
        const previewContainer = document.getElementById('storyImagePreview');
        previewContainer.innerHTML = `
            <div class="upload-placeholder">
                <img src="assets/icons/image-upload.svg" alt="Upload" class="upload-icon">
                <p>Clique para adicionar uma ilustração</p>
                <span class="upload-hint">PNG, JPG ou GIF até 5MB</span>
            </div>
        `;
        
        // Limpar input e dados
        document.getElementById('storyImage').value = '';
        delete this.storyData.imageData;
    }

    // Coleta dados do formulário
    collectFormData() {
        const formData = new FormData(document.getElementById('storyForm'));
        const data = {};

        // Campos simples
        data.title = formData.get('storyTitle');
        data.genre = formData.get('storyGenre');
        data.difficulty = formData.get('storyDifficulty');
        data.description = formData.get('storyDescription');
        data.premise = formData.get('storyPremise');
        data.objective = formData.get('storyObjective');
        data.conflict = formData.get('storyConflict');
        data.resolution = formData.get('storyResolution');
        data.protagonists = formData.get('storyProtagonists');
        data.setting = formData.get('storySetting');
        data.atmosphere = formData.get('storyAtmosphere');
        data.duration = formData.get('storyDuration');
        data.players = formData.get('storyPlayers');
        data.notes = formData.get('storyNotes');
        data.inspiration = formData.get('storyInspiration');
        
        // Adicionar dados da imagem se existir
        if (this.storyData?.imageData) {
            data.imageData = this.storyData.imageData;
        }

        // NPCs
        data.npcs = [];
        const npcNames = formData.getAll('npcName[]');
        const npcRoles = formData.getAll('npcRole[]');
        const npcDescriptions = formData.getAll('npcDescription[]');
        for (let i = 0; i < npcNames.length; i++) {
            if (npcNames[i].trim()) {
                data.npcs.push({
                    name: npcNames[i],
                    role: npcRoles[i],
                    description: npcDescriptions[i]
                });
            }
        }

        // Locais
        data.locations = [];
        const locationNames = formData.getAll('locationName[]');
        const locationDescriptions = formData.getAll('locationDescription[]');
        for (let i = 0; i < locationNames.length; i++) {
            if (locationNames[i].trim()) {
                data.locations.push({
                    name: locationNames[i],
                    description: locationDescriptions[i]
                });
            }
        }

        // Encontros
        data.encounters = [];
        const encounterTypes = formData.getAll('encounterType[]');
        const encounterDescriptions = formData.getAll('encounterDescription[]');
        for (let i = 0; i < encounterTypes.length; i++) {
            if (encounterTypes[i].trim()) {
                data.encounters.push({
                    type: encounterTypes[i],
                    description: encounterDescriptions[i]
                });
            }
        }

        // Recompensas
        data.rewards = [];
        const rewardTypes = formData.getAll('rewardType[]');
        const rewardDescriptions = formData.getAll('rewardDescription[]');
        for (let i = 0; i < rewardTypes.length; i++) {
            if (rewardTypes[i].trim()) {
                data.rewards.push({
                    type: rewardTypes[i],
                    description: rewardDescriptions[i]
                });
            }
        }

        return data;
    }

    // Valida os dados do formulário
    validateForm(data) {
        const errors = [];

        if (!data.title || data.title.trim() === '') {
            errors.push('Título da história é obrigatório');
        }

        if (!data.premise || data.premise.trim() === '') {
            errors.push('Premissa é obrigatória');
        }

        if (!data.objective || data.objective.trim() === '') {
            errors.push('Objetivo principal é obrigatório');
        }

        if (!data.setting || data.setting.trim() === '') {
            errors.push('Cenário principal é obrigatório');
        }

        return errors;
    }

    // Gera o preview da história
    generatePreviewHTML(data) {
        let html = `
            <div class="preview-section">
                <h3>${data.title || 'História sem título'}</h3>
                ${data.imageData ? `<div style="text-align: center; margin: 1rem 0;"><img src="${data.imageData.src}" alt="Ilustração da História" style="max-width: 100%; max-height: 300px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);"></div>` : ''}
                ${data.description ? `<p><strong>Descrição:</strong> ${data.description}</p>` : ''}
                ${data.genre ? `<p><strong>Gênero:</strong> ${data.genre}</p>` : ''}
                ${data.difficulty ? `<p><strong>Dificuldade:</strong> ${data.difficulty}</p>` : ''}
                ${data.duration ? `<p><strong>Duração:</strong> ${data.duration}</p>` : ''}
                ${data.players ? `<p><strong>Jogadores:</strong> ${data.players}</p>` : ''}
            </div>
        `;

        if (data.premise) {
            html += `
                <div class="preview-section">
                    <h3>Premissa</h3>
                    <p>${data.premise}</p>
                </div>
            `;
        }

        if (data.objective) {
            html += `
                <div class="preview-section">
                    <h3>Objetivo Principal</h3>
                    <p>${data.objective}</p>
                </div>
            `;
        }

        if (data.conflict) {
            html += `
                <div class="preview-section">
                    <h3>Conflito Central</h3>
                    <p>${data.conflict}</p>
                </div>
            `;
        }

        if (data.setting) {
            html += `
                <div class="preview-section">
                    <h3>Cenário</h3>
                    <p>${data.setting}</p>
                    ${data.atmosphere ? `<p><strong>Atmosfera:</strong> ${data.atmosphere}</p>` : ''}
                </div>
            `;
        }

        if (data.npcs && data.npcs.length > 0) {
            html += `
                <div class="preview-section">
                    <h3>NPCs Importantes</h3>
                    <ul>
            `;
            data.npcs.forEach(npc => {
                html += `<li><strong>${npc.name}</strong> - ${npc.role}${npc.description ? `: ${npc.description}` : ''}</li>`;
            });
            html += `</ul></div>`;
        }

        if (data.locations && data.locations.length > 0) {
            html += `
                <div class="preview-section">
                    <h3>Locais Importantes</h3>
                    <ul>
            `;
            data.locations.forEach(location => {
                html += `<li><strong>${location.name}</strong>${location.description ? `: ${location.description}` : ''}</li>`;
            });
            html += `</ul></div>`;
        }

        if (data.encounters && data.encounters.length > 0) {
            html += `
                <div class="preview-section">
                    <h3>Encontros e Desafios</h3>
                    <ul>
            `;
            data.encounters.forEach(encounter => {
                html += `<li><strong>${encounter.type}</strong>${encounter.description ? `: ${encounter.description}` : ''}</li>`;
            });
            html += `</ul></div>`;
        }

        if (data.rewards && data.rewards.length > 0) {
            html += `
                <div class="preview-section">
                    <h3>Recompensas</h3>
                    <ul>
            `;
            data.rewards.forEach(reward => {
                html += `<li><strong>${reward.type}</strong>${reward.description ? `: ${reward.description}` : ''}</li>`;
            });
            html += `</ul></div>`;
        }

        if (data.resolution) {
            html += `
                <div class="preview-section">
                    <h3>Possíveis Resoluções</h3>
                    <p>${data.resolution}</p>
                </div>
            `;
        }

        if (data.notes) {
            html += `
                <div class="preview-section">
                    <h3>Notas do Mestre</h3>
                    <p>${data.notes}</p>
                </div>
            `;
        }

        if (data.inspiration) {
            html += `
                <div class="preview-section">
                    <h3>Inspirações</h3>
                    <p>${data.inspiration}</p>
                </div>
            `;
        }

        return html;
    }

    // Mostra o preview da história
    previewStory() {
        const data = this.collectFormData();
        const errors = this.validateForm(data);

        if (errors.length > 0) {
            alert('Por favor, corrija os seguintes erros:\n\n' + errors.join('\n'));
            return;
        }

        const previewHTML = this.generatePreviewHTML(data);
        document.getElementById('storyPreviewContent').innerHTML = previewHTML;
        document.getElementById('storyPreviewModal').style.display = 'block';
    }

    // Salva a história
    saveStory() {
        const data = this.collectFormData();
        const errors = this.validateForm(data);

        if (errors.length > 0) {
            alert('Por favor, corrija os seguintes erros:\n\n' + errors.join('\n'));
            return;
        }

        // Salvar no localStorage por enquanto
        const stories = JSON.parse(localStorage.getItem('stories') || '[]');
        data.id = Date.now();
        data.createdAt = new Date().toISOString();
        stories.push(data);
        localStorage.setItem('stories', JSON.stringify(stories));

        alert('História salva com sucesso!');
    }

    // Cria a história (salva e redireciona)
    createStory() {
        const data = this.collectFormData();
        const errors = this.validateForm(data);

        if (errors.length > 0) {
            alert('Por favor, corrija os seguintes erros:\n\n' + errors.join('\n'));
            return;
        }

        // Salvar no localStorage por enquanto
        const stories = JSON.parse(localStorage.getItem('stories') || '[]');
        data.id = Date.now();
        data.createdAt = new Date().toISOString();
        stories.push(data);
        localStorage.setItem('stories', JSON.stringify(stories));

        alert('História criada com sucesso!');
        window.location.href = 'creations.html';
    }

    // Cancela a criação
    cancelStory() {
        if (confirm('Tem certeza que deseja cancelar? Todos os dados não salvos serão perdidos.')) {
            // Limpar formulário
            document.getElementById('storyForm').reset();
            
            // Remover itens extras das listas dinâmicas
            this.resetDynamicLists();
            
            // Redirecionar para a página de criações
            window.location.href = 'creations.html';
        }
    }

    // Reset das listas dinâmicas
    resetDynamicLists() {
        // Reset NPCs
        const npcList = document.getElementById('npcList');
        npcList.innerHTML = `
            <div class="list-item">
                <input type="text" name="npcName[]" placeholder="Nome do NPC" class="npc-name">
                <input type="text" name="npcRole[]" placeholder="Papel na história" class="npc-role">
                <textarea name="npcDescription[]" placeholder="Descrição do NPC" rows="2" class="npc-description"></textarea>
                <button type="button" class="btn-remove" onclick="removeNPC(this)">Remover</button>
            </div>
        `;

        // Reset Locations
        const locationList = document.getElementById('locationList');
        locationList.innerHTML = `
            <div class="list-item">
                <input type="text" name="locationName[]" placeholder="Nome do local" class="location-name">
                <textarea name="locationDescription[]" placeholder="Descrição do local" rows="2" class="location-description"></textarea>
                <button type="button" class="btn-remove" onclick="removeLocation(this)">Remover</button>
            </div>
        `;

        // Reset Encounters
        const encounterList = document.getElementById('encounterList');
        encounterList.innerHTML = `
            <div class="list-item">
                <input type="text" name="encounterType[]" placeholder="Tipo de encontro" class="encounter-type">
                <textarea name="encounterDescription[]" placeholder="Descrição do encontro/desafio" rows="2" class="encounter-description"></textarea>
                <button type="button" class="btn-remove" onclick="removeEncounter(this)">Remover</button>
            </div>
        `;

        // Reset Rewards
        const rewardList = document.getElementById('rewardList');
        rewardList.innerHTML = `
            <div class="list-item">
                <input type="text" name="rewardType[]" placeholder="Tipo de recompensa" class="reward-type">
                <textarea name="rewardDescription[]" placeholder="Descrição da recompensa" rows="2" class="reward-description"></textarea>
                <button type="button" class="btn-remove" onclick="removeReward(this)">Remover</button>
            </div>
        `;
    }

    // Exporta a história
    exportStory() {
        const data = this.collectFormData();
        const errors = this.validateForm(data);

        if (errors.length > 0) {
            alert('Por favor, corrija os seguintes erros antes de exportar:\n\n' + errors.join('\n'));
            return;
        }

        const exportData = JSON.stringify(data, null, 2);
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.title || 'historia'}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Funções globais para os botões de adicionar/remover
function addNPC() {
    storyCreator.addNPC();
}

function removeNPC(button) {
    storyCreator.removeNPC(button);
}

function addLocation() {
    storyCreator.addLocation();
}

function removeLocation(button) {
    storyCreator.removeLocation(button);
}

function addEncounter() {
    storyCreator.addEncounter();
}

function removeEncounter(button) {
    storyCreator.removeEncounter(button);
}

function addReward() {
    storyCreator.addReward();
}

function removeReward(button) {
    storyCreator.removeReward(button);
}

function closeStoryPreview() {
    document.getElementById('storyPreviewModal').style.display = 'none';
}

function exportStory() {
    storyCreator.exportStory();
}

// Inicializar quando a página carregar
let storyCreator;
document.addEventListener('DOMContentLoaded', function() {
    storyCreator = new StoryCreator();
});