// Configurações do Dungeon Keeper
class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.initializeEventListeners();
        this.updateUI();
    }

    // Carrega configurações do localStorage ou usa padrões
    loadSettings() {
        const defaultSettings = {
            profile: {
                username: 'DarkKnight',
                email: 'darkknight@dungeon.com',
                bio: 'Um valente cavaleiro das trevas em busca de aventuras épicas...',
                avatar: 'user-avatar.svg'
            },
            gameplay: {
                difficulty: 'normal',
                autoSave: true,
                tutorials: true,
                language: 'pt-BR'
            },
            audioVisual: {
                masterVolume: 75,
                musicVolume: 60,
                sfxVolume: 80,
                theme: 'medieval',
                animations: true,
                particles: true
            },
            notifications: {
                email: true,
                push: true,
                quest: true,
                social: false
            },
            privacy: {
                profilePublic: true,
                showOnline: true,
                allowFriendRequests: true
            }
        };

        const saved = localStorage.getItem('dungeonKeeperSettings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }

    // Salva configurações no localStorage
    saveSettings() {
        localStorage.setItem('dungeonKeeperSettings', JSON.stringify(this.settings));
        this.showNotification('Configurações salvas com sucesso!', 'success');
    }

    // Inicializa event listeners
    initializeEventListeners() {
        // Sliders de volume
        this.setupVolumeSliders();
        
        // Avatar selection
        this.setupAvatarSelection();
        
        // Form inputs
        this.setupFormInputs();
        
        // Checkboxes
        this.setupCheckboxes();
        
        // Select dropdowns
        this.setupSelects();
    }

    setupVolumeSliders() {
        const sliders = ['masterVolume', 'musicVolume', 'sfxVolume'];
        
        sliders.forEach(sliderId => {
            const slider = document.getElementById(sliderId);
            const valueDisplay = document.getElementById(sliderId + 'Value');
            
            if (slider && valueDisplay) {
                slider.addEventListener('input', (e) => {
                    const value = e.target.value;
                    valueDisplay.textContent = value + '%';
                    this.settings.audioVisual[sliderId] = parseInt(value);
                    this.playVolumePreview(sliderId);
                });
            }
        });
    }

    setupAvatarSelection() {
        const avatarOptions = document.querySelectorAll('.avatar-option');
        
        avatarOptions.forEach(avatar => {
            avatar.addEventListener('click', () => {
                // Remove selected class from all avatars
                avatarOptions.forEach(av => av.classList.remove('selected'));
                
                // Add selected class to clicked avatar
                avatar.classList.add('selected');
                
                // Update settings
                const avatarSrc = avatar.getAttribute('src');
                this.settings.profile.avatar = avatarSrc.split('/').pop();
                
                // Update top bar avatar
                const topBarAvatar = document.querySelector('.top-bar .avatar-icon');
                if (topBarAvatar) {
                    topBarAvatar.src = avatarSrc;
                }
            });
        });
    }

    setupFormInputs() {
        const inputs = {
            'username': 'profile.username',
            'email': 'profile.email',
            'bio': 'profile.bio'
        };

        Object.entries(inputs).forEach(([inputId, settingPath]) => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('change', (e) => {
                    this.setNestedProperty(this.settings, settingPath, e.target.value);
                });
            }
        });
    }

    setupCheckboxes() {
        const checkboxes = {
            'autoSave': 'gameplay.autoSave',
            'tutorials': 'gameplay.tutorials',
            'animations': 'audioVisual.animations',
            'particles': 'audioVisual.particles',
            'emailNotifications': 'notifications.email',
            'pushNotifications': 'notifications.push',
            'questNotifications': 'notifications.quest',
            'socialNotifications': 'notifications.social',
            'profilePublic': 'privacy.profilePublic',
            'showOnline': 'privacy.showOnline',
            'allowFriendRequests': 'privacy.allowFriendRequests'
        };

        Object.entries(checkboxes).forEach(([checkboxId, settingPath]) => {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    this.setNestedProperty(this.settings, settingPath, e.target.checked);
                });
            }
        });
    }

    setupSelects() {
        const selects = {
            'difficulty': 'gameplay.difficulty',
            'language': 'gameplay.language',
            'theme': 'audioVisual.theme'
        };

        Object.entries(selects).forEach(([selectId, settingPath]) => {
            const select = document.getElementById(selectId);
            if (select) {
                select.addEventListener('change', (e) => {
                    this.setNestedProperty(this.settings, settingPath, e.target.value);
                    
                    // Apply theme change immediately
                    if (selectId === 'theme') {
                        this.applyTheme(e.target.value);
                    }
                });
            }
        });
    }

    // Atualiza a UI com as configurações atuais
    updateUI() {
        // Update form inputs
        this.updateInput('username', this.settings.profile.username);
        this.updateInput('email', this.settings.profile.email);
        this.updateInput('bio', this.settings.profile.bio);
        
        // Update checkboxes
        this.updateCheckbox('autoSave', this.settings.gameplay.autoSave);
        this.updateCheckbox('tutorials', this.settings.gameplay.tutorials);
        this.updateCheckbox('animations', this.settings.audioVisual.animations);
        this.updateCheckbox('particles', this.settings.audioVisual.particles);
        this.updateCheckbox('emailNotifications', this.settings.notifications.email);
        this.updateCheckbox('pushNotifications', this.settings.notifications.push);
        this.updateCheckbox('questNotifications', this.settings.notifications.quest);
        this.updateCheckbox('socialNotifications', this.settings.notifications.social);
        this.updateCheckbox('profilePublic', this.settings.privacy.profilePublic);
        this.updateCheckbox('showOnline', this.settings.privacy.showOnline);
        this.updateCheckbox('allowFriendRequests', this.settings.privacy.allowFriendRequests);
        
        // Update selects
        this.updateSelect('difficulty', this.settings.gameplay.difficulty);
        this.updateSelect('language', this.settings.gameplay.language);
        this.updateSelect('theme', this.settings.audioVisual.theme);
        
        // Update volume sliders
        this.updateSlider('masterVolume', this.settings.audioVisual.masterVolume);
        this.updateSlider('musicVolume', this.settings.audioVisual.musicVolume);
        this.updateSlider('sfxVolume', this.settings.audioVisual.sfxVolume);
    }

    updateInput(id, value) {
        const input = document.getElementById(id);
        if (input) input.value = value;
    }

    updateCheckbox(id, checked) {
        const checkbox = document.getElementById(id);
        if (checkbox) checkbox.checked = checked;
    }

    updateSelect(id, value) {
        const select = document.getElementById(id);
        if (select) select.value = value;
    }

    updateSlider(id, value) {
        const slider = document.getElementById(id);
        const valueDisplay = document.getElementById(id + 'Value');
        if (slider) slider.value = value;
        if (valueDisplay) valueDisplay.textContent = value + '%';
    }

    // Aplica tema visual
    applyTheme(theme) {
        document.body.className = `theme-${theme}`;
        this.showNotification(`Tema alterado para: ${this.getThemeName(theme)}`, 'info');
    }

    getThemeName(theme) {
        const themes = {
            'medieval': 'Medieval Clássico',
            'dark': 'Masmorras Sombrias',
            'fantasy': 'Reino Fantástico',
            'royal': 'Corte Real'
        };
        return themes[theme] || theme;
    }

    // Reproduz preview de volume
    playVolumePreview(volumeType) {
        // Simula reprodução de som para preview
        console.log(`Preview de ${volumeType}: ${this.settings.audioVisual[volumeType]}%`);
    }

    // Utilitário para definir propriedades aninhadas
    setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!(keys[i] in current)) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
    }

    // Mostra notificação
    showNotification(message, type = 'info') {
        // Remove notificação existente
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        // Cria nova notificação
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        // Adiciona estilos
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #d4af37, #b8860b);
            color: #2C1810;
            padding: 15px 20px;
            border-radius: 8px;
            border: 2px solid #8b6914;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            font-family: 'Cinzel', serif;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.3s ease;
        `;
        
        if (type === 'success') {
            notification.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
            notification.style.color = '#fff';
        } else if (type === 'error') {
            notification.style.background = 'linear-gradient(135deg, #f44336, #da190b)';
            notification.style.color = '#fff';
        }
        
        document.body.appendChild(notification);
        
        // Remove automaticamente após 3 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }

    // Restaura configurações padrão
    resetToDefaults() {
        if (confirm('Tem certeza que deseja restaurar todas as configurações para os valores padrão?')) {
            localStorage.removeItem('dungeonKeeperSettings');
            this.settings = this.loadSettings();
            this.updateUI();
            this.showNotification('Configurações restauradas para os padrões!', 'success');
        }
    }
}

// Funções globais
function saveSettings() {
    if (window.settingsManager) {
        window.settingsManager.saveSettings();
    }
}

function resetSettings() {
    if (window.settingsManager) {
        window.settingsManager.resetToDefaults();
    }
}

// Inicializa quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
    
    // Adiciona estilos para animações
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .notification button {
            background: none;
            border: none;
            color: inherit;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .notification button:hover {
            opacity: 0.7;
        }
    `;
    document.head.appendChild(style);
});