// ==UserScript==
// @name         GrepoFusion
// @namespace    https://github.com/KID6767/GrepoFusion
// @version      1.3.2-beta
// @description  Fusion pack dla Grepolis — integracja narzędzi i nowych funkcji w jednym dodatku!
// @author       KID6767 & ChatGPT
// @match        https://*.grepolis.com/*
// @icon         data:image/png;base64,PUT-YOUR-LOGO-HERE
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // === Logo Base64 (podmień na swoje) ===
    const GF_LOGO = "data:image/png;base64,PUT-YOUR-LOGO-HERE";

    // === Aktualna wersja ===
    const GF_VERSION = "1.3.2-beta";

    // === Moduły (proste demo) ===
    const modules = {
        backButton: true,
        transportCalc: true,
        attackAlarm: true
    };

    // === Helper: styl UI ===
    GM_addStyle(`
        .gf-window {
            background: #1b1b1b;
            border: 2px solid #d4af37;
            color: #fff;
            padding: 10px;
            border-radius: 8px;
            font-family: Verdana, sans-serif;
            max-width: 500px;
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
        }
        .gf-window h2 {
            color: #d4af37;
            text-align: center;
        }
        .gf-btn {
            background: #d4af37;
            border: none;
            color: #000;
            padding: 6px 12px;
            margin: 5px;
            cursor: pointer;
            border-radius: 6px;
        }
        .gf-changelog {
            max-height: 250px;
            overflow-y: auto;
            background: #111;
            padding: 6px;
            border-radius: 6px;
        }
    `);

    // === Changelog treść ===
    const changelog = `
    <div class="gf-changelog">
        <h3>📜 GrepoFusion Changelog</h3>
        <p><b>1.3.2 (aktualna)</b><br>
        🖼 Logo GrepoFusion widoczne w UI<br>
        ⚙️ Kreator konfiguracji (pierwsze uruchomienie)<br>
        📜 Changelog przy każdym odświeżeniu<br>
        👥 Autorzy: KID6767 & ChatGPT</p>

        <p><b>1.4.0 (planned)</b><br>
        📑 Raporty+ (eksport BBCode, sumowanie strat)<br>
        ⏳ Time Calculator (ETA)<br>
        🚢 Transport Calc+<br>
        ⛪ Temple Notifier</p>

        <p><b>1.5.0 (planned)</b><br>
        🛠 DIO Tools (częściowo)<br>
        🐙 GRCRTools<br>
        🗺 Map Enhancer</p>

        <p><b>1.6.0 (planned)</b><br>
        🗂 Rozszerzony panel (zakładki)<br>
        📊 GrepoData integracja<br>
        🎨 Nowe UI</p>
    </div>
    `;

    // === Funkcja: pokaż changelog ===
    function showChangelog() {
        const win = document.createElement("div");
        win.className = "gf-window";
        win.innerHTML = `
            <h2><img src="${GF_LOGO}" style="width:64px;height:64px;vertical-align:middle;"> GrepoFusion ${GF_VERSION}</h2>
            ${changelog}
            <button class="gf-btn" id="gf-close">OK</button>
        `;
        document.body.appendChild(win);
        document.getElementById("gf-close").onclick = () => win.remove();
    }

    // === Funkcja: kreator konfiguracji (demo) ===
    function showConfigurator() {
        const seen = GM_getValue("gf_seen_"+GF_VERSION, false);
        if (seen) return;

        const win = document.createElement("div");
        win.className = "gf-window";
        win.innerHTML = `
            <h2><img src="${GF_LOGO}" style="width:64px;height:64px;vertical-align:middle;"> GrepoFusion Setup</h2>
            <p>🎨 Wybierz kolor akcentu: <input type="color" id="gf-color" value="#d4af37"></p>
            <p><label><input type="checkbox" id="mod-back" checked> ◀ Back Button</label></p>
            <p><label><input type="checkbox" id="mod-trans" checked> 🚢 Transport Calculator</label></p>
            <p><label><input type="checkbox" id="mod-alarm" checked> ⚠ Attack Alarm</label></p>
            <button class="gf-btn" id="gf-save">Zapisz</button>
        `;
        document.body.appendChild(win);

        document.getElementById("gf-save").onclick = () => {
            GM_setValue("accentColor", document.getElementById("gf-color").value);
            GM_setValue("mod_back", document.getElementById("mod-back").checked);
            GM_setValue("mod_trans", document.getElementById("mod-trans").checked);
            GM_setValue("mod_alarm", document.getElementById("mod-alarm").checked);
            GM_setValue("gf_seen_"+GF_VERSION, true);
            win.remove();
            alert("✅ Konfiguracja GrepoFusion zapisana!");
        };
    }

    // === Start ===
    window.addEventListener("load", () => {
        showChangelog();   // zawsze pokazuj changelog
        showConfigurator(); // tylko raz na wersję
    });

})();
