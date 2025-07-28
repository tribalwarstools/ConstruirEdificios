(function iniciarAntiLogoffRobusto() {
    if (window.antiLogoffRobustoAtivo) {
        console.log("✅ Anti-logoff já está ativo.");
        return;
    }
    window.antiLogoffRobustoAtivo = true;

    console.log("🛡️ Anti-logoff robusto ativado.");

    let contador = 0;
    const intervalo = 4 * 60 * 1000; // 4 minutos (seguro e não óbvio)

    const acoes = [
        () => {
            // Gatilho leve: Atualiza título
            document.title = document.title;
        },
        () => {
            // Gatilho médio: Dispara evento fictício no body
            document.body.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
        },
        () => {
            // Gatilho visual leve: Alterna uma classe qualquer no body
            document.body.classList.toggle('anti-logoff-blink');
            setTimeout(() => document.body.classList.remove('anti-logoff-blink'), 100);
        },
        () => {
            // Gatilho aleatório: Faz um fetch para algo já carregado
            fetch('/game.php').then(() => {}).catch(() => {});
        },
        () => {
            // Gatilho TW: Clica em um link oculto (ex: mudar de aba via script - desativado aqui)
            // document.querySelector('#overview_menu a')?.click();
        }
    ];

    // Ciclo periódico
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

    // Adiciona controle manual pelo console
    window.desativarAntiLogoff = () => {
        clearInterval(window.antiLogoffIntervalo);
        window.antiLogoffRobustoAtivo = false;
        console.log("❌ Anti-logoff desativado.");
    };
})();
