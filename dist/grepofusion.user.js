// ==UserScript==
// @name         GrepoFusion
// @namespace    https://github.com/KID6767/GrepoFusion
// @version      1.5.0.2
// @description  Pirate Edition 2025: motywy, panel, powitanie+changelog, Integrations (GRCR/DIO/Quack) bez kasowania, poprawki layoutu (Senat/okna), bezpieczne podmiany ikon (Classic/Pirate/Remaster).
// @author       KID6767 & ChatGPT
// @match        https://*.grepolis.com/*
// @updateURL    https://raw.githubusercontent.com/KID6767/GrepoFusion/main/dist/grepofusion.user.js
// @downloadURL  https://raw.githubusercontent.com/KID6767/GrepoFusion/main/dist/grepofusion.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  'use strict';

  // ================= Core =================
  const VER = "1.5.0.2";
  const S = (k, d) => GM_getValue(k, d);
  const W = (k, v) => GM_setValue(k, v);

  const THEMES = {
    classic:{ bg:"#f4e2b2", text:"#222",    accent:"#a57e36", border:"#a57e36" },
    emerald:{ bg:"#0b1d13", text:"#d4af37", accent:"#14623a", border:"#d4af37" },
    pirate: { bg:"#0a0a0a", text:"#e0c878", accent:"#7c2f00", border:"#e0c878" }
  };
  const PACKS = {
    classic:  "assets/classic",
    pirate:   "assets/pirate",
    remaster: "assets/remaster2025"
  };

  const CFG = {
    theme:  S("gf_theme", "emerald"),
    pack:   S("gf_pack",  "pirate"),
    integrate: S("gf_integrate", true),   // integrujemy cudze dodatki (UI rebrand), nic nie kasujemy
    clean:  S("gf_clean", false),         // miękki clean: kosmetyka, bez remove()
    showChangelogEveryLoad: S("gf_changelog_always", true),
    assetBase: S("gf_asset_base", "https://raw.githubusercontent.com/KID6767/GrepoFusion/main")
  };

  // Przyklejamy klasę scopingową do <body> by NIE niszczyć core layoutu gry
  function addScopeClass() {
    document.documentElement.classList.add("gf-scope-root");
    document.body.classList.add("gf-scope");
  }

  function applyTheme() {
    const t = THEMES[CFG.theme] || THEMES.emerald;
    // Uwaga: scope'ujemy style do .gf-scope aby nie psuć .gpwindow_content layoutu
    GM_addStyle(`
      :root{
        --gf-bg:${t.bg}; --gf-text:${t.text}; --gf-accent:${t.accent}; --gf-border:${t.border};
        --gf-shadow:0 10px 30px rgba(0,0,0,.55);
      }
      /* tylko nasz scope, bez brutalnego nadpisu całych okien */
      .gf-scope {
        color: var(--gf-text);
      }
      .gf-scope .ui-dialog .ui-dialog-titlebar,
      .gf-scope .ui-tabs .ui-tabs-nav li.ui-state-active a {
        background: var(--gf-accent) !important; color: var(--gf-text) !important;
      }
      /* NIE zmieniamy tła wszystkich okien gry, jedynie elementy GrepoFusion i paski tytułu */
      .gf-fab{
        position: fixed; right: 18px; bottom: 18px; width: 44px; height: 44px;
        display:flex; align-items:center; justify-content:center; border-radius: 50%;
        border: 2px solid var(--gf-border); background: rgba(0,0,0,.9); color: var(--gf-text);
        font-size: 20px; cursor: pointer; z-index: 2147483647; box-shadow: var(--gf-shadow);
      }
      .gf-panel{
        position: fixed; right: 18px; bottom: 72px; min-width: 340px; max-width: 460px;
        padding: 12px; border: 2px solid var(--gf-border); border-radius: 14px;
        background: rgba(0,0,0,.92); color: var(--gf-text); z-index: 2147483647; box-shadow: var(--gf-shadow);
        font: 13px/1.4 system-ui,-apple-system,Segoe UI,Roboto,Arial;
      }
      .gf-title{ margin: 0 0 8px; font-weight: 700; font-size: 14px; }
      .gf-row{ display:flex; align-items:center; gap:8px; margin:8px 0; }
      .gf-row label{ flex: 1; }
      .gf-btn{
        padding: 6px 10px; border: 1px solid var(--gf-border); border-radius:8px;
        background: #0b1d13; color: var(--gf-text); cursor: pointer;
      }
      .gf-badge{
        display:inline-flex; align-items:center; gap:6px; padding:4px 8px; border-radius:999px;
        border: 1px solid var(--gf-border); background: rgba(0,0,0,.75); color: var(--gf-text); font-size: 12px;
      }
      /* Changelog / powitanie – standalone, zawsze działa bez assetów */
      .gf-changelog{
        position: fixed; left: 50%; top: 18px; transform: translateX(-50%);
        width: min(620px, 92vw); background: rgba(0,0,0,.94);
        border: 2px solid var(--gf-border); color: var(--gf-text);
        border-radius: 12px; padding: 14px; z-index: 2147483647; box-shadow: var(--gf-shadow);
      }
      .gf-changelog h3{ margin:0 0 6px; font-size: 16px; }
      .gf-changelog ul{ margin: 6px 0 0 18px; }
      .gf-close-x{ position:absolute; right: 10px; top: 8px; cursor:pointer; font-weight: 700; }

      /* Rebranding obcych badge – bez .remove() */
      .dio_btn, .dio-tools, .dio_tools, .grcr_logo, #grcrFooter, .quack_tools, .q_tool, .watchrij {
        border: 1px solid var(--gf-border) !important; background: rgba(0,0,0,.40) !important; color: var(--gf-text) !important;
      }

      /* Ikony GrepoFusion (CSS override) */
      .gf-icon-ship-light, .gf-icon-ship-bireme, .gf-icon-ship-trireme, .gf-icon-ship-colony, .gf-icon-ship-fire,
      .gf-ui-report, .gf-ui-message, .gf-ui-settings{
        width: 28px; height: 28px; background-size: contain; background-repeat: no-repeat; background-position:center;
        display:inline-block; filter: drop-shadow(0 2px 2px rgba(0,0,0,.3));
      }
    `);
  }

  // Changelog / powitanie (nie zależy od assetów)
  function showChangelog() {
    if (!CFG.showChangelogEveryLoad) return;
    const box = document.createElement('div');
    box.className = 'gf-changelog';
    box.innerHTML = `
      <div class="gf-close-x" title="Zamknij">✖</div>
      <h3>⚓ GrepoFusion v${VER} — Pirate Edition</h3>
      <ul>
        <li>Naprawa layoutu okien (Senat/okna – bez tła blackout)</li>
        <li>Powitanie/changelog niezależny od assetów</li>
        <li>Integrations: GRCR/DIO/Quack — wchłonięte i rebrandowane (bez kasowania)</li>
        <li>Bezpieczne, scope'owane style (nie psują UI Grepolis)</li>
        <li>Wstępne ikony statków/UI per pakiet (Classic/Pirate/Remaster)</li>
      </ul>
      <div style="margin-top:10px;display:flex;gap:8px;justify-content:flex-end;">
        <button class="gf-btn" id="gf-hide-once">OK</button>
        <button class="gf-btn" id="gf-hide-forever">Nie pokazuj</button>
      </div>
    `;
    document.body.appendChild(box);
    box.querySelector('.gf-close-x').onclick = () => box.remove();
    box.querySelector('#gf-hide-once').onclick = () => box.remove();
    box.querySelector('#gf-hide-forever').onclick = () => { W("gf_changelog_always", false); box.remove(); };
  }

  // Panel ustawień
  function openPanel() {
    const ex = document.querySelector('.gf-panel'); if (ex) { ex.remove(); return; }
    const panel = document.createElement('div');
    panel.className = 'gf-panel';
    panel.innerHTML = `
      <div class="gf-title">⚙️ GrepoFusion — Ustawienia</div>

      <div class="gf-row"><label>Motyw UI</label>
        <select id="gf-theme">
          <option value="classic">Classic</option>
          <option value="emerald">Emerald</option>
          <option value="pirate">Pirate</option>
        </select>
      </div>

      <div class="gf-row"><label>Pakiet grafik</label>
        <select id="gf-pack">
          <option value="classic">Classic</option>
          <option value="pirate">Pirate Edition</option>
          <option value="remaster">Remaster 2025</option>
        </select>
      </div>

      <div class="gf-row"><label>Asset Base (GitHub RAW / lokalny)</label></div>
      <div class="gf-row"><input id="gf-asset-base" style="flex:1; padding:6px; border-radius:8px; border:1px solid var(--gf-border);" value="${CFG.assetBase}"></div>

      <div class="gf-row">🧩 Integrations Mode (wchłanianie zewnętrznych dodatków) <input type="checkbox" id="gf-integrate" ${CFG.integrate ? 'checked' : ''}></div>
      <div class="gf-row">🧹 Soft Clean (rebrand tylko wizualny) <input type="checkbox" id="gf-clean" ${CFG.clean ? 'checked' : ''}></div>
      <div class="gf-row">📜 Changelog przy każdym odświeżeniu <input type="checkbox" id="gf-chg" ${CFG.showChangelogEveryLoad ? 'checked' : ''}></div>

      <div class="gf-row" style="justify-content:flex-end; gap:8px;">
        <button class="gf-btn" id="gf-save">Zapisz</button>
        <button class="gf-btn" id="gf-close">Zamknij</button>
      </div>

      <div style="margin-top:12px;">
        <div class="gf-title">🔗 Wchłonięte dodatki (skróty)</div>
        <div class="gf-badge">GRCRTools</div>
        <div class="gf-badge">DIO-TOOLS</div>
        <div class="gf-badge">Quack</div>
      </div>

      <div style="margin-top:12px;opacity:.8;">
        <span class="gf-badge">GrepoFusion v${VER}</span>
      </div>
    `;
    document.body.appendChild(panel);

    panel.querySelector('#gf-theme').value = CFG.theme;
    panel.querySelector('#gf-pack').value  = CFG.pack;
    panel.querySelector('#gf-close').onclick = () => panel.remove();
    panel.querySelector('#gf-save').onclick  = () => {
      W("gf_theme", panel.querySelector('#gf-theme').value);
      W("gf_pack",  panel.querySelector('#gf-pack').value);
      W("gf_asset_base", panel.querySelector('#gf-asset-base').value.trim() || CFG.assetBase);
      W("gf_integrate", panel.querySelector('#gf-integrate').checked);
      W("gf_clean", panel.querySelector('#gf-clean').checked);
      W("gf_changelog_always", panel.querySelector('#gf-chg').checked);
      alert("✅ Zapisano. Odśwież stronę.");
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

  // Integrations — rebrand/przeniesienie bez kasowania
  function integrateExternal() {
    if (!CFG.integrate) return;
    // Rebrand wykonujemy CSS-em (już w GM_addStyle). Dodatkowo możemy unifikować pozycje:
    // Przykładowo przenoszenie „pływających” buttonów do naszego „koszyka”.
    const bucketId = "gf-integration-bucket";
    let bucket = document.getElementById(bucketId);
    if (!bucket) {
      bucket = document.createElement('div');
      bucket.id = bucketId;
      bucket.style.cssText = "position:fixed; right:18px; bottom:130px; z-index:2147483646; pointer-events:none;";
      document.body.appendChild(bucket);
    }
    const move = (sel) => {
      document.querySelectorAll(sel).forEach(el => {
        // tylko jeśli to „latające” UI – nie ruszamy elementów głęboko w oknach gry
        if (getComputedStyle(el).position === "fixed" || getComputedStyle(el).position === "absolute") {
          el.style.pointerEvents = "auto";
          el.style.margin = "6px";
          bucket.appendChild(el);
        }
      });
    };
    move('.dio_btn, .dio-tools, .dio_tools, .quack_tools, .q_tool, .watchrij, .grcr_logo, #grcrFooter');
  }

  // Soft clean – zero remove(), tylko kosmetyka
  function softClean() {
    if (!CFG.clean) return;
    GM_addStyle(`
      .dio_btn a, .dio-tools a, .grcr_logo a, .quack_tools a { color: var(--gf-text) !important; }
    `);
  }

  // Asset switch (bezpieczny CSS override)
  function buildAssetURL(rel) { return `${CFG.assetBase}/${PACKS[CFG.pack]}/${rel}`; }
  function applyPrelimIconOverrides() {
    const css = `
      .gf-icon-ship-light  { background-image:url('${buildAssetURL("ships/lightship.png")}') !important; }
      .gf-icon-ship-bireme { background-image:url('${buildAssetURL("ships/bireme.png")}') !important; }
      .gf-icon-ship-trireme{ background-image:url('${buildAssetURL("ships/trireme.png")}') !important; }
      .gf-icon-ship-colony { background-image:url('${buildAssetURL("ships/titanic.png")}') !important; }
      .gf-icon-ship-fire   { background-image:url('${buildAssetURL("ships/black_pearl.png")}') !important; }
      .gf-ui-report   { background-image:url('${buildAssetURL("ui/report.png")}') !important; }
      .gf-ui-message  { background-image:url('${buildAssetURL("ui/message.png")}') !important; }
      .gf-ui-settings { background-image:url('${buildAssetURL("ui/settings.png")}') !important; }
    `;
    GM_addStyle(css);
  }

  // Debug
  window.GF = window.GF || {};
  window.GF.debug = () => {
    const state = {
      version: VER,
      cfg: { ...CFG },
      has: {
        GRCR: !!(window.GRCR || window.GRCRTools),
        DIO:  !!(window.DIO || window.dio_tools || window.dio_btn),
        QUACK:!!(window.QUACK || window.quack_tools)
      }
    };
    console.log("%c[GrepoFusion] Debug", "color:var(--gf-border);font-weight:700;", state);
    return state;
  };

  // Init
  function init() {
    const start = () => {
      try {
        addScopeClass();
        applyTheme();
        mountFAB();
        if (CFG.showChangelogEveryLoad) showChangelog();
        if (CFG.integrate) integrateExternal();
        if (CFG.clean)     softClean();
        applyPrelimIconOverrides();
        console.log("%c[GrepoFusion] v" + VER + " ready (theme="+CFG.theme+", pack="+CFG.pack+", integrate="+CFG.integrate+")", "color:var(--gf-border);font-weight:700;");
      } catch (e) {
        console.error("[GrepoFusion] init error:", e);
      }
    };
    if (document.readyState === "complete" || document.readyState === "interactive") setTimeout(start, 250);
    else window.addEventListener("DOMContentLoaded", () => setTimeout(start, 250));
  }
  init();
})();
