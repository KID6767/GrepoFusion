// ==UserScript==
// @name         GrepoFusion
// @namespace    https://github.com/KID6767/GrepoFusion
// @version      1.3.3
// @description  Fusion pack dla Grepolis — Redesign & Remaster 2025 + pierwsze porównania
// @author       KID6767 & ChatGPT
// @match        https://*.grepolis.com/*
// @icon         https://raw.githubusercontent.com/KID6767/GrepoFusion/main/assets/logo.png
// @updateURL    https://raw.githubusercontent.com/KID6767/GrepoFusion/main/dist/grepofusion.user.js
// @downloadURL  https://raw.githubusercontent.com/KID6767/GrepoFusion/main/dist/grepofusion.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    const GF_VERSION = "1.3.3";

    // === Easter Bunny (losowy easter egg) ===
    function easterBunny() {
        if (Math.random() < 0.1) {
            alert("🐇 Easter Bunny wita w GrepoFusion v" + GF_VERSION + "! Powodzenia w podbojach!");
        }
    }

    // === Changelog popup ===
    function showChangelog() {
        const lastSeen = GM_getValue("lastVersion", "0");
        if (lastSeen !== GF_VERSION) {
            const html = `
            <div style="background:#1b1b1b;color:#eee;padding:20px;border:2px solid #d4af37;border-radius:12px;max-width:600px;font-family:sans-serif;">
                <h2 style="margin-top:0;color:#d4af37;">GrepoFusion v${GF_VERSION}</h2>
                <ul>
                    <li>Dodano system porównań (Senat + Fire Ship)</li>
                    <li>Ulepszony Easter Bunny 🐇</li>
                    <li>Mini-galeria w changelogu</li>
                </ul>
                <div style="display:flex;gap:10px;flex-wrap:wrap;">
                    <div><b>Senat</b><br><img src="https://raw.githubusercontent.com/KID6767/GrepoFusion/main/assets/compare/buildings/senate/after.png" width="120"></div>
                    <div><b>Fire Ship</b><br><img src="https://raw.githubusercontent.com/KID6767/GrepoFusion/main/assets/compare/ships/fire_ship/after.png" width="120"></div>
                </div>
                <p style="margin-top:10px;font-size:12px;opacity:0.8;">Wkrótce → Colony Ship + jednostki lądowe</p>
            </div>`;
            const popup = document.createElement("div");
            popup.innerHTML = html;
            Object.assign(popup.style, {position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:9999});
            document.body.appendChild(popup);
            GM_setValue("lastVersion", GF_VERSION);
        }
    }

    // === Apply color override (tolerancja ~10%) ===
    function applyColors() {
        const accent = GM_getValue("accentColor", "#d4af37"); // złoty
        GM_addStyle(`
            .ui-dialog .ui-dialog-titlebar,
            .ui-tabs .ui-tabs-nav li.ui-state-active a,
            .game_header {
                background-color: ${accent} !important;
            }
            .gpwindow_content, .ui-dialog-titlebar {
                border-color: ${accent} !important;
            }
        `);
    }

    // Run features
    easterBunny();
    showChangelog();
    applyColors();

    console.log("%c[GrepoFusion] v" + GF_VERSION + " załadowany!", "color:#d4af37;font-weight:bold;");
})();