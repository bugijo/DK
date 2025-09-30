// Create Item JavaScript

class ItemCreator {
    constructor() {
        this.selectedType = null;
        this.uploadedImage = null;
        this.currentUploadMode = 'file';
        this.initializeEventListeners();
        this.loadSavedData();
    }

    initializeEventListeners() {
        // Item type selection
        document.querySelectorAll('.item-type-card').forEach(card => {
            card.addEventListener('click', (e) => this.selectItemType(e));
        });

        // Upload mode selection
        document.querySelectorAll('.upload-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectUploadMode(e));
        });

        // File upload
        const fileUploadArea = document.getElementById('fileUploadArea');
        const fileInput = document.getElementById('itemImageFile');
        
        fileUploadArea.addEventListener('click', () => fileInput.click());
        fileUploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        fileUploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        fileUploadArea.addEventListener('drop', (e) => this.handleFileDrop(e));
        
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Remove image
        document.getElementById('removeImage').addEventListener('click', () => this.removeImage());
        
        // URL preview
        document.getElementById('previewUrl').addEventListener('click', () => this.previewUrlImage());
        
        // Magical properties toggle
        document.getElementById('isMagical').addEventListener('change', (e) => this.toggleMagicalProperties(e));
        
        // Form actions
        document.getElementById('previewItem').addEventListener('click', () => this.previewItem());
        document.getElementById('saveItem').addEventListener('click', () => this.saveItem());
        document.getElementById('createItem').addEventListener('click', (e) => this.createItem(e));
        document.getElementById('cancelItem').addEventListener('click', () => this.cancelCreation());
        
        // Form validation
        document.getElementById('itemForm').addEventListener('input', () => this.validateForm());
    }

    selectItemType(event) {
        // Remove previous selection
        document.querySelectorAll('.item-type-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Add selection to clicked card
        const card = event.currentTarget;
        card.classList.add('selected');
        
        // Store selected type
        this.selectedType = card.dataset.type;
        
        // Show specific properties
        this.showSpecificProperties(this.selectedType);
        
        // Update form validation
        this.validateForm();
    }

    showSpecificProperties(type) {
        const specificSection = document.getElementById('specificProperties');
        const allProperties = document.querySelectorAll('.type-properties');
        
        // Hide all property sections
        allProperties.forEach(section => {
            section.style.display = 'none';
        });
        
        // Show relevant property section
        const relevantSection = document.getElementById(`${type}Properties`);
        if (relevantSection) {
            specificSection.style.display = 'block';
            relevantSection.style.display = 'block';
        } else {
            specificSection.style.display = 'none';
        }
    }

    selectUploadMode(event) {
        // Remove previous selection
        document.querySelectorAll('.upload-option').forEach(option => {
            option.classList.remove('active');
        });
        
        // Add selection to clicked option
        const option = event.currentTarget;
        option.classList.add('active');
        
        // Store current mode
        this.currentUploadMode = option.dataset.option;
        
        // Show/hide upload sections
        const fileUpload = document.getElementById('fileUpload');
        const urlUpload = document.getElementById('urlUpload');
        
        if (this.currentUploadMode === 'file') {
            fileUpload.style.display = 'block';
            urlUpload.style.display = 'none';
        } else {
            fileUpload.style.display = 'none';
            urlUpload.style.display = 'block';
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        event.currentTarget.classList.add('dragover');
    }

    handleDragLeave(event) {
        event.preventDefault();
        event.currentTarget.classList.remove('dragover');
    }

    handleFileDrop(event) {
        event.preventDefault();
        event.currentTarget.classList.remove('dragover');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showNotification('Por favor, selecione apenas arquivos de imagem.', 'error');
            return;
        }
        
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('O arquivo deve ter no máximo 5MB.', 'error');
            return;
        }
        
        // Read and display file
        const reader = new FileReader();
        reader.onload = (e) => {
            this.uploadedImage = e.target.result;
            this.showImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    showImagePreview(imageSrc) {
        const preview = document.getElementById('imagePreview');
        const previewImage = document.getElementById('previewImage');
        const uploadArea = document.getElementById('fileUploadArea');
        
        previewImage.src = imageSrc;
        preview.style.display = 'block';
        uploadArea.style.display = 'none';
    }

    removeImage() {
        const preview = document.getElementById('imagePreview');
        const uploadArea = document.getElementById('fileUploadArea');
        const fileInput = document.getElementById('itemImageFile');
        
        this.uploadedImage = null;
        preview.style.display = 'none';
        uploadArea.style.display = 'block';
        fileInput.value = '';
    }

    previewUrlImage() {
        const urlInput = document.getElementById('itemImageUrl');
        const urlPreview = document.getElementById('urlPreview');
        const urlPreviewImage = document.getElementById('urlPreviewImage');
        
        const imageUrl = urlInput.value.trim();
        if (!imageUrl) {
            this.showNotification('Por favor, insira uma URL válida.', 'error');
            return;
        }
        
        // Test if URL is valid image
        const img = new Image();
        img.onload = () => {
            urlPreviewImage.src = imageUrl;
            urlPreview.style.display = 'block';
            this.uploadedImage = imageUrl;
        };
        img.onerror = () => {
            this.showNotification('URL de imagem inválida ou inacessível.', 'error');
        };
        img.src = imageUrl;
    }

    toggleMagicalProperties(event) {
        const magicalSection = document.getElementById('magicalProperties');
        magicalSection.style.display = event.target.checked ? 'block' : 'none';
    }

    validateForm() {
        const itemName = document.getElementById('itemName').value.trim();
        const createButton = document.getElementById('createItem');
        
        const isValid = itemName && this.selectedType;
        createButton.disabled = !isValid;
        
        if (isValid) {
            createButton.classList.remove('disabled');
        } else {
            createButton.classList.add('disabled');
        }
    }

    collectFormData() {
        const formData = {
            // Basic info
            name: document.getElementById('itemName').value.trim(),
            type: this.selectedType,
            rarity: document.getElementById('itemRarity').value,
            description: document.getElementById('itemDescription').value.trim(),
            
            // Image
            image: this.uploadedImage,
            imageType: this.currentUploadMode,
            
            // Value and weight
            value: parseFloat(document.getElementById('itemValue').value) || 0,
            weight: parseFloat(document.getElementById('itemWeight').value) || 0,
            
            // Magical properties
            isMagical: document.getElementById('isMagical').checked,
            magicalEffect: document.getElementById('magicalEffect').value.trim(),
            attunement: document.getElementById('attunement').value,
            charges: parseInt(document.getElementById('charges').value) || 0,
            
            // Timestamp
            createdAt: new Date().toISOString()
        };
        
        // Add type-specific properties
        if (this.selectedType === 'weapon') {
            formData.weaponType = document.getElementById('weaponType').value;
            formData.damage = document.getElementById('weaponDamage').value.trim();
            formData.damageType = document.getElementById('damageType').value;
            formData.weaponProperties = Array.from(document.querySelectorAll('input[name="weaponProps"]:checked'))
                .map(cb => cb.value);
        } else if (this.selectedType === 'armor') {
            formData.armorType = document.getElementById('armorType').value;
            formData.armorClass = parseInt(document.getElementById('armorClass').value) || 10;
            formData.stealthDisadvantage = document.getElementById('stealthDisadvantage').value === 'yes';
        } else if (this.selectedType === 'consumable') {
            formData.consumableType = document.getElementById('consumableType').value;
            formData.uses = parseInt(document.getElementById('uses').value) || 1;
        }
        
        return formData;
    }

    previewItem() {
        const formData = this.collectFormData();
        
        if (!formData.name || !formData.type) {
            this.showNotification('Por favor, preencha pelo menos o nome e tipo do item.', 'error');
            return;
        }
        
        this.showPreviewModal(formData);
    }

    showPreviewModal(itemData) {
        const modal = document.getElementById('previewModal');
        const content = document.getElementById('previewContent');
        
        content.innerHTML = this.generateItemPreviewHTML(itemData);
        modal.style.display = 'flex';
    }

    generateItemPreviewHTML(item) {
        const rarityClass = `rarity-${item.rarity.replace('-', '-')}`;
        
        let html = `
            <div class="item-preview-card">
                <div class="item-preview-header">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}" class="item-preview-image">` : ''}
                    <div class="item-preview-title">
                        <h3>${item.name}</h3>
                        <div class="item-rarity ${rarityClass}">${this.getRarityLabel(item.rarity)}</div>
                    </div>
                </div>
                
                <div class="item-preview-stats">
                    <div class="stat-item">
                        <div class="stat-label">Tipo</div>
                        <div class="stat-value">${this.getTypeLabel(item.type)}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Valor</div>
                        <div class="stat-value">${item.value} po</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Peso</div>
                        <div class="stat-value">${item.weight} lb</div>
                    </div>
        `;
        
        // Add type-specific stats
        if (item.type === 'weapon') {
            html += `
                <div class="stat-item">
                    <div class="stat-label">Dano</div>
                    <div class="stat-value">${item.damage} ${this.getDamageTypeLabel(item.damageType)}</div>
                </div>
            `;
        } else if (item.type === 'armor') {
            html += `
                <div class="stat-item">
                    <div class="stat-label">CA</div>
                    <div class="stat-value">${item.armorClass}</div>
                </div>
            `;
        }
        
        html += `</div>`;
        
        // Add description
        if (item.description) {
            html += `
                <div class="item-preview-description">
                    <p>${item.description}</p>
                </div>
            `;
        }
        
        // Add magical effect
        if (item.isMagical && item.magicalEffect) {
            html += `
                <div class="item-preview-description">
                    <strong style="color: #d4af37;">Efeito Mágico:</strong>
                    <p>${item.magicalEffect}</p>
                </div>
            `;
        }
        
        html += `</div>`;
        
        return html;
    }

    saveItem() {
        const formData = this.collectFormData();
        
        if (!formData.name || !formData.type) {
            this.showNotification('Por favor, preencha pelo menos o nome e tipo do item.', 'error');
            return;
        }
        
        // Save to localStorage
        const savedItems = JSON.parse(localStorage.getItem('dnd_items') || '[]');
        formData.id = Date.now().toString();
        savedItems.push(formData);
        localStorage.setItem('dnd_items', JSON.stringify(savedItems));
        
        this.showNotification('Item salvo com sucesso!', 'success');
    }

    createItem(event) {
        event.preventDefault();
        
        const formData = this.collectFormData();
        
        if (!formData.name || !formData.type) {
            this.showNotification('Por favor, preencha pelo menos o nome e tipo do item.', 'error');
            return;
        }
        
        // Save item
        this.saveItem();
        
        // Show success message
        this.showNotification('Item criado com sucesso!', 'success');
        
        // Reset form after delay
        setTimeout(() => {
            this.resetForm();
        }, 2000);
    }

    cancelCreation() {
        if (confirm('Tem certeza que deseja cancelar? Todas as alterações serão perdidas.')) {
            this.resetForm();
        }
    }

    resetForm() {
        document.getElementById('itemForm').reset();
        this.selectedType = null;
        this.uploadedImage = null;
        
        // Reset UI elements
        document.querySelectorAll('.item-type-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        document.getElementById('specificProperties').style.display = 'none';
        document.getElementById('magicalProperties').style.display = 'none';
        
        this.removeImage();
        this.validateForm();
    }

    loadSavedData() {
        // Load any saved draft data
        const draftData = localStorage.getItem('dnd_item_draft');
        if (draftData) {
            // Implement draft loading if needed
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontFamily: 'Crimson Text, serif',
            fontSize: '1rem',
            zIndex: '10000',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease'
        });
        
        // Set background color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    getRarityLabel(rarity) {
        const labels = {
            'common': 'Comum',
            'uncommon': 'Incomum',
            'rare': 'Raro',
            'very-rare': 'Muito Raro',
            'legendary': 'Lendário',
            'artifact': 'Artefato'
        };
        return labels[rarity] || rarity;
    }

    getTypeLabel(type) {
        const labels = {
            'weapon': 'Arma',
            'armor': 'Armadura',
            'accessory': 'Acessório',
            'consumable': 'Consumível',
            'tool': 'Ferramenta',
            'treasure': 'Tesouro'
        };
        return labels[type] || type;
    }

    getDamageTypeLabel(damageType) {
        const labels = {
            'slashing': 'Cortante',
            'piercing': 'Perfurante',
            'bludgeoning': 'Contundente',
            'fire': 'Fogo',
            'cold': 'Frio',
            'lightning': 'Elétrico',
            'thunder': 'Trovão',
            'acid': 'Ácido',
            'poison': 'Veneno',
            'psychic': 'Psíquico',
            'necrotic': 'Necrótico',
            'radiant': 'Radiante',
            'force': 'Força'
        };
        return labels[damageType] || damageType;
    }
}

// Global functions for modal
function closePreviewModal() {
    document.getElementById('previewModal').style.display = 'none';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ItemCreator();
});