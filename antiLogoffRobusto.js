(function() {
  // Cria painel flutuante
  const painel = document.createElement('div');
  painel.style.position = 'fixed';
  painel.style.bottom = '20px';
  painel.style.right = '20px';
  painel.style.background = '#222';
  painel.style.color = '#eee';
  painel.style.padding = '10px 15px';
  painel.style.borderRadius = '8px';
  painel.style.boxShadow = '0 0 10px rgba(0,0,0,0.7)';
  painel.style.fontFamily = 'Arial, sans-serif';
  painel.style.zIndex = 99999;
  painel.style.userSelect = 'none';
  painel.style.width = '220px';
  painel.style.textAlign = 'center';
  painel.style.cursor = 'default';

  painel.innerHTML = `
    <div id="painelTitulo" style="font-weight:bold; margin-bottom:8px; cursor:move; user-select:none;">
      Anti-Logoff Robusto
    </div>
    <button id="btnIniciar" style="width:90px; margin-right:10px; padding:5px;">Iniciar</button>
    <button id="btnParar" style="width:90px; padding:5px;">Parar</button>
    <div id="status" style="margin-top:10px; font-size:14px; color:#0f0;">Inativo</div>
  `;

  document.body.appendChild(painel);

  // Função anti-logoff (seu código)
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
      } catch (e) {
        console.warn("⚠️ Erro na ação anti-logoff:", e);
      }
      contador++;
    }, intervalo);
  }

  function desativarAntiLogoff() {
    clearInterval(window.antiLogoffIntervalo);
    window.antiLogoffRobustoAtivo = false;
    console.log("❌ Anti-logoff desativado.");
  }

  function atualizarStatus() {
    const statusEl = painel.querySelector('#status');
    if (window.antiLogoffRobustoAtivo) {
      statusEl.textContent = "Ativo 🟢";
      statusEl.style.color = "#0f0";
    } else {
      statusEl.textContent = "Inativo 🔴";
      statusEl.style.color = "#f33";
    }
  }

  // Botões
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

  atualizarStatus();

  // Função para tornar o painel arrastável pelo título
  const painelTitulo = painel.querySelector('#painelTitulo');
  let offsetX, offsetY, isDragging = false;

  painelTitulo.addEventListener('mousedown', (e) => {
    isDragging = true;
    // Posições relativas ao painel
    const rect = painel.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    painel.style.transition = 'none'; // para evitar transição durante drag
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    // Calcula nova posição fixa dentro da janela
    let left = e.clientX - offsetX;
    let top = e.clientY - offsetY;

    // Limita para não sair da tela
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
      painel.style.transition = ''; // volta transição normal
    }
  });

  // Adiciona global para console, se quiser
  window.iniciarAntiLogoffRobusto = iniciarAntiLogoffRobusto;
  window.desativarAntiLogoff = desativarAntiLogoff;

})();
