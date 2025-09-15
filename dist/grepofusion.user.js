// ==UserScript==
// @name         GrepoFusion (Dev Mini 2)
// @namespace    https://github.com/KID6767/GrepoFusion
// @version      1.4.0-dev-mini2
// @description  Dev build: Titanic (Colony Ship) + Black Pearl (Fire Ship) + Emerald skin
// @author       KID6767 & ChatGPT
// @match        https://*.grepolis.com/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
    'use strict';

    const GF_VERSION = "1.4.0-dev-mini2";

    // === Skin Emerald ===
    GM_addStyle(`
        body, .gpwindow_content { background-color: #0b0f0c !important; color: #eee !important; }
        .ui-dialog .ui-dialog-titlebar,
        .ui-tabs .ui-tabs-nav li.ui-state-active a,
        .game_header { background-color: #1a3d2f !important; color: #d4af37 !important; }
        .gpwindow_content, .ui-dialog-titlebar { border-color: #d4af37 !important; }
    `);

    // === GrepoFusion Lab ===
    const labBtn = document.createElement("div");
    labBtn.innerHTML = "⚗️ GrepoFusion Lab (beta)";
    Object.assign(labBtn.style, {
        position:"fixed",bottom:"60px",right:"10px",background:"#1a3d2f",
        color:"#d4af37",padding:"6px 12px",borderRadius:"8px",cursor:"pointer",zIndex:9999
    });
    labBtn.onclick = ()=>alert("GrepoFusion Lab (beta) - funkcje w przygotowaniu!");
    document.body.appendChild(labBtn);

    // === Placeholder grafik statków ===
    const styleShips = document.createElement("style");
    styleShips.innerHTML = `
        img[src*="unit_transporter"] { content:url("assets/remaster/ships/titanic.png"); }
        img[src*="unit_fire_ship"] { content:url("assets/remaster/ships/blackpearl.png"); }
    `;
    document.head.appendChild(styleShips);

    console.log("%c[GrepoFusion] v" + GF_VERSION + " załadowany!", "color:#d4af37;font-weight:bold;");
})();
// === GrepoFusion: Gold+Emerald Theme & Clean Mode (HOTFIX) ===
(function () {
  'use strict';

  const THEME_BG   = '#1a3d2f';   // tło = jak nagłówki
  const THEME_GOLD = '#d4af37';   // kolor tekstów/linków

  // Globalny styl
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

    /* Scrollbary (WebKit) */
    *::-webkit-scrollbar { width:10px; height:10px; }
    *::-webkit-scrollbar-thumb { background:${THEME_GOLD}; border-radius:8px; }
    *::-webkit-scrollbar-track { background:${THEME_BG}; }

    /* Zabij pozostałości beżu, nawet inline */
    .gpwindow_content [style*="#f4e2b2"],
    .gpwindow_content [style*="rgb(244, 226, 178)"],
    .gpwindow_content [style*="rgba(244, 226, 178"],
    .gpwindow_content [style*="beige"] {
      background-color:${THEME_BG} !important;
      color:${THEME_GOLD} !important;
    }
  `);

  // CLEAN MODE – ukryj widoczne sygnatury cudzych dodatków
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

  // Dodatkowe „dobicie” otwartych okien (zabezpieczenie)
  document.querySelectorAll('.gpwindow_content, .ui-dialog').forEach(el => {
    el.style.setProperty('background-color', THEME_BG, 'important');
    el.style.setProperty('color', THEME_GOLD, 'important');
  });

  console.log('%c[GrepoFusion] HOTFIX Gold+Emerald & Clean Mode zastosowany.',
              'color:'+THEME_GOLD+';font-weight:bold;');
})();
