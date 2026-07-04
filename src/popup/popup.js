// ============================================================
// SOFA — src/popup/popup.js
// Salva e recupera a chave de API usando chrome.storage.sync.
// "sync" = a chave acompanha seu perfil do Chrome entre máquinas.
// ============================================================

const input = document.getElementById("apiKey");
const saveBtn = document.getElementById("save");
const status = document.getElementById("status");

// Ao abrir o popup, mostra se já existe uma chave salva
chrome.storage.sync.get("apiKey").then(({ apiKey }) => {
  if (apiKey) {
    input.value = apiKey;
    status.textContent = "✓ Chave já configurada";
  }
});

saveBtn.addEventListener("click", async () => {
  const apiKey = input.value.trim();

  if (!apiKey) {
    status.textContent = "Cole uma chave antes de salvar.";
    status.style.color = "#e0a3a3";
    return;
  }

  await chrome.storage.sync.set({ apiKey });
  status.textContent = "✓ Chave salva com sucesso!";
  status.style.color = "#8fd6a4";
});
