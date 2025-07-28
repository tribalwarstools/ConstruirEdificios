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
  painel.style.width = '240px';
  painel.style.textAlign = 'center';
  painel.style.cursor = 'default';

  painel.innerHTML = `
    <div id="painelTitulo" style="font-weight:bold; margin-bottom:10px; cursor:move; user-select:none;">
      Anti-Logoff Robusto
    </div>
    <div style="display: flex; justify-content: center; gap: 12px;">
      <button id="btnIniciar" style="
        flex: 1;
        padding: 8px 0;
        border: none;
        border-radius: 6px;
        background-color: #28a745;
        color: white;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(40,167,69,0.6);
        transition: background-color 0.3s ease;
      ">Iniciar</button>
      <button id="btnParar" style="
        flex: 1;
        padding: 8px 0;
        border: none;
        border-radius: 6px;
        background-color: #dc3545;
        color: white;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(220,53,69,0.6);
        transition: background-color 0.3s ease;
      ">Parar</button>
    </div>
    <div id="status" style="margin-top:12px; font-size:14px; color:#0f0; user-select:none; min-height:18px;">Inativo</div>
  `;

  document.body.appendChild(painel);

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
    const btnIniciar = painel.querySelector('#btnIniciar');
    const btnParar = painel.querySelector('#btnParar');

    if (window.antiLogoffRobustoAtivo) {
      statusEl.textContent = "Ativo 🟢";
      statusEl.style.color = "#0f0";

      btnIniciar.disabled = true;
      btnIniciar.style.cursor = 'not-allowed';
      btnIniciar.style.opacity = '0.6';

      btnParar.disabled = false;
      btnParar.style.cursor = 'pointer';
      btnParar.style.opacity = '1';
    } else {
      statusEl.textContent = "Inativo 🔴";
      statusEl.style.color = "#f33";

      btnIniciar.disabled = false;
      btnIniciar.style.cursor = 'pointer';
      btnIniciar.style.opacity = '1';

      btnParar.disabled = true;
      btnParar.style.cursor = 'not-allowed';
      btnParar.style.opacity = '0.6';
    }
  }

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

  // Hover efeitos só se botão habilitado
  btnIniciar.addEventListener('mouseenter', () => {
    if (!btnIniciar.disabled) btnIniciar.style.backgroundColor = '#218838';
  });
  btnIniciar.addEventListener('mouseleave', () => {
    if (!btnIniciar.disabled) btnIniciar.style.backgroundColor = '#28a745';
  });

  btnParar.addEventListener('mouseenter', () => {
    if (!btnParar.disabled) btnParar.style.backgroundColor = '#c82333';
  });
  btnParar.addEventListener('mouseleave', () => {
    if (!btnParar.disabled) btnParar.style.backgroundColor = '#dc3545';
  });

  atualizarStatus();

  // Função para tornar o painel arrastável pelo título
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

})();
