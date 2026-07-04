// ============================================================
// SOFA — src/content/index.js
// ------------------------------------------------------------
// Ponto de entrada do content script: liga a UI (ui.js) ao
// contexto (context.js) e conversa com o background.
//
// O manifest carrega os arquivos nesta ordem:
//   context.js → ui.js → index.js
// então aqui window.Sofa.context e window.Sofa.ui já existem.
// ============================================================

(() => {
  // Evita injetar duas vezes (pode acontecer em SPAs)
  if (document.getElementById("sofa-root-host")) return;

  const { getPageContext } = window.Sofa.context;
  const ui = window.Sofa.ui.mount();

  // ----------------------------------------------------------
  // Abrir/fechar o balão
  // ----------------------------------------------------------
  ui.fab.addEventListener("click", () => {
    const willOpen = !ui.balloon.classList.contains("open");
    ui.balloon.classList.toggle("open", willOpen);

    if (willOpen) {
      const ctx = getPageContext();

      // Ternários ENCADEADOS = if / else if / else numa expressão só.
      // Cada caso exclui os seguintes; o último é o "senão" genérico.
      ui.contextEl.textContent = ctx.youtube
        ? `🎵 Assistindo: ${ctx.youtube.videoTitle}`
        : ctx.spotify
        ? `🎧 Escutando: ${ctx.spotify.musicTitle}`
        : ctx.mercadoLivre?.type === "lista"
        ? `🛒 Pesquisando: ${ctx.mercadoLivre.searchTerm}`
        : ctx.mercadoLivre?.type === "produto"
        ? `🛒 Vendo: ${ctx.mercadoLivre.productTitle}`
        : `📄 ${ctx.title}`;

      ui.input.focus();
    }
  });

  // ----------------------------------------------------------
  // Perguntar à IA (via background)
  // ----------------------------------------------------------
  async function ask() {
    const prompt = ui.input.value.trim();
    if (!prompt) return;

    ui.sendBtn.disabled = true;
    ui.answerEl.textContent = "Pensando...";

    try {
      const response = await chrome.runtime.sendMessage({
        type: "ASK_AI",
        prompt,
        context: getPageContext(),
      });

      ui.answerEl.textContent = response.ok ? response.text : `⚠️ ${response.error}`;
    } catch (err) {
      ui.answerEl.textContent = `⚠️ Falha na comunicação com a extensão: ${err.message}`;
    } finally {
      ui.sendBtn.disabled = false;
      ui.input.value = "";
      ui.input.focus();
    }
  }

  // ----------------------------------------------------------
  // Limpar a memória da conversa (via background)
  // ----------------------------------------------------------
  async function clearConversation() {
    try {
      const response = await chrome.runtime.sendMessage({ type: "CLEAR_HISTORY" });

      ui.answerEl.textContent = response.ok
        ? "🧹 Conversa limpa! Podemos começar do zero."
        : `⚠️ ${response.error}`;
    } catch (err) {
      ui.answerEl.textContent = `⚠️ Falha na comunicação com a extensão: ${err.message}`;
    }
  }

  ui.clearBtn.addEventListener("click", clearConversation);

  ui.sendBtn.addEventListener("click", ask);
  ui.input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") ask();
  });

  // Fecha o balão com Esc
  ui.shadow.addEventListener("keydown", (e) => {
    if (e.key === "Escape") ui.balloon.classList.remove("open");
  });
})();
