class MapCreator {
    constructor() {
        this.mapData = {};
        this.currentUploadOption = 'upload';
        this.initializeEventListeners();
        this.initializeUploadOptions();
    }

    initializeEventListeners() {
        // Botões principais
        document.getElementById('previewMap').addEventListener('click', () => this.previewMap());
        document.getElementById('saveMap').addEventListener('click', () => this.saveMap());
        document.getElementById('createMap').addEventListener('click', () => this.createMap());
        document.getElementById('cancelMap').addEventListener('click', () => this.cancelMap());

        // Form submission
        document.getElementById('mapForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createMap();
        });

        // Image upload
        document.getElementById('mapImage').addEventListener('change', (e) => this.handleImageUpload(e));
        document.getElementById('mapImagePreview').addEventListener('click', () => {
            document.getElementById('mapImage').click();
        });

        // URL preview
        document.getElementById('previewUrl').addEventListener('click', () => this.previewExternalUrl());
        document.getElementById('mapImageUrl').addEventListener('input', (e) => this.handleUrlInput(e));
    }

    initializeUploadOptions() {
        const options = document.querySelectorAll('.upload-option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                const optionType = option.getAttribute('data-option');
                this.switchUploadOption(optionType);
            });
        });
    }

    switchUploadOption(optionType) {
        // Remover classe active de todas as opções
        document.querySelectorAll('.upload-option').forEach(opt => opt.classList.remove('active'));
        document.querySelectorAll('.upload-section').forEach(section => section.classList.remove('active'));

        // Ativar opção selecionada
        document.querySelector(`[data-option="${optionType}"]`).classList.add('active');
        document.getElementById(`${optionType}Section`).classList.add('active');
        
        this.currentUploadOption = optionType;
    }

    // Função para lidar com upload de imagem
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validar tipo de arquivo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('Por favor, selecione apenas arquivos de imagem (PNG, JPG, GIF, WebP)');
            return;
        }

        // Validar tamanho (10MB para mapas)
        const maxSize = 10 * 1024 * 1024; // 10MB em bytes
        if (file.size > maxSize) {
            alert('A imagem deve ter no máximo 10MB');
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
        const previewContainer = document.getElementById('mapImagePreview');
        previewContainer.innerHTML = `
            <img src="${imageSrc}" alt="Preview" class="preview-image">
            <button type="button" class="image-remove-btn" onclick="mapCreator.removeImage()" title="Remover imagem">
                ×
            </button>
        `;
        
        // Armazenar dados da imagem
        this.mapData.imageData = {
            src: imageSrc,
            name: fileName,
            type: 'upload'
        };
    }

    // Remover imagem
    removeImage() {
        const previewContainer = document.getElementById('mapImagePreview');
        previewContainer.innerHTML = `
            <div class="upload-placeholder">
                <div class="upload-icon">📁</div>
                <p>Clique para fazer upload do mapa</p>
                <span class="upload-hint">PNG, JPG ou GIF até 10MB</span>
            </div>
        `;
        
        // Limpar input e dados
        document.getElementById('mapImage').value = '';
        delete this.mapData.imageData;
    }

    // Lidar com input de URL
    handleUrlInput(event) {
        const url = event.target.value;
        if (url && this.isValidImageUrl(url)) {
            // Auto-preview para URLs válidas
            setTimeout(() => this.previewExternalUrl(), 500);
        }
    }

    // Verificar se URL é válida para imagem
    isValidImageUrl(url) {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        return imageExtensions.some(ext => url.toLowerCase().includes(ext));
    }

    // Preview de URL externa
    previewExternalUrl() {
        const url = document.getElementById('mapImageUrl').value;
        if (!url) {
            alert('Por favor, insira uma URL válida');
            return;
        }

        const previewContainer = document.getElementById('urlPreview');
        previewContainer.innerHTML = '<p>Carregando preview...</p>';

        // Criar elemento de imagem para testar
        const img = new Image();
        img.onload = () => {
            previewContainer.innerHTML = `
                <img src="${url}" alt="Preview da URL" style="max-width: 100%; max-height: 300px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                <button type="button" class="image-remove-btn" onclick="mapCreator.removeUrlPreview()" title="Remover preview">
                    ×
                </button>
            `;
            
            // Armazenar dados da URL
            this.mapData.imageData = {
                src: url,
                name: 'Imagem Externa',
                type: 'url'
            };
        };
        img.onerror = () => {
            previewContainer.innerHTML = '<p style="color: #DC143C;">❌ Erro ao carregar imagem. Verifique se a URL está correta.</p>';
        };
        img.src = url;
    }

    // Remover preview de URL
    removeUrlPreview() {
        document.getElementById('urlPreview').innerHTML = '';
        document.getElementById('mapImageUrl').value = '';
        delete this.mapData.imageData;
    }

    // Adicionar Ponto de Interesse
    addPOI() {
        const poiList = document.getElementById('poiList');
        const poiItem = document.createElement('div');
        poiItem.className = 'list-item';
        poiItem.innerHTML = `
            <input type="text" placeholder="Nome do local" class="poi-name">
            <input type="text" placeholder="Coordenadas (ex: A5)" class="poi-coords">
            <textarea placeholder="Descrição do ponto de interesse..." class="poi-description" rows="2"></textarea>
            <button type="button" class="btn-remove" onclick="this.parentElement.remove()">Remover</button>
        `;
        poiList.appendChild(poiItem);
    }

    // Coletar dados dos POIs
    collectPOIs() {
        const poiItems = document.querySelectorAll('#poiList .list-item');
        const pois = [];
        
        poiItems.forEach(item => {
            const name = item.querySelector('.poi-name').value;
            const coords = item.querySelector('.poi-coords').value;
            const description = item.querySelector('.poi-description').value;
            
            if (name || coords || description) {
                pois.push({ name, coords, description });
            }
        });
        
        return pois;
    }

    // Coleta dados do formulário
    collectFormData() {
        const formData = {
            title: document.getElementById('mapTitle').value,
            type: document.getElementById('mapType').value,
            description: document.getElementById('mapDescription').value,
            scale: document.getElementById('mapScale').value,
            dimensions: document.getElementById('mapDimensions').value,
            notes: document.getElementById('mapNotes').value,
            pointsOfInterest: this.collectPOIs(),
            imageData: this.mapData?.imageData || null,
            uploadOption: this.currentUploadOption
        };

        return formData;
    }

    // Validar dados do formulário
    validateFormData(data) {
        const errors = [];

        if (!data.title.trim()) {
            errors.push('Título do mapa é obrigatório');
        }

        if (errors.length > 0) {
            alert('Erros encontrados:\n' + errors.join('\n'));
            return false;
        }

        return true;
    }

    // Gera preview do mapa
    generatePreview(data) {
        let previewHTML = `
            <div class="preview-section">
                <h2>${data.title || 'Mapa sem título'}</h2>
                ${data.imageData ? `<div style="text-align: center; margin: 1rem 0;"><img src="${data.imageData.src}" alt="Mapa" style="max-width: 100%; max-height: 400px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);"></div>` : ''}
                ${data.description ? `<p><strong>Descrição:</strong> ${data.description}</p>` : ''}
            </div>

            <div class="preview-section">
                <h3>Informações Básicas</h3>
                <p><strong>Tipo:</strong> ${data.type || 'Não especificado'}</p>
                <p><strong>Escala:</strong> ${data.scale || 'Não especificado'}</p>
                <p><strong>Dimensões:</strong> ${data.dimensions || 'Não especificado'}</p>
            </div>
        `;

        if (data.pointsOfInterest && data.pointsOfInterest.length > 0) {
            previewHTML += `
                <div class="preview-section">
                    <h3>Pontos de Interesse</h3>
                    <ul>
            `;
            data.pointsOfInterest.forEach(poi => {
                previewHTML += `<li><strong>${poi.name}</strong> ${poi.coords ? `(${poi.coords})` : ''}: ${poi.description}</li>`;
            });
            previewHTML += `</ul></div>`;
        }

        if (data.notes) {
            previewHTML += `
                <div class="preview-section">
                    <h3>Notas</h3>
                    <p>${data.notes}</p>
                </div>
            `;
        }

        return previewHTML;
    }

    // Exibir preview
    previewMap() {
        const data = this.collectFormData();
        const previewContent = this.generatePreview(data);
        
        document.getElementById('previewContent').innerHTML = previewContent;
        document.getElementById('previewModal').style.display = 'block';
    }

    // Salvar mapa
    saveMap() {
        const data = this.collectFormData();
        
        if (!this.validateFormData(data)) {
            return;
        }

        // Salvar no localStorage
        const savedMaps = JSON.parse(localStorage.getItem('dnd_maps') || '[]');
        data.id = Date.now();
        data.createdAt = new Date().toISOString();
        data.updatedAt = new Date().toISOString();
        
        savedMaps.push(data);
        localStorage.setItem('dnd_maps', JSON.stringify(savedMaps));
        
        alert('Mapa salvo com sucesso!');
    }

    // Criar mapa (salvar e redirecionar)
    createMap() {
        const data = this.collectFormData();
        
        if (!this.validateFormData(data)) {
            return;
        }

        this.saveMap();
        
        // Redirecionar para página de criações
        if (confirm('Mapa criado com sucesso! Deseja ir para a página de criações?')) {
            window.location.href = 'creations.html';
        }
    }

    // Cancelar criação
    cancelMap() {
        if (confirm('Tem certeza que deseja cancelar? Todos os dados não salvos serão perdidos.')) {
            // Limpar formulário
            document.getElementById('mapForm').reset();
            this.removeImage();
            this.removeUrlPreview();
            
            // Limpar POIs
            document.getElementById('poiList').innerHTML = '';
            
            // Redirecionar
            window.location.href = 'creations.html';
        }
    }

    // Exportar mapa como JSON
    exportMap() {
        const data = this.collectFormData();
        
        if (!this.validateFormData(data)) {
            return;
        }

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_map.json`;
        link.click();
    }
}

// Funções globais
function closePreviewModal() {
    document.getElementById('previewModal').style.display = 'none';
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('previewModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Inicializar quando a página carregar
let mapCreator;
document.addEventListener('DOMContentLoaded', function() {
    mapCreator = new MapCreator();
});