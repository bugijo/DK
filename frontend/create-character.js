// Dados das regras de D&D 5e
const DND_DATA = {
    races: {
        human: {
            name: 'Humano',
            abilityScoreIncrease: { all: 1 },
            traits: ['Versátil', 'Talento Extra'],
            size: 'Médio',
            speed: 9,
            languages: ['Comum', 'Um idioma à escolha']
        },
        elf: {
            name: 'Elfo',
            abilityScoreIncrease: { dexterity: 2 },
            traits: ['Visão no Escuro', 'Percepção Aguçada', 'Ancestral Élfico', 'Transe'],
            size: 'Médio',
            speed: 9,
            languages: ['Comum', 'Élfico'],
            proficiencies: ['Percepção']
        },
        dwarf: {
            name: 'Anão',
            abilityScoreIncrease: { constitution: 2 },
            traits: ['Visão no Escuro', 'Resistência Anã', 'Proficiência com Machados'],
            size: 'Médio',
            speed: 7.5,
            languages: ['Comum', 'Anão'],
            proficiencies: ['História']
        },
        halfling: {
            name: 'Halfling',
            abilityScoreIncrease: { dexterity: 2 },
            traits: ['Sortudo', 'Corajoso', 'Agilidade Halfling'],
            size: 'Pequeno',
            speed: 7.5,
            languages: ['Comum', 'Halfling']
        },
        dragonborn: {
            name: 'Draconato',
            abilityScoreIncrease: { strength: 2, charisma: 1 },
            traits: ['Sopro Dracônico', 'Resistência Dracônica'],
            size: 'Médio',
            speed: 9,
            languages: ['Comum', 'Dracônico']
        },
        tiefling: {
            name: 'Tiefling',
            abilityScoreIncrease: { charisma: 2, intelligence: 1 },
            traits: ['Resistência ao Fogo', 'Magia Infernal', 'Legado Infernal'],
            size: 'Médio',
            speed: 9,
            languages: ['Comum', 'Infernal']
        }
    },
    classes: {
        fighter: {
            name: 'Guerreiro',
            hitDie: 10,
            primaryAbility: ['strength', 'dexterity'],
            savingThrows: ['strength', 'constitution'],
            skillChoices: 2,
            skillList: ['Acrobacia', 'Adestrar Animais', 'Atletismo', 'História', 'Intimidação', 'Intuição', 'Percepção', 'Sobrevivência'],
            features: ['Estilo de Luta', 'Ação Extra'],
            startingGold: { dice: '5d4', multiplier: 10 }
        },
        wizard: {
            name: 'Mago',
            hitDie: 6,
            primaryAbility: ['intelligence'],
            savingThrows: ['intelligence', 'wisdom'],
            skillChoices: 2,
            skillList: ['Arcanismo', 'História', 'Intuição', 'Investigação', 'Medicina', 'Religião'],
            features: ['Grimório', 'Recuperação Arcana'],
            startingGold: { dice: '2d4', multiplier: 10 }
        },
        rogue: {
            name: 'Ladino',
            hitDie: 8,
            primaryAbility: ['dexterity'],
            savingThrows: ['dexterity', 'intelligence'],
            skillChoices: 4,
            skillList: ['Acrobacia', 'Atletismo', 'Enganação', 'Furtividade', 'Intimidação', 'Intuição', 'Investigação', 'Percepção', 'Atuação', 'Persuasão', 'Prestidigitação'],
            features: ['Ataque Furtivo', 'Gíria de Ladrão'],
            startingGold: { dice: '4d4', multiplier: 10 }
        },
        cleric: {
            name: 'Clérigo',
            hitDie: 8,
            primaryAbility: ['wisdom'],
            savingThrows: ['wisdom', 'charisma'],
            skillChoices: 2,
            skillList: ['História', 'Intuição', 'Medicina', 'Persuasão', 'Religião'],
            features: ['Canalizar Divindade', 'Domínio Divino'],
            startingGold: { dice: '5d4', multiplier: 10 }
        },
        barbarian: {
            name: 'Bárbaro',
            hitDie: 12,
            primaryAbility: ['strength'],
            savingThrows: ['strength', 'constitution'],
            skillChoices: 2,
            skillList: ['Adestrar Animais', 'Atletismo', 'Intimidação', 'Natureza', 'Percepção', 'Sobrevivência'],
            features: ['Fúria', 'Defesa sem Armadura'],
            startingGold: { dice: '2d4', multiplier: 10 }
        },
        ranger: {
            name: 'Patrulheiro',
            hitDie: 10,
            primaryAbility: ['dexterity', 'wisdom'],
            savingThrows: ['strength', 'dexterity'],
            skillChoices: 3,
            skillList: ['Adestrar Animais', 'Atletismo', 'Furtividade', 'Intuição', 'Investigação', 'Natureza', 'Percepção', 'Sobrevivência'],
            features: ['Inimigo Favorito', 'Terreno Favorito'],
            startingGold: { dice: '5d4', multiplier: 10 }
        }
    },
    backgrounds: {
        acolyte: {
            name: 'Acólito',
            skills: ['Intuição', 'Religião'],
            languages: 2,
            equipment: ['Símbolo sagrado', 'Livro de orações', 'Incenso'],
            feature: 'Abrigo dos Fiéis'
        },
        criminal: {
            name: 'Criminoso',
            skills: ['Enganação', 'Furtividade'],
            tools: ['Ferramentas de Ladrão', 'Conjunto de Jogo'],
            equipment: ['Pé de cabra', 'Roupas escuras', 'Capuz'],
            feature: 'Contato Criminal'
        },
        'folk-hero': {
            name: 'Herói do Povo',
            skills: ['Adestrar Animais', 'Sobrevivência'],
            tools: ['Ferramentas de Artesão', 'Veículos (terrestres)'],
            equipment: ['Ferramentas de artesão', 'Pá', 'Roupas de artesão'],
            feature: 'Hospitalidade Rústica'
        },
        noble: {
            name: 'Nobre',
            skills: ['História', 'Persuasão'],
            tools: ['Conjunto de Jogo'],
            languages: 1,
            equipment: ['Roupas finas', 'Anel de sinete', 'Pergaminho de linhagem'],
            feature: 'Posição de Privilégio'
        },
        sage: {
            name: 'Erudito',
            skills: ['Arcanismo', 'História'],
            languages: 2,
            equipment: ['Tinta e pena', 'Carta de colega', 'Roupas comuns'],
            feature: 'Pesquisador'
        },
        soldier: {
            name: 'Soldado',
            skills: ['Atletismo', 'Intimidação'],
            tools: ['Conjunto de Jogo', 'Veículos (terrestres)'],
            equipment: ['Insígnia de posto', 'Baralho de cartas', 'Roupas comuns'],
            feature: 'Posto Militar'
        }
    }
};

// Estado do personagem
let characterData = {
    mode: 'guided',
    currentStep: 1,
    race: null,
    class: null,
    background: null,
    attributes: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
    },
    details: {},
    expertData: {}
};

// Arrays padrão de atributos
const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
let availableValues = [...STANDARD_ARRAY];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeCharacterCreation();
});

function initializeCharacterCreation() {
    setupModeSelection();
    setupGuidedMode();
    setupExpertMode();
    updateAttributeModifiers();
}

// Seleção de Modo
function setupModeSelection() {
    const modeCards = document.querySelectorAll('.mode-card');
    
    modeCards.forEach(card => {
        card.addEventListener('click', function() {
            const mode = this.dataset.mode;
            selectMode(mode);
        });
    });
}

function selectMode(mode) {
    characterData.mode = mode;
    
    // Atualizar cards visuais
    document.querySelectorAll('.mode-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    
    // Mostrar modo correspondente
    document.querySelectorAll('.creation-mode').forEach(modeDiv => {
        modeDiv.classList.remove('active');
    });
    document.getElementById(`${mode}-mode`).classList.add('active');
}

// Modo Guiado
function setupGuidedMode() {
    setupRaceSelection();
    setupClassSelection();
    setupAttributeSelection();
    setupBackgroundSelection();
    setupStepNavigation();
    updateStepDisplay();
}

function setupRaceSelection() {
    const raceCards = document.querySelectorAll('.race-card');
    
    raceCards.forEach(card => {
        card.addEventListener('click', function() {
            const race = this.dataset.race;
            selectRace(race);
        });
    });
}

function selectRace(raceKey) {
    characterData.race = raceKey;
    
    // Atualizar visual
    document.querySelectorAll('.race-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector(`[data-race="${raceKey}"]`).classList.add('selected');
    
    // Atualizar classes disponíveis baseado na raça
    updateAvailableClasses();
    
    // Atualizar atributos finais com novos bônus raciais
    updateFinalAttributes();
    updateCharacterSummary();
    
    showNotification(`Raça ${DND_DATA.races[raceKey].name} selecionada!`);
}

function setupClassSelection() {
    const classCards = document.querySelectorAll('.class-card');
    
    classCards.forEach(card => {
        card.addEventListener('click', function() {
            const classKey = this.dataset.class;
            selectClass(classKey);
        });
    });
}

function selectClass(classKey) {
    characterData.class = classKey;
    
    // Atualizar visual
    document.querySelectorAll('.class-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector(`[data-class="${classKey}"]`).classList.add('selected');
    
    // Atualizar antecedentes recomendados
    updateRecommendedBackgrounds();
    
    // Atualizar estatísticas do personagem
    updateFinalAttributes();
    updateCharacterSummary();
    
    showNotification(`Classe ${DND_DATA.classes[classKey].name} selecionada!`);
}

function updateAvailableClasses() {
    // Lógica para destacar classes recomendadas baseado na raça
    const raceData = DND_DATA.races[characterData.race];
    if (!raceData) return;
    
    const classCards = document.querySelectorAll('.class-card');
    classCards.forEach(card => {
        card.style.opacity = '1';
        card.style.order = '0';
    });
    
    // Destacar classes que combinam com os bônus raciais
    if (raceData.abilityScoreIncrease.strength) {
        highlightClass('fighter');
        highlightClass('barbarian');
    }
    if (raceData.abilityScoreIncrease.dexterity) {
        highlightClass('rogue');
        highlightClass('ranger');
    }
    if (raceData.abilityScoreIncrease.intelligence) {
        highlightClass('wizard');
    }
    if (raceData.abilityScoreIncrease.wisdom) {
        highlightClass('cleric');
        highlightClass('ranger');
    }
    if (raceData.abilityScoreIncrease.charisma) {
        // Destacar classes de carisma quando implementadas
    }
}

function highlightClass(classKey) {
    const classCard = document.querySelector(`[data-class="${classKey}"]`);
    if (classCard) {
        classCard.style.order = '-1';
        classCard.style.boxShadow = '0 0 15px rgba(78, 205, 196, 0.4)';
    }
}

function setupAttributeSelection() {
    const methodInputs = document.querySelectorAll('input[name="attr-method"]');
    
    methodInputs.forEach(input => {
        input.addEventListener('change', () => {
            switchAttributeSystem(input.value);
            updateFinalAttributes();
        });
    });
    
    // Configurar eventos para cada sistema
    setupStandardArray();
    setupPointBuy();
    setupRollSystem();
    setupCustomSystem();
    
    // Ativar sistema padrão inicialmente
    switchAttributeSystem('standard');
    updateFinalAttributes();
}

// Alternar entre sistemas de atributos
function switchAttributeSystem(system) {
    // Ocultar todos os sistemas
    document.querySelectorAll('.attribute-system').forEach(sys => {
        sys.classList.remove('active');
    });
    
    // Mostrar sistema selecionado
    const activeSystem = document.getElementById(getSystemId(system));
    if (activeSystem) {
        activeSystem.classList.add('active');
    }
    
    // Atualizar estado do personagem
    characterData.attributeMethod = system;
    updateFinalAttributes();
}

// Obter ID do sistema
function getSystemId(system) {
    const systemIds = {
        'standard': 'standard-array',
        'point-buy': 'point-buy',
        'roll': 'roll-system',
        'custom': 'custom-system'
    };
    return systemIds[system] || 'standard-array';
}

function setupStandardArray() {
    const attributeSelects = document.querySelectorAll('.attr-select');
    
    // Configurar seleção de atributos
    attributeSelects.forEach(select => {
        select.addEventListener('change', function() {
            const attr = this.dataset.attr;
            const value = parseInt(this.value);
            handleAttributeChange(attr, value, this);
            updateFinalAttributes();
            updateCharacterSummary();
        });
    });
    
    updateAvailableValues();
}

function setupPointBuy() {
    const pointBuyButtons = document.querySelectorAll('.point-btn');
    const pointsRemainingSpan = document.getElementById('points-remaining');
    
    // Inicializar pontos
    characterData.pointBuy = {
        points: 27,
        attributes: {
            strength: 8,
            dexterity: 8,
            constitution: 8,
            intelligence: 8,
            wisdom: 8,
            charisma: 8
        }
    };
    
    pointBuyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const attr = button.dataset.attr;
            const isIncrease = button.classList.contains('increase');
            
            if (isIncrease) {
                increaseAttribute(attr);
            } else {
                decreaseAttribute(attr);
            }
            
            updatePointBuyDisplay();
            updateFinalAttributes();
        });
    });
    
    updatePointBuyDisplay();
}

function getPointCost(currentValue, increase = true) {
    if (increase) {
        if (currentValue >= 15) return 999; // Não pode passar de 15
        if (currentValue >= 13) return 2;
        return 1;
    } else {
        if (currentValue <= 8) return 999; // Não pode ser menor que 8
        if (currentValue > 13) return 2;
        return 1;
    }
}

function increaseAttribute(attr) {
    const current = characterData.pointBuy.attributes[attr];
    const cost = getPointCost(current, true);
    
    if (current < 15 && characterData.pointBuy.points >= cost) {
        characterData.pointBuy.attributes[attr]++;
        characterData.pointBuy.points -= cost;
        updateFinalAttributes();
        updateCharacterSummary();
    }
}

function decreaseAttribute(attr) {
    const current = characterData.pointBuy.attributes[attr];
    const refund = getPointCost(current, false);
    
    if (current > 8) {
        characterData.pointBuy.attributes[attr]--;
        characterData.pointBuy.points += refund;
        updateFinalAttributes();
        updateCharacterSummary();
    }
}

function updatePointBuyDisplay() {
    const pointsRemainingSpan = document.getElementById('points-remaining');
    pointsRemainingSpan.textContent = characterData.pointBuy.points;
    
    // Atualizar valores e modificadores
    Object.keys(characterData.pointBuy.attributes).forEach(attr => {
        const valueSpan = document.querySelector(`.point-value[data-attr="${attr}"]`);
        const modifierSpan = document.querySelector(`.point-buy-item .modifier[data-attr="${attr}"]`);
        const increaseBtn = document.querySelector(`.point-btn.increase[data-attr="${attr}"]`);
        const decreaseBtn = document.querySelector(`.point-btn.decrease[data-attr="${attr}"]`);
        
        const value = characterData.pointBuy.attributes[attr];
        const modifier = Math.floor((value - 10) / 2);
        
        if (valueSpan) valueSpan.textContent = value;
        if (modifierSpan) modifierSpan.textContent = `(${modifier >= 0 ? '+' : ''}${modifier})`;
        
        // Habilitar/desabilitar botões
        if (increaseBtn) {
            const cost = getPointCost(value, true);
            increaseBtn.disabled = value >= 15 || characterData.pointBuy.points < cost;
        }
        
        if (decreaseBtn) {
            decreaseBtn.disabled = value <= 8;
        }
    });
}

function setupRollSystem() {
    const rollAllBtn = document.getElementById('roll-all-btn');
    const rollGoldBtn = document.getElementById('roll-gold-btn');
    const rollSingleBtns = document.querySelectorAll('.roll-single');
    
    // Inicializar atributos rolados
    characterData.rolledAttributes = {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
    };
    
    rollAllBtn.addEventListener('click', () => {
        Object.keys(characterData.rolledAttributes).forEach(attr => {
            rollSingleAttribute(attr);
        });
        updateFinalAttributes();
    });
    
    rollGoldBtn.addEventListener('click', () => {
        rollStartingGold();
    });
    
    rollSingleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const attr = btn.dataset.attr;
            rollSingleAttribute(attr);
            updateFinalAttributes();
        });
    });
}

function rollDice(sides, count = 1) {
    const rolls = [];
    for (let i = 0; i < count; i++) {
        rolls.push(Math.floor(Math.random() * sides) + 1);
    }
    return rolls;
}

function rollSingleAttribute(attr) {
    // Rolar 4d6, descartar o menor
    const rolls = rollDice(6, 4);
    rolls.sort((a, b) => b - a); // Ordenar decrescente
    const total = rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0); // Somar os 3 maiores
    
    characterData.rolledAttributes[attr] = total;
    
    // Atualizar display
    const valueSpan = document.querySelector(`.roll-value[data-attr="${attr}"]`);
    const modifierSpan = document.querySelector(`.roll-item .modifier[data-attr="${attr}"]`);
    const detailsDiv = document.querySelector(`.roll-details[data-attr="${attr}"]`);
    
    const modifier = Math.floor((total - 10) / 2);
    
    if (valueSpan) valueSpan.textContent = total;
    if (modifierSpan) modifierSpan.textContent = `(${modifier >= 0 ? '+' : ''}${modifier})`;
    if (detailsDiv) {
        detailsDiv.textContent = `Dados: [${rolls.join(', ')}] → ${total} (descartou ${rolls[3]})`;
    }
    
    updateFinalAttributes();
    updateCharacterSummary();
}

function rollStartingGold() {
    const selectedClass = characterData.class;
    if (!selectedClass || !DND_DATA.classes[selectedClass]) {
        showNotification('Selecione uma classe primeiro!', 'error');
        return;
    }
    
    const classData = DND_DATA.classes[selectedClass];
    const goldDice = classData.startingGold || { dice: '4d4', multiplier: 10 };
    
    // Rolar dados de ouro (exemplo: 4d4 x 10)
    const diceCount = parseInt(goldDice.dice.split('d')[0]);
    const diceSides = parseInt(goldDice.dice.split('d')[1]);
    const rolls = rollDice(diceSides, diceCount);
    const total = rolls.reduce((sum, roll) => sum + roll, 0) * goldDice.multiplier;
    
    characterData.startingGold = total;
    
    const goldResultDiv = document.getElementById('gold-result');
    if (goldResultDiv) {
        goldResultDiv.innerHTML = `
            <h4><img src="/icons/Moedas.png" alt="Moedas" style="width: 18px; height: 18px; display: inline; margin-right: 6px;" />Ouro Inicial</h4>
            <p>Dados: ${goldDice.dice} × ${goldDice.multiplier}</p>
            <p>Rolagem: [${rolls.join(', ')}] × ${goldDice.multiplier} = <strong>${total} moedas de ouro</strong></p>
        `;
    }
    
    showNotification(`Ouro inicial rolado: ${finalGold} po!`, 'success');
}

function updateCharacterStats() {
    if (!characterData.finalAttributes) return;
    
    const attributes = characterData.finalAttributes;
    const selectedClass = characterData.class;
    const selectedRace = characterData.race;
    
    // Calcular modificadores
    const modifiers = {};
    Object.keys(attributes).forEach(attr => {
        modifiers[attr] = Math.floor((attributes[attr] - 10) / 2);
    });
    
    // Calcular Pontos de Vida
    let hitPoints = 0;
    if (selectedClass && DND_DATA.classes[selectedClass]) {
        const hitDie = DND_DATA.classes[selectedClass].hitDie;
        const dieSize = parseInt(hitDie.substring(1)); // Remove 'd' e pega o número
        hitPoints = dieSize + modifiers.constitution;
        if (hitPoints < 1) hitPoints = 1;
    }
    
    // Calcular Classe de Armadura (base 10 + mod Destreza)
    const armorClass = 10 + modifiers.dexterity;
    
    // Calcular Bônus de Proficiência (nível 1)
    const proficiencyBonus = 2;
    
    // Atualizar dados do personagem
    characterData.stats = {
        hitPoints: hitPoints,
        armorClass: armorClass,
        proficiencyBonus: proficiencyBonus,
        modifiers: modifiers
    };
    
    // Atualizar display se existir
    updateStatsDisplay();
}

function updateStatsDisplay() {
    if (!characterData.stats) return;
    
    const stats = characterData.stats;
    
    // Atualizar elementos de estatísticas se existirem
    const hpElement = document.getElementById('character-hp');
    const acElement = document.getElementById('character-ac');
    const profElement = document.getElementById('character-prof');
    
    if (hpElement) hpElement.textContent = stats.hitPoints;
    if (acElement) acElement.textContent = stats.armorClass;
    if (profElement) profElement.textContent = `+${stats.proficiencyBonus}`;
}

function setupCustomSystem() {
    const customInputs = document.querySelectorAll('.custom-input');
    
    // Inicializar atributos customizados
    characterData.customAttributes = {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
    };
    
    customInputs.forEach(input => {
        input.addEventListener('input', () => {
            const attr = input.dataset.attr;
            let value = parseInt(input.value) || 10;
            
            // Validar limites
            if (value < 3) value = 3;
            if (value > 18) value = 18;
            
            characterData.customAttributes[attr] = value;
            input.value = value;
            
            // Atualizar modificador
            const modifierSpan = document.querySelector(`.custom-item .modifier[data-attr="${attr}"]`);
            const modifier = Math.floor((value - 10) / 2);
            if (modifierSpan) {
                modifierSpan.textContent = `(${modifier >= 0 ? '+' : ''}${modifier})`;
            }
            
            updateFinalAttributes();
            updateCharacterSummary();
        });
    });
}

function updateFinalAttributes() {
    const method = characterData.attributeMethod || 'standard';
    let baseAttributes = {};
    
    // Obter atributos base baseado no método
    switch (method) {
        case 'standard':
            baseAttributes = getStandardArrayAttributes();
            break;
        case 'point-buy':
            baseAttributes = characterData.pointBuy ? characterData.pointBuy.attributes : {};
            break;
        case 'roll':
            baseAttributes = characterData.rolledAttributes || {};
            break;
        case 'custom':
            baseAttributes = characterData.customAttributes || {};
            break;
        default:
            baseAttributes = {
                strength: 10, dexterity: 10, constitution: 10,
                intelligence: 10, wisdom: 10, charisma: 10
            };
    }
    
    // Obter bônus raciais
    const racialBonuses = getRacialBonuses();
    
    // Calcular atributos finais
    const finalAttributes = {};
    Object.keys(baseAttributes).forEach(attr => {
        const base = baseAttributes[attr] || 10;
        const racial = racialBonuses[attr] || 0;
        finalAttributes[attr] = base + racial;
    });
    
    // Atualizar display
    updateFinalAttributesDisplay(baseAttributes, racialBonuses, finalAttributes);
    
    // Atualizar estatísticas do personagem
    characterData.finalAttributes = finalAttributes;
    updateCharacterStats();
}

function getStandardArrayAttributes() {
    const attributes = {};
    const selects = document.querySelectorAll('.attr-select');
    
    selects.forEach(select => {
        const attr = select.dataset.attr;
        attributes[attr] = parseInt(select.value) || 10;
    });
    
    return attributes;
}

function getRacialBonuses() {
    const selectedRace = characterData.selectedRace;
    if (!selectedRace || !DND_DATA.races[selectedRace]) {
        return { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 };
    }
    
    return DND_DATA.races[selectedRace].abilityScoreIncrease || {};
}

function updateFinalAttributesDisplay(baseAttributes, racialBonuses, finalAttributes) {
    Object.keys(finalAttributes).forEach(attr => {
        const base = baseAttributes[attr] || 10;
        const racial = racialBonuses[attr] || 0;
        const final = finalAttributes[attr];
        const modifier = Math.floor((final - 10) / 2);
        
        // Atualizar elementos do resumo final
        const baseElement = document.getElementById(`final-${attr}-base`);
        const racialElement = document.getElementById(`final-${attr}-racial`);
        const finalElement = document.getElementById(`final-${attr}`);
        const modifierElement = document.getElementById(`final-${attr}-mod`);
        
        if (baseElement) baseElement.textContent = base;
        if (racialElement) {
            racialElement.textContent = racial > 0 ? `+${racial}` : (racial < 0 ? racial : '+0');
            racialElement.style.display = racial !== 0 ? 'inline' : 'none';
        }
        if (finalElement) finalElement.textContent = final;
        if (modifierElement) modifierElement.textContent = `(${modifier >= 0 ? '+' : ''}${modifier})`;
    });
}

function handleAttributeMethod(method) {
    const attributeSelects = document.querySelectorAll('.attr-select');
    
    switch(method) {
        case 'standard':
            availableValues = [...STANDARD_ARRAY];
            enableAttributeSelects(true);
            resetAttributeSelects();
            break;
        case 'point-buy':
            // Implementar sistema de compra de pontos
            showNotification('Sistema de compra de pontos em desenvolvimento');
            break;
        case 'roll':
            // Rolar atributos
            rollAttributes();
            enableAttributeSelects(false);
            break;
    }
    
    updateAvailableValues();
}

function rollAttributes() {
    const attributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    
    attributes.forEach(attr => {
        const rolls = [];
        for (let i = 0; i < 4; i++) {
            rolls.push(Math.floor(Math.random() * 6) + 1);
        }
        rolls.sort((a, b) => b - a);
        const total = rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
        
        characterData.attributes[attr] = total;
        const select = document.querySelector(`[data-attr="${attr}"]`);
        if (select) {
            select.value = total;
        }
    });
    
    showNotification('Atributos rolados!');
    updateAttributeModifiers();
}

function enableAttributeSelects(enabled) {
    const attributeSelects = document.querySelectorAll('.attr-select');
    attributeSelects.forEach(select => {
        select.disabled = !enabled;
    });
}

function resetAttributeSelects() {
    const attributeSelects = document.querySelectorAll('.attr-select');
    const defaultValues = [15, 14, 13, 12, 10, 8];
    
    attributeSelects.forEach((select, index) => {
        select.value = defaultValues[index];
        const attr = select.dataset.attr;
        characterData.attributes[attr] = defaultValues[index];
    });
    
    updateAttributeModifiers();
}

function handleAttributeChange(attr, newValue, selectElement) {
    const oldValue = characterData.attributes[attr];
    
    // Verificar se o valor está disponível
    if (!availableValues.includes(newValue) && newValue !== oldValue) {
        selectElement.value = oldValue;
        showNotification('Este valor já foi usado!', 'error');
        return;
    }
    
    // Atualizar valores disponíveis
    if (oldValue !== newValue) {
        const oldIndex = availableValues.indexOf(oldValue);
        if (oldIndex === -1) {
            availableValues.push(oldValue);
        }
        
        const newIndex = availableValues.indexOf(newValue);
        if (newIndex !== -1) {
            availableValues.splice(newIndex, 1);
        }
    }
    
    characterData.attributes[attr] = newValue;
    updateAvailableValues();
    updateAttributeModifiers();
}

function updateAvailableValues() {
    const availableElement = document.getElementById('available-values');
    if (availableElement) {
        if (availableValues.length === 0) {
            availableElement.textContent = 'Todos os valores foram atribuídos';
        } else {
            availableElement.textContent = availableValues.sort((a, b) => b - a).join(', ');
        }
    }
}

function setupBackgroundSelection() {
    const backgroundCards = document.querySelectorAll('.background-card');
    
    backgroundCards.forEach(card => {
        card.addEventListener('click', function() {
            const background = this.dataset.background;
            selectBackground(background);
        });
    });
}

function selectBackground(backgroundKey) {
    characterData.background = backgroundKey;
    
    // Atualizar visual
    document.querySelectorAll('.background-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector(`[data-background="${backgroundKey}"]`).classList.add('selected');
    
    showNotification(`Antecedente ${DND_DATA.backgrounds[backgroundKey].name} selecionado!`);
}

function updateRecommendedBackgrounds() {
    // Lógica para recomendar antecedentes baseado na classe
    const classData = DND_DATA.classes[characterData.class];
    if (!classData) return;
    
    const backgroundCards = document.querySelectorAll('.background-card');
    backgroundCards.forEach(card => {
        card.style.opacity = '1';
        card.style.order = '0';
    });
    
    // Recomendar antecedentes baseado na classe
    switch(characterData.class) {
        case 'cleric':
            highlightBackground('acolyte');
            break;
        case 'fighter':
        case 'barbarian':
            highlightBackground('soldier');
            highlightBackground('folk-hero');
            break;
        case 'rogue':
            highlightBackground('criminal');
            break;
        case 'wizard':
            highlightBackground('sage');
            break;
    }
}

function highlightBackground(backgroundKey) {
    const backgroundCard = document.querySelector(`[data-background="${backgroundKey}"]`);
    if (backgroundCard) {
        backgroundCard.style.order = '-1';
        backgroundCard.style.boxShadow = '0 0 15px rgba(78, 205, 196, 0.4)';
    }
}

function setupStepNavigation() {
    const prevBtn = document.getElementById('prev-step');
    const nextBtn = document.getElementById('next-step');
    const finishBtn = document.getElementById('finish-character');
    
    prevBtn.addEventListener('click', () => changeStep(-1));
    nextBtn.addEventListener('click', () => changeStep(1));
    finishBtn.addEventListener('click', finishCharacterCreation);
    
    // Configurar detalhes do personagem
    setupCharacterDetails();
}

function setupCharacterDetails() {
    const detailInputs = document.querySelectorAll('.character-details input, .character-details textarea');
    
    detailInputs.forEach(input => {
        input.addEventListener('input', function() {
            const field = this.id.replace('char-', '');
            characterData.details[field] = this.value;
            
            if (field === 'name') {
                updateCharacterSummary();
            }
        });
    });
}

function changeStep(direction) {
    const newStep = characterData.currentStep + direction;
    
    if (newStep < 1 || newStep > 6) return;
    
    // Validar passo atual antes de avançar
    if (direction > 0 && !validateCurrentStep()) {
        return;
    }
    
    characterData.currentStep = newStep;
    updateStepDisplay();
    updateCharacterSummary();
}

function validateCurrentStep() {
    switch(characterData.currentStep) {
        case 1:
            if (!characterData.race) {
                showNotification('Selecione uma raça antes de continuar!', 'error');
                return false;
            }
            break;
        case 2:
            if (!characterData.class) {
                showNotification('Selecione uma classe antes de continuar!', 'error');
                return false;
            }
            break;
        case 3:
            if (availableValues.length > 0) {
                showNotification('Distribua todos os valores de atributo!', 'error');
                return false;
            }
            break;
        case 4:
            if (!characterData.background) {
                showNotification('Selecione um antecedente antes de continuar!', 'error');
                return false;
            }
            break;
        case 5:
            if (!characterData.details.name || characterData.details.name.trim() === '') {
                showNotification('Digite o nome do personagem!', 'error');
                return false;
            }
            break;
    }
    return true;
}

function updateStepDisplay() {
    // Atualizar indicadores de passo
    document.querySelectorAll('.step').forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNumber === characterData.currentStep) {
            step.classList.add('active');
        } else if (stepNumber < characterData.currentStep) {
            step.classList.add('completed');
        }
    });
    
    // Mostrar conteúdo do passo atual
    document.querySelectorAll('.step-content').forEach((content, index) => {
        const stepNumber = index + 1;
        content.classList.remove('active');
        
        if (stepNumber === characterData.currentStep) {
            content.classList.add('active');
        }
    });
    
    // Atualizar botões de navegação
    const prevBtn = document.getElementById('prev-step');
    const nextBtn = document.getElementById('next-step');
    const finishBtn = document.getElementById('finish-character');
    
    prevBtn.disabled = characterData.currentStep === 1;
    
    if (characterData.currentStep === 6) {
        nextBtn.style.display = 'none';
        finishBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'inline-block';
        finishBtn.style.display = 'none';
    }
}

function updateCharacterSummary() {
    if (characterData.currentStep !== 6) return;
    
    // Atualizar nome
    const nameElement = document.getElementById('summary-name');
    if (nameElement) {
        nameElement.textContent = characterData.details.name || 'Nome do Personagem';
    }
    
    // Atualizar raça e classe
    const raceClassElement = document.getElementById('summary-race-class');
    if (raceClassElement) {
        const raceName = characterData.race ? DND_DATA.races[characterData.race].name : 'Raça';
        const className = characterData.class ? DND_DATA.classes[characterData.class].name : 'Classe';
        raceClassElement.textContent = `${raceName} ${className}`;
    }
    
    // Atualizar atributos com bônus raciais
    const finalAttributes = calculateFinalAttributes();
    
    Object.keys(finalAttributes).forEach(attr => {
        const valueElement = document.getElementById(`summary-${attr.substring(0, 3)}`);
        const modElement = valueElement?.nextElementSibling;
        
        if (valueElement) {
            valueElement.textContent = finalAttributes[attr];
        }
        if (modElement) {
            const modifier = Math.floor((finalAttributes[attr] - 10) / 2);
            modElement.textContent = `(${modifier >= 0 ? '+' : ''}${modifier})`;
        }
    });
    
    // Atualizar estatísticas derivadas
    updateDerivedStats(finalAttributes);
    
    // Atualizar antecedente
    const backgroundElement = document.getElementById('summary-background');
    if (backgroundElement) {
        backgroundElement.textContent = characterData.background ? 
            DND_DATA.backgrounds[characterData.background].name : '-';
    }
    
    // Exibir ouro inicial se foi rolado
    if (characterData.startingGold) {
        const goldInfo = document.createElement('p');
        goldInfo.innerHTML = `<strong>Ouro Inicial:</strong> ${characterData.startingGold} po`;
        
        const statsSection = document.querySelector('.summary-stats');
        if (statsSection && !document.getElementById('summary-gold')) {
            goldInfo.id = 'summary-gold';
            statsSection.appendChild(goldInfo);
        }
    }
}

function calculateFinalAttributes() {
    const finalAttributes = { ...characterData.attributes };
    
    if (characterData.race) {
        const raceData = DND_DATA.races[characterData.race];
        const bonuses = raceData.abilityScoreIncrease;
        
        if (bonuses.all) {
            Object.keys(finalAttributes).forEach(attr => {
                finalAttributes[attr] += bonuses.all;
            });
        } else {
            Object.keys(bonuses).forEach(attr => {
                if (finalAttributes[attr] !== undefined) {
                    finalAttributes[attr] += bonuses[attr];
                }
            });
        }
    }
    
    return finalAttributes;
}

function updateDerivedStats(attributes) {
    // Pontos de Vida
    const hpElement = document.getElementById('summary-hp');
    if (hpElement && characterData.class) {
        const classData = DND_DATA.classes[characterData.class];
        const conModifier = Math.floor((attributes.constitution - 10) / 2);
        const hp = classData.hitDie + conModifier;
        hpElement.textContent = Math.max(1, hp);
    }
    
    // Classe de Armadura
    const acElement = document.getElementById('summary-ac');
    if (acElement) {
        const dexModifier = Math.floor((attributes.dexterity - 10) / 2);
        const ac = 10 + dexModifier;
        acElement.textContent = ac;
    }
}

function finishCharacterCreation() {
    if (!validateCurrentStep()) return;
    
    // Calcular estatísticas finais
    const finalCharacter = {
        ...characterData,
        finalAttributes: calculateFinalAttributes(),
        createdAt: new Date().toISOString()
    };
    
    // Salvar personagem
    saveCharacter(finalCharacter);
    
    // Mostrar modal de confirmação
    showConfirmationModal();
}

function saveCharacter(character) {
    let savedCharacters = JSON.parse(localStorage.getItem('dnd_characters') || '[]');
    savedCharacters.push(character);
    localStorage.setItem('dnd_characters', JSON.stringify(savedCharacters));
    
    showNotification('Personagem salvo com sucesso!');
}

// Modo Expert
function setupExpertMode() {
    setupExpertAttributeInputs();
    setupExpertActions();
}

function setupExpertAttributeInputs() {
    const attrInputs = document.querySelectorAll('.attr-score');
    
    attrInputs.forEach(input => {
        input.addEventListener('input', function() {
            updateExpertModifier(this);
        });
    });
}

function updateExpertModifier(input) {
    const score = parseInt(input.value) || 10;
    const modifier = Math.floor((score - 10) / 2);
    const modifierElement = input.nextElementSibling;
    
    if (modifierElement && modifierElement.classList.contains('attr-modifier')) {
        modifierElement.textContent = `${modifier >= 0 ? '+' : ''}${modifier}`;
    }
    
    // Atualizar outros campos dependentes
    updateExpertDerivedStats();
}

function updateExpertDerivedStats() {
    // Atualizar iniciativa
    const dexInput = document.querySelector('.attributes-section .attr-score[value]');
    if (dexInput) {
        const dexScore = parseInt(dexInput.value) || 10;
        const dexMod = Math.floor((dexScore - 10) / 2);
        const initiativeInput = document.querySelector('input[value="+0"][readonly]');
        if (initiativeInput) {
            initiativeInput.value = `${dexMod >= 0 ? '+' : ''}${dexMod}`;
        }
    }
    
    // Atualizar percepção passiva
    const wisInput = document.querySelector('.attributes-section .attr-score');
    if (wisInput) {
        const wisScore = parseInt(wisInput.value) || 10;
        const wisMod = Math.floor((wisScore - 10) / 2);
        const passivePerceptionInput = document.querySelector('.passive-perception input');
        if (passivePerceptionInput) {
            passivePerceptionInput.value = 10 + wisMod;
        }
    }
}

function setupExpertActions() {
    const clearBtn = document.getElementById('clear-sheet');
    const importBtn = document.getElementById('import-character');
    const saveBtn = document.getElementById('save-expert-character');
    
    clearBtn.addEventListener('click', clearExpertSheet);
    importBtn.addEventListener('click', importCharacter);
    saveBtn.addEventListener('click', saveExpertCharacter);
}

function clearExpertSheet() {
    if (confirm('Tem certeza que deseja limpar toda a ficha?')) {
        // Limpar todos os inputs
        document.querySelectorAll('#expert-mode input, #expert-mode textarea, #expert-mode select').forEach(input => {
            if (input.type === 'checkbox') {
                input.checked = false;
            } else if (input.hasAttribute('readonly')) {
                // Não limpar campos readonly
            } else {
                input.value = input.type === 'number' ? '0' : '';
            }
        });
        
        // Resetar atributos para 10
        document.querySelectorAll('.attr-score').forEach(input => {
            input.value = '10';
            updateExpertModifier(input);
        });
        
        showNotification('Ficha limpa!');
    }
}

function importCharacter() {
    const savedCharacters = JSON.parse(localStorage.getItem('dnd_characters') || '[]');
    
    if (savedCharacters.length === 0) {
        showNotification('Nenhum personagem salvo encontrado!', 'error');
        return;
    }
    
    // Criar modal de seleção de personagem
    showCharacterSelectionModal(savedCharacters);
}

function saveExpertCharacter() {
    const characterName = document.querySelector('.char-name-input').value;
    
    if (!characterName.trim()) {
        showNotification('Digite o nome do personagem!', 'error');
        return;
    }
    
    // Coletar dados da ficha
    const expertCharacter = {
        mode: 'expert',
        name: characterName,
        createdAt: new Date().toISOString(),
        data: collectExpertData()
    };
    
    // Salvar
    let savedCharacters = JSON.parse(localStorage.getItem('dnd_characters') || '[]');
    savedCharacters.push(expertCharacter);
    localStorage.setItem('dnd_characters', JSON.stringify(savedCharacters));
    
    showNotification('Personagem salvo com sucesso!');
    showConfirmationModal();
}

function collectExpertData() {
    const data = {};
    
    // Coletar todos os dados dos inputs
    document.querySelectorAll('#expert-mode input, #expert-mode textarea, #expert-mode select').forEach(input => {
        if (input.id || input.name) {
            const key = input.id || input.name;
            if (input.type === 'checkbox') {
                data[key] = input.checked;
            } else {
                data[key] = input.value;
            }
        }
    });
    
    return data;
}

// Funções auxiliares
function updateAttributeModifiers() {
    // Atualizar modificadores no modo guiado se necessário
    Object.keys(characterData.attributes).forEach(attr => {
        const score = characterData.attributes[attr];
        const modifier = Math.floor((score - 10) / 2);
        
        // Atualizar display se existir
        const modifierElement = document.querySelector(`[data-attr="${attr}"] + .attr-modifier`);
        if (modifierElement) {
            modifierElement.textContent = `${modifier >= 0 ? '+' : ''}${modifier}`;
        }
    });
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function showConfirmationModal() {
    const modal = document.getElementById('confirmation-modal');
    modal.classList.add('active');
    
    // Configurar botões do modal
    document.getElementById('create-another').onclick = () => {
        modal.classList.remove('active');
        resetCharacterCreation();
    };
    
    document.getElementById('view-character').onclick = () => {
        modal.classList.remove('active');
        // Redirecionar para visualização do personagem
        showNotification('Funcionalidade de visualização em desenvolvimento');
    };
}

function showCharacterSelectionModal(characters) {
    // Implementar modal de seleção de personagem
    const characterList = characters.map((char, index) => {
        const name = char.name || char.details?.name || `Personagem ${index + 1}`;
        const date = new Date(char.createdAt).toLocaleDateString();
        return `${index + 1}. ${name} (${date})`;
    }).join('\n');
    
    const selection = prompt(`Selecione um personagem para importar:\n\n${characterList}\n\nDigite o número:`);
    
    if (selection) {
        const index = parseInt(selection) - 1;
        if (index >= 0 && index < characters.length) {
            importCharacterData(characters[index]);
        } else {
            showNotification('Seleção inválida!', 'error');
        }
    }
}

function importCharacterData(character) {
    if (character.mode === 'expert' && character.data) {
        // Importar dados do modo expert
        Object.keys(character.data).forEach(key => {
            const input = document.querySelector(`#expert-mode [id="${key}"], #expert-mode [name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = character.data[key];
                } else {
                    input.value = character.data[key];
                }
            }
        });
        
        // Atualizar modificadores
        document.querySelectorAll('.attr-score').forEach(input => {
            updateExpertModifier(input);
        });
        
        showNotification('Personagem importado com sucesso!');
    } else {
        showNotification('Formato de personagem não compatível com o modo expert!', 'error');
    }
}

function resetCharacterCreation() {
    // Resetar dados
    characterData = {
        mode: 'guided',
        currentStep: 1,
        race: null,
        class: null,
        background: null,
        attributes: {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10
        },
        details: {},
        expertData: {}
    };
    
    availableValues = [...STANDARD_ARRAY];
    
    // Resetar interface
    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('input, textarea, select').forEach(input => {
        if (input.type === 'checkbox') {
            input.checked = false;
        } else if (input.type === 'radio') {
            input.checked = input.value === 'standard';
        } else {
            input.value = '';
        }
    });
    
    // Resetar modo para guiado
    selectMode('guided');
    updateStepDisplay();
    resetAttributeSelects();
    
    showNotification('Criação de personagem reiniciada!');
}