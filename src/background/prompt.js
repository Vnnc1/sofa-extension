// ============================================================
// SOFA — src/background/prompt.js
// ------------------------------------------------------------
// Engenharia de contexto: transforma a pergunta do usuário +
// o contexto da página em UM texto bem montado para a IA.
//
// Este é o arquivo que você mais vai evoluir no projeto
// (histórico de conversa, leitores por site, etc.) — por isso
// ele merece viver sozinho.
// ============================================================

/**
 * Monta o texto final enviado à IA.
 *
 * @param {string} prompt  Pergunta digitada pelo usuário
 * @param {object} context Contexto coletado da página (título, URL, seleção...)
 * @returns {string}
 */
export function buildPrompt(prompt, context) {
  const systemInstructions = [
    "Você é a Sofa, uma assistente de navegação minimalista.",
    "Responda em português, de forma curta e direta (máximo 3 frases,",
    "a não ser que o usuário peça detalhes).",
    "Use o contexto da página abaixo para fundamentar sua resposta.",
    "",
    "--- CONTEXTO DA PÁGINA ---",
    `Título: ${context.title}`,
    `URL: ${context.url}`,
    context.selection ? `Texto selecionado pelo usuário: "${context.selection}"` : "",
    context.youtube
      ? `O usuário está assistindo um vídeo no YouTube: "${context.youtube.videoTitle}" do canal "${context.youtube.channel}".`
      : "",
    context.spotify
      ? `O usuário está escutando musica no Spotify: "${context.spotify.musicTitle}" do(a)(s) artistas "${context.spotify.musicTitle}".`
      : "",
    "--------------------------",
  ]
    .filter(Boolean) // remove as linhas vazias (quando não há seleção/YouTube)
    .join("\n");

  return `${systemInstructions}\n\nPergunta do usuário: ${prompt}`;
}
