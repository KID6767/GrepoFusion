// ==UserScript==
// @name         GrepoFusion
// @namespace    https://github.com/KID6767/GrepoFusion
// @version      1.3.3-hotfix
// @description  Fusion pack dla Grepolis — Emerald+Gold Theme, Clean Mode, Lab (beta)
// @author       KID6767 & ChatGPT
// @match        https://*.grepolis.com/*
// @icon         data:image/png;base64,PUT-YOUR-LOGO-HERE
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
  'use strict';

  const GF_VERSION = "1.3.3-hotfix";

  // === Kolorystyka Gold+Emerald ===
  const THEME_BG   = '#1a3d2f';   // tło jak nagłówki
  const THEME_GOLD = '#d4af37';   // kolor tekstów/linków

  GM_addStyle(`
    /* Tła i tekst w oknach gry */
    body,
    .ui-dialog,
    .ui-widget-content,
    .gpwindow_content,
    .ui-tabs-panel,
    .ui-dialog .gpwindow_content,
    .ui-dialog .ui-dialog-content,
    .ui-tooltip, #ui_tooltip {
      background-color:${THEME_BG} !important;
      color:${THEME_GOLD} !important;
    }

    /* Belki, nagłówki, zakładki */
    .ui-dialog .ui-dialog-titlebar,
    .gpwindow .gpwindow_header,
    .ui-tabs .ui-tabs-nav,
    .ui-tabs .ui-tabs-nav li.ui-state-active a {
      background-color:${THEME_BG} !important;
      color:${THEME_GOLD} !important;
      border-color:${THEME_GOLD} !important;
    }

    /* Ramki/bordery */
    .gpwindow_content,
    .ui-dialog,
    .ui-dialog-titlebar,
    .ui-tabs .ui-tabs-nav li,
    .ui-widget-content,
    .game_list,
    .report_title,
    .message_header {
      border-color:${THEME_GOLD} !important;
    }

    /* Linki i przyciski */
    a, a:link, a:visited { color:${THEME_GOLD} !important; }
    .button, .button_new, .btn,
    .button .caption {
      background:transparent !important;
      color:${THEME_GOLD} !important;
      border-color:${THEME_GOLD} !important;
    }
    .button:hover, .btn:hover { filter:brightness(1.08); }

    /* Pola formularzy */
    input, select, textarea {
      background:#0c2a20 !important;
      color:${THEME_GOLD} !important;
      border:1px solid ${THEME_GOLD} !important;
    }

    /* Scrollbary */
    *::-webkit-scrollbar { width:10px; height:10px; }
    *::-webkit-scrollbar-thumb { background:${THEME_GOLD}; border-radius:8px; }
    *::-webkit-scrollbar-track { background:${THEME_BG}; }

    /* Zabij pozostałości beżu */
    .gpwindow_content [style*="#f4e2b2"],
    .gpwindow_content [style*="rgb(244, 226, 178)"],
    .gpwindow_content [style*="rgba(244, 226, 178"],
    .gpwindow_content [style*="beige"] {
      background-color:${THEME_BG} !important;
      color:${THEME_GOLD} !important;
    }
  `);

  // === Clean Mode ===
  const HIDE_PATTERNS = /(GRCR|GRCRTools|DIO[- ]?TOOLS|Quack|Toolsammlung|Octopus|Ośmiorniczka)/i;
  function cleanBadges(root = document) {
    const it = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
    let n;
    while ((n = it.nextNode())) {
      const txt = (n.textContent || '').trim();
      const idc = ((n.id || '') + ' ' + (n.className || '')).toString();
      const tt  = n.getAttribute?.('title') || n.getAttribute?.('alt') || '';
      if (HIDE_PATTERNS.test(txt) || HIDE_PATTERNS.test(idc) || HIDE_PATTERNS.test(tt)) {
        n.style.setProperty('display','none','important');
      }
    }
  }
  cleanBadges();
  new MutationObserver(muts => muts.forEach(m => {
    m.addedNodes && m.addedNodes.forEach(n => n.nodeType === 1 && cleanBadges(n));
  })).observe(document.documentElement, { childList: true, subtree: true });

  // === GrepoFusion Lab (beta) ===
  const labBtn = document.createElement("div");
  labBtn.innerHTML = "⚗️ GrepoFusion Lab (beta)";
  Object.assign(labBtn.style, {
    position:"fixed",bottom:"60px",right:"10px",background:THEME_BG,
    color:THEME_GOLD,padding:"6px 12px",borderRadius:"8px",
    cursor:"pointer",zIndex:9999,fontWeight:"bold"
  });
  labBtn.onclick = ()=>alert("GrepoFusion Lab (beta) - funkcje w przygotowaniu!");
  document.body.appendChild(labBtn);

  console.log("%c[GrepoFusion] v" + GF_VERSION + " załadowany.",
              "color:"+THEME_GOLD+";font-weight:bold;");
})();
