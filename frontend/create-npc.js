// Create NPC JavaScript

class NPCCreator {
    constructor() {
        this.initializeEventListeners();
        this.updateAllModifiers();
        this.updateCalculatedStats();
    }

    initializeEventListeners() {
        // Attribute inputs
        const attributeInputs = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        attributeInputs.forEach(attr => {
            const input = document.getElementById(attr);
            if (input) {
                input.addEventListener('input', () => {
                    this.updateModifier(attr);
                    this.updateCalculatedStats();
                });
            }
        });

        // Level change
        const levelSelect = document.getElementById('npcLevel');
        if (levelSelect) {
            levelSelect.addEventListener('change', () => {
                this.updateCalculatedStats();
            });
        }

        // Class change
        const classSelect = document.getElementById('npcClass');
        if (classSelect) {
            classSelect.addEventListener('change', () => {
                this.updateCalculatedStats();
            });
        }

        // Race change
        const raceSelect = document.getElementById('npcRace');
        if (raceSelect) {
            raceSelect.addEventListener('change', () => {
                this.applyRacialBonuses();
                this.updateCalculatedStats();
            });
        }

        // Armor and shield changes
        const armorSelect = document.getElementById('armor');
        const shieldSelect = document.getElementById('shield');
        if (armorSelect) {
            armorSelect.addEventListener('change', () => {
                this.updateCalculatedStats();
            });
        }
        if (shieldSelect) {
            shieldSelect.addEventListener('change', () => {
                this.updateCalculatedStats();
            });
        }

        // Attribute generation buttons
        const rollBtn = document.getElementById('rollAttributes');
        const standardBtn = document.getElementById('standardArray');
        const pointBuyBtn = document.getElementById('pointBuy');

        if (rollBtn) {
            rollBtn.addEventListener('click', () => this.rollAttributes());
        }
        if (standardBtn) {
            standardBtn.addEventListener('click', () => this.setStandardArray());
        }
        if (pointBuyBtn) {
            pointBuyBtn.addEventListener('click', () => this.setPointBuyArray());
        }

        // Avatar controls
        const uploadAvatarBtn = document.getElementById('uploadAvatar');
        const avatarUpload = document.getElementById('avatarUpload');

        if (uploadAvatarBtn) {
            uploadAvatarBtn.addEventListener('click', () => avatarUpload.click());
        }
        if (avatarUpload) {
            avatarUpload.addEventListener('change', (e) => this.handleAvatarUpload(e));
        }

        // Form submission
        const form = document.getElementById('npcForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Preview button
        const previewBtn = document.getElementById('previewNPC');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => this.previewNPC());
        }
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

    // Update all modifiers
    updateAllModifiers() {
        const attributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        attributes.forEach(attr => this.updateModifier(attr));
    }

    // Get proficiency bonus based on level
    getProficiencyBonus(level) {
        return Math.ceil(level / 4) + 1;
    }

    // Get hit die based on class
    getHitDie(className) {
        const hitDice = {
            'barbaro': 12,
            'guerreiro': 10,
            'paladino': 10,
            'patrulheiro': 10,
            'bardo': 8,
            'clerigo': 8,
            'druida': 8,
            'monge': 8,
            'ladino': 8,
            'bruxo': 8,
            'mago': 6,
            'feiticeiro': 6
        };
        return hitDice[className] || 8;
    }

    // Get base armor class from armor
    getArmorClass() {
        const armorSelect = document.getElementById('armor');
        const shieldSelect = document.getElementById('shield');
        const dexInput = document.getElementById('dexterity');
        
        let baseAC = 10;
        let dexMod = this.calculateModifier(parseInt(dexInput.value) || 10);
        let shieldBonus = 0;
        
        if (armorSelect && armorSelect.value) {
            const armorAC = {
                'couro': 11,
                'couro-batido': 12,
                'camisao-malha': 13,
                'gibao-peles': 12,
                'brunea': 14,
                'cota-malha': 16,
                'peitoral': 14,
                'meia-armadura': 15,
                'cota-escamas': 14,
                'loriga-segmentada': 17,
                'armadura-completa': 18
            };
            
            const armorType = armorSelect.value;
            baseAC = armorAC[armorType] || 10;
            
            // Light armor: full dex bonus
            // Medium armor: max +2 dex bonus
            // Heavy armor: no dex bonus
            const lightArmors = ['couro', 'couro-batido', 'camisao-malha'];
            const mediumArmors = ['gibao-peles', 'brunea', 'cota-malha', 'peitoral', 'meia-armadura', 'cota-escamas'];
            const heavyArmors = ['loriga-segmentada', 'armadura-completa'];
            
            if (lightArmors.includes(armorType)) {
                baseAC += dexMod;
            } else if (mediumArmors.includes(armorType)) {
                baseAC += Math.min(dexMod, 2);
            }
            // Heavy armor doesn't add dex modifier
        } else {
            // No armor: 10 + dex modifier
            baseAC = 10 + dexMod;
        }
        
        if (shieldSelect && shieldSelect.value === 'escudo') {
            shieldBonus = 2;
        }
        
        return baseAC + shieldBonus;
    }

    // Get speed based on race
    getSpeed(race) {
        const speeds = {
            'humano': 30,
            'elfo': 30,
            'anao': 25,
            'halfling': 25,
            'draconato': 30,
            'gnomo': 25,
            'meio-elfo': 30,
            'meio-orc': 30,
            'tiefling': 30
        };
        return speeds[race] || 30;
    }

    // Update calculated statistics
    updateCalculatedStats() {
        const levelInput = document.getElementById('npcLevel');
        const classInput = document.getElementById('npcClass');
        const raceInput = document.getElementById('npcRace');
        const conInput = document.getElementById('constitution');
        const dexInput = document.getElementById('dexterity');
        
        const level = parseInt(levelInput.value) || 1;
        const className = classInput.value;
        const race = raceInput.value;
        const conMod = this.calculateModifier(parseInt(conInput.value) || 10);
        const dexMod = this.calculateModifier(parseInt(dexInput.value) || 10);
        
        // Hit Points
        const hitDie = this.getHitDie(className);
        const hitPoints = hitDie + conMod + ((level - 1) * (Math.floor(hitDie / 2) + 1 + conMod));
        document.getElementById('hitPoints').textContent = Math.max(1, hitPoints);
        
        // Armor Class
        document.getElementById('armorClass').textContent = this.getArmorClass();
        
        // Proficiency Bonus
        const profBonus = this.getProficiencyBonus(level);
        document.getElementById('proficiencyBonus').textContent = `+${profBonus}`;
        
        // Initiative
        document.getElementById('initiative').textContent = dexMod >= 0 ? `+${dexMod}` : `${dexMod}`;
        
        // Speed
        document.getElementById('speed').textContent = `${this.getSpeed(race)} pés`;
    }

    // Apply racial bonuses to attributes
    applyRacialBonuses() {
        const raceSelect = document.getElementById('npcRace');
        if (!raceSelect || !raceSelect.value) return;
        
        // Reset all attributes to base values first
        // Note: This is a simplified implementation
        // In a full implementation, you'd want to store base values separately
        
        const racialBonuses = {
            'humano': { // +1 to all
                'strength': 1, 'dexterity': 1, 'constitution': 1,
                'intelligence': 1, 'wisdom': 1, 'charisma': 1
            },
            'elfo': { 'dexterity': 2 },
            'anao': { 'constitution': 2 },
            'halfling': { 'dexterity': 2 },
            'draconato': { 'strength': 2, 'charisma': 1 },
            'gnomo': { 'intelligence': 2 },
            'meio-elfo': { 'charisma': 2 }, // +1 to two others
            'meio-orc': { 'strength': 2, 'constitution': 1 },
            'tiefling': { 'intelligence': 1, 'charisma': 2 }
        };
        
        // This is a notification to the user about racial bonuses
        // In a full implementation, you'd apply these automatically
        console.log('Racial bonuses for', raceSelect.value, ':', racialBonuses[raceSelect.value]);
    }

    // Roll 4d6 drop lowest for each attribute
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

    // Set standard array (15, 14, 13, 12, 10, 8)
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

    // Set point buy array (balanced build)
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

    // Validate form
    validateForm() {
        const requiredFields = [
            'npcName',
            'npcRace',
            'npcClass'
        ];
        
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                field.classList.add('error');
                isValid = false;
                
                // Remove error class after animation
                setTimeout(() => {
                    field.classList.remove('error');
                }, 500);
            }
        });
        
        return isValid;
    }

    // Collect form data
    collectFormData() {
        const formData = {
            // Basic Info
            name: document.getElementById('npcName').value,
            level: parseInt(document.getElementById('npcLevel').value),
            race: document.getElementById('npcRace').value,
            class: document.getElementById('npcClass').value,
            background: document.getElementById('npcBackground').value,
            alignment: document.getElementById('npcAlignment').value,
            
            // Attributes
            attributes: {
                strength: parseInt(document.getElementById('strength').value),
                dexterity: parseInt(document.getElementById('dexterity').value),
                constitution: parseInt(document.getElementById('constitution').value),
                intelligence: parseInt(document.getElementById('intelligence').value),
                wisdom: parseInt(document.getElementById('wisdom').value),
                charisma: parseInt(document.getElementById('charisma').value)
            },
            
            // Calculated Stats
            hitPoints: parseInt(document.getElementById('hitPoints').textContent),
            armorClass: parseInt(document.getElementById('armorClass').textContent),
            proficiencyBonus: document.getElementById('proficiencyBonus').textContent,
            initiative: document.getElementById('initiative').textContent,
            speed: document.getElementById('speed').textContent,
            
            // Personality
            personalityTraits: document.getElementById('personalityTraits').value,
            ideals: document.getElementById('ideals').value,
            bonds: document.getElementById('bonds').value,
            flaws: document.getElementById('flaws').value,
            
            // Equipment
            armor: document.getElementById('armor').value,
            shield: document.getElementById('shield').value,
            weapons: document.getElementById('weapons').value,
            equipment: document.getElementById('equipment').value,
            
            // Notes
            notes: document.getElementById('notes').value,
            
            // Avatar data
            avatar: this.currentAvatar || null,
            
            // Metadata
            createdAt: new Date().toISOString()
        };
        
        return formData;
    }



    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const avatarPreview = document.getElementById('avatarPreview');
                avatarPreview.innerHTML = `<img src="${e.target.result}" alt="Avatar do NPC">`;
                
                // Store uploaded image data
                this.currentAvatar = {
                    type: 'uploaded',
                    data: e.target.result
                };
            };
            reader.readAsDataURL(file);
        }
    }

    // Preview NPC
    previewNPC() {
        if (!this.validateForm()) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        const npcData = this.collectFormData();
        
        // Create preview modal
        const modal = document.createElement('div');
        modal.className = 'preview-modal';
        modal.innerHTML = `
            <div class="preview-content">
                <div class="preview-header">
                    <h2>${npcData.name}</h2>
                    <button class="close-preview">&times;</button>
                </div>
                <div class="preview-body">
                    <div class="preview-section">
                        <h3>Avatar</h3>
                        <div class="preview-avatar">
                            ${document.getElementById('avatarPreview').innerHTML}
                        </div>
                    </div>
                    <div class="preview-section">
                        <h3>Informações Básicas</h3>
                        <p><strong>Nível:</strong> ${npcData.level}</p>
                        <p><strong>Raça:</strong> ${npcData.race}</p>
                        <p><strong>Classe:</strong> ${npcData.class}</p>
                        <p><strong>Antecedente:</strong> ${npcData.background}</p>
                        <p><strong>Tendência:</strong> ${npcData.alignment}</p>
                    </div>
                    <div class="preview-section">
                        <h3>Atributos</h3>
                        <div class="preview-attributes">
                            <div>FOR: ${npcData.attributes.strength} (${this.calculateModifier(npcData.attributes.strength) >= 0 ? '+' : ''}${this.calculateModifier(npcData.attributes.strength)})</div>
                            <div>DES: ${npcData.attributes.dexterity} (${this.calculateModifier(npcData.attributes.dexterity) >= 0 ? '+' : ''}${this.calculateModifier(npcData.attributes.dexterity)})</div>
                            <div>CON: ${npcData.attributes.constitution} (${this.calculateModifier(npcData.attributes.constitution) >= 0 ? '+' : ''}${this.calculateModifier(npcData.attributes.constitution)})</div>
                            <div>INT: ${npcData.attributes.intelligence} (${this.calculateModifier(npcData.attributes.intelligence) >= 0 ? '+' : ''}${this.calculateModifier(npcData.attributes.intelligence)})</div>
                            <div>SAB: ${npcData.attributes.wisdom} (${this.calculateModifier(npcData.attributes.wisdom) >= 0 ? '+' : ''}${this.calculateModifier(npcData.attributes.wisdom)})</div>
                            <div>CAR: ${npcData.attributes.charisma} (${this.calculateModifier(npcData.attributes.charisma) >= 0 ? '+' : ''}${this.calculateModifier(npcData.attributes.charisma)})</div>
                        </div>
                    </div>
                    <div class="preview-section">
                        <h3>Estatísticas de Combate</h3>
                        <p><strong>Pontos de Vida:</strong> ${npcData.hitPoints}</p>
                        <p><strong>Classe de Armadura:</strong> ${npcData.armorClass}</p>
                        <p><strong>Bônus de Proficiência:</strong> ${npcData.proficiencyBonus}</p>
                        <p><strong>Iniciativa:</strong> ${npcData.initiative}</p>
                        <p><strong>Velocidade:</strong> ${npcData.speed}</p>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .preview-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .preview-content {
                background: linear-gradient(135deg, #2F1B14 0%, #3D2817 100%);
                border: 2px solid #8B4513;
                border-radius: 10px;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                color: #F5DEB3;
            }
            .preview-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                border-bottom: 2px solid #8B4513;
            }
            .preview-header h2 {
                color: #FFD700;
                margin: 0;
            }
            .close-preview {
                background: none;
                border: none;
                color: #FFD700;
                font-size: 2rem;
                cursor: pointer;
            }
            .preview-body {
                padding: 1rem;
            }
            .preview-section {
                margin-bottom: 1.5rem;
            }
            .preview-section h3 {
                color: #FFD700;
                border-bottom: 1px solid #8B4513;
                padding-bottom: 0.5rem;
            }
            .preview-attributes {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 0.5rem;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Close modal functionality
        const closeBtn = modal.querySelector('.close-preview');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            }
        });
    }

    // Handle form submission
    handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        const npcData = this.collectFormData();
        
        // Save to localStorage (in a real app, this would be sent to a server)
        const savedNPCs = JSON.parse(localStorage.getItem('savedNPCs') || '[]');
        savedNPCs.push(npcData);
        localStorage.setItem('savedNPCs', JSON.stringify(savedNPCs));
        
        alert(`NPC "${npcData.name}" criado com sucesso!`);
        
        // Redirect back to creations page
        window.location.href = 'creations.html';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NPCCreator();
});