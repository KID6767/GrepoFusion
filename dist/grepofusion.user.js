// ==UserScript==
// @name         GrepoFusion
// @namespace    https://github.com/KID6767/GrepoFusion
// @version      1.5.0.1
// @description  Pirate Edition 2025: pełny motyw (Gold+Emerald), panel ustawień, Integrations Mode (wchłanianie GRCR/DIO/Quack), rebrand bez usuwania, changelog overlay, wybór pakietu grafik (Classic/Pirate/Remaster) i wstępne podmiany ikon (statki/UI).
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

  const VER = "1.5.0.1";
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
    // Clean Mode domyślnie OFF (już nic nie usuwa – tylko rebranduje, jeśli włączysz)
    clean:  S("gf_clean", false),
    // Integrations Mode ON: wchłaniamy UI zewnętrznych modów pod GrepoFusion
    integrate: S("gf_integrate", true),
    showChangelogEveryLoad: S("gf_changelog_always", true),
    assetBase: S("gf_asset_base", "https://raw.githubusercontent.com/KID6767/GrepoFusion/main")
  };

  function applyTheme(key) {
    const t = THEMES[key] || THEMES.emerald;
    GM_addStyle(`
      :root{
        --gf-bg:${t.bg}; --gf-text:${t.text}; --gf-accent:${t.accent}; --gf-border:${t.border};
        --gf-shadow:0 10px 30px rgba(0,0,0,.55);
      }
      body, .gpwindow_content, .ui-dialog, .ui-tabs-panel{
        background: var(--gf-bg) !important; color: var(--gf-text) !important;
      }
      .ui-dialog .ui-dialog-titlebar,
      .ui-tabs .ui-tabs-nav li.ui-state-active a{
        background: var(--gf-accent) !important; color: var(--gf-text) !important;
      }
      .gf-fab{
        position: fixed; right: 18px; bottom: 18px; width: 44px; height: 44px;
        display:flex; align-items:center; justify-content:center; border-radius: 50%;
        border: 2px solid var(--gf-border); background: rgba(0,0,0,.9); color: var(--gf-text);
        font-size: 20px; cursor: pointer; z-index: 2147483647; box-shadow: var(--gf-shadow);
      }
      .gf-panel{
        position: fixed; right: 18px; bottom: 72px; min-width: 340px; max-width: 440px;
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
      .gf-changelog{
        position: fixed; left: 50%; top: 18px; transform: translateX(-50%); width: min(600px, 92vw);
        background: rgba(0,0,0,.94); border: 2px solid var(--gf-border); color: var(--gf-text);
        border-radius: 12px; padding: 14px; z-index: 2147483647; box-shadow: var(--gf-shadow);
      }
      .gf-changelog h3{ margin:0 0 6px; font-size: 16px; }
      .gf-changelog ul{ margin: 6px 0 0 18px; }
      .gf-close-x{ position:absolute; right: 10px; top: 8px; cursor:pointer; font-weight: 700; }

      .gf-integ-list { display:flex; flex-direction:column; gap:6px; padding:6px; border:1px dashed var(--gf-border); border-radius:8px; }
      .gf-integ-item { display:flex; gap:8px; align-items:center; }
      .gf-badge{
        display:inline-flex; align-items:center; gap:6px; padding:4px 8px; border-radius:999px;
        border: 1px solid var(--gf-border); background: rgba(0,0,0,.75); color: var(--gf-text); font-size: 12px;
      }

      /* Skin zamiast kasowania obcych badge – rebrand do naszego stylu */
      .dio_btn, .dio-tools, .dio_tools, .grcr_logo, #grcrFooter, .quack_tools, .q_tool, .watchrij {
        border: 1px solid var(--gf-border) !important; background: rgba(0,0,0,.65) !important; color: var(--gf-text) !important;
      }
    `);
  }
  applyTheme(CFG.theme);

  // Changelog overlay
  function showChangelog() {
    if (!CFG.showChangelogEveryLoad) return;
    const box = document.createElement('div');
    box.className = 'gf-changelog';
    box.innerHTML = `
      <div class="gf-close-x" title="Zamknij">✖</div>
      <h3>📜 GrepoFusion v${VER} — Pirate Edition (Integrations)</h3>
      <ul>
        <li>Integrations Mode: GRCR/DIO/Quack itp. wchłonięte pod GrepoFusion (bez kasowania funkcji)</li>
        <li>Clean Mode domyślnie wyłączony i miękki (rebrand zamiast usuwania)</li>
        <li>Panel z wyborem motywu i pakietu grafik (Classic/Pirate/Remaster)</li>
        <li>Wstępne podmiany ikon statków/UI (po dodaniu assetów)</li>
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
      box.remove();
    };
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
      <div class="gf-row">🧹 Clean Mode (rebrand tylko wizualny) <input type="checkbox" id="gf-clean" ${CFG.clean ? 'checked' : ''}></div>
      <div class="gf-row">📜 Changelog przy każdym odświeżeniu <input type="checkbox" id="gf-chg" ${CFG.showChangelogEveryLoad ? 'checked' : ''}></div>

      <div class="gf-row" style="justify-content:flex-end; gap:8px;">
        <button class="gf-btn" id="gf-save">Zapisz</button>
        <button class="gf-btn" id="gf-close">Zamknij</button>
      </div>

      <div style="margin-top:12px;">
        <div class="gf-title">🔗 Wchłonięte dodatki</div>
        <div id="gf-integrations" class="gf-integ-list">
          <div class="gf-integ-item"><span class="gf-badge">GRCRTools</span><button class="gf-btn" id="gf-open-grcr">Otwórz</button></div>
          <div class="gf-integ-item"><span class="gf-badge">DIO-TOOLS</span><button class="gf-btn" id="gf-open-dio">Otwórz</button></div>
          <div class="gf-integ-item"><span class="gf-badge">Quack</span><button class="gf-btn" id="gf-open-quack">Otwórz</button></div>
        </div>
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

    // Hooki integracyjne (jeśli są obecne globalne obiekty — bez psucia)
    const openIf = (name, fns) => {
      const btn = panel.querySelector(name);
      if (!btn) return;
      btn.disabled = !fns.some(fn => typeof fn === 'function');
      btn.onclick = () => {
        for (const fn of fns) { try { if (typeof fn === 'function') { fn(); return; } } catch(e){} }
        alert("Nie wykryto API modułu — upewnij się, że dodatek jest aktywny.");
      };
    };

    // PRZYKŁADOWE bezpieczne hooki (dopasujemy dokładniej w 1.5.1 po Twoich screenach):
    openIf('#gf-open-grcr', [window.GRCRTools?.open, window.GRCR?.open, window.GRCRTools]);
    openIf('#gf-open-dio',  [window.DIO?.open,     window.dio_open,    window.DIO]);
    openIf('#gf-open-quack',[window.QUACK?.open,   window.quack_open,  window.QUACK]);
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

  // Integrations Mode – przenoszenie UI zewnętrznych dodatków pod GrepoFusion (rebrand)
  function integrateExternal() {
    if (!CFG.integrate) return;
    // Zamiast usuwać – przenosimy znane nody pod nasz kontener (lub chowamy badge).
    const bucketId = "gf-integration-bucket";
    let bucket = document.getElementById(bucketId);
    if (!bucket) {
      bucket = document.createElement('div');
      bucket.id = bucketId;
      bucket.style.cssText = "position:fixed; right:18px; bottom:130px; z-index:2147483646; pointer-events:none;";
      document.body.appendChild(bucket);
    }
    const move = sel => {
      document.querySelectorAll(sel).forEach(el => {
        el.style.pointerEvents = "auto"; // przywróć klikalność
        el.style.margin = "6px";
        el.style.border = "1px solid var(--gf-border)";
        el.style.background = "rgba(0,0,0,.65)";
        bucket.appendChild(el);
      });
    };
    // Znane klasy/ID – tylko przeniesienie/rebrand
    move('.dio_btn, .dio-tools, .dio_tools');
    move('.grcr_logo, #grcrFooter');
    move('.quack_tools, .q_tool, .watchrij');
  }

  // Miękki Clean Mode – tylko kosmetyka, niczego nie kasuje
  function softClean() {
    if (!CFG.clean) return;
    // ewentualne dodatkowe podbicie stylu:
    GM_addStyle(`
      .dio_btn a, .dio-tools a, .grcr_logo a, .quack_tools a { color: var(--gf-text) !important; }
    `);
  }

  // Asset Switch (CSS nadpisujący – pakiety Classic/Pirate/Remaster)
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
      .gf-icon-ship-light, .gf-icon-ship-bireme, .gf-icon-ship-trireme, .gf-icon-ship-colony, .gf-icon-ship-fire,
      .gf-ui-report, .gf-ui-message, .gf-ui-settings{
        width: 28px; height: 28px; background-size: contain; background-repeat: no-repeat; background-position:center;
        display:inline-block; filter: drop-shadow(0 2px 2px rgba(0,0,0,.3));
      }
    `;
    GM_addStyle(css);
  }

  function init() {
    const start = () => {
      try {
        mountFAB();
        if (CFG.showChangelogEveryLoad) showChangelog();
        if (CFG.integrate) integrateExternal();
        if (CFG.clean)     softClean();
        applyPrelimIconOverrides();
        console.log("%c[GrepoFusion] v" + VER + " ready (theme="+CFG.theme+", pack="+CFG.pack+", integrate="+CFG.integrate+")", "color:var(--gf-border);font-weight:700;");
      } catch (e) { console.error("[GrepoFusion] init error:", e); }
    };
    if (document.readyState === "complete" || document.readyState === "interactive") setTimeout(start, 250);
    else window.addEventListener("DOMContentLoaded", () => setTimeout(start, 250));
  }
  init();
})();
