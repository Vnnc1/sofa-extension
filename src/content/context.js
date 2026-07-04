// ============================================================
// SOFA — src/content/context.js
// ------------------------------------------------------------
// Coleta o contexto da página (título, URL, seleção, YouTube).
//
// Content scripts NÃO suportam import/export como o background.
// A solução clássica sem bundler: cada arquivo pendura suas
// funções num "namespace" global (window.Sofa) e o manifest
// carrega os arquivos em ordem.
// ============================================================

window.Sofa = window.Sofa || {};

window.Sofa.context = (() => {
  function getPageContext() {
    const context = {
      title: document.title,
      url: location.href,
      selection: window.getSelection()?.toString().slice(0, 500) || "",
      youtube: null,
      spotify: null,
    };

    if (location.hostname.includes("youtube.com" || "youtu.be") && location.pathname === "/watch" ) {
      const videoTitle =
        document.querySelector("h1.ytd-watch-metadata")?.textContent?.trim() ||
        document.title.replace(/ - YouTube$/, "");
      const channel =
        document.querySelector("ytd-channel-name a")?.textContent?.trim() || "";
      context.youtube = { videoTitle, channel };
    }

    if (location.hostname.includes("open.spotify.com") && location.pathname.startsWith("/track")) {
      const musicTitle =
        document.querySelector("div.context-item-info-title")?.textContent?.trim() ||
        document.title.replace(/ - Spotify$/, "");
      const musicSubTitle =
        document.querySelector("div.context-item-info-subtitle")?.textContent?.trim() || "";
      context.spotify = { musicTitle, musicSubTitle} ;
    }

    return context;
  }

  // Só o que está aqui fica visível para os outros arquivos
  return { getPageContext };
})();
