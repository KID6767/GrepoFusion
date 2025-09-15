// ==UserScript==
// @name         GrepoFusion
// @namespace    https://github.com/KID6767/GrepoFusion
// @version      1.3.0
// @description  Uniwersalny pakiet ulepszeń do Grepolis: Visual Upgrade, panel ustawień, color picker i wiele więcej!
// @author       GrepoFusion Team
// @match        https://*.grepolis.com/*
// @icon         https://raw.githubusercontent.com/KID6767/GrepoFusion/main/assets/logo.png
// @updateURL    https://raw.githubusercontent.com/KID6767/GrepoFusion/main/dist/grepofusion.user.js
// @downloadURL  https://raw.githubusercontent.com/KID6767/GrepoFusion/main/dist/grepofusion.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    // 🔔 Powitanie
    console.log('%c[GrepoFusion] 🔥 Witaj w ulepszonej wersji Grepolis!', 'color:#A57E36;font-size:14px;');

    // 🎨 Domyślny kolor akcentu
    let accentColor = GM_getValue("accentColor", "#A57E36");

    // 📌 Funkcja podmiany kolorów
    function applyAccentColor(color) {
        const css = `
            .ui-dialog .ui-dialog-titlebar,
            .ui-dialog .gpwindow_content,
            .ui-tabs .ui-tabs-nav li.ui-state-active a {
                background-color: ${color} !important;
            }
            .gpwindow_content, .game_header, .ui-dialog-titlebar {
                border-color: ${color} !important;
            }
        `;
        let styleEl = document.getElementById("grepoFusionTheme");
        if (!styleEl) {
            styleEl = document.createElement("style");
            styleEl.id = "grepoFusionTheme";
            document.head.appendChild(styleEl);
        }
        styleEl.innerHTML = css;
    }
    applyAccentColor(accentColor);

    // ⚙️ Panel ustawień
    function createSettingsPanel() {
        const btn = document.createElement("div");
        btn.id = "gf-settings-btn";
        btn.innerHTML = "⚙️";
        Object.assign(btn.style, {
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: accentColor,
            color: "#fff",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "20px",
            zIndex: "99999"
        });

        const panel = document.createElement("div");
        panel.id = "gf-settings-panel";
        Object.assign(panel.style, {
            position: "fixed",
            bottom: "70px",
            right: "20px",
            width: "250px",
            padding: "15px",
            background: "#1c1c1c",
            color: "#fff",
            borderRadius: "10px",
            boxShadow: "0 0 10px rgba(0,0,0,0.5)",
            display: "none",
            zIndex: "99999"
        });

        panel.innerHTML = `
            <h3 style="margin-top:0;font-size:16px;">⚙️ GrepoFusion</h3>
            <label for="gf-color">🎨 Kolor akcentu:</label>
            <input type="color" id="gf-color" value="${accentColor}" style="width:100%;margin-top:5px;">
        `;

        document.body.appendChild(btn);
        document.body.appendChild(panel);

        btn.addEventListener("click", () => {
            panel.style.display = panel.style.display === "none" ? "block" : "none";
        });

        document.getElementById("gf-color").addEventListener("input", (e) => {
            accentColor = e.target.value;
            GM_setValue("accentColor", accentColor);
            applyAccentColor(accentColor);
            btn.style.background = accentColor;
        });
    }

    // ⏳ Poczekaj aż strona się załaduje
    window.addEventListener("load", createSettingsPanel);

})();
