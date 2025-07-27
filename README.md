# Script Fila de Construção - Tribal Wars

Automatiza a construção de edifícios no Tribal Wars, com painel interativo para seleção, ordenação e controle da fila de construção.

---

## Funcionalidades

- Painel arrastável e estilizado conforme o visual do Tribal Wars.
- Seleção dos edifícios a construir via checkbox.
- Ordenação da fila via drag and drop.
- Configuração do intervalo entre tentativas de construção.
- Controle de início e parada da execução.
- Mensagens informativas no jogo sobre o andamento.
- Alerta ao tentar fechar a aba com execução ativa.
- Anti-logoff para manter sessão ativa durante a execução.

---

## Como usar

1. Acesse a tela de construções do Tribal Wars (`screen=main`).
2. Abra as ferramentas de desenvolvimento do navegador (F12).
3. Na aba **Console**, cole o código do script e pressione Enter.
4. O painel aparecerá no canto superior direito.
5. Marque os edifícios desejados e organize a ordem com drag and drop.
6. Ajuste o intervalo entre tentativas.
7. Clique em **Iniciar Construção** para ativar.
8. Para interromper, clique em **Parar**.
9. Não feche o painel durante a execução — um alerta aparecerá caso tente.

---

## Parâmetros e Configurações

| Parâmetro                       | Tipo           | Padrão           | Descrição                                                                                         |
|--------------------------------|----------------|------------------|-------------------------------------------------------------------------------------------------|
| `listaEdificios`               | Objeto         | Predefinido      | Mapeia códigos internos para nomes dos edifícios no painel.                                    |
| `delaySelect`                  | Select (ms)    | 120000 (2 min)   | Intervalo entre tentativas de construção. Valores: 30s, 1, 2, 3, 5, 10, 15, 30, 60 minutos.    |
| `maxTentativasSemSucesso`      | Número         | 10               | Máximo de tentativas sem sucesso antes de notificar (não encerra execução automaticamente).      |
| `executando`                   | Boolean        | false            | Flag que indica se o script está rodando, controla botões e alertas.                           |

---

## Documentação Técnica

### Variáveis principais

- `painel`: Container do painel criado.
- `listaContainer`: `<ul>` com a lista dos edifícios.
- `listaItens`: Array dos `<li>` com cada edifício.
- `btnIniciar`, `btnParar`: Botões para controlar execução.
- `intervaloConstrucao`: Timer para ciclo de tentativas.
- `intervaloAntiLogoff`: Timer para manter sessão ativa.

### Funções principais

- `criarItem(cod, nome)`: Cria elemento `<li>` com checkbox e drag and drop.
- `obterFilaOrdenada()`: Retorna array dos códigos dos edifícios selecionados, na ordem do painel.
- `construirFila()`: Inicia execução do loop de construção, ativando timers e anti-logoff.
- `pararConstruir()`: Para execução, timers e restaura estado dos botões.
- `ativarAntiLogoff()`: Inicia timer para enviar requisições GET periódicas e evitar logout.
- `onBeforeUnload(event)`: Alerta ao tentar fechar a aba com execução ativa.
- `removerEventosAntesDeUnload()`: Remove evento `beforeunload` após parada.

### Eventos

- Drag and drop para ordenar lista.
- Clique em iniciar/parar para controle.
- Movimento do painel via arrastar o cabeçalho.
- Fechamento do painel bloqueado se executando.

### Fluxo

1. Verifica tela correta.
2. Cria painel e lista.
3. Usuário seleciona e ordena edifícios.
4. Define delay.
5. Inicia execução com clique.
6. Tenta construir periodicamente conforme ordem.
7. Mostra mensagens sobre status.
8. Permite parar execução.
9. Alerta ao fechar aba durante execução.

---

## Avisos importantes

- **Uso manual**: Execute no console do navegador, não use extensões proibidas.
- Pode tentar construir sem recursos disponíveis.
- Monitore execução para evitar problemas.

---

## Licença

MIT License © [Seu Nome]

---
´´javascript:$.getScript('https://tribalwarstools.github.io/ConstruirEdificios/construir.js');
