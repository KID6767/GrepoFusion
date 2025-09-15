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