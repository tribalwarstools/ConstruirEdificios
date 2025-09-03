(function () {
    // ====== NOVO CSS PADRÃO RECOLHÍVEL À DIREITA ======
    function aplicarEstiloPainelConstrucao() {
        const style = document.createElement('style');
        style.textContent = `
            .twc-painel {
                background: #2e2e2e;
                border: 2px solid #b79755;
                border-radius: 6px;
                font-family: Verdana, sans-serif;
                font-size: 13px;
                color: #f5deb3;
                z-index: 999999;
                box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.7);
                position: fixed;
                top: 100px;
                right: -300px; /* escondido à direita */
                width: 280px;
                user-select: none;
                transition: right 0.3s ease-in-out;
            }
            .twc-painel.ativo { right: 20px; } /* visível */
            .twc-cabecalho {
                background: linear-gradient(to bottom, #3a3a3a, #1e1e1e);
                border-bottom: 1px solid #b79755;
                padding: 8px 12px;
                font-weight: bold;
                color: #f0e2b6;
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
                background: #2e2e2e;
            }
            .twc-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 6px 6px 6px 0;
                border-bottom: 1px solid #444;
                background: #2e2e2e;
                cursor: pointer;
                font-weight: 600;
                font-size: 13px;
                color: #f5deb3;
            }
            .twc-item:hover { background: #3a3a3a; }
            .twc-btn {
                font-size: 13px;
                padding: 4px 6px;
                margin-top: 6px;
                border-radius: 4px;
                border: 1px solid #b79755;
                background-color: #1c1c1c;
                color: #f5deb3;
                cursor: pointer;
                width: 100%;
                font-weight: bold;
            }
            .twc-btn:hover { background-color: #3a3a3a; }
            .twc-delay-select {
                padding: 4px 6px;
                border-radius: 4px;
                border: 1px solid #b79755;
                font-size: 13px;
                background-color: #1c1c1c;
                color: #f5deb3;
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
            .twc-toggle {
                position: absolute;
                top: 0;
                left: -28px;
                width: 28px;
                height: 40px;
                background: #5c4023;
                border: 2px solid #b79755;
                border-right: none;
                border-radius: 6px 0 0 6px;
                color: #f5deb3;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 16px;
                box-shadow: -2px 2px 6px #000;
            }
        `;
        document.head.appendChild(style);
    }
    aplicarEstiloPainelConstrucao();

    // ====== Criação do painel ======
    const painel = document.createElement("div");
    painel.className = "twc-painel";

    // Toggle para recolher/expandir
    const toggle = document.createElement("div");
    toggle.className = "twc-toggle";
    toggle.title = "Abrir/Fechar painel";
    toggle.textContent = "🏗️";
    toggle.onclick = () => painel.classList.toggle("ativo");
    painel.appendChild(toggle);

    const cabecalho = document.createElement("div");
    cabecalho.className = "twc-cabecalho";
    cabecalho.innerHTML = `<span>Fila de Construção</span><span style="cursor:pointer;" title="Fechar painel">✖</span>`;
    cabecalho.lastChild.onclick = () => {
        if (executando) { alert("❗ Pare a execução antes de fechar."); return; }
        pararConstruir();
        painel.remove();
    };
    painel.appendChild(cabecalho);

    const listaContainer = document.createElement("ul");
    listaContainer.className = "twc-lista";
    painel.appendChild(listaContainer);

    const listaEdificios = {
        main: "Edifício Principal", barracks: "Quartel", stable: "Estábulo", garage: "Oficina",
        watchtower: "Torre de Vigia", smith: "Ferreiro", place: "Praça de Reunião", statue: "Estátua",
        market: "Mercado", wood: "Bosque", stone: "Poço de Argila", iron: "Mina de Ferro",
        farm: "Fazenda", storage: "Armazém", hide: "Esconderijo", wall: "Muralha", snob: "Academia"
    };

    const listaItens = [];
    function criarItem(cod, nome) {
        const li = document.createElement("li");
        li.className = "twc-item";
        li.dataset.cod = cod;
        const span = document.createElement("span");
        span.textContent = nome;
        const chk = document.createElement("input");
        chk.type = "checkbox";
        chk.onchange = () => { atualizarContadorFila(); salvarConfiguracao(); atualizarTextoBotaoToggle(); };
        li.append(span, chk);
        listaItens.push(li);
        return li;
    }
    for (const [cod, nome] of Object.entries(listaEdificios)) {
        listaContainer.appendChild(criarItem(cod, nome));
    }

    // Botões topo: Marcar Todos / Salvar
    const botoesTopoWrapper = document.createElement("div");
    botoesTopoWrapper.style = "display:flex; gap:8px; margin:8px 12px 0 12px;";
    const btnToggleMarcar = document.createElement("button");
    btnToggleMarcar.className = "twc-btn";
    btnToggleMarcar.style.flex = "1";
    btnToggleMarcar.textContent = "Marcar Todos";
    btnToggleMarcar.onclick = () => {
        const marcar = listaItens.some(li => !li.querySelector("input").checked);
        listaItens.forEach(li => li.querySelector("input").checked = marcar);
        atualizarContadorFila();
        salvarConfiguracao();
        atualizarTextoBotaoToggle();
    };
    function atualizarTextoBotaoToggle() {
        btnToggleMarcar.textContent = listaItens.some(li => !li.querySelector("input").checked) ? "Marcar Todos" : "Desmarcar Todos";
    }
    const btnSalvarConfig = document.createElement("button");
    btnSalvarConfig.className = "twc-btn";
    btnSalvarConfig.style.flex = "1";
    btnSalvarConfig.textContent = "💾 Salvar";
    btnSalvarConfig.onclick = () => {
        salvarConfiguracao();
        UI.InfoMessage("Configuração salva!", 2000, "success");
    };
    botoesTopoWrapper.append(btnToggleMarcar, btnSalvarConfig);
    painel.appendChild(botoesTopoWrapper);

    // Delay e contadores
    const delayWrapper = document.createElement("div");
    delayWrapper.style = "margin:12px;";
    delayWrapper.innerHTML = `<label style="font-weight:600;">Checar daqui a: </label>`;
    const delaySelect = document.createElement("select");
    delaySelect.className = "twc-delay-select";
    [0.5,1,2,3,5,10,15,30,60].forEach(min => {
        const opt = document.createElement("option");
        opt.value = min*60000;
        opt.textContent = min===0.5?"30 segundos":`${min} minuto${min>1?'s':''}`;
        delaySelect.appendChild(opt);
    });
    delayWrapper.appendChild(delaySelect);
    const contadorRegressivo = document.createElement("div");
    contadorRegressivo.className = "twc-contador";
    delayWrapper.appendChild(contadorRegressivo);
    painel.appendChild(delayWrapper);

    const contadorRealFila = document.createElement("div");
    contadorRealFila.className = "twc-contador";
    painel.appendChild(contadorRealFila);
    const contadorMarcados = document.createElement("div");
    contadorMarcados.className = "twc-contador";
    painel.appendChild(contadorMarcados);

    const botoesWrapper = document.createElement("div");
    botoesWrapper.className = "twc-botoes";
    const btnIniciar = document.createElement("button");
    btnIniciar.className = "twc-btn";
    btnIniciar.textContent = "▶️ Iniciar";
    const btnParar = document.createElement("button");
    btnParar.className = "twc-btn";
    btnParar.textContent = "⏹️ Parar";
    btnParar.disabled = true;
    botoesWrapper.append(btnIniciar, btnParar);
    painel.appendChild(botoesWrapper);

    document.body.appendChild(painel);

    // ===== Funções de execução =====
    function atualizarContadorFila() {
        const fila = [...document.querySelectorAll("a.btn.btn-cancel")].filter(a=>a.href.includes("action=cancel")).length;
        contadorRealFila.textContent = `🏗️ Construções na fila: ${fila}`;
        contadorMarcados.textContent = `✅ Itens marcados: ${listaItens.filter(li=>li.querySelector("input").checked).length}`;
    }
    function obterFilaOrdenada() { return [...listaContainer.children].filter(li=>li.querySelector("input").checked).map(li=>li.dataset.cod); }

    let intervaloConstrucao = null, executando = false, intervaloRegressivo = null, tempoRestante = 0;
    function executarConstrucao() {
        if ([...document.querySelectorAll("a.btn.btn-cancel")].filter(a=>a.href.includes("action=cancel")).length>=5) { UI.InfoMessage("⛔ Fila cheia. Aguardando...",2000,"warning"); return; }
        const fila = obterFilaOrdenada();
        if (!fila.length) { pararConstruir(); return; }
        for (let cod of fila) {
            const botao = [...document.querySelectorAll(`a.btn-build[id^='main_buildlink_${cod}_']`)].find(b=>b.offsetParent!==null&&!b.classList.contains('disabled'));
            if(botao){ botao.click(); UI.InfoMessage(`✅ Construindo ${listaEdificios[cod]}!`,2000,"success"); break; }
        }
        atualizarContadorFila();
    }
    function iniciarExecucao() {
        if(executando) return;
        if(!obterFilaOrdenada().length) return UI.InfoMessage("Nenhum marcado!",2000,"error");
        executando=true; btnIniciar.disabled=true; btnParar.disabled=false;
        intervaloConstrucao=setInterval(executarConstrucao, Number(delaySelect.value));
        iniciarContadorRegressivo();
        UI.InfoMessage("Fila de construção iniciada!",2000,"success");
    }
    function pararConstruir() {
        clearInterval(intervaloConstrucao);
        executando=false; btnIniciar.disabled=false; btnParar.disabled=true;
        clearInterval(intervaloRegressivo);
        UI.InfoMessage("Fila de construção parada!",2000,"error");
    }
    function iniciarContadorRegressivo() {
        clearInterval(intervaloRegressivo);
        tempoRestante=Number(delaySelect.value);
        intervaloRegressivo=setInterval(()=>{
            tempoRestante-=1000;
            if(tempoRestante<=0) tempoRestante=Number(delaySelect.value);
            contadorRegressivo.textContent=`⏳ Próxima checagem: ${Math.floor(tempoRestante/1000)}s`;
        },1000);
    }
    function salvarConfiguracao() {
        localStorage.setItem("filaConstrucaoConfig",JSON.stringify({
            delay:delaySelect.value,
            ordem:[...listaContainer.children].map(li=>li.dataset.cod),
            selecionados: listaItens.reduce((a,li)=>{a[li.dataset.cod]=li.querySelector("input").checked; return a;}, {})
        }));
    }
    function carregarConfiguracao() {
        const config = JSON.parse(localStorage.getItem("filaConstrucaoConfig")||"{}");
        if(config.ordem) config.ordem.forEach(cod=>{ const li=listaItens.find(i=>i.dataset.cod===cod); if(li) listaContainer.appendChild(li); });
        if(config.selecionados) listaItens.forEach(li=>li.querySelector("input").checked=!!config.selecionados[li.dataset.cod]);
        if(config.delay) delaySelect.value=config.delay;
        atualizarContadorFila();
        atualizarTextoBotaoToggle();
    }
    btnIniciar.onclick=iniciarExecucao;
    btnParar.onclick=pararConstruir;
    delaySelect.onchange=()=>{
        if(executando){ clearInterval(intervaloConstrucao); executarConstrucao(); intervaloConstrucao=setInterval(executarConstrucao, Number(delaySelect.value)); iniciarContadorRegressivo(); }
    };
    carregarConfiguracao();

})();
