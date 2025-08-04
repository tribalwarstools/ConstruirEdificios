(function () {
    const url = window.location.href;
    const urlBase = game_data.link_base_pure + "main";

    if (!url.includes("screen=main")) {
        Dialog.show('redirDialog', `
            <div style="font-size:12px; text-align:center;">
              <p>Você não está na tela de construções. Deseja ser redirecionado?</p>
              <div style="margin-top:10px;">
                <button id="redirSim" class="btn btn-confirm-yes">Sim</button>
                <button id="redirNao" class="btn btn-confirm-no">Não</button>
              </div>
            </div>
        `);

        $('#redirSim').on('click', () => {
            window.location.href = urlBase;
        });

        $('#redirNao').on('click', () => {
            Dialog.close();
        });

        return;
    }

    // [CÓDIGO COMPLETO INSERIDO AQUI – já incluso no seu post anterior. Omitido aqui por limitação de espaço.]
	
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

    const painel = document.createElement("div");
    painel.style = `
        position: fixed;
        top: 100px;
        right: 20px;
        width: 280px;
        background-color: #f3f1e5;
        border: 2px solid #8b7d6b;
        border-radius: 6px;
        box-shadow: 3px 3px 10px rgb(0 0 0 / 0.3);
        font-family: Tahoma, Verdana, Segoe, sans-serif;
        font-size: 13px;
        color: #3a2e1a;
        user-select: none;
        z-index: 999999;
    `;

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
    fechar.onclick = () => {
        if (executando) {
            alert("❗ O script está em execução. Pare a execução antes de fechar o painel.");
            return;
        }
        pararConstruir();
        painel.remove();
        removerEventosAntesDeUnload();
    };
    fechar.onmouseenter = () => fechar.style.color = "#c00";
    fechar.onmouseleave = () => fechar.style.color = "#6b4f2f";
    cabecalho.appendChild(fechar);
    painel.appendChild(cabecalho);

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
        chk.addEventListener("change", () => {
            atualizarContadorFila();
            salvarConfiguracao();
            atualizarTextoBotaoToggle();
        });

        li.appendChild(span);
        li.appendChild(chk);

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
            salvarConfiguracao();
        });

        return li;
    }

    for (const [cod, nome] of Object.entries(listaEdificios)) {
        const item = criarItem(cod, nome);
        listaContainer.appendChild(item);
        listaItens.push(item);
    }
    painel.appendChild(listaContainer);

    // Botão toggle Marcar/Desmarcar Todos
    const btnToggleMarcar = document.createElement("button");
    btnToggleMarcar.textContent = "Marcar Todos";
    btnToggleMarcar.className = "btn btn-confirm";
    btnToggleMarcar.style = `
        margin: 8px 12px 0 12px;
        width: calc(100% - 24px);
        font-weight: bold;
        cursor: pointer;
    `;

    function atualizarTextoBotaoToggle() {
        const algumDesmarcado = listaItens.some(li => !li.querySelector("input").checked);
        btnToggleMarcar.textContent = algumDesmarcado ? "Marcar Todos" : "Desmarcar Todos";
    }

    btnToggleMarcar.onclick = () => {
        const algumDesmarcado = listaItens.some(li => !li.querySelector("input").checked);
        if (algumDesmarcado) {
            listaItens.forEach(li => li.querySelector("input").checked = true);
        } else {
            listaItens.forEach(li => li.querySelector("input").checked = false);
        }
        atualizarContadorFila();
        salvarConfiguracao();
        atualizarTextoBotaoToggle();
    };

    painel.appendChild(btnToggleMarcar);

    // Delay selector
    const delayWrapper = document.createElement("div");
    delayWrapper.style = "margin: 12px 12px 0 12px; user-select: text;";
    const delayLabel = document.createElement("label");
    delayLabel.textContent = "Checar daqui a: ";
    delayLabel.style = "font-weight: 600; margin-right: 6px; color: #3a2e1a;";
    const delaySelect = document.createElement("select");
    delaySelect.style = `
        padding: 4px 6px;
        border-radius: 4px;
        border: 1px solid #a19171;
        font-size: 13px;
        cursor: pointer;
        background-color: #f3f1e5;
        color: #3a2e1a;
    `;
    const opcoesMinutos = [0.5, 1, 2, 3, 5, 10, 15, 30, 60];
    for (const min of opcoesMinutos) {
        const opt = document.createElement("option");
        opt.value = min * 60 * 1000;
        opt.textContent = min === 0.5 ? "30 segundos" : `${min} minuto${min > 1 ? "s" : ""}`;
        delaySelect.appendChild(opt);
    }
    delayWrapper.appendChild(delayLabel);
    delayWrapper.appendChild(delaySelect);
    const contadorRegressivo = document.createElement("div");
    contadorRegressivo.style = "text-align: center; font-weight: bold; margin-top: 6px; color: #3a2e1a;";
    delayWrapper.appendChild(contadorRegressivo);

    painel.appendChild(delayWrapper);

    // Botão salvar configuração
    const btnSalvarConfig = document.createElement("button");
    btnSalvarConfig.textContent = "💾 Salvar Configuração";
    btnSalvarConfig.className = "btn btn-info";
    btnSalvarConfig.style = `
        margin: 10px 12px;
        width: calc(100% - 24px);
        font-weight: bold;
        cursor: pointer;
    `;
    btnSalvarConfig.onclick = () => {
        salvarConfiguracao();
        UI.InfoMessage("Configuração salva com sucesso!", 2500, "success");
    };
    painel.appendChild(btnSalvarConfig);

    // Contadores
    const contadorRealFila = document.createElement("div");
    contadorRealFila.style = "margin: 6px 12px; font-weight: bold; text-align: center; color: #3a2e1a;";
    painel.appendChild(contadorRealFila);

    const contadorMarcados = document.createElement("div");
    contadorMarcados.style = "margin: 6px 12px; font-weight: bold; text-align: center; color: #3a2e1a;";
    painel.appendChild(contadorMarcados);

    function atualizarContadorFila() {
        const botoesCancelar = [...document.querySelectorAll("a.btn.btn-cancel")].filter(a => a.href.includes("action=cancel"));
        const contagemReal = botoesCancelar.length;
        const marcados = listaItens.filter(li => li.querySelector("input").checked).length;

        contadorRealFila.textContent = `🏗️ Construções na fila: ${contagemReal}`;
        contadorMarcados.textContent = `✅ Itens marcados: ${marcados}`;
    }

    const botoesWrapper = document.createElement("div");
    botoesWrapper.style = `
        display: flex;
        gap: 8px;
        justify-content: center;
        margin: 16px 12px 12px 12px;
    `;
    const btnIniciar = document.createElement("button");
    btnIniciar.textContent = "▶️ Iniciar";
    btnIniciar.className = "btn btn-confirm-yes";
    btnIniciar.style.flex = "1";

    const btnParar = document.createElement("button");
    btnParar.textContent = "⏹️ Parar";
    btnParar.className = "btn btn-confirm-no";
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
    const maxTentativasSemSucesso = 10;
    let tentativasSemSucesso = 0;

    // Função com a lógica do que será feito a cada intervalo
    function executarConstrucao() {
        const botoesCancelar = [...document.querySelectorAll("a.btn.btn-cancel")].filter(a => a.href.includes("action=cancel"));
        const filaCheia = botoesCancelar.length >= 5;
        if (filaCheia) {
		UI.InfoMessage("⛔ A fila de construção já possui 5 edifícios. Aguardando espaço...", 3000, "warning");
		return;
	}


        let construido = false;
        const filaAtualizada = obterFilaOrdenada();

        if(filaAtualizada.length === 0) {
            UI.InfoMessage("Nenhum edifício marcado para construir. Parando execução.", 3000, "warning");
            pararConstruir();
            return;
        }

        for (let cod of filaAtualizada) {
            const botoes = [...document.querySelectorAll(`a.btn-build[id^='main_buildlink_${cod}_']`)]
                .filter(b => b.offsetParent !== null && !b.classList.contains('disabled'));

            const botao = botoes[0];
            if (botao) {
                botao.click();
                UI.InfoMessage(`✅ Construção de "${listaEdificios[cod]}" iniciada!`, 3000, "success");
                construido = true;
                tentativasSemSucesso = 0;
                break;
            }
        }

        if (!construido) {
            tentativasSemSucesso++;
            UI.InfoMessage(`⚠️ Tentativa ${tentativasSemSucesso} sem sucesso de construir.`, 2000, "warning");
            if (tentativasSemSucesso >= maxTentativasSemSucesso) {
                UI.InfoMessage("Nenhum edifício disponível para construir. Continuando tentativas...", 4000, "warning");
            }
        }

        atualizarContadorFila();
    }

    function iniciarExecucao() {
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
        tentativasSemSucesso = 0;

        intervaloConstrucao = setInterval(executarConstrucao, Number(delaySelect.value) || 60000);
        atualizarContadorFila();
        iniciarContadorRegressivo();
        window.addEventListener("beforeunload", onBeforeUnload);
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
        removerEventosAntesDeUnload();
        clearInterval(intervaloRegressivo);
        tempoRestante = 0;
        atualizarContador();
        atualizarContadorFila();
    }

    btnIniciar.onclick = iniciarExecucao;
    btnParar.onclick = pararConstruir;

    function onBeforeUnload(event) {
        if (executando) {
            event.preventDefault();
            event.returnValue = "⚠️ O script está em execução. Tem certeza que deseja sair e interromper a construção?";
            return event.returnValue;
        }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    function removerEventosAntesDeUnload() {
        window.removeEventListener("beforeunload", onBeforeUnload);
    }

    cabecalho.onmousedown = function (e) {
        e.preventDefault();
        let shiftX = e.clientX - painel.getBoundingClientRect().left;
        let shiftY = e.clientY - painel.getBoundingClientRect().top;

        function moveAt(pageX, pageY) {
            let newX = pageX - shiftX;
            let newY = pageY - shiftY;
            const maxX = window.innerWidth - painel.offsetWidth;
            const maxY = window.innerHeight - painel.offsetHeight;
            newX = Math.min(Math.max(0, newX), maxX);
            newY = Math.min(Math.max(0, newY), maxY);
            painel.style.left = newX + "px";
            painel.style.top = newY + "px";
            painel.style.right = "auto";
        }

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }

        document.addEventListener("mousemove", onMouseMove);
        document.onmouseup = function () {
            document.removeEventListener("mousemove", onMouseMove);
            document.onmouseup = null;
        };
    };
    cabecalho.ondragstart = () => false;

    // Funções para salvar e carregar configuração no localStorage
    function salvarConfiguracao() {
        const config = {
            delay: delaySelect.value,
            ordem: Array.from(listaContainer.children).map(li => li.dataset.cod),
            selecionados: listaItens.reduce((acc, li) => {
                acc[li.dataset.cod] = li.querySelector("input").checked;
                return acc;
            }, {})
        };
        localStorage.setItem("filaConstrucaoConfig", JSON.stringify(config));
    }

    function carregarConfiguracao() {
        const configStr = localStorage.getItem("filaConstrucaoConfig");
        if (!configStr) return;

        try {
            const config = JSON.parse(configStr);

            if (config.ordem && Array.isArray(config.ordem)) {
                config.ordem.forEach(cod => {
                    const li = listaItens.find(li => li.dataset.cod === cod);
                    if (li) listaContainer.appendChild(li);
                });
            }

            if (config.selecionados) {
                listaItens.forEach(li => {
                    li.querySelector("input").checked = !!config.selecionados[li.dataset.cod];
                });
            }

            if (config.delay) {
                delaySelect.value = config.delay;
            }

            atualizarContadorFila();
            atualizarTextoBotaoToggle();
        } catch (e) {
            console.error("Erro ao carregar configuração da fila de construção:", e);
        }
    }

    let tempoRestante = Number(delaySelect.value) || 60000;
    let intervaloRegressivo = null;

    function iniciarContadorRegressivo() {
        clearInterval(intervaloRegressivo);
        tempoRestante = Number(delaySelect.value);
        atualizarContador();
        intervaloRegressivo = setInterval(() => {
            tempoRestante -= 1000;
            if (tempoRestante <= 0) {
                tempoRestante = Number(delaySelect.value); // reinicia o contador
            }
            atualizarContador();
        }, 1000);
    }

    function atualizarContador() {
        const segundos = Math.max(0, Math.floor(tempoRestante / 1000));
        contadorRegressivo.textContent = `⏳ Próxima checagem em: ${segundos}s`;
    }
	
    // Mantenha todo o conteúdo que você já postou acima normalmente...

    delaySelect.addEventListener("change", () => {
        if (executando) {
            clearInterval(intervaloConstrucao); // Encerra o intervalo atual

            const novoDelay = Number(delaySelect.value);

            // Executa imediatamente uma tentativa de construção
            executarConstrucao();

            // Inicia novo intervalo com novo delay
            intervaloConstrucao = setInterval(() => {
                executarConstrucao();
            }, novoDelay);

            // Reinicia o cronômetro visual
            iniciarContadorRegressivo();
        }
    });

    carregarConfiguracao();
})();
