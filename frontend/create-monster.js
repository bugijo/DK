class MonsterCreator {
    constructor() {
        this.currentAvatar = null;
        this.abilities = [];
        this.actions = [];
        this.initializeEventListeners();
        this.updateCalculatedStats();
    }

    initializeEventListeners() {
        // Avatar upload
        const uploadBtn = document.getElementById('uploadAvatar');
        const avatarUpload = document.getElementById('avatarUpload');
        
        if (uploadBtn && avatarUpload) {
            uploadBtn.addEventListener('click', () => avatarUpload.click());
            avatarUpload.addEventListener('change', (e) => this.handleAvatarUpload(e));
        }

        // Attribute inputs
        const attributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        attributes.forEach(attr => {
            const input = document.getElementById(attr);
            if (input) {
                input.addEventListener('input', () => {
                    this.updateModifier(attr);
                    this.updateCalculatedStats();
                });
            }
        });

        // Challenge Rating change
        const challengeRating = document.getElementById('challengeRating');
        if (challengeRating) {
            challengeRating.addEventListener('change', () => this.updateCalculatedStats());
        }

        // Hit Points input
        const hitPoints = document.getElementById('hitPoints');
        if (hitPoints) {
            hitPoints.addEventListener('input', () => this.updateHitDiceInfo());
        }

        // Attribute generation buttons
        const rollBtn = document.getElementById('rollAttributes');
        const standardBtn = document.getElementById('standardArray');
        const pointBuyBtn = document.getElementById('pointBuy');
        
        if (rollBtn) rollBtn.addEventListener('click', () => this.rollAttributes());
        if (standardBtn) standardBtn.addEventListener('click', () => this.setStandardArray());
        if (pointBuyBtn) pointBuyBtn.addEventListener('click', () => this.setPointBuyArray());

        // Special abilities and actions
        const addAbilityBtn = document.getElementById('addAbility');
        const addActionBtn = document.getElementById('addAction');
        
        if (addAbilityBtn) addAbilityBtn.addEventListener('click', () => this.addSpecialAbility());
        if (addActionBtn) addActionBtn.addEventListener('click', () => this.addAction());

        // Form buttons
        const previewBtn = document.getElementById('previewMonster');
        const saveBtn = document.getElementById('saveMonster');
        const cancelBtn = document.getElementById('cancelMonster');
        const form = document.getElementById('monsterForm');
        
        if (previewBtn) previewBtn.addEventListener('click', () => this.previewMonster());
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveMonster());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.cancelMonster());
        if (form) form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Calculate ability modifier
    calculateModifier(score) {
        return Math.floor((score - 10) / 2);
    }

    // Update modifier display
    updateModifier(attribute) {
        const input = document.getElementById(attribute);
        const modifierSpan = document.getElementById(attribute + 'Mod');
        
        if (input && modifierSpan) {
            const score = parseInt(input.value) || 10;
            const modifier = this.calculateModifier(score);
            modifierSpan.textContent = modifier >= 0 ? `+${modifier}` : `${modifier}`;
        }
    }

    // Get proficiency bonus based on challenge rating
    getProficiencyBonus(challengeRating) {
        const cr = parseFloat(challengeRating);
        if (cr <= 4) return 2;
        if (cr <= 8) return 3;
        if (cr <= 12) return 4;
        if (cr <= 16) return 5;
        if (cr <= 20) return 6;
        if (cr <= 24) return 7;
        if (cr <= 28) return 8;
        return 9;
    }

    // Calculate armor class based on monster type and dexterity
    calculateArmorClass() {
        const dexterity = parseInt(document.getElementById('dexterity').value) || 10;
        const dexMod = this.calculateModifier(dexterity);
        
        // Base AC calculation (can be enhanced based on monster type)
        const baseAC = 10 + dexMod;
        return Math.max(baseAC, 10);
    }

    // Update calculated statistics
    updateCalculatedStats() {
        // Update all modifiers
        const attributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        attributes.forEach(attr => this.updateModifier(attr));

        // Update armor class
        const acElement = document.getElementById('armorClass');
        if (acElement) {
            acElement.textContent = this.calculateArmorClass();
        }

        // Update proficiency bonus
        const challengeRating = document.getElementById('challengeRating').value;
        const proficiencyElement = document.getElementById('proficiencyBonus');
        if (proficiencyElement) {
            const bonus = this.getProficiencyBonus(challengeRating);
            proficiencyElement.textContent = `+${bonus}`;
        }

        // Update hit dice info
        this.updateHitDiceInfo();
    }

    // Update hit dice information based on hit points
    updateHitDiceInfo() {
        const hitPoints = parseInt(document.getElementById('hitPoints').value) || 1;
        const constitution = parseInt(document.getElementById('constitution').value) || 10;
        const conMod = this.calculateModifier(constitution);
        
        // Estimate hit dice based on hit points and constitution modifier
        const avgHitDie = 4.5; // Average of d8
        const estimatedHitDice = Math.max(1, Math.round((hitPoints - conMod) / (avgHitDie + conMod)));
        
        const hitDiceInfo = document.getElementById('hitDiceInfo');
        if (hitDiceInfo) {
            hitDiceInfo.textContent = `(${estimatedHitDice}d8${conMod >= 0 ? '+' : ''}${conMod * estimatedHitDice})`;
        }
    }

    // Roll attributes using 4d6 drop lowest
    rollAttributes() {
        const attributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        
        attributes.forEach(attr => {
            const rolls = [];
            for (let i = 0; i < 4; i++) {
                rolls.push(Math.floor(Math.random() * 6) + 1);
            }
            rolls.sort((a, b) => b - a);
            const total = rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
            
            const input = document.getElementById(attr);
            if (input) {
                input.value = total;
                this.updateModifier(attr);
            }
        });
        
        this.updateCalculatedStats();
    }

    // Set standard array for monsters
    setStandardArray() {
        const standardValues = [15, 14, 13, 12, 10, 8];
        const attributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        
        attributes.forEach((attr, index) => {
            const input = document.getElementById(attr);
            if (input) {
                input.value = standardValues[index];
                this.updateModifier(attr);
            }
        });
        
        this.updateCalculatedStats();
    }

    // Set point buy array
    setPointBuyArray() {
        const pointBuyValues = [14, 14, 14, 12, 12, 10];
        const attributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        
        attributes.forEach((attr, index) => {
            const input = document.getElementById(attr);
            if (input) {
                input.value = pointBuyValues[index];
                this.updateModifier(attr);
            }
        });
        
        this.updateCalculatedStats();
    }

    // Add special ability
    addSpecialAbility() {
        const abilityId = `ability_${Date.now()}`;
        const abilityList = document.getElementById('abilityList');
        
        const abilityDiv = document.createElement('div');
        abilityDiv.className = 'ability-item';
        abilityDiv.innerHTML = `
            <div class="ability-header">
                <input type="text" placeholder="Nome da Habilidade" class="ability-name" data-id="${abilityId}">
                <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
            <textarea placeholder="Descrição da habilidade..." class="ability-description" data-id="${abilityId}" rows="3"></textarea>
        `;
        
        abilityList.appendChild(abilityDiv);
        this.abilities.push({ id: abilityId, name: '', description: '' });
    }

    // Add action
    addAction() {
        const actionId = `action_${Date.now()}`;
        const actionList = document.getElementById('actionList');
        
        const actionDiv = document.createElement('div');
        actionDiv.className = 'action-item';
        actionDiv.innerHTML = `
            <div class="action-header">
                <input type="text" placeholder="Nome da Ação" class="action-name" data-id="${actionId}">
                <button type="button" class="remove-btn" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Tipo de Ataque</label>
                    <select class="action-attack-type" data-id="${actionId}">
                        <option value="">Selecione</option>
                        <option value="melee">Corpo a Corpo</option>
                        <option value="ranged">À Distância</option>
                        <option value="spell">Magia</option>
                        <option value="other">Outro</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Bônus de Ataque</label>
                    <input type="text" placeholder="+5" class="action-attack-bonus" data-id="${actionId}">
                </div>
                <div class="form-group">
                    <label>Alcance</label>
                    <input type="text" placeholder="5 pés" class="action-reach" data-id="${actionId}">
                </div>
                <div class="form-group">
                    <label>Dano</label>
                    <input type="text" placeholder="1d8+3 perfurante" class="action-damage" data-id="${actionId}">
                </div>
            </div>
            <textarea placeholder="Descrição da ação..." class="action-description" data-id="${actionId}" rows="3"></textarea>
        `;
        
        actionList.appendChild(actionDiv);
        this.actions.push({ id: actionId, name: '', type: '', bonus: '', reach: '', damage: '', description: '' });
    }

    // Handle avatar upload
    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const avatarPreview = document.getElementById('avatarPreview');
                avatarPreview.innerHTML = `<img src="${e.target.result}" alt="Avatar do Monstro" style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px;">`;
                
                this.currentAvatar = {
                    type: 'uploaded',
                    data: e.target.result
                };
            };
            reader.readAsDataURL(file);
        }
    }

    // Validate form
    validateForm() {
        const requiredFields = [
            'monsterName',
            'challengeRating',
            'monsterType',
            'monsterSize'
        ];
        
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                field.classList.add('error');
                isValid = false;
                
                setTimeout(() => {
                    field.classList.remove('error');
                }, 500);
            }
        });
        
        return isValid;
    }

    // Collect form data
    collectFormData() {
        // Collect abilities
        const abilities = [];
        document.querySelectorAll('.ability-item').forEach(item => {
            const name = item.querySelector('.ability-name').value;
            const description = item.querySelector('.ability-description').value;
            if (name || description) {
                abilities.push({ name, description });
            }
        });

        // Collect actions
        const actions = [];
        document.querySelectorAll('.action-item').forEach(item => {
            const name = item.querySelector('.action-name').value;
            const attackType = item.querySelector('.action-attack-type').value;
            const attackBonus = item.querySelector('.action-attack-bonus').value;
            const reach = item.querySelector('.action-reach').value;
            const damage = item.querySelector('.action-damage').value;
            const description = item.querySelector('.action-description').value;
            
            if (name || description) {
                actions.push({ name, attackType, attackBonus, reach, damage, description });
            }
        });

        const formData = {
            // Basic Info
            name: document.getElementById('monsterName').value,
            challengeRating: document.getElementById('challengeRating').value,
            type: document.getElementById('monsterType').value,
            size: document.getElementById('monsterSize').value,
            alignment: document.getElementById('alignment').value,
            
            // Attributes
            attributes: {
                strength: parseInt(document.getElementById('strength').value),
                dexterity: parseInt(document.getElementById('dexterity').value),
                constitution: parseInt(document.getElementById('constitution').value),
                intelligence: parseInt(document.getElementById('intelligence').value),
                wisdom: parseInt(document.getElementById('wisdom').value),
                charisma: parseInt(document.getElementById('charisma').value)
            },
            
            // Combat Stats
            hitPoints: parseInt(document.getElementById('hitPoints').value),
            armorClass: parseInt(document.getElementById('armorClass').textContent),
            speed: document.getElementById('speed').value,
            proficiencyBonus: document.getElementById('proficiencyBonus').textContent,
            
            // Resistances and Immunities
            damageResistances: document.getElementById('damageResistances').value,
            damageImmunities: document.getElementById('damageImmunities').value,
            conditionImmunities: document.getElementById('conditionImmunities').value,
            damageVulnerabilities: document.getElementById('damageVulnerabilities').value,
            
            // Senses and Languages
            senses: document.getElementById('senses').value,
            languages: document.getElementById('languages').value,
            
            // Special Abilities and Actions
            specialAbilities: abilities,
            actions: actions,
            
            // Description
            description: document.getElementById('description').value,
            lore: document.getElementById('lore').value,
            
            // Avatar
            avatar: this.currentAvatar || null,
            
            // Metadata
            createdAt: new Date().toISOString()
        };
        
        return formData;
    }

    // Preview monster
    previewMonster() {
        if (!this.validateForm()) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        const monsterData = this.collectFormData();
        const modal = document.getElementById('previewModal');
        const previewContent = document.getElementById('previewContent');
        
        // Generate challenge rating XP
        const crXP = this.getChallengeRatingXP(monsterData.challengeRating);
        
        previewContent.innerHTML = `
            <div class="monster-stat-block">
                <h4>${monsterData.name}</h4>
                <div class="stat-line">
                    <span class="stat-label">${monsterData.size} ${monsterData.type}, ${monsterData.alignment}</span>
                </div>
                <hr>
                <div class="stat-line">
                    <span class="stat-label">Classe de Armadura:</span>
                    <span class="stat-value">${monsterData.armorClass}</span>
                </div>
                <div class="stat-line">
                    <span class="stat-label">Pontos de Vida:</span>
                    <span class="stat-value">${monsterData.hitPoints} ${document.getElementById('hitDiceInfo').textContent}</span>
                </div>
                <div class="stat-line">
                    <span class="stat-label">Velocidade:</span>
                    <span class="stat-value">${monsterData.speed}</span>
                </div>
                <hr>
                <div class="abilities">
                    <div class="ability">
                        <div class="ability-name">FOR</div>
                        <div class="ability-score">${monsterData.attributes.strength}</div>
                        <div class="ability-modifier">(${this.calculateModifier(monsterData.attributes.strength) >= 0 ? '+' : ''}${this.calculateModifier(monsterData.attributes.strength)})</div>
                    </div>
                    <div class="ability">
                        <div class="ability-name">DES</div>
                        <div class="ability-score">${monsterData.attributes.dexterity}</div>
                        <div class="ability-modifier">(${this.calculateModifier(monsterData.attributes.dexterity) >= 0 ? '+' : ''}${this.calculateModifier(monsterData.attributes.dexterity)})</div>
                    </div>
                    <div class="ability">
                        <div class="ability-name">CON</div>
                        <div class="ability-score">${monsterData.attributes.constitution}</div>
                        <div class="ability-modifier">(${this.calculateModifier(monsterData.attributes.constitution) >= 0 ? '+' : ''}${this.calculateModifier(monsterData.attributes.constitution)})</div>
                    </div>
                    <div class="ability">
                        <div class="ability-name">INT</div>
                        <div class="ability-score">${monsterData.attributes.intelligence}</div>
                        <div class="ability-modifier">(${this.calculateModifier(monsterData.attributes.intelligence) >= 0 ? '+' : ''}${this.calculateModifier(monsterData.attributes.intelligence)})</div>
                    </div>
                    <div class="ability">
                        <div class="ability-name">SAB</div>
                        <div class="ability-score">${monsterData.attributes.wisdom}</div>
                        <div class="ability-modifier">(${this.calculateModifier(monsterData.attributes.wisdom) >= 0 ? '+' : ''}${this.calculateModifier(monsterData.attributes.wisdom)})</div>
                    </div>
                    <div class="ability">
                        <div class="ability-name">CAR</div>
                        <div class="ability-score">${monsterData.attributes.charisma}</div>
                        <div class="ability-modifier">(${this.calculateModifier(monsterData.attributes.charisma) >= 0 ? '+' : ''}${this.calculateModifier(monsterData.attributes.charisma)})</div>
                    </div>
                </div>
                <hr>
                ${monsterData.damageResistances ? `<div class="stat-line"><span class="stat-label">Resistências a Dano:</span> <span class="stat-value">${monsterData.damageResistances}</span></div>` : ''}
                ${monsterData.damageImmunities ? `<div class="stat-line"><span class="stat-label">Imunidades a Dano:</span> <span class="stat-value">${monsterData.damageImmunities}</span></div>` : ''}
                ${monsterData.conditionImmunities ? `<div class="stat-line"><span class="stat-label">Imunidades a Condições:</span> <span class="stat-value">${monsterData.conditionImmunities}</span></div>` : ''}
                ${monsterData.damageVulnerabilities ? `<div class="stat-line"><span class="stat-label">Vulnerabilidades:</span> <span class="stat-value">${monsterData.damageVulnerabilities}</span></div>` : ''}
                ${monsterData.senses ? `<div class="stat-line"><span class="stat-label">Sentidos:</span> <span class="stat-value">${monsterData.senses}</span></div>` : ''}
                ${monsterData.languages ? `<div class="stat-line"><span class="stat-label">Idiomas:</span> <span class="stat-value">${monsterData.languages}</span></div>` : ''}
                <div class="stat-line">
                    <span class="stat-label">Nível de Desafio:</span>
                    <span class="stat-value">${monsterData.challengeRating} (${crXP} XP)</span>
                </div>
                <hr>
                ${monsterData.specialAbilities.length > 0 ? `
                    <h5>Habilidades Especiais</h5>
                    ${monsterData.specialAbilities.map(ability => `
                        <div class="ability-block">
                            <strong>${ability.name}.</strong> ${ability.description}
                        </div>
                    `).join('')}
                    <hr>
                ` : ''}
                ${monsterData.actions.length > 0 ? `
                    <h5>Ações</h5>
                    ${monsterData.actions.map(action => `
                        <div class="action-block">
                            <strong>${action.name}.</strong> ${action.attackType ? `<em>${action.attackType === 'melee' ? 'Ataque Corpo a Corpo' : action.attackType === 'ranged' ? 'Ataque à Distância' : action.attackType === 'spell' ? 'Ataque de Magia' : 'Ação'}:</em> ` : ''}${action.attackBonus ? `${action.attackBonus} para atingir, ` : ''}${action.reach ? `alcance ${action.reach}, ` : ''}${action.damage ? `${action.damage} de dano. ` : ''}${action.description}
                        </div>
                    `).join('')}
                ` : ''}
            </div>
        `;
        
        modal.style.display = 'block';
        
        // Close modal functionality
        const closeBtn = document.getElementById('closePreview');
        closeBtn.onclick = () => modal.style.display = 'none';
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        };
    }

    // Get challenge rating XP
    getChallengeRatingXP(cr) {
        const xpTable = {
            '0': '10', '1/8': '25', '1/4': '50', '1/2': '100',
            '1': '200', '2': '450', '3': '700', '4': '1.100',
            '5': '1.800', '6': '2.300', '7': '2.900', '8': '3.900',
            '9': '5.000', '10': '5.900', '11': '7.200', '12': '8.400',
            '13': '10.000', '14': '11.500', '15': '13.000', '16': '15.000',
            '17': '18.000', '18': '20.000', '19': '22.000', '20': '25.000',
            '21': '33.000', '22': '41.000', '23': '50.000', '24': '62.000',
            '25': '75.000', '26': '90.000', '27': '105.000', '28': '120.000',
            '29': '135.000', '30': '155.000'
        };
        return xpTable[cr] || '0';
    }

    // Save monster
    saveMonster() {
        if (!this.validateForm()) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        const monsterData = this.collectFormData();
        
        // Save to localStorage
        const savedMonsters = JSON.parse(localStorage.getItem('savedMonsters') || '[]');
        savedMonsters.push(monsterData);
        localStorage.setItem('savedMonsters', JSON.stringify(savedMonsters));
        
        alert(`Monstro "${monsterData.name}" salvo com sucesso!`);
    }

    // Handle form submission
    handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        const monsterData = this.collectFormData();
        
        // Save to localStorage
        const savedMonsters = JSON.parse(localStorage.getItem('savedMonsters') || '[]');
        savedMonsters.push(monsterData);
        localStorage.setItem('savedMonsters', JSON.stringify(savedMonsters));
        
        alert(`Monstro "${monsterData.name}" criado com sucesso!`);
        
        // Redirect back to creations page
        window.location.href = 'creations.html';
    }

    cancelMonster() {
        if (confirm('Tem certeza que deseja cancelar? Todas as alterações não salvas serão perdidas.')) {
            // Clear the form
            document.getElementById('monsterForm').reset();
            
            // Reset avatar
            this.currentAvatar = null;
            const avatarPreview = document.getElementById('avatarPreview');
            if (avatarPreview) {
                avatarPreview.innerHTML = `
                    <div class="avatar-placeholder">
                        <img src="assets/icons/upload.svg" alt="Upload" width="40" height="40">
                        <span>Clique para adicionar avatar</span>
                    </div>
                `;
            }
            
            // Clear dynamic lists
            this.abilities = [];
            this.actions = [];
            
            // Clear abilities and actions containers
            const abilitiesContainer = document.getElementById('abilitiesContainer');
            const actionsContainer = document.getElementById('actionsContainer');
            
            if (abilitiesContainer) abilitiesContainer.innerHTML = '';
            if (actionsContainer) actionsContainer.innerHTML = '';
            
            // Reset calculated stats
            this.updateCalculatedStats();
            
            // Redirect to home or creations page
            window.location.href = 'home.html';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MonsterCreator();
});