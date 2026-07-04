// ============================================================
// SOFA — src/background/history.js
// ------------------------------------------------------------
// A memória da conversa. Único arquivo do projeto que fala com
// o chrome.storage.session.
// ============================================================

const MAX_ITEMS = 10;

/**
 * @returns {Promise<Array<{role: "user"|"model", text: string}>>}
 */
export async function getHistory() {
  const { history } = await chrome.storage.session.get("history");
  return history || []; // primeira vez: ainda não existe nada
}

/**
 * @param {string} userText  O que o usuário perguntou
 * @param {string} modelText O que a IA respondeu
 */
export async function addTurns(userText, modelText) {
  const history = await getHistory();

  history.push({ role: "user", text: userText });
  history.push({ role: "model", text: modelText });

  await chrome.storage.session.set({ history: history.slice(-MAX_ITEMS) });
}

/**
 * Apaga a conversa inteira.
 */
export async function clearHistory() {
  await chrome.storage.session.remove("history");
}
