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

## Arquitetura

```
sofa-extension/
├── manifest.json              Configuração (Manifest V3): permissões, scripts, popup
├── assets/
│   └── icons/
└── src/
    ├── background/            Service worker (ES Modules)
    │   ├── index.js           Entrada: recebe mensagens e orquestra os módulos
    │   ├── prompt.js          Engenharia de contexto: monta o texto para a IA
    │   └── gemini.js          Cliente da API do Gemini (único lugar que fala com o Google)
    ├── content/               Injetado nas páginas (compartilham window.Sofa)
    │   ├── context.js         Coleta o contexto da página (título, seleção, YouTube...)
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
[página] src/content ──mensagem──▶ src/background ──fetch──▶ API Gemini
   ▲     (index.js)                (index.js → prompt.js → gemini.js)
   │                                    │
   └────────── resposta ◀───────────────┘
```

## Próximos degraus (roadmap)

1. **Feito** — ícone flutuante + balão + contexto básico + IA

   (
      Diante a idealização do projeto e também das minhas limitações, por hora estarei estudando melhor a logica com a base do codigo.
      Além do mais estou no inicio, estou praticando e tenho pouco conhecimento sobre javascript/typescript
   )

2. Histórico de conversa (guardar as últimas mensagens e enviar junto)
3. Sugestões proativas (a Sofa comenta sozinha quando detecta uma música)
4. Leitores de contexto para mais sites (GitHub, artigos, e-commerce)
5. OAuth 2.0 com o Spotify (chrome.identity + Spotify Web API)
6. Botão "Salvar no Spotify" quando detectar música no YouTube
7. Migrar o código para TypeScript com um bundler (Vite + CRXJS)
