// ============================================================
// SOFA — src/background/prompt.js
// ------------------------------------------------------------
// Engenharia de contexto: transforma histórico + contexto da
// página + pergunta atual no formato de conversa da API.
// ============================================================

export const SYSTEM_INSTRUCTION = [
  "Você é a Sofa, uma assistente de navegação minimalista.",
  "Responda em português, de forma curta e direta (máximo 3 frases,",
  "a não ser que o usuário peça detalhes).",
  "Use o contexto da página fornecido para fundamentar sua resposta.",
  "Você pode sugerir links, mas não invente URLs que não existam.",
  "Suas respostas podem conter trechos do texto da página, mas não copie tudo — resuma.",
  "Você pode sugerir ideias ao usuário.",
  "Se o contexto não contém a resposta, diga isso claramente em vez de inventar.",
].join("\n");

/**
 * Monta o array `contents` completo: histórico + pergunta atual.
 *
 * @param {string} prompt  Pergunta digitada agora
 * @param {object} context Contexto da página (título, URL, seleção...)
 * @param {Array}  history Turnos anteriores, vindos do history.js
 * @returns {Array} contents no formato da API do Gemini
 */
export function buildContents(prompt, context, history) {
  const turns = history.map((turn) => ({
    role: turn.role,
    parts: [{ text: turn.text }],
  }));

  const contextBlock = [
    "--- CONTEXTO DA PÁGINA ---",
    `Título: ${context.title}`,
    `URL: ${context.url}`,
    `Data e hora atuais: ${new Date().toLocaleString("pt-BR")}`,
    context.selection ? `Texto selecionado pelo usuário: "${context.selection}"` : "",
    context.youtube
      ? `O usuário está assistindo um vídeo no YouTube: "${context.youtube.videoTitle}" do canal "${context.youtube.channel}".`
      : "",
    context.spotify
      ? `O usuário está escutando musica no Spotify: "${context.spotify.musicTitle}" do(a)(s) artistas "${context.spotify.musicSubTitle}".`
      : "",
    context.mercadoLivre?.type === "produto"
      ? `O usuário está vendo um produto no Mercado Livre: "${context.mercadoLivre.productTitle}" com preço "${context.mercadoLivre.productPrice}" e frete "${context.mercadoLivre.productShipping}".`
      : "",
    context.mercadoLivre?.type === "lista"
      ? `O usuário pesquisou "${context.mercadoLivre.searchTerm}" no Mercado Livre. Primeiros resultados:\n${context.mercadoLivre.products}`
      : "",
    "--------------------------",
  ]
    .filter(Boolean)
    .join("\n");

  turns.push({
    role: "user",
    parts: [{ text: `${contextBlock}\n\nPergunta do usuário: ${prompt}` }],
  });

  return turns;
}
