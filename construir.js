(function () {
    if (!window.location.href.includes("screen=main")) {
        UI.InfoMessage("Abra a tela de construções (screen=main) para usar o script.", 3000, "error");
        return;
    }

    const listaEdificios = {
        main: "Edifício Principal",
        barracks: "Quartel",
        stable: "Estábulo",
        garage: "Oficina",
        watchtower: "Torre de Vigia",
        smith: "Ferreiro",
        place: "Praça de Reunião",
        statue: "Estátua",
        market: "Mercado",
        wood: "Bosque",
        stone: "Poço de Argila",
        iron: "Mina de Ferro",
        farm: "Fazenda",
        storage: "Armazém",
        hide: "Esconderijo",
        wall: "Muralha",
        snob: "Academia"
    };

    // --- Criar painel principal ---
    const painel = document.createElement("div");
    painel.style.position = "fixed";
    painel.style.top = "100px";
    painel.style.left = (window.innerWidth - 300) + "px"; // posição inicial à direita
    painel.style.width = "280px";
    painel.style.backgroundColor = "#f3f1e5";
    painel.style.border = "2px solid #8b7d6b";
    painel.style.borderRadius = "6px";
    painel.style.boxShadow = "3px 3px 10px rgba(0,0,0,0.3)";
    painel.style.fontFamily = "Tahoma, Verdana, Segoe, sans-serif";
    painel.style.fontSize = "13px";
    painel.style.color = "#3a2e1a";
    painel.style.userSelect = "none";
    painel.style.zIndex = "999999";
    painel.style.right = "auto";
    painel.style.bottom = "auto";

    // Cabeçalho arrastável
    const cabecalho = document.createElement("div");
    cabecalho.style = `
        background: linear-gradient(to bottom, #d3c9a1, #a8976f);
        border-bottom: 1px solid #8b7d6b;
        padding: 8px 12px;
        font-weight: bold;
        cursor: move;
        user-select: text;
        color: #3a2e1a;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;

    const titulo = document.createElement("span");
    titulo.textContent = "🏗️ Fila de Construção";
    titulo.style.fontSize = "14px";
    cabecalho.appendChild(titulo);

    // Botão fechar
    const fechar = document.createElement("span");
    fechar.textContent = "✖";
    fechar.title = "Fechar painel";
    fechar.style = `
        cursor: pointer;
        font-weight: bold;
        font-size: 16px;
        color: #6b4f2f;
        user-select: none;
    `;
    fechar.onmouseenter = () => fechar.style.color = "#c00";
    fechar.onmouseleave = () => fechar.style.color = "#6b4f2f";
    fechar.onclick = () => {
        pararConstruir();
        painel.remove();
    };
    cabecalho.appendChild(fechar);

    painel.appendChild(cabecalho);

    // Lista de itens (ul)
    const listaContainer = document.createElement("ul");
    listaContainer.style = `
        list-style: none;
        padding: 6px 12px;
        margin: 0;
        max-height: 320px;
        overflow-y: auto;
        background: #fbf8f0;
    `;

    const listaItens = [];

    function criarItem(cod, nome) {
        const li = document.createElement("li");
        li.draggable = true;
        li.style = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 6px 6px 6px 0;
            border-bottom: 1px solid #d1c7a1;
            background: #fdfaf1;
            cursor: grab;
            user-select: none;
            font-weight: 600;
            font-size: 13px;
            color: #3a2e1a;
        `;
        li.dataset.cod = cod;

        const span = document.createElement("span");
        span.textContent = nome;
        span.style.flexGrow = "1";
        span.style.userSelect = "text";

        const chk = document.createElement("input");
        chk.type = "checkbox";
        chk.checked = false;
        chk.style.marginLeft = "10px";
        chk.title = "Selecionar para construção";

        li.appendChild(span);
        li.appendChild(chk);

        // Drag'n'drop events
        li.addEventListener("dragstart", e => {
            e.dataTransfer.setData("text/plain", cod);
            li.style.opacity = "0.5";
        });
        li.addEventListener("dragend", e => {
            li.style.opacity = "1";
        });
        li.addEventListener("dragover", e => {
            e.preventDefault();
            li.style.borderColor = "#3a2e1a";
            li.style.background = "#f7f1d1";
        });
        li.addEventListener("dragleave", e => {
            li.style.borderColor = "#d1c7a1";
            li.style.background = "#fdfaf1";
        });
        li.addEventListener("drop", e => {
            e.preventDefault();
            const draggedCod = e.dataTransfer.getData("text/plain");
            if (draggedCod === cod) return;

            const draggedEl = listaItens.find(item => item.dataset.cod === draggedCod);
            listaContainer.insertBefore(draggedEl, li);
            li.style.borderColor = "#d1c7a1";
            li.style.background = "#fdfaf1";
        });

        return li;
    }

    for (const [cod, nome] of Object.entries(listaEdificios)) {
        const item = criarItem(cod, nome);
        listaContainer.appendChild(item);
        listaItens.push(item);
    }
    painel.appendChild(listaContainer);

    // Delay select
    const delayWrapper = document.createElement("div");
    delayWrapper.style = "margin: 12px 12px 0 12px; user-select: text;";

    const delayLabel = document.createElement("label");
    delayLabel.textContent = "Checar daqui a: ";
    delayLabel.htmlFor = "delaySelect";
    delayLabel.style = "font-weight: 600; margin-right: 6px; color: #3a2e1a;";

    const delaySelect = document.createElement("select");
    delaySelect.id = "delaySelect";
    delaySelect.title = "Intervalo entre tentativas de construção";
    delaySelect.style = `
        padding: 4px 6px;
        border-radius: 4px;
        border: 1px solid #a19171;
        font-size: 13px;
        cursor: pointer;
        background-color: #f3f1e5;
        color: #3a2e1a;
    `;

    const opcoesMinutos = [0.5, 1, 2, 3, 5, 10];
    for (const min of opcoesMinutos) {
        const opt = document.createElement("option");
        opt.value = min * 60 * 1000;
        opt.textContent = min === 0.5 ? "30 segundos" : `${min} minuto${min > 1 ? "s" : ""}`;
        delaySelect.appendChild(opt);
    }
    delaySelect.value = 60000;

    delayWrapper.appendChild(delayLabel);
    delayWrapper.appendChild(delaySelect);
    painel.appendChild(delayWrapper);

    // Botões container
    const botoesWrapper = document.createElement("div");
    botoesWrapper.style = `
        display: flex;
        gap: 8px;
        justify-content: center;
        margin: 16px 12px 12px 12px;
    `;

    const btnIniciar = document.createElement("button");
    btnIniciar.textContent = "▶️ Iniciar Construção";
    btnIniciar.className = "btn btn-confirm";
    btnIniciar.style.flex = "1";

    const btnParar = document.createElement("button");
    btnParar.textContent = "⏹️ Parar";
    btnParar.className = "btn btn-cancel";
    btnParar.style.flex = "1";

    btnParar.disabled = true;
    btnParar.style.opacity = "0.6";
    btnParar.style.cursor = "not-allowed";

    botoesWrapper.appendChild(btnIniciar);
    botoesWrapper.appendChild(btnParar);
    painel.appendChild(botoesWrapper);

    document.body.appendChild(painel);

    function obterFilaOrdenada() {
        const fila = [];
        for (const li of listaContainer.children) {
            const chk = li.querySelector("input[type=checkbox]");
            if (chk.checked) {
                fila.push(li.dataset.cod);
            }
        }
        return fila;
    }

    let intervaloConstrucao = null;
    let executando = false;

    function construirFila() {
        if (executando) return;

        const fila = obterFilaOrdenada();

        if (fila.length === 0) {
            UI.InfoMessage("Nenhum edifício marcado para construir.", 3000, "error");
            return;
        }

        btnIniciar.disabled = true;
        btnParar.disabled = false;
        btnParar.style.opacity = "1";
        btnParar.style.cursor = "pointer";
        executando = true;

        let tentativasSemSucesso = 0;
        const maxTentativasSemSucesso = 3;

        intervaloConstrucao = setInterval(() => {
            const filaLivre = !document.querySelector("#buildqueue .buildorder");
            if (!filaLivre) {
                tentativasSemSucesso = 0;
                return;
            }

            let construidoNesteCiclo = false;

            for (let cod of fila) {
                const botoes = [...document.querySelectorAll(`a[id^='main_buildlink_${cod}_']`)];

                const botao = botoes.find(b => b.offsetParent !== null && !b.classList.contains('disabled'));

                if (botao) {
                    botao.click();
                    UI.InfoMessage(`✅ Construção de "${listaEdificios[cod]}" iniciada!`, 3000, "success");
                    construidoNesteCiclo = true;
                    tentativasSemSucesso = 0;
                    break;
                }
            }

            if (!construidoNesteCiclo) {
                tentativasSemSucesso++;
                if (tentativasSemSucesso >= maxTentativasSemSucesso) {
                    UI.InfoMessage("Nenhum edifício disponível para construir. Parando execução.", 4000, "warning");
                    pararConstruir();
                }
            }
        }, Number(delaySelect.value) || 60000);
    }

    function pararConstruir() {
        if (intervaloConstrucao) {
            clearInterval(intervaloConstrucao);
            intervaloConstrucao = null;
        }
        executando = false;
        btnIniciar.disabled = false;
        btnParar.disabled = true;
        btnParar.style.opacity = "0.6";
        btnParar.style.cursor = "not-allowed";
        UI.InfoMessage("⏹️ Execução da fila de construção encerrada.", 3000, "info");
    }

    btnIniciar.onclick = construirFila;
    btnParar.onclick = pararConstruir;

    // ARRASTAR: correção usando clientX/clientY e remover listeners apropriadamente
    cabecalho.onmousedown = function (e) {
        e.preventDefault();

        const painelRect = painel.getBoundingClientRect();
        const shiftX = e.clientX - painelRect.left;
        const shiftY = e.clientY - painelRect.top;

        function onMouseMove(event) {
            let newX = event.clientX - shiftX;
            let newY = event.clientY - shiftY;

            // Limitar dentro da viewport
            const maxX = window.innerWidth - painel.offsetWidth;
            const maxY = window.innerHeight - painel.offsetHeight;

            newX = Math.min(Math.max(0, newX), maxX);
            newY = Math.min(Math.max(0, newY), maxY);

            painel.style.left = newX + "px";
            painel.style.top = newY + "px";
            painel.style.right = "auto";
            painel.style.bottom = "auto";
        }

        function onMouseUp() {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        }

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };

    // Desabilitar drag nativo do cabeçalho para evitar conflitos
    cabecalho.ondragstart = () => false;
})();
