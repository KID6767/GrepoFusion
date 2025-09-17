// ==UserScript==
// @name         GrepoFusion
// @namespace    https://github.com/KID6767/GrepoFusion
// @version      1.4.5
// @description  Remaster 2025: motyw Gold+Emerald, panel ustawień, Clean Mode, Beige-Killer, podmiana ikon (statki+piechota+mityczne+budynki), Easter Bunny, porównania grafik, integracje skryptów, GrepoFusion Lab (beta).
// @author       KID6767 & ChatGPT
// @match        https://*.grepolis.com/*
// @icon         https://raw.githubusercontent.com/KID6767/GrepoFusion/main/assets/logo/logo-small.png
// @updateURL    https://raw.githubusercontent.com/KID6767/GrepoFusion/main/dist/grepofusion.user.js
// @downloadURL  https://raw.githubusercontent.com/KID6767/GrepoFusion/main/dist/grepofusion.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// ==/UserScript==

(function() {
  'use strict';

  const GF_VERSION = "1.4.5";
  console.log(`%c[GrepoFusion] v${GF_VERSION} załadowany!`, "color:#d4af37;font-weight:bold;");

  // === Motyw Gold+Emerald ===
  GM_addStyle(`
    body, .gpwindow_content {
      background-color: #0b1a0f !important;
      color: #d4af37 !important;
    }
    .gpwindow .gpwindow_header,
    .ui-dialog .ui-dialog-titlebar {
      background: linear-gradient(#0b1a0f, #1c2d1a);
      color: #d4af37 !important;
    }
  `);

  // === Easter Bunny (ukryty) ===
  function easterBunny() {
    console.log("[GrepoFusion] 🐇 Easter Bunny aktywny!");
  }

  // === Ikony jednostek (demo) ===
  const unitIcons = {
    "unit_fire": "https://raw.githubusercontent.com/KID6767/GrepoFusion/main/assets/pirate/ships/blackpearl.png",
    "unit_colonize": "https://raw.githubusercontent.com/KID6767/GrepoFusion/main/assets/pirate/ships/titanic.png",
    "unit_bireme": "https://raw.githubusercontent.com/KID6767/GrepoFusion/main/assets/pirate/ships/bireme.png",
    "unit_trireme": "https://raw.githubusercontent.com/KID6767/GrepoFusion/main/assets/pirate/ships/trireme.png",
    "unit_sword": "https://raw.githubusercontent.com/KID6767/GrepoFusion/main/assets/pirate/infantry/swordsman.png",
    "unit_slinger": "https://raw.githubusercontent.com/KID6767/GrepoFusion/main/assets/pirate/infantry/slinger.png",
    "unit_hoplite": "https://raw.githubusercontent.com/KID6767/GrepoFusion/main/assets/pirate/infantry/hoplite.png",
    "unit_minotaur": "https://raw.githubusercontent.com/KID6767/GrepoFusion/main/assets/pirate/mythical/minotaur.png",
    "unit_medusa": "https://raw.githubusercontent.com/KID6767/GrepoFusion/main/assets/pirate/mythical/medusa.png",
    "unit_hydra": "https://raw.githubusercontent.com/KID6767/GrepoFusion/main/assets/pirate/mythical/hydra.png"
  };

  function replaceUnitIcons() {
    Object.entries(unitIcons).forEach(([unit, url]) => {
      const el = document.querySelector(`.unit_icon40x40.${unit} img`);
      if (el) el.src = url;
    });
  }

  setInterval(replaceUnitIcons, 2000);
})();
