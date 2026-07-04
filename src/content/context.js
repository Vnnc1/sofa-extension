// ============================================================
// SOFA — src/content/context.js
// ------------------------------------------------------------
// Coleta o contexto da página (título, URL, seleção) e os
// leitores por site: YouTube, Spotify e Mercado Livre.
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
      mercadoLivre: null,
    };

    if (location.hostname.includes("youtube.com") || location.hostname.includes("youtu.be")) {
      if (location.pathname === "/watch") {
        const videoTitle =
          document.querySelector("h1.ytd-watch-metadata")?.textContent?.trim() ||
          document.title.replace(/ - YouTube$/, "");
        const channel =
          document.querySelector("ytd-channel-name a")?.textContent?.trim() || "";
        context.youtube = { videoTitle, channel };
      }
    }

    if (location.hostname.includes("open.spotify.com") && location.pathname.startsWith("/track")) {
      const musicTitle =
        document.querySelector("div.context-item-info-title")?.textContent?.trim() ||
        document.title.replace(/ - Spotify$/, "");
      const musicSubTitle =
        document.querySelector("div.context-item-info-subtitle")?.textContent?.trim() || "";
      context.spotify = { musicTitle, musicSubTitle} ;
    }

    if (location.hostname.includes("mercadolivre.com.br")) {
      if (location.hostname === "lista.mercadolivre.com.br") {
        const cards = document.querySelectorAll("div.poly-card");
        const products = Array.from(cards).slice(0, 10).map((card) => {
          const title = card.querySelector("h3.poly-component__title-wrapper")?.textContent?.trim() || "?";
          const price = card.querySelector("div.poly-price__current")?.textContent?.trim() || "";
          const shipping = card.querySelector("div.poly-shipping-v2__item")?.textContent?.trim() || "";
          return `- ${title} | ${price} | ${shipping}`;
        }).join("\n");
        const searchTerm = decodeURIComponent(location.pathname.slice(1).split("_")[0]);
        context.mercadoLivre = { type: "lista", searchTerm, products };
      }
      const productTitleEl = document.querySelector("h1.ui-pdp-title");
      if (productTitleEl) {
        const productTitle = productTitleEl.textContent.trim();
        const productPrice =
          document.querySelector("div.ui-pdp-price__second-line")?.textContent?.trim() || "";
        const productShipping =
          document.querySelector("div.shipping-section")?.textContent?.trim() || "";
        context.mercadoLivre = { type: "produto", productTitle, productPrice, productShipping };
      }
    }

    return context;
  }

  // Só o que está aqui fica visível para os outros arquivos
  return { getPageContext };
})();
