class ConstructionQueueManager {
    constructor() {
        this.CONFIG = {
            panel: {
                width: 300,
                position: { top: 120, right: 25 },
                colors: {
                    background: '#2a2a2a',
                    border: '#c8a971',
                    text: '#f0d9a8',
                    header: {
                        gradient: ['#353535', '#1a1a1a'],
                        text: '#f5e5c6'
                    },
                    button: {
                        background: '#1e1e1e',
                        hover: '#3d3d3d',
                        active: '#4a4a4a'
                    }
                }
            },
            delays: [0.5, 1, 2, 3, 5, 10, 15, 30, 60],
            storageKey: 'twConstructionQueueConfig_v2'
        };

        this.BUILDINGS = {
            main: "Edifício Principal", barracks: "Quartel", stable: "Estábulo",
            garage: "Oficina", watchtower: "Torre de Vigia", smith: "Ferreiro",
            place: "Praça de Reunião", statue: "Estátua", market: "Mercado",
            wood: "Bosque", stone: "Poço de Argila", iron: "Mina de Ferro",
            farm: "Fazenda", storage: "Armazém", hide: "Esconderijo",
            wall: "Muralha", snob: "Academia"
        };

        this.state = {
            isRunning: false,
            intervalId: null,
            countdownInterval: null,
            timeRemaining: 0,
            items: [],
            dragSource: null
        };

        this.elements = {
            panel: null,
            listContainer: null,
            countdown: null,
            queueCounter: null,
            selectedCounter: null,
            startBtn: null,
            stopBtn: null,
            delaySelect: null,
            toggleAllBtn: null
        };

        this.init();
    }

    init() {
        if (!this.validateScreen()) return;
        
        this.applyStyles();
        this.createPanel();
        this.setupEventListeners();
        this.loadConfiguration();
        this.updateCounters();
    }

    validateScreen() {
        if (!window.location.href.includes("screen=main")) {
            this.showRedirectDialog();
            return false;
        }
        return true;
    }

    showRedirectDialog() {
        const url = game_data.link_base_pure + "main";
        const dialogContent = `
            <div style="font-size:12px; text-align:center; padding:10px;">
                <p>Você não está na tela de construções. Deseja ser redirecionado?</p>
                <div style="margin-top:15px; display:flex; gap:10px; justify-content:center;">
                    <button class="btn btn-confirm-yes" onclick="window.location.href='${url}'">Sim</button>
                    <button class="btn btn-confirm-no" onclick="Dialog.close()">Não</button>
                </div>
            </div>
        `;
        
        Dialog.show('redirDialog', dialogContent);
    }

    applyStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .twc-painel {
                background: ${this.CONFIG.panel.colors.background};
                border: 2px solid ${this.CONFIG.panel.colors.border};
                border-radius: 8px;
                font-family: 'Segoe UI', Tahoma, sans-serif;
                font-size: 13px;
                color: ${this.CONFIG.panel.colors.text};
                z-index: 10000;
                box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.6);
                position: fixed;
                top: ${this.CONFIG.panel.position.top}px;
                right: ${this.CONFIG.panel.position.right}px;
                width: ${this.CONFIG.panel.width}px;
                user-select: none;
                backdrop-filter: blur(2px);
            }
            
            .twc-cabecalho {
                background: linear-gradient(to bottom, ${this.CONFIG.panel.colors.header.gradient.join(', ')});
                border-bottom: 2px solid ${this.CONFIG.panel.colors.border};
                padding: 10px 15px;
                font-weight: bold;
                cursor: move;
                color: ${this.CONFIG.panel.colors.header.text};
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-radius: 6px 6px 0 0;
            }
            
            .twc-lista {
                list-style: none;
                padding: 8px 0;
                margin: 0;
                max-height: 350px;
                overflow-y: auto;
                background: ${this.CONFIG.panel.colors.background};
            }
            
            .twc-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 15px;
                border-bottom: 1px solid #3a3a3a;
                background: ${this.CONFIG.panel.colors.background};
                cursor: grab;
                font-weight: 600;
                font-size: 13px;
                color: ${this.CONFIG.panel.colors.text};
                transition: all 0.2s ease;
            }
            
            .twc-item:hover {
                background: #353535;
                transform: translateX(2px);
            }
            
            .twc-item.dragging {
                opacity: 0.5;
                background: #404040;
            }
            
            .twc-btn {
                font-size: 13px;
                padding: 6px 12px;
                border-radius: 5px;
                border: 1px solid ${this.CONFIG.panel.colors.border};
                background-color: ${this.CONFIG.panel.colors.button.background};
                color: ${this.CONFIG.panel.colors.text};
                cursor: pointer;
                font-weight: bold;
                transition: all 0.2s ease;
                min-width: 80px;
            }
            
            .twc-btn:hover {
                background-color: ${this.CONFIG.panel.colors.button.hover};
                transform: translateY(-1px);
            }
            
            .twc-btn:active {
                background-color: ${this.CONFIG.panel.colors.button.active};
                transform: translateY(0);
            }
            
            .twc-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none;
            }
            
            .twc-delay-select {
                padding: 6px 8px;
                border-radius: 5px;
                border: 1px solid ${this.CONFIG.panel.colors.border};
                font-size: 13px;
                background-color: ${this.CONFIG.panel.colors.button.background};
                color: ${this.CONFIG.panel.colors.text};
                cursor: pointer;
                width: 100%;
            }
            
            .twc-contador {
                font-size: 13px;
                font-weight: bold;
                margin: 8px 15px;
                text-align: center;
                color: #ffd700;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .twc-botoes {
                display: flex;
                gap: 10px;
                justify-content: center;
                margin: 15px;
                padding-top: 10px;
                border-top: 1px solid #3a3a3a;
            }
            
            .twc-flex {
                display: flex;
                gap: 10px;
                margin: 10px 15px;
            }
            
            .twc-flex-1 {
                flex: 1;
            }
            
            .twc-checkbox {
                accent-color: ${this.CONFIG.panel.colors.border};
                cursor: pointer;
                transform: scale(1.1);
            }
            
            .twc-section {
                margin: 10px 0;
                padding: 0 15px;
            }
            
            .twc-label {
                display: block;
                margin-bottom: 5px;
                font-weight: 600;
                color: ${this.CONFIG.panel.colors.header.text};
            }
        `;
        document.head.appendChild(style);
    }

    createPanel() {
        this.elements.panel = document.createElement("div");
        this.elements.panel.className = "twc-painel";
        
        this.createHeader();
        this.createList();
        this.createControls();
        this.createCounters();
        this.createButtons();
        
        document.body.appendChild(this.elements.panel);
        this.setupDragAndDrop();
    }

    createHeader() {
        const header = document.createElement("div");
        header.className = "twc-cabecalho";
        header.innerHTML = `
            <span>🏗️ Fila de Construção</span>
            <span style="cursor:pointer; font-size:16px;" title="Fechar painel">✖</span>
        `;
        
        header.lastChild.onclick = () => this.closePanel();
        this.elements.panel.appendChild(header);
    }

    createList() {
        this.elements.listContainer = document.createElement("ul");
        this.elements.listContainer.className = "twc-lista";
        
        Object.entries(this.BUILDINGS).forEach(([code, name]) => {
            const item = this.createListItem(code, name);
            this.elements.listContainer.appendChild(item);
            this.state.items.push(item);
        });
        
        this.elements.panel.appendChild(this.elements.listContainer);
    }

    createListItem(code, name) {
        const li = document.createElement("li");
        li.className = "twc-item";
        li.dataset.code = code;
        
        const span = document.createElement("span");
        span.textContent = name;
        
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "twc-checkbox";
        checkbox.onchange = () => this.handleCheckboxChange();
        
        li.append(span, checkbox);
        this.setupListItemDrag(li);
        
        return li;
    }

    setupListItemDrag(item) {
        item.draggable = true;
        
        item.ondragstart = (e) => {
            this.state.dragSource = item;
            e.dataTransfer.setData("text/plain", item.dataset.code);
            item.classList.add("dragging");
        };
        
        item.ondragend = () => {
            item.classList.remove("dragging");
            this.state.dragSource = null;
        };
        
        item.ondragover = (e) => e.preventDefault();
        item.ondrop = (e) => this.handleItemDrop(e, item);
    }

    createControls() {
        // Toggle all button
        const toggleWrapper = document.createElement("div");
        toggleWrapper.className = "twc-flex";
        
        this.elements.toggleAllBtn = document.createElement("button");
        this.elements.toggleAllBtn.className = "twc-btn twc-flex-1";
        this.elements.toggleAllBtn.textContent = "Marcar Todos";
        this.elements.toggleAllBtn.onclick = () => this.toggleAllItems();
        
        const saveBtn = document.createElement("button");
        saveBtn.className = "twc-btn twc-flex-1";
        saveBtn.textContent = "💾 Salvar";
        saveBtn.onclick = () => this.saveConfiguration();
        
        toggleWrapper.append(this.elements.toggleAllBtn, saveBtn);
        this.elements.panel.appendChild(toggleWrapper);
        
        // Delay selector
        const delayWrapper = document.createElement("div");
        delayWrapper.className = "twc-section";
        
        const label = document.createElement("label");
        label.className = "twc-label";
        label.textContent = "Intervalo de verificação:";
        
        this.elements.delaySelect = document.createElement("select");
        this.elements.delaySelect.className = "twc-delay-select";
        
        this.CONFIG.delays.forEach(min => {
            const option = document.createElement("option");
            option.value = min * 60000;
            option.textContent = min === 0.5 ? "30 segundos" : `${min} minuto${min > 1 ? "s" : ""}`;
            this.elements.delaySelect.appendChild(option);
        });
        
        delayWrapper.append(label, this.elements.delaySelect);
        this.elements.panel.appendChild(delayWrapper);
    }

    createCounters() {
        this.elements.countdown = document.createElement("div");
        this.elements.countdown.className = "twc-contador";
        
        this.elements.queueCounter = document.createElement("div");
        this.elements.queueCounter.className = "twc-contador";
        
        this.elements.selectedCounter = document.createElement("div");
        this.elements.selectedCounter.className = "twc-contador";
        
        this.elements.panel.append(
            this.elements.countdown,
            this.elements.queueCounter,
            this.elements.selectedCounter
        );
    }

    createButtons() {
        const buttonsWrapper = document.createElement("div");
        buttonsWrapper.className = "twc-botoes";
        
        this.elements.startBtn = document.createElement("button");
        this.elements.startBtn.className = "twc-btn";
        this.elements.startBtn.textContent = "▶️ Iniciar";
        this.elements.startBtn.onclick = () => this.startConstruction();
        
        this.elements.stopBtn = document.createElement("button");
        this.elements.stopBtn.className = "twc-btn";
        this.elements.stopBtn.textContent = "⏹️ Parar";
        this.elements.stopBtn.disabled = true;
        this.elements.stopBtn.onclick = () => this.stopConstruction();
        
        buttonsWrapper.append(this.elements.startBtn, this.elements.stopBtn);
        this.elements.panel.appendChild(buttonsWrapper);
    }

    handleCheckboxChange() {
        this.updateCounters();
        this.saveConfiguration();
        this.updateToggleButtonText();
    }

    handleItemDrop(e, targetItem) {
        e.preventDefault();
        if (!this.state.dragSource || this.state.dragSource === targetItem) return;
        
        const allItems = Array.from(this.elements.listContainer.children);
        const sourceIndex = allItems.indexOf(this.state.dragSource);
        const targetIndex = allItems.indexOf(targetItem);
        
        if (sourceIndex < targetIndex) {
            this.elements.listContainer.insertBefore(this.state.dragSource, targetItem.nextSibling);
        } else {
            this.elements.listContainer.insertBefore(this.state.dragSource, targetItem);
        }
        
        this.saveConfiguration();
    }

    executeConstruction() {
        if (this.getCurrentQueueCount() >= 5) {
            this.showNotification("⛔ Fila cheia. Aguardando...", "warning");
            return;
        }
        
        const queue = this.getOrderedQueue();
        if (!queue.length) {
            this.stopConstruction();
            return;
        }
        
        for (let code of queue) {
            const buildButton = this.findBuildButton(code);
            if (buildButton) {
                buildButton.click();
                this.showNotification(`✅ Construindo ${this.BUILDINGS[code]}!`, "success");
                break;
            }
        }
        
        this.updateCounters();
    }

    findBuildButton(code) {
        const buttons = document.querySelectorAll(`a.btn-build[id^='main_buildlink_${code}_']`);
        return Array.from(buttons).find(button => 
            button.offsetParent !== null && !button.classList.contains('disabled')
        );
    }

    getCurrentQueueCount() {
        const cancelButtons = document.querySelectorAll("a.btn.btn-cancel");
        return Array.from(cancelButtons).filter(a => a.href.includes("action=cancel")).length;
    }

    getOrderedQueue() {
        return Array.from(this.elements.listContainer.children)
            .filter(item => item.querySelector("input").checked)
            .map(item => item.dataset.code);
    }

    startConstruction() {
        if (this.state.isRunning) return;
        
        const queue = this.getOrderedQueue();
        if (!queue.length) {
            this.showNotification("❌ Nenhum item marcado!", "error");
            return;
        }
        
        this.state.isRunning = true;
        this.elements.startBtn.disabled = true;
        this.elements.stopBtn.disabled = false;
        
        const delay = Number(this.elements.delaySelect.value);
        this.state.intervalId = setInterval(() => this.executeConstruction(), delay);
        this.startCountdown();
        
        this.showNotification("🚀 Fila de construção iniciada!", "success");
    }

    stopConstruction() {
        if (!this.state.isRunning) return;
        
        clearInterval(this.state.intervalId);
        clearInterval(this.state.countdownInterval);
        
        this.state.isRunning = false;
        this.elements.startBtn.disabled = false;
        this.elements.stopBtn.disabled = true;
        this.elements.countdown.textContent = "";
        
        this.showNotification("🛑 Fila de construção parada!", "error");
    }

    startCountdown() {
        clearInterval(this.state.countdownInterval);
        this.state.timeRemaining = Number(this.elements.delaySelect.value);
        
        this.state.countdownInterval = setInterval(() => {
            this.state.timeRemaining -= 1000;
            
            if (this.state.timeRemaining <= 0) {
                this.state.timeRemaining = Number(this.elements.delaySelect.value);
            }
            
            const seconds = Math.floor(this.state.timeRemaining / 1000);
            this.elements.countdown.innerHTML = `⏳ Próxima verificação: <span style="color:#ffa500">${seconds}s</span>`;
        }, 1000);
    }

    saveConfiguration() {
        const config = {
            delay: this.elements.delaySelect.value,
            order: Array.from(this.elements.listContainer.children).map(item => item.dataset.code),
            selected: this.state.items.reduce((acc, item) => {
                acc[item.dataset.code] = item.querySelector("input").checked;
                return acc;
            }, {})
        };
        
        localStorage.setItem(this.CONFIG.storageKey, JSON.stringify(config));
    }

    loadConfiguration() {
        try {
            const saved = localStorage.getItem(this.CONFIG.storageKey);
            if (!saved) return;
            
            const config = JSON.parse(saved);
            
            if (config.order) {
                config.order.forEach(code => {
                    const item = this.state.items.find(i => i.dataset.code === code);
                    if (item) this.elements.listContainer.appendChild(item);
                });
            }
            
            if (config.selected) {
                this.state.items.forEach(item => {
                    item.querySelector("input").checked = !!config.selected[item.dataset.code];
                });
            }
            
            if (config.delay) {
                this.elements.delaySelect.value = config.delay;
            }
            
        } catch (error) {
            console.error("Erro ao carregar configuração:", error);
        }
        
        this.updateCounters();
        this.updateToggleButtonText();
    }

    updateCounters() {
        const queueCount = this.getCurrentQueueCount();
        const selectedCount = this.state.items.filter(item => item.querySelector("input").checked).length;
        
        this.elements.queueCounter.innerHTML = `🏗️ Fila atual: <span style="color:#${queueCount < 5 ? '90ee90' : 'ff6b6b'}">${queueCount}/5</span>`;
        this.elements.selectedCounter.innerHTML = `✅ Marcados: <span style="color:#90ee90">${selectedCount}</span>`;
    }

    updateToggleButtonText() {
        const allChecked = this.state.items.every(item => item.querySelector("input").checked);
        this.elements.toggleAllBtn.textContent = allChecked ? "Desmarcar Todos" : "Marcar Todos";
    }

    toggleAllItems() {
        const shouldCheck = this.state.items.some(item => !item.querySelector("input").checked);
        
        this.state.items.forEach(item => {
            item.querySelector("input").checked = shouldCheck;
        });
        
        this.updateCounters();
        this.saveConfiguration();
        this.updateToggleButtonText();
    }

    showNotification(message, type) {
        if (typeof UI !== 'undefined' && UI.InfoMessage) {
            UI.InfoMessage(message, 2000, type);
        } else {
            console.log(`${type}: ${message}`);
        }
    }

    closePanel() {
        if (this.state.isRunning) {
            this.showNotification("❗ Pare a execução antes de fechar.", "warning");
            return;
        }
        
        this.stopConstruction();
        this.elements.panel.remove();
    }

    setupDragAndDrop() {
        const header = this.elements.panel.querySelector(".twc-cabecalho");
        let isDragging = false;
        let startX, startY, initialX, initialY;
        
        header.onmousedown = (e) => {
            if (e.target.tagName === 'SPAN' && e.target !== header.firstChild) return;
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            
            const rect = this.elements.panel.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;
            
            this.elements.panel.style.cursor = 'grabbing';
            e.preventDefault();
        };
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            this.elements.panel.style.left = `${initialX + dx}px`;
            this.elements.panel.style.top = `${initialY + dy}px`;
            this.elements.panel.style.right = 'auto';
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                this.elements.panel.style.cursor = '';
            }
        });
        
        header.ondragstart = () => false;
    }
}

// Inicializar a aplicação
new ConstructionQueueManager();
