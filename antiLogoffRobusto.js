(function() {
  // Cria estilo CSS
  const style = document.createElement('style');
  style.textContent = `
    #twAutoLabelPanel {
      position: fixed;
      bottom: 40px;
      left: 20px;
      right: auto;
      background: #2e2e2e;
      border: 2px solid #b79755;
      border-radius: 6px;
      padding: 10px 15px;
      font-family: "Tahoma", sans-serif;
      font-size: 14px;
      color: #f0e6d2;
      box-shadow: 0 0 8px rgba(0,0,0,0.8);
      z-index: 99999;
      width: 180px;
      user-select: none;
      text-align: center;
    }
    #twAutoLabelPanel h4 {
      margin: 0 0 8px 0;
      font-weight: bold;
      color: #d4b35d;
      cursor: move;
      user-select: none;
    }
    #twAutoLabelPanel button {
      background: #b79755;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      color: #2e2e2e;
      font-weight: bold;
      width: 100%;
      transition: background 0.3s ease;
      margin-top: 6px;
    }
    #twAutoLabelPanel button:hover:not(:disabled) {
      background: #d4b35d;
    }
    #twAutoLabelPanel button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    #twAutoLabelPanel .status {
      margin-top: 6px;
      font-weight: bold;
    }
    #twCountdown {
      margin-top: 4px;
      font-size: 12px;
      color: #aaa;
    }
    /* Efeito piscante anti-logoff */
    .anti-logoff-blink {
      animation: blinkAnim 0.3s ease;
    }
    @keyframes blinkAnim {
      0% { background-color: inherit; }
      50% { background-color: #d4b35d; }
      100% { background-color: inherit; }
    }
  `;
  document.head.appendChild(style);

  // Cria painel flutuante
  const painel = document.createElement('div');
  painel.id = 'twAutoLabelPanel';

  painel.innerHTML = `
    <h4 id="painelTitulo">Anti-Logoff Robusto</h4>
    <button id="btnIniciar">Iniciar</button>
    <button id="btnParar" disabled>Parar</button>
    <div id="status" class="status">Inativo 🔴</div>
    <div id="twCountdown"></div>
  `;

  document.body.appendChild(painel);

  // Funções do anti-logoff
  function iniciarAntiLogoffRobusto() {
    if (window.antiLogoffRobustoAtivo) {
      console.log("✅ Anti-logoff já está ativo.");
      return;
    }
    window.antiLogoffRobustoAtivo = true;
    console.log("🛡️ Anti-logoff robusto ativado.");

    let contador = 0;
    const intervalo = 4 * 60 * 1000; // 4 minutos

    const acoes = [
      () => { document.title = document.title; },
      () => { document.body.dispatchEvent(new MouseEvent('mousemove', { bubbles: true })); },
      () => {
        document.body.classList.toggle('anti-logoff-blink');
        setTimeout(() => document.body.classList.remove('anti-logoff-blink'), 100);
      },
      () => { fetch('/game.php').then(() => {}).catch(() => {}); }
    ];

    window.antiLogoffIntervalo = setInterval(() => {
      const acao = acoes[contador % acoes.length];
      try {
        acao();
        console.log(`💤 Mantendo ativo... [Ação ${contador + 1}]`);
        atualizarContador(intervalo / 1000);
      } catch (e) {
        console.warn("⚠️ Erro na ação anti-logoff:", e);
      }
      contador++;
    }, intervalo);

    iniciarCountdown(intervalo);
  }

  function desativarAntiLogoff() {
    clearInterval(window.antiLogoffIntervalo);
    window.antiLogoffRobustoAtivo = false;
    console.log("❌ Anti-logoff desativado.");
    stopCountdown();
  }

  // Atualiza o texto e estado dos botões
  function atualizarStatus() {
    const statusEl = painel.querySelector('#status');
    const btnIniciar = painel.querySelector('#btnIniciar');
    const btnParar = painel.querySelector('#btnParar');

    if (window.antiLogoffRobustoAtivo) {
      statusEl.textContent = "Ativo 🟢";
      statusEl.style.color = "#0f0";

      btnIniciar.disabled = true;
      btnParar.disabled = false;
    } else {
      statusEl.textContent = "Inativo 🔴";
      statusEl.style.color = "#f33";

      btnIniciar.disabled = false;
      btnParar.disabled = true;
    }
  }

  // Contador regressivo visual (opcional)
  let countdownInterval = null;
  let tempoRestante = 0;
  const countdownEl = painel.querySelector('#twCountdown');

  function iniciarCountdown(tempoTotal) {
    tempoRestante = tempoTotal;
    atualizarContador(tempoRestante);
    countdownInterval = setInterval(() => {
      tempoRestante--;
      if (tempoRestante <= 0) {
        tempoRestante = 0;
      }
      atualizarContador(tempoRestante);
    }, 1000);
  }

  function atualizarContador(segundos) {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    countdownEl.textContent = `Próxima ação em: ${min}:${seg.toString().padStart(2, '0')}`;
  }

  function stopCountdown() {
    clearInterval(countdownInterval);
    countdownEl.textContent = '';
  }

  // Eventos dos botões
  const btnIniciar = painel.querySelector('#btnIniciar');
  const btnParar = painel.querySelector('#btnParar');

  btnIniciar.addEventListener('click', () => {
    iniciarAntiLogoffRobusto();
    atualizarStatus();
  });

  btnParar.addEventListener('click', () => {
    desativarAntiLogoff();
    atualizarStatus();
  });

  // Hover já estilizado no CSS, mas se quiser pode melhorar via JS também

  // Drag para mover o painel pelo título
  const painelTitulo = painel.querySelector('#painelTitulo');
  let offsetX, offsetY, isDragging = false;

  painelTitulo.addEventListener('mousedown', (e) => {
    isDragging = true;
    const rect = painel.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    painel.style.transition = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    let left = e.clientX - offsetX;
    let top = e.clientY - offsetY;

    const maxLeft = window.innerWidth - painel.offsetWidth;
    const maxTop = window.innerHeight - painel.offsetHeight;
    if (left < 0) left = 0;
    if (top < 0) top = 0;
    if (left > maxLeft) left = maxLeft;
    if (top > maxTop) top = maxTop;

    painel.style.left = left + 'px';
    painel.style.top = top + 'px';
    painel.style.right = 'auto';
    painel.style.bottom = 'auto';
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      painel.style.transition = '';
    }
  });

  // Controle global para console
  window.iniciarAntiLogoffRobusto = iniciarAntiLogoffRobusto;
  window.desativarAntiLogoff = desativarAntiLogoff;

  // Atualiza status inicial
  atualizarStatus();
})();
