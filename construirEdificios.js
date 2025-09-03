(function () {
    // ====== CONFIGURAÇÕES E CONSTANTES ======
    const CONFIG = {
        panel: {
            width: 280,
            position: { top: 100, right: 20 },
            colors: {
                background: '#2e2e2e',
                border: '#b79755',
                text: '#f5deb3',
                header: {
                    gradient: ['#3a3a3a', '#1e1e1e'],
                    text: '#f0e2b6'
                },
                button: {
                    background: '#1c1c1c',
                    hover: '#3a3a3a'
                }
            }
        },
        delays: [0.5, 1, 2, 3, 5, 10, 15, 30, 60],
        storageKey: 'filaConstrucaoConfig'
    };

    const BUILDINGS = {
        main: "Edifício Principal", barracks: "Quartel", stable: "Estábulo", 
        garage: "Oficina", watchtower: "Torre de Vigia", smith: "Ferreiro", 
        place: "Praça de Reunião", statue: "Estátua", market: "Mercado", 
        wood: "Bosque", stone: "Poço de Argila", iron: "Mina de Ferro",
        farm: "Fazenda", storage: "Armazém", hide: "Esconderijo", 
        wall: "Muralha", snob: "Academia"
    };

    // ====== ESTADO DA APLICAÇÃO ======
    let state = {
        isRunning: false,
        intervalId: null,
        countdownInterval: null,
        timeRemaining: 0,
        items: []
    };

    // ====== ELEMENTOS DO DOM ======
    let elements = {
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

    // ====== INICIALIZAÇÃO ======
    function init() {
        if (!validateScreen()) return;
        
        applyStyles();
        createPanel();
        setupEventListeners();
        loadConfiguration();
        updateQueueCounter();
    }

    function validateScreen() {
        const urlBase = game_data.link_base_pure + "main";
        if (!window.location.href.includes("screen=main")) {
            showRedirectDialog(urlBase);
            return false;
        }
        return true;
    }

    function showRedirectDialog(url) {
        Dialog.show('redirDialog', `
            <div style="font-size:12px; text-align:center;">
                <p>Você não está na tela de construções. Deseja ser redirecionado?</p>
                <div style="margin-top:10px;">
                    <button id="redirSim" class="btn btn-confirm-yes">Sim</button>
                    <button id="redirNao" class="btn btn-confirm-no">Não</button>
                </div>
            </div>
        `);
        
        $('#redirSim').on('click', () => window.location.href = url);
        $('#redirNao').on('click', Dialog.close);
    }

    // ====== ESTILOS ======
    function applyStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .twc-painel {
                background: ${CONFIG.panel.colors.background};
                border: 2px solid ${CONFIG.panel.colors.border};
                border-radius: 6px;
                font-family: Verdana, sans-serif;
                font-size: 13px;
                color: ${CONFIG.panel.colors.text};
                z-index: 999999;
                box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.7);
                position: fixed;
                top: ${CONFIG.panel.position.top}px;
                right: ${CONFIG.panel.position.right}px;
                width: ${CONFIG.panel.width}px;
                user-select: none;
            }
            
            .twc-cabecalho {
                background: linear-gradient(to bottom, ${CONFIG.panel.colors.header.gradient.join(', ')});
                border-bottom: 1px solid ${CONFIG.panel.colors.border};
                padding: 8px 12px;
                font-weight: bold;
                cursor: move;
                color: ${CONFIG.panel.colors.header.text};
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .twc-lista {
                list-style: none;
                padding: 6px 12px;
                margin: 0;
                max-height: 320px;
                overflow-y: auto;
                background: ${CONFIG.panel.colors.background};
            }
            
            .twc-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 6px 6px 6px 0;
                border-bottom: 1px solid #444;
                background: ${CONFIG.panel.colors.background};
                cursor: grab;
                font-weight: 600;
                font-size: 13px;
                color: ${CONFIG.panel.colors.text};
                transition: background-color 0.2s ease;
            }
            
            .twc-item:hover {
                background: #3a3a3a;
            }
            
            .twc-btn {
                font-size: 13px;
                padding: 4px 6px;
                border-radius: 4px;
                border: 1px solid ${CONFIG.panel.colors.border};
                background-color: ${CONFIG.panel.colors.button.background};
                color: ${CONFIG.panel.colors.text};
                cursor: pointer;
                font-weight: bold;
                transition: background-color 0.2s ease;
            }
            
            .twc-btn:hover {
                background-color: ${CONFIG.panel.colors.button.hover};
            }
            
            .twc-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            .twc-delay-select {
                padding: 4px 6px;
                border-radius: 4px;
                border: 1px solid ${CONFIG.panel.colors.border};
                font-size: 13px;
                background-color: ${CONFIG.panel.colors.button.background};
                color: ${CONFIG.panel.colors.text};
                cursor: pointer;
            }
            
            .twc-contador {
                font-size: 14px;
                font-weight: bold;
                margin: 6px 12px;
                text-align: center;
                color: #ffd700;
            }
            
            .twc-botoes {
                display: flex;
                gap: 8px;
                justify-content: center;
                margin: 12px;
            }
            
            .twc-flex {
                display: flex;
                gap: 8px;
                margin: 8px 12px;
            }
            
            .twc-flex-1 {
                flex: 1;
            }
        `;
        document.head.appendChild(style);
    }

    // ====== CRIAÇÃO DO PAINEL ======
    function createPanel() {
        elements.panel = document.createElement("div");
        elements.panel.className = "twc-painel";
        
        createHeader();
        createList();
        createControls();
        createCounters();
        createButtons();
        
        document.body.appendChild(elements.panel);
        setupDragAndDrop();
    }

    function createHeader() {
        const header = document.createElement("div");
        header.className = "twc-cabecalho";
        header.innerHTML = `
            <span>🏗️ Fila de Construção</span>
            <span style="cursor:pointer;" title="Fechar painel">✖</span>
        `;
        
        header.lastChild.onclick = closePanel;
        elements.panel.appendChild(header);
    }

    function createList() {
        elements.listContainer = document.createElement("ul");
        elements.listContainer.className = "twc-lista";
        
        Object.entries(BUILDINGS).forEach(([code, name]) => {
            const item = createListItem(code, name);
            elements.listContainer.appendChild(item);
            state.items.push(item);
        });
        
        elements.panel.appendChild(elements.listContainer);
    }

    function createListItem(code, name) {
        const li = document.createElement("li");
        li.className = "twc-item";
        li.dataset.code = code;
        
        const span = document.createElement("span");
        span.textContent = name;
        
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.onchange = handleCheckboxChange;
        
        li.append(span, checkbox);
        setupListItemDrag(li);
        
        return li;
    }

    function setupListItemDrag(item) {
        item.draggable = true;
        
        item.ondragstart = (e) => {
            e.dataTransfer.setData("text/plain", item.dataset.code);
            item.style.opacity = "0.5";
        };
        
        item.ondragend = () => item.style.opacity = "1";
        item.ondrop = handleItemDrop;
        item.ondragover = (e) => e.preventDefault();
    }

    function createControls() {
        const controlsWrapper = document.createElement("div");
        controlsWrapper.className = "twc-flex";
        
        // Botão Marcar/Desmarcar Todos
        elements.toggleAllBtn = document.createElement("button");
        elements.toggleAllBtn.className = "twc-btn twc-flex-1";
        elements.toggleAllBtn.textContent = "Marcar Todos";
        elements.toggleAllBtn.onclick = toggleAllItems;
        
        // Botão Salvar
        const saveBtn = document.createElement("button");
        saveBtn.className = "twc-btn twc-flex-1";
        saveBtn.textContent = "💾 Salvar";
        saveBtn.onclick = saveConfiguration;
        
        controlsWrapper.append(elements.toggleAllBtn, saveBtn);
        elements.panel.appendChild(controlsWrapper);
        
        // Seletor de delay
        const delayWrapper = document.createElement("div");
        delayWrapper.style.margin = "12px";
        delayWrapper.innerHTML = `<label style="font-weight:600;">Checar daqui a: </label>`;
        
        elements.delaySelect = document.createElement("select");
        elements.delaySelect.className = "twc-delay-select";
        
        CONFIG.delays.forEach(min => {
            const option = document.createElement("option");
            option.value = min * 60000;
            option.textContent = min === 0.5 ? "30 segundos" : `${min} minuto${min > 1 ? "s" : ""}`;
            elements.delaySelect.appendChild(option);
        });
        
        delayWrapper.appendChild(elements.delaySelect);
        elements.panel.appendChild(delayWrapper);
    }

    function createCounters() {
        elements.countdown = document.createElement("div");
        elements.countdown.className = "twc-contador";
        
        elements.queueCounter = document.createElement("div");
        elements.queueCounter.className = "twc-contador";
        
        elements.selectedCounter = document.createElement("div");
        elements.selectedCounter.className = "twc-contador";
        
        elements.panel.append(elements.countdown, elements.queueCounter, elements.selectedCounter);
    }

    function createButtons() {
        const buttonsWrapper = document.createElement("div");
        buttonsWrapper.className = "twc-botoes";
        
        elements.startBtn = document.createElement("button");
        elements.startBtn.className = "twc-btn";
        elements.startBtn.textContent = "▶️ Iniciar";
        elements.startBtn.onclick = startConstruction;
        
        elements.stopBtn = document.createElement("button");
        elements.stopBtn.className = "twc-btn";
        elements.stopBtn.textContent = "⏹️ Parar";
        elements.stopBtn.disabled = true;
        elements.stopBtn.onclick = stopConstruction;
        
        buttonsWrapper.append(elements.startBtn, elements.stopBtn);
        elements.panel.appendChild(buttonsWrapper);
    }

    // ====== MANIPULAÇÃO DE EVENTOS ======
    function setupEventListeners() {
        elements.delaySelect.onchange = handleDelayChange;
    }

    function handleCheckboxChange() {
        updateQueueCounter();
        saveConfiguration();
        updateToggleButtonText();
    }

    function handleItemDrop(e) {
        e.preventDefault();
        const draggedCode = e.dataTransfer.getData("text/plain");
        const targetCode = e.currentTarget.dataset.code;
        
        if (draggedCode === targetCode) return;
        
        const draggedItem = state.items.find(item => item.dataset.code === draggedCode);
        elements.listContainer.insertBefore(draggedItem, e.currentTarget);
        saveConfiguration();
    }

    function handleDelayChange() {
        if (!state.isRunning) return;
        
        clearInterval(state.intervalId);
        executeConstruction();
        state.intervalId = setInterval(executeConstruction, Number(elements.delaySelect.value));
        startCountdown();
    }

    // ====== LÓGICA DE CONSTRUÇÃO ======
    function executeConstruction() {
        if (getCurrentQueueCount() >= 5) {
            showNotification("⛔ Fila cheia. Aguardando...", "warning");
            return;
        }
        
        const queue = getOrderedQueue();
        if (!queue.length) {
            stopConstruction();
            return;
        }
        
        for (let code of queue) {
            const buildButton = findBuildButton(code);
            if (buildButton) {
                buildButton.click();
                showNotification(`✅ Construindo ${BUILDINGS[code]}!`, "success");
                break;
            }
        }
        
        updateQueueCounter();
    }

    function findBuildButton(code) {
        const buttons = document.querySelectorAll(`a.btn-build[id^='main_buildlink_${code}_']`);
        return Array.from(buttons).find(button => 
            button.offsetParent !== null && !button.classList.contains('disabled')
        );
    }

    function getCurrentQueueCount() {
        const cancelButtons = document.querySelectorAll("a.btn.btn-cancel");
        return Array.from(cancelButtons).filter(a => a.href.includes("action=cancel")).length;
    }

    function getOrderedQueue() {
        return Array.from(elements.listContainer.children)
            .filter(item => item.querySelector("input").checked)
            .map(item => item.dataset.code);
    }

    // ====== CONTROLES DE EXECUÇÃO ======
    function startConstruction() {
        if (state.isRunning) return;
        
        const queue = getOrderedQueue();
        if (!queue.length) {
            showNotification("Nenhum item marcado!", "error");
            return;
        }
        
        state.isRunning = true;
        elements.startBtn.disabled = true;
        elements.stopBtn.disabled = false;
        
        const delay = Number(elements.delaySelect.value);
        state.intervalId = setInterval(executeConstruction, delay);
        startCountdown();
        
        showNotification("Fila de construção iniciada!", "success");
    }

    function stopConstruction() {
        if (!state.isRunning) return;
        
        clearInterval(state.intervalId);
        clearInterval(state.countdownInterval);
        
        state.isRunning = false;
        elements.startBtn.disabled = false;
        elements.stopBtn.disabled = true;
        elements.countdown.textContent = "";
        
        showNotification("Fila de construção parada!", "error");
    }

    // ====== CONTADOR REGRESSIVO ======
    function startCountdown() {
        clearInterval(state.countdownInterval);
        state.timeRemaining = Number(elements.delaySelect.value);
        
        state.countdownInterval = setInterval(() => {
            state.timeRemaining -= 1000;
            
            if (state.timeRemaining <= 0) {
                state.timeRemaining = Number(elements.delaySelect.value);
            }
            
            elements.countdown.textContent = `⏳ Próxima checagem: ${Math.floor(state.timeRemaining/1000)}s`;
        }, 1000);
    }

    // ====== GERENCIAMENTO DE CONFIGURAÇÃO ======
    function saveConfiguration() {
        const config = {
            delay: elements.delaySelect.value,
            order: Array.from(elements.listContainer.children).map(item => item.dataset.code),
            selected: state.items.reduce((acc, item) => {
                acc[item.dataset.code] = item.querySelector("input").checked;
                return acc;
            }, {})
        };
        
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(config));
    }

    function loadConfiguration() {
        try {
            const saved = localStorage.getItem(CONFIG.storageKey);
            if (!saved) return;
            
            const config = JSON.parse(saved);
            
            if (config.order) {
                config.order.forEach(code => {
                    const item = state.items.find(i => i.dataset.code === code);
                    if (item) elements.listContainer.appendChild(item);
                });
            }
            
            if (config.selected) {
                state.items.forEach(item => {
                    item.querySelector("input").checked = !!config.selected[item.dataset.code];
                });
            }
            
            if (config.delay) {
                elements.delaySelect.value = config.delay;
            }
            
        } catch (error) {
            console.error("Erro ao carregar configuração:", error);
        }
        
        updateQueueCounter();
        updateToggleButtonText();
    }

    // ====== UTILITÁRIOS ======
    function updateQueueCounter() {
        const queueCount = getCurrentQueueCount();
        const selectedCount = state.items.filter(item => item.querySelector("input").checked).length;
        
        elements.queueCounter.textContent = `🏗️ Construções na fila: ${queueCount}`;
        elements.selectedCounter.textContent = `✅ Itens marcados: ${selectedCount}`;
    }

    function updateToggleButtonText() {
        const allChecked = state.items.every(item => item.querySelector("input").checked);
        elements.toggleAllBtn.textContent = allChecked ? "Desmarcar Todos" : "Marcar Todos";
    }

    function toggleAllItems() {
        const shouldCheck = state.items.some(item => !item.querySelector("input").checked);
        
        state.items.forEach(item => {
            item.querySelector("input").checked = shouldCheck;
        });
        
        updateQueueCounter();
        saveConfiguration();
        updateToggleButtonText();
    }

    function showNotification(message, type) {
        UI.InfoMessage(message, 2000, type);
    }

    function closePanel() {
        if (state.isRunning) {
            showNotification("❗ Pare a execução antes de fechar.", "warning");
            return;
        }
        
        stopConstruction();
        elements.panel.remove();
    }

    // ====== ARRASTAR PAINEL ======
    function setupDragAndDrop() {
        const header = elements.panel.querySelector(".twc-cabecalho");
        
        header.onmousedown = function(e) {
            if (e.target.tagName === 'SPAN' && e.target !== header.firstChild) return;
            
            e.preventDefault();
            
            const initialX = e.clientX - elements.panel.getBoundingClientRect().left;
            const initialY = e.clientY - elements.panel.getBoundingClientRect().top;
            
            function movePanel(pageX, pageY) {
                let newX = pageX - initialX;
                let newY = pageY - initialY;
                
                const maxX = window.innerWidth - elements.panel.offsetWidth;
                const maxY = window.innerHeight - elements.panel.offsetHeight;
                
                newX = Math.max(0, Math.min(newX, maxX));
                newY = Math.max(0, Math.min(newY, maxY));
                
                elements.panel.style.left = newX + "px";
                elements.panel.style.top = newY + "px";
                elements.panel.style.right = "auto";
            }
            
            function onMouseMove(e) {
                movePanel(e.pageX, e.pageY);
            }
            
            function onMouseUp() {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
            }
            
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        };
        
        header.ondragstart = () => false;
    }

    // ====== INICIAR APLICAÇÃO ======
    init();
})();
