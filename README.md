# Sofa — Assistente de Navegação

Uma IA companheira que vive num ícone flutuante, entende o contexto da página
e responde sem atrapalhar sua navegação.

## Como rodar (Chrome / Edge / Brave)

1. Baixe e extraia esta pasta em algum lugar fixo do seu computador.
2. Abra `chrome://extensions` no navegador.
3. Ative o **Modo do desenvolvedor** (canto superior direito).
4. Clique em **"Carregar sem compactação"** e selecione a pasta `sofa-extension`.
5. Pronto! Visite qualquer site — o ícone da Sofa aparece no canto inferior direito.

## Conectando a IA (grátis)

1. Acesse https://aistudio.google.com/apikey e crie uma chave gratuita do Gemini.
2. Clique no ícone da Sofa na **barra de ferramentas** do navegador (não o flutuante).
3. Cole a chave e salve.
4. Agora abra o balão flutuante em qualquer site e pergunte algo sobre a página.

## Teste rápido

Abra um vídeo de música no YouTube, clique no ícone flutuante e pergunte:
> "Que música é essa e quem é o artista?"

A Sofa lê o título do vídeo e o canal como contexto — exatamente o primeiro
passo do seu fluxo YouTube → Spotify.

Depois, teste a **memória**: faça uma segunda pergunta como
> "O que eu te perguntei antes?"

E numa busca do Mercado Livre, experimente:
> "Qual desses tem o melhor custo-benefício?"

## Funcionalidades

- **Contexto por site** — leitores específicos para YouTube (vídeo/canal),
  Spotify (música/artista) e Mercado Livre (busca com lista de produtos e
  página de produto com preço/frete).
- **Histórico de conversa** — as últimas 5 trocas ficam no
  `chrome.storage.session` (sobrevivem ao service worker dormir, somem ao
  fechar o navegador) e são reenviadas a cada pergunta, então a Sofa lembra
  do que vocês falaram. O botão 🧹 no balão apaga a memória.
- **Fallback de modelos** — a cota gratuita do Gemini é contada por modelo;
  quando um devolve erro de limite (429) ou sobrecarga (503), a Sofa tenta
  automaticamente o próximo da lista em `gemini.js` (flash-lite → flash →
  flash-latest), sem o usuário perceber.

## Arquitetura

```
sofa-extension/
├── manifest.json              Configuração (Manifest V3): permissões, scripts, popup
├── assets/
│   └── icons/
└── src/
    ├── background/            Service worker (ES Modules)
    │   ├── index.js           Entrada: recebe mensagens e orquestra os módulos
    │   ├── prompt.js          Engenharia de contexto: histórico + contexto + pergunta → contents[]
    │   ├── history.js         Memória da conversa (chrome.storage.session, janela deslizante)
    │   └── gemini.js          Cliente da API do Gemini com fallback de modelos
    ├── content/               Injetado nas páginas (compartilham window.Sofa)
    │   ├── context.js         Coleta contexto: título, seleção, YouTube, Spotify, Mercado Livre
    │   ├── ui.js              Visual: Shadow DOM, estilos, botão flutuante e balão
    │   └── index.js           Entrada: liga UI + contexto + mensagens
    └── popup/
        ├── popup.html         Configuração da chave de API
        ├── popup.css          Estilos do popup
        └── popup.js           Salva a chave em chrome.storage.sync
```

Cada arquivo tem UMA responsabilidade. Quer mexer no visual? `ui.js`.
Melhorar o prompt? `prompt.js`. Ler contexto de um site novo? `context.js`.

Fluxo de uma pergunta:

```
[página] src/content ──ASK_AI──▶ src/background ─────fetch────▶ API Gemini
   ▲     (index.js)              1. history.js  lê a memória     (com fallback:
   │                             2. prompt.js   monta contents    limite? tenta o
   │                             3. gemini.js   chama a IA        próximo modelo)
   │                             4. history.js  salva a troca          │
   └───────────── resposta ◀──────────────────────────────────────────┘

[🧹 limpar] ──CLEAR_HISTORY──▶ history.js apaga o storage.session
```

## Próximos degraus (roadmap)

1. **Feito** — ícone flutuante + balão + contexto básico + IA

   (
      Diante a idealização do projeto e também das minhas limitações, por hora estarei estudando melhor a logica com a base do codigo.
      Além do mais estou no inicio, estou praticando e tenho pouco conhecimento sobre javascript/typescript
   )

2. **Feito** — Histórico de conversa (guardar as últimas mensagens e enviar junto)

   (
      Inicio de um breve Histórico de Conversa que vai vim melhorias para a funcionalidade.
      Implementado com chrome.storage.session + janela deslizante de 10 itens e botão de limpar no balão.
   )
3. Sugestões proativas (a Sofa comenta sozinha quando detecta uma música)
4. **Em andamento** — Leitores de contexto para mais sites (GitHub, artigos, e-commerce)

   (
      Spotify e Mercado Livre já implementados; próximos: GitHub e artigos.
   )
5. OAuth 2.0 com o Spotify (chrome.identity + Spotify Web API)
6. Botão "Salvar no Spotify" quando detectar música no YouTube
7. Migrar o código para TypeScript com um bundler (Vite + CRXJS)
