// ============================================================
// SOFA — src/background/index.js (Service Worker)
// ------------------------------------------------------------
// Ponto de entrada do background. Responsabilidade única:
// receber mensagens do content script, orquestrar os módulos
// e devolver a resposta.
// ============================================================

import { askGemini } from "./gemini.js";
import { SYSTEM_INSTRUCTION, buildContents } from "./prompt.js";
import { getHistory, addTurns, clearHistory } from "./history.js";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ASK_AI") {
    handleAskAI(message)
      .then((text) => sendResponse({ ok: true, text }))
      .catch((err) => sendResponse({ ok: false, error: err.message }));

    return true; // avisa ao Chrome que a resposta será assíncrona
  }

  // Já preparado para o futuro botão "limpar conversa" no balão
  if (message.type === "CLEAR_HISTORY") {
    clearHistory()
      .then(() => sendResponse({ ok: true }))
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

  // 2. Carrega a memória da conversa (history.js)
  const history = await getHistory();

  // 3. Monta a conversa: histórico + contexto + pergunta (prompt.js)
  const contents = buildContents(prompt, context, history);

  // 4. Chama a IA (gemini.js)
  const answer = await askGemini(apiKey, SYSTEM_INSTRUCTION, contents);

  // 5. Memoriza a troca — é isso que faz a PRÓXIMA pergunta
  //    "lembrar" desta aqui
  await addTurns(prompt, answer);

  return answer;
}
