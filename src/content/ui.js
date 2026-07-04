// ============================================================
// SOFA — src/content/ui.js
// ------------------------------------------------------------
// Tudo que é VISUAL mora aqui: estilos, HTML e a montagem do
// Shadow DOM. Nenhuma lógica de rede ou de contexto — este
// arquivo só sabe desenhar.
// ============================================================

window.Sofa = window.Sofa || {};

window.Sofa.ui = (() => {
  // O sofá em SVG — mesma identidade do ícone da extensão.
  // "currentColor" herda a cor do texto do botão, então basta
  // mudar o CSS para recolorir o ícone.
  const SOFA_SVG = `
    <svg class="sofa-icon" viewBox="0 0 24 24" width="26" height="26"
         fill="none" stroke="currentColor" stroke-width="1.6"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
      <path d="M2 16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z" />
      <path d="M4 18v2" />
      <path d="M20 18v2" />
    </svg>
  `;

  const STYLES = `
    :host { all: initial; }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .sofa-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #e9e7ff;
      background: radial-gradient(circle at 30% 30%, #6d6a8f, #1c1b29);
      box-shadow: 0 4px 18px rgba(20, 18, 40, 0.35);
      transition: transform 0.18s ease, box-shadow 0.18s ease;
    }
    .sofa-fab:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 24px rgba(20, 18, 40, 0.45);
    }

    /* O sofá "respira" suavemente, como o olho antigo */
    .sofa-icon {
      animation: sofa-breathe 3.2s ease-in-out infinite;
    }
    @keyframes sofa-breathe {
      0%, 100% { transform: scale(1);    opacity: 0.85; }
      50%      { transform: scale(1.12); opacity: 1;    }
    }
    @media (prefers-reduced-motion: reduce) {
      .sofa-icon { animation: none; }
    }

    .sofa-balloon {
      position: fixed;
      bottom: 84px;
      right: 24px;
      width: 320px;
      max-height: 60vh;
      display: none;
      flex-direction: column;
      gap: 10px;
      padding: 14px;
      border-radius: 14px;
      background: #1c1b29;
      color: #e9e7ff;
      font-family: -apple-system, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      line-height: 1.5;
      box-shadow: 0 8px 32px rgba(20, 18, 40, 0.45);
    }
    .sofa-balloon.open { display: flex; }

    .sofa-context {
      font-size: 11px;
      color: #9a97b8;
      border-left: 2px solid #6d6a8f;
      padding-left: 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sofa-answer {
      overflow-y: auto;
      white-space: pre-wrap;
    }
    .sofa-answer:empty { display: none; }

    .sofa-row { display: flex; gap: 8px; }

    .sofa-input {
      flex: 1;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid #3a3852;
      background: #26243a;
      color: #e9e7ff;
      font-size: 13px;
      outline: none;
    }
    .sofa-input:focus { border-color: #6d6a8f; }

    .sofa-send {
      padding: 8px 12px;
      border: none;
      border-radius: 8px;
      background: #6d6a8f;
      color: #fff;
      cursor: pointer;
      font-size: 13px;
    }
    .sofa-send:disabled { opacity: 0.5; cursor: wait; }
  `;

  /**
   * Cria o host + Shadow DOM e devolve as referências dos
   * elementos que a lógica (index.js) precisa manipular.
   */
  function mount() {
    // Shadow DOM = a "bolha de proteção" do nosso CSS.
    // Nada do site vaza pra dentro, nada nosso vaza pra fora.
    const host = document.createElement("div");
    host.id = "sofa-root-host";
    host.style.cssText = "all: initial; position: fixed; z-index: 2147483647;";
    document.documentElement.appendChild(host);

    const shadow = host.attachShadow({ mode: "open" });

    shadow.innerHTML = `
      <style>${STYLES}</style>

      <div class="sofa-balloon" role="dialog" aria-label="sofa assistente">
        <div class="sofa-context"></div>
        <div class="sofa-answer"></div>
        <div class="sofa-row">
          <input class="sofa-input" type="text" placeholder="Pergunte sobre esta página..." />
          <button class="sofa-send">Ir</button>
        </div>
      </div>

      <button class="sofa-fab" title="Abrir sofa" aria-label="Abrir assistente sofa">
        ${SOFA_SVG}
      </button>
    `;

    return {
      shadow,
      fab: shadow.querySelector(".sofa-fab"),
      balloon: shadow.querySelector(".sofa-balloon"),
      contextEl: shadow.querySelector(".sofa-context"),
      answerEl: shadow.querySelector(".sofa-answer"),
      input: shadow.querySelector(".sofa-input"),
      sendBtn: shadow.querySelector(".sofa-send"),
    };
  }

  return { mount };
})();
