// ============================================================
// SOFA — src/background/gemini.js
// ------------------------------------------------------------
// Cliente da API do Gemini com FALLBACK de modelos.
//
// A cota gratuita do Google é contada POR MODELO. Então, quando
// um modelo devolve erro de limite, tentamos o próximo da lista
// — cada um tem seu próprio contador de requisições/tokens.
//
// Este arquivo continua sendo o ÚNICO lugar que fala com o
// Google: quem monta a conversa é o prompt.js.
// ============================================================

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-flash-latest",
];

const RETRYABLE_STATUS = [429, 503];

/**
 * Envia a conversa para o Gemini, caindo para o próximo modelo
 * da lista quando o atual atinge o limite.
 *
 * @param {string} apiKey            Chave do Google AI Studio
 * @param {string} systemInstruction Regras fixas (texto puro)
 * @param {Array}  contents          Turnos da conversa, no formato da API
 * @returns {Promise<string>} Texto da resposta da IA
 */
export async function askGemini(apiKey, systemInstruction, contents) {
  const exhausted = []; // guarda o que falhou, para a mensagem final

  for (const model of GEMINI_MODELS) {
    const response = await fetch(`${BASE_URL}/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
      }),
    });

    // Limite atingido ou sobrecarga → registra e tenta o próximo
    if (RETRYABLE_STATUS.includes(response.status)) {
      exhausted.push(`${model} (erro ${response.status})`);
      console.warn(`[Sofa] ${model} indisponível (${response.status}), tentando o próximo...`);
      continue;
    }

    // Erro que não se resolve trocando de modelo → falha na hora
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

  // Chegou aqui = TODOS os modelos da lista estão no limite
  throw new Error(
    `Todos os modelos atingiram o limite (${exhausted.join(", ")}). ` +
      "A cota gratuita renova diariamente — tente mais tarde."
  );
}
