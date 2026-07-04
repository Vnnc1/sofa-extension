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
      ui.contextEl.textContent = ctx.youtube
        ? `🎵 Assistindo: ${ctx.youtube.videoTitle}`
        : `📄 ${ctx.title}`;
      ui.contextEl.textContent = ctx.spotify
        ? `Escutando: ${ctx.spotify.musicTitle}`
        : ` ${ctx.title}`;
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

  ui.sendBtn.addEventListener("click", ask);
  ui.input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") ask();
  });

  // Fecha o balão com Esc
  ui.shadow.addEventListener("keydown", (e) => {
    if (e.key === "Escape") ui.balloon.classList.remove("open");
  });
})();
