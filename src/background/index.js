// ============================================================
// SOFA — src/background/index.js (Service Worker)
// ------------------------------------------------------------
// Ponto de entrada do background. Responsabilidade única:
// receber mensagens do content script, orquestrar os módulos
// e devolver a resposta.
// ============================================================

import { askGemini } from "./gemini.js";
import { buildPrompt } from "./prompt.js";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ASK_AI") {
    handleAskAI(message)
      .then((text) => sendResponse({ ok: true, text }))
      .catch((err) => sendResponse({ ok: false, error: err.message }));

    return true;
  }
});

async function handleAskAI({ prompt, context }) {
  // 1. Busca a chave de API salva pelo popup
  const { apiKey } = await chrome.storage.sync.get("apiKey");

  if (!apiKey) {
    throw new Error(
      "Nenhuma chave de API configurada. Clique no ícone da Sofa na barra do navegador e cole sua chave do Google AI Studio."
    );
  }

  const promptText = buildPrompt(prompt, context);

  return askGemini(apiKey, promptText);
}
