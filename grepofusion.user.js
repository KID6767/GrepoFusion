// ==UserScript==
// @name         GrepoFusion
// @namespace    https://github.com/KID6767/GrepoFusion
// @version      1.5.0-beta
// @description  Pirate Edition 2025: pełny motyw (Gold+Emerald), panel ustawień, Clean Mode, changelog overlay, wybór pakietu grafik (Classic / Pirate / Remaster) i wstępne podmiany ikon (statki/UI).
// @author       KID6767 & ChatGPT
// @match        https://*.grepolis.com/*
// @icon         data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjZDRhZjM3IiB3aWR0aD0iMjQwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDI0MCAyNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHNpcmNsZSBjeD0iMTIwIiBjeT0iMTIwIiByPSIxMTAiIGZpbGw9IiMwYjFkMTMiLz48dGV4dCB4PSI1MCUiIHk9IjU1JSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2Q0YWYzNyIgZm9udC1zaXplPSIzMCIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiPkZHPC90ZXh0Pjwvc3ZnPg==
// @updateURL    https://raw.githubusercontent.com/KID6767/GrepoFusion/main/dist/grepofusion.user.js
// @downloadURL  https://raw.githubusercontent.com/KID6767/GrepoFusion/main/dist/grepofusion.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  'use strict';

  /* ==============================
     CONST / STORAGE
  =============================== */
  const VER = "1.5.0-beta";
  const S = (k, d) => GM_getValue(k, d);
  const W = (k, v) => GM_setValue(k, v);

  // Motywy kolorystyczne
  const THEMES = {
    classic:  { bg: "#f4e2b2", text: "#222",    accent: "#a57e36", border: "#a57e36" },
    emerald:  { bg: "#0b1d13", text: "#d4af37", accent: "#14623a", border: "#d4af37" },
    pirate:   { bg: "#0a0a0a", text: "#e0c878", accent: "#7c2f00", border: "#e0c878" }
  };

  // Pakiety assetów (folder w repo)
  const PACKS = {
    classic:  "assets/classic",
    pirate:   "assets/pirate",
    remaster: "assets/remaster2025"
  };

  // Użytkowe ustawienia
  const CFG = {
    theme: S("gf_theme", "emerald"),
    pack : S("gf_pack",  "pirate"), // classic/pirate/remaster
    clean: S("gf_clean", true),
    showChangelogEveryLoad: S("gf_changelog_always", true),
    // base do assetów – na produkcji zostaw GH raw; lokalnie można podmienić w panelu
    assetBase: S("gf_asset_base", "https://raw.githubusercontent.com/KID6767/GrepoFusion/main")
  };

  /* ==============================
     BASE CSS (motyw + UI)
  =============================== */
  function applyTheme(tKey) {
    const t = THEMES[tKey] || THEMES.emerald;
    GM_addStyle(`
      :root{
        --gf-bg:${t.bg};
        --gf-text:${t.text};
        --gf-accent:${t.accent};
        --gf-border:${t.border};
        --gf-shadow:0 10px 30px rgba(0,0,0,.55);
      }
      body, .gpwindow_content, .ui-dialog, .ui-tabs-panel{
        background: var(--gf-bg) !important;
        color: var(--gf-text) !important;
      }
      .ui-dialog .ui-dialog-titlebar,
      .ui-tabs .ui-tabs-nav li.ui-state-active a{
        background: var(--gf-accent) !important;
        color: var(--gf-text) !important;
      }
      /* FAB */
      .gf-fab{
        position: fixed; right: 18px; bottom: 18px; width: 44px; height: 44px;
        display:flex; align-items:center; justify-content:center;
        border-radius: 50%; border: 2px solid var(--gf-border);
        background: rgba(0,0,0,.9); color: var(--gf-text);
        font-size: 20px; cursor: pointer; z-index: 2147483647;
        box-shadow: var(--gf-shadow);
      }
      .gf-panel{
        position: fixed; right: 18px; bottom: 72px; min-width: 340px; max-width: 420px;
        padding: 12px; border: 2px solid var(--gf-border);
        background: rgba(0,0,0,.92); color: var(--gf-text);
        border-radius: 14px; z-index: 2147483647; box-shadow: var(--gf-shadow);
        font: 13px/1.4 system-ui,-apple-system,Segoe UI,Roboto,Arial;
      }
      .gf-title{ margin: 0 0 8px; font-weight: 700; font-size: 14px; }
      .gf-row{ display:flex; align-items:center; gap:8px; margin:8px 0; }
      .gf-row label{ flex: 1; }
      .gf-btn{
        padding: 6px 10px; border: 1px solid var(--gf-border);
        border-radius:8px; background: #0b1d13; color: var(--gf-text); cursor: pointer;
      }
      .gf-changelog{
        position: fixed; left: 50%; top: 18px; transform: translateX(-50%);
        width: min(600px, 92vw); background: rgba(0,0,0,.94);
        border: 2px solid var(--gf-border); color: var(--gf-text);
        border-radius: 12px; padding: 14px; z-index: 2147483647; box-shadow: var(--gf-shadow);
      }
      .gf-changelog h3{ margin:0 0 6px; font-size: 16px; }
      .gf-changelog ul{ margin: 6px 0 0 18px; }
      .gf-close-x{ position:absolute; right: 10px; top: 8px; cursor:pointer; font-weight: 700; }
      /* Podstawowe badge GrepoFusion w UI */
      .gf-badge{
        display:inline-flex; align-items:center; gap:6px; padding:4px 8px; border-radius:999px;
        border: 1px solid var(--gf-border); background: rgba(0,0,0,.75); color: var(--gf-text);
        font-size: 12px;
      }
    `);
  }
  applyTheme(CFG.theme);

  /* ==============================
     CLEAN MODE (po innych dodatkach)
  =============================== */
  function cleanMode() {
    if (!CFG.clean) return;
    const killers = [
      '.dio_btn', '.dio-tools', '.dio_tools', '.grcr_logo', '#grcrFooter',
      '.quack_tools', '.q_tool', '.watchrij', '.octopus', '.osmorama'
    ];
    killers.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => el.remove());
    });
  }
// --- Integracje: konfiguracja przełączników ---
const INTEGRATIONS_KEY = "gf_integrations";
const INTEGRATIONS = Object.assign({
  grcrtools: true,      // Raporty -> BBCode, raport linki
  diotools:  true,      // skróty, podglądy, ulepszenia mapy
  transport: true,      // kalkulator transportu
  timers:    true,      // alarm/timery
  backbtn:   true       // back button w profilach
}, S(INTEGRATIONS_KEY, {}));

// --- UI w panelu: dodaj pod sekcją z motywami/pakietem ---
function renderIntegrationToggles(container){
  container.insertAdjacentHTML("beforeend", `
    <div class="gf-title" style="margin-top:6px">🔌 Integracje (wcielone)</div>
    <div class="gf-row">GRCRTools (raporty → BBCode) <input type="checkbox" id="gf-int-grcr" ${INTEGRATIONS.grcrtools?'checked':''}></div>
    <div class="gf-row">DIO-TOOLS (ulepszenia UI/mapa) <input type="checkbox" id="gf-int-dio" ${INTEGRATIONS.diotools?'checked':''}></div>
    <div class="gf-row">Transport kalkulator <input type="checkbox" id="gf-int-transport" ${INTEGRATIONS.transport?'checked':''}></div>
    <div class="gf-row">Timery/Alarm <input type="checkbox" id="gf-int-timers" ${INTEGRATIONS.timers?'checked':''}></div>
    <div class="gf-row">Back button (profile) <input type="checkbox" id="gf-int-backbtn" ${INTEGRATIONS.backbtn?'checked':''}></div>
  `);
}

// W openPanel(): tuż przed przyciskami Zapisz/Zamknij, wywołaj:
renderIntegrationToggles(panel);

// W handlerze „Zapisz” dodaj:
const newIntegrations = {
  grcrtools: panel.querySelector('#gf-int-grcr').checked,
  diotools:  panel.querySelector('#gf-int-dio').checked,
  transport: panel.querySelector('#gf-int-transport').checked,
  timers:    panel.querySelector('#gf-int-timers').checked,
  backbtn:   panel.querySelector('#gf-int-backbtn').checked
};
W(INTEGRATIONS_KEY, newIntegrations);

  /* ==============================
     CHANGES OVERLAY (przy każdym odświeżeniu)
  =============================== */
  function showChangelogOverlay() {
    if (!CFG.showChangelogEveryLoad) return;
    const box = document.createElement('div');
    box.className = 'gf-changelog';
    box.innerHTML = `
      <div class="gf-close-x" title="Zamknij">✖</div>
      <h3>📜 GrepoFusion v${VER} — Pirate Edition</h3>
      <ul>
        <li>Motyw Gold+Emerald (ciemny) + złote akcenty</li>
        <li>Panel ustawień (motywy, pakiety grafik, Clean Mode)</li>
        <li>Clean Mode — usuwa ślady innych dodatków</li>
        <li>Podstawowe podmiany ikon (statki/UI)</li>
        <li>GrepoFusion Lab — przygotowane pod eksperymenty</li>
      </ul>
      <div style="margin-top:10px;display:flex;gap:8px;justify-content:flex-end;">
        <button class="gf-btn" id="gf-hide-once">OK</button>
        <button class="gf-btn" id="gf-hide-forever">Nie pokazuj</button>
      </div>
    `;
    document.body.appendChild(box);
    box.querySelector('.gf-close-x').onclick = () => box.remove();
    box.querySelector('#gf-hide-once').onclick = () => box.remove();
    box.querySelector('#gf-hide-forever').onclick = () => {
      W("gf_changelog_always", false);
      CFG.showChangelogEveryLoad = false;
      box.remove();
    };
  }

  /* ==============================
     PANEL USTAWIEŃ
  =============================== */
  function openPanel() {
    const ex = document.querySelector('.gf-panel');
    if (ex) { ex.remove(); return; }

    const panel = document.createElement('div');
    panel.className = 'gf-panel';
    panel.innerHTML = `
      <div class="gf-title">⚙️ GrepoFusion — Ustawienia</div>

      <div class="gf-row">
        <label>Motyw UI</label>
        <select id="gf-theme">
          <option value="classic">Classic</option>
          <option value="emerald">Emerald</option>
          <option value="pirate">Pirate</option>
        </select>
      </div>

      <div class="gf-row">
        <label>Pakiet grafik</label>
        <select id="gf-pack">
          <option value="classic">Classic</option>
          <option value="pirate">Pirate Edition</option>
          <option value="remaster">Remaster 2025</option>
        </select>
      </div>

      <div class="gf-row">
        <label>Asset Base (GitHub RAW / lokalny)</label>
      </div>
      <div class="gf-row">
        <input id="gf-asset-base" style="flex:1; padding:6px; border-radius:8px; border:1px solid var(--gf-border);" value="${CFG.assetBase}">
      </div>

      <div class="gf-row">🧹 Clean Mode <input type="checkbox" id="gf-clean" ${CFG.clean ? 'checked' : ''}></div>
      <div class="gf-row">📜 Pokaż changelog przy każdym odświeżeniu <input type="checkbox" id="gf-chg" ${CFG.showChangelogEveryLoad ? 'checked' : ''}></div>

      <div class="gf-row" style="justify-content:flex-end; gap:8px;">
        <button class="gf-btn" id="gf-save">Zapisz</button>
        <button class="gf-btn" id="gf-close">Zamknij</button>
      </div>

      <div style="margin-top:12px;opacity:.8;">
        <span class="gf-badge">GrepoFusion v${VER}</span>
      </div>
    `;
    document.body.appendChild(panel);

    // set values
    panel.querySelector('#gf-theme').value = CFG.theme;
    panel.querySelector('#gf-pack').value = CFG.pack;

    // actions
    panel.querySelector('#gf-close').onclick = () => panel.remove();
    panel.querySelector('#gf-save').onclick  = () => {
      const newTheme = panel.querySelector('#gf-theme').value;
      const newPack  = panel.querySelector('#gf-pack').value;
      const newBase  = panel.querySelector('#gf-asset-base').value.trim();
      const newClean = panel.querySelector('#gf-clean').checked;
      const newChg   = panel.querySelector('#gf-chg').checked;

      W("gf_theme", newTheme);
      W("gf_pack",  newPack);
      W("gf_asset_base", newBase || CFG.assetBase);
      W("gf_clean", newClean);
      W("gf_changelog_always", newChg);

      alert("✅ Zapisano. Odśwież stronę, aby zastosować zmiany.");
    };
  }

  // FAB
  function mountFAB() {
    const fab = document.createElement('div');
    fab.className = 'gf-fab';
    fab.title = 'GrepoFusion — Ustawienia';
    fab.textContent = '⚙';
    fab.onclick = openPanel;
    document.body.appendChild(fab);
  }

  /* ==============================
     ASSET SWITCH (wstępna podmiana)
     — bezpiecznie: CSS nadpisujący wybrane elementy
     — pakiety: classic/pirate/remaster
  =============================== */
  function buildAssetURL(relPath) {
    // np. `${CFG.assetBase}/${PACKS[CFG.pack]}/ships/bireme.png`
    return `${CFG.assetBase}/${PACKS[CFG.pack]}/${relPath}`;
  }

  function applyPrelimIconOverrides() {
    GF.Modules.Transport.mount();
    GF.Modules.Timers.mount();
    GF.Modules.BackButton.mount();
    GF.Modules.GRCR.mount();
    GF.Modules.DIO.mount();

    // UWAGA: selektory są „bezpieczne wstępne”.
    // Jeśli w Twojej instancji Grepolis DOM różni się, będziemy je doszlifowywać w 1.5.1+
    const css = `
      /* Przykład: dock/port listy statków (ikony) */
      /* W razie potrzeby podmienimy na konkretne selektory Twojego świata */
      .gf-icon-ship-light  { background-image:url('${buildAssetURL("ships/lightship.png")}') !important; }
      .gf-icon-ship-bireme { background-image:url('${buildAssetURL("ships/bireme.png")}') !important; }
      .gf-icon-ship-trireme{ background-image:url('${buildAssetURL("ships/trireme.png")}') !important; }
      .gf-icon-ship-colony { background-image:url('${buildAssetURL("ships/titanic.png")}') !important; }
      .gf-icon-ship-fire   { background-image:url('${buildAssetURL("ships/black_pearl.png")}') !important; }

      /* UI przyciski przykładowe */
      .gf-ui-report   { background-image:url('${buildAssetURL("ui/report.png")}') !important; }
      .gf-ui-message  { background-image:url('${buildAssetURL("ui/message.png")}') !important; }
      .gf-ui-settings { background-image:url('${buildAssetURL("ui/settings.png")}') !important; }

      /* Ramka pod ikonę (uniwersalna) */
      .gf-icon-ship-light, .gf-icon-ship-bireme, .gf-icon-ship-trireme, .gf-icon-ship-colony, .gf-icon-ship-fire,
      .gf-ui-report, .gf-ui-message, .gf-ui-settings{
        width: 28px; height: 28px; background-size: contain; background-repeat: no-repeat; background-position: center;
        display:inline-block; filter: drop-shadow(0 2px 2px rgba(0,0,0,.3));
      }
    `;
    GM_addStyle(css);
  }
// ==============================
// MODULES (wcielone)
// ==============================
const GF = (window.GF ||= { Modules:{} });

GF.Modules.Transport = {
  enabled(){ return S(INTEGRATIONS_KEY, INTEGRATIONS).transport; },
  mount(){
    if(!this.enabled()) return;
    // TODO: pełny kalkulator (1.5.x)
    console.log("[GF] Transport module mounted");
  }
};

GF.Modules.Timers = {
  enabled(){ return S(INTEGRATIONS_KEY, INTEGRATIONS).timers; },
  mount(){
    if(!this.enabled()) return;
    // TODO: alarm ataku, countdowny, przypominajki
    console.log("[GF] Timers module mounted");
  }
};

GF.Modules.BackButton = {
  enabled(){ return S(INTEGRATIONS_KEY, INTEGRATIONS).backbtn; },
  mount(){
    if(!this.enabled()) return;
    // TODO: wykrycie profilu gracza → wstaw przycisk „Wstecz”
    console.log("[GF] BackButton module mounted");
  }
};

GF.Modules.GRCR = {
  enabled(){ return S(INTEGRATIONS_KEY, INTEGRATIONS).grcrtools; },
  mount(){
    if(!this.enabled()) return;
    // TODO: parser raportów → BBCode, skrócone linki, itp.
    console.log("[GF] GRCR (BBCode) module mounted");
  }
};

GF.Modules.DIO = {
  enabled(){ return S(INTEGRATIONS_KEY, INTEGRATIONS).diotools; },
  mount(){
    if(!this.enabled()) return;
    // TODO: drobne ulepszenia UI/mapa kompatybilne z naszym motywem
    console.log("[GF] DIO module mounted");
  }
};

  /* ==============================
     INIT
  =============================== */
  function init() {
    // Delikatne opóźnienie – Grepolis lubi dociągać UI po load
    const start = () => {
      try {
        if (CFG.clean) cleanMode();
        mountFAB();
        if (CFG.showChangelogEveryLoad) showChangelogOverlay();
        applyPrelimIconOverrides();
        console.log("%c[GrepoFusion] v" + VER + " ready (theme=" + CFG.theme + ", pack=" + CFG.pack + ")", "color:var(--gf-border);font-weight:700;");
      } catch (e) {
        console.error("[GrepoFusion] init error:", e);
      }
    };
    if (document.readyState === "complete" || document.readyState === "interactive") {
      setTimeout(start, 250);
    } else {
      window.addEventListener("DOMContentLoaded", () => setTimeout(start, 250));
    }
  }

  init();
})();
