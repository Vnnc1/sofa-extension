// ============================================================
// SOFA — src/background/gemini.js
// ------------------------------------------------------------
// Cliente da API do Gemini. Este arquivo é o ÚNICO lugar do
// projeto que sabe conversar com a API do Google.
//
// Vantagem dessa separação: se um dia você trocar de provedor
// (OpenAI, Claude, etc.), só precisa mexer aqui — o resto da
// extensão nem fica sabendo.
// ============================================================

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

/**
 * Envia um texto para o Gemini e devolve a resposta como string.
 *
 * @param {string} apiKey     Chave do Google AI Studio
 * @param {string} promptText Texto completo (instruções + contexto + pergunta)
 * @returns {Promise<string>} Texto da resposta da IA
 */
export async function askGemini(apiKey, promptText) {
  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: promptText }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`A API respondeu com erro ${response.status}: ${body.slice(0, 200)}`);
  }

  const data = await response.json();

  // Navega na resposta com "?." para não quebrar se algo vier vazio
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("A API respondeu, mas sem texto. Tente novamente.");
  }

  return text.trim();
}
