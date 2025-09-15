// ==UserScript==
// @name         GrepoFusion
// @namespace    https://github.com/KID6767/GrepoFusion
// @version      1.4.0-beta
// @description  Redesign/Remaster 2025: złoto-szmaragdowy motyw, panel ustawień, Lab (beta), changelog, clean mode, beige-killer, wstępna podmiana ikon statków.
// @author       KID6767 & ChatGPT
// @match        https://*.grepolis.com/*
// @icon         data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIwIiBoZWlnaHQ9IjIyMCIgdmlld0JveD0iMCAwIDIyMCAyMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHNpcmNsZSBjeD0iMTEwIiBjeT0iMTEwIiByPSI5NSIgZmlsbD0iI0UxQURBNiIvPjxwYXRoIGQ9Ik0xMTAgMzUgNzUgOTUgMTEwIDE4NSAxNDUgOTUgMTEwIDM1eiIgZmlsbD0iI0Q0QUYzNyIvPjwvc3ZnPg==
// @updateURL    https://raw.githubusercontent.com/KID6767/GrepoFusion/main/dist/grepofusion.user.js
// @downloadURL  https://raw.githubusercontent.com/KID6767/GrepoFusion/main/dist/grepofusion.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  'use strict';

  const GF = {
    VERSION: '1.4.0-beta',
    KEY: {
      ACCENT: 'gf_accent',            // kolor akcentu (złoto)
      BG: 'gf_bg',                    // kolor tła (szmaragd)
      SHOW_CHANGELOG: 'gf_seen_'      // sufiks: wersja
        + '1.4.0-beta',
      HIDE_WELCOME: 'gf_hide_welcome',
      MODULES: 'gf_modules',
      SHIP_RULES: 'gf_ship_rules',
    },
    DEFAULTS: {
      accent: '#d4af37', // gold
      bg: '#1a3d2f',     // emerald/dark
      modules: {
        cleanMode: true,
        beigeKiller: true,
        lab: true,
        shipIcons: true,
        uiDarkAll: true,
      },
      shipRules: [
        // Wstępne reguły (podmiana ikon przez contains → lokalne assety)
        // Docelowo zamienimy na prawdziwe grafiki w 1.4.1+
        { contains: 'unit_fire_ship', replace: 'assets/remaster/ships/blackpearl.png' },
        { contains: 'unit_transporter', replace: 'assets/remaster/ships/titanic.png' }
      ]
    }
  };

  // ===== Helpers =====
  const S = (k, d) => {
    try { return GM_getValue(k, d); } catch { return d; }
  };
  const W = (k, v) => {
    try { GM_setValue(k, v); } catch {}
  };

  const accent = S(GF.KEY.ACCENT, GF.DEFAULTS.accent);
  const bg = S(GF.KEY.BG, GF.DEFAULTS.bg);
  const modules = Object.assign({}, GF.DEFAULTS.modules, S(GF.KEY.MODULES, {}));
  const shipRules = S(GF.KEY.SHIP_RULES, GF.DEFAULTS.shipRules);

  // ===== Base theme (gold + emerald) =====
  GM_addStyle(`
    :root {
      --gf-bg: ${bg};
      --gf-gold: ${accent};
      --gf-input: #0c2a20;
    }
    /* Tła i teksty */
    body, .ui-widget-content, .ui-dialog, .gpwindow_content, .ui-dialog .gpwindow_content, .ui-tabs-panel,
    .ui-dialog .ui-dialog-content, .ui-tooltip, #ui_tooltip {
      background-color: var(--gf-bg) !important;
      color: var(--gf-gold) !important;
    }
    /* Nagłówki / belki */
    .ui-dialog .ui-dialog-titlebar, .gpwindow .gpwindow_header, .ui-tabs .ui-tabs-nav, .ui-tabs .ui-tabs-nav li.ui-state-active a {
      background-color: var(--gf-bg) !important;
      color: var(--gf-gold) !important;
      border-color: var(--gf-gold) !important;
    }
    /* Ramki */
    .gpwindow_content, .ui-dialog, .ui-dialog-titlebar, .ui-tabs .ui-tabs-nav li, .ui-widget-content, .game_list,
    .report_title, .message_header {
      border-color: var(--gf-gold) !important;
    }
    /* Linki / przyciski */
    a, a:link, a:visited { color: var(--gf-gold) !important; }
    .button, .button_new, .btn, .button .caption {
      background: transparent !important;
      color: var(--gf-gold) !important;
      border-color: var(--gf-gold) !important;
    }
    .button:hover, .btn:hover { filter: brightness(1.08); }
    /* Inputy */
    input, select, textarea {
      background: var(--gf-input) !important;
      color: var(--gf-gold) !important;
      border: 1px solid var(--gf-gold) !important;
    }
    /* Scrollbar (webkit) */
    *::-webkit-scrollbar { width: 10px; height: 10px; }
    *::-webkit-scrollbar-thumb { background: var(--gf-gold); border-radius: 8px; }
    *::-webkit-scrollbar-track { background: var(--gf-bg); }
  `);

  // ===== Clean mode (usuń widoczne sygnatury narzędzi) =====
  function applyCleanMode(root = document) {
    if (!modules.cleanMode) return;
    const RX = /(GRCR|GRCRTools|DIO[- ]?TOOLS|Quack|Toolsammlung|Octopus|Ośmiorniczka)/i;
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
    let n;
    while ((n = tw.nextNode())) {
      const t = (n.textContent || '').trim();
      const idc = ((n.id || '') + ' ' + (n.className || '')).toString();
      const tt = n.getAttribute?.('title') || n.getAttribute?.('alt') || '';
      if (RX.test(t) || RX.test(idc) || RX.test(tt)) {
        n.style.setProperty('display', 'none', 'important');
      }
    }
  }

  // ===== Beige Killer (tolerancja ~10% dla #f4e2b2) =====
  function nearBeige(rgb) {
    // #f4e2b2 = (244,226,178). Tolerancja ±10%: 24/22/18
    const target = [244,226,178], tol = [24,22,18];
    return Math.abs(rgb[0]-target[0])<=tol[0] &&
           Math.abs(rgb[1]-target[1])<=tol[1] &&
           Math.abs(rgb[2]-target[2])<=tol[2];
  }
  function cssColorToRGB(v) {
    if (!v) return null;
    if (v.startsWith('#')) {
      const s = v.replace('#','');
      const n = s.length===3 ? s.split('').map(c=>c+c).join('') : s;
      const r = parseInt(n.substring(0,2),16),
            g = parseInt(n.substring(2,4),16),
            b = parseInt(n.substring(4,6),16);
      return [r,g,b];
    }
    const m = v.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/i);
    return m ? [parseInt(m[1]),parseInt(m[2]),parseInt(m[3])] : null;
  }
  function applyBeigeKiller(root=document) {
    if (!modules.beigeKiller) return;
    const els = root.querySelectorAll('*');
    els.forEach(el=>{
      const cs = getComputedStyle(el);
      const bgc = cssColorToRGB(cs.backgroundColor);
      const bc  = cssColorToRGB(cs.borderTopColor);
      if (bgc && nearBeige(bgc)) {
        el.style.setProperty('background-color', bg, 'important');
        el.style.setProperty('color', accent, 'important');
      }
      if (bc && nearBeige(bc)) {
        el.style.setProperty('border-color', accent, 'important');
      }
      // inline „beige”
      if (el.getAttribute && /#f4e2b2|beige|rgb\\(244,\\s*226,\\s*178\\)/i.test(el.getAttribute('style')||'')) {
        el.style.setProperty('background-color', bg, 'important');
        el.style.setProperty('color', accent, 'important');
      }
    });
  }

  // ===== Ship icon overrides (proste reguły CSS) =====
  function applyShipRules() {
    if (!modules.shipIcons || !shipRules?.length) return;
    const css = shipRules.map(r =>
      `img[src*="${r.contains}"]{content:url("${r.replace}");}`
    ).join('\\n');
    GM_addStyle(css);
  }

  // ===== UI: panel ustawień + Lab =====
  function makePanel() {
    const panel = document.createElement('div');
    panel.id = 'gf-panel';
    panel.innerHTML = `
      <div class="gf-floating">
        <div class="gf-head">
          <span>⚔️ GrepoFusion ${GF.VERSION}</span>
          <button class="gf-close">✕</button>
        </div>
        <div class="gf-body">
          <div class="gf-section">
            <h4>🎨 Motyw</h4>
            <label>Kolor akcentu (gold): <input type="color" id="gf-accent" value="${accent}"></label>
            <label>Kolor tła (emerald): <input type="color" id="gf-bg" value="${bg}"></label>
            <button id="gf-save-colors" class="gf-btn">Zapisz kolory</button>
          </div>

          <div class="gf-section">
            <h4>🧩 Moduły</h4>
            ${Object.entries(modules).map(([key,val])=>`
              <label class="gf-check">
                <input type="checkbox" data-mod="${key}" ${val?'checked':''}> ${key}
              </label>
            `).join('')}
            <button id="gf-save-mods" class="gf-btn">Zapisz moduły</button>
          </div>

          <div class="gf-section">
            <h4>⚗️ GrepoFusion Lab (beta)</h4>
            <p>Eksperymentalne funkcje będą trafiać tutaj w 1.4.x.</p>
            <button id="gf-lab-demo" class="gf-btn">Pokaż demo</button>
          </div>

          <div class="gf-section">
            <h4>📜 Changelog</h4>
            <ul class="gf-changelog">
              <li><b>1.4.0-beta</b> — motyw Gold+Emerald, Panel, Lab (beta), Clean mode, Beige-killer, wstępne podmiany ikon statków.</li>
              <li><b>1.3.3</b> — system porównań Before/After, mini-galeria w popupie, Easter Bunny.</li>
            </ul>
          </div>
        </div>
      </div>
      <button class="gf-toggle">⚙️ GrepoFusion</button>
    `;
    GM_addStyle(`
      .gf-toggle{
        position:fixed; right:14px; bottom:18px; z-index:2147483647;
        background:var(--gf-bg); color:var(--gf-gold);
        border:1px solid var(--gf-gold); border-radius:10px; padding:8px 12px;
        font-weight:700; cursor:pointer;
      }
      .gf-floating{
        position:fixed; right:14px; bottom:66px; z-index:2147483646;
        width:360px; max-height:70vh; overflow:auto;
        background:var(--gf-bg); color:var(--gf-gold);
        border:2px solid var(--gf-gold); border-radius:14px; box-shadow:0 12px 28px rgba(0,0,0,.45);
        display:none;
      }
      .gf-floating.show{ display:block; }
      .gf-head{
        display:flex; justify-content:space-between; align-items:center;
        padding:10px 12px; border-bottom:1px solid var(--gf-gold); font-weight:800;
      }
      .gf-body{ padding:10px 12px; }
      .gf-section{ margin-bottom:12px; }
      .gf-section h4{ margin:0 0 6px 0; font-size:14px; }
      .gf-btn{
        background:transparent; color:var(--gf-gold); border:1px solid var(--gf-gold);
        border-radius:8px; padding:6px 10px; cursor:pointer; margin-top:6px;
      }
      .gf-btn:hover{ filter:brightness(1.1); }
      .gf-check{ display:flex; gap:8px; align-items:center; margin:4px 0; }
      .gf-changelog{ padding-left:16px; }
    `);
    document.body.appendChild(panel);

    const toggle = panel.querySelector('.gf-toggle');
    const win = panel.querySelector('.gf-floating');
    const close = panel.querySelector('.gf-close');

    toggle.onclick = () => win.classList.toggle('show');
    close.onclick = () => win.classList.remove('show');

    panel.querySelector('#gf-save-colors').onclick = () => {
      const a = panel.querySelector('#gf-accent').value || GF.DEFAULTS.accent;
      const b = panel.querySelector('#gf-bg').value || GF.DEFAULTS.bg;
      W(GF.KEY.ACCENT, a);
      W(GF.KEY.BG, b);
      alert('Zapisano. Odśwież stronę (F5), aby wczytać kolory.');
    };
    panel.querySelector('#gf-save-mods').onclick = () => {
      const all = panel.querySelectorAll('input[type="checkbox"][data-mod]');
      const m = {};
      all.forEach(ch => m[ch.dataset.mod] = ch.checked);
      W(GF.KEY.MODULES, m);
      alert('Zapisano moduły. Odśwież stronę (F5).');
    };
    panel.querySelector('#gf-lab-demo').onclick = () => {
      alert('GrepoFusion Lab (beta) — miejsce na eksperymenty 1.4.x');
    };
  }

  // ===== Changelog / Welcome =====
  function showChangelogOnce() {
    const key = GF.KEY.SHOW_CHANGELOG;
    const seen = S(key, false);
    if (seen) return;
    const box = document.createElement('div');
    box.innerHTML = `
      <div class="gf-chg">
        <h3>GrepoFusion ${GF.VERSION}</h3>
        <ul>
          <li>🎨 Motyw Gold+Emerald (złote teksty, ciemne tła).</li>
          <li>🧹 Clean Mode — ukrywa sygnatury innych dodatków.</li>
          <li>🟤 Beige-killer — zabija beż (#f4e2b2 ±10%).</li>
          <li>⚗️ GrepoFusion Lab — start sekcji beta (w panelu).</li>
          <li>🚢 Wstępne podmiany ikon statków (rules).</li>
        </ul>
        <button class="gf-ok">OK</button>
      </div>
    `;
    GM_addStyle(`
      .gf-chg{
        position:fixed; left:50%; top:50%; transform:translate(-50%,-50%);
        background:var(--gf-bg); color:var(--gf-gold);
        border:2px solid var(--gf-gold); border-radius:12px; padding:16px 18px;
        z-index:2147483647; width:480px; max-width:90vw; box-shadow:0 12px 28px rgba(0,0,0,.5);
        font-family:Verdana, Arial, sans-serif;
      }
      .gf-chg h3{ margin:0 0 8px 0; }
      .gf-chg button.gf-ok{
        margin-top:10px; background:transparent; color:var(--gf-gold);
        border:1px solid var(--gf-gold); border-radius:8px; padding:6px 10px; cursor:pointer;
      }
    `);
    document.body.appendChild(box);
    box.querySelector('.gf-ok').onclick = () => {
      W(key, true);
      box.remove();
    };
  }

  // ===== Observers =====
  function observeDom() {
    const obs = new MutationObserver(ms => {
      ms.forEach(m => {
        m.addedNodes && m.addedNodes.forEach(n => {
          if (n.nodeType !== 1) return;
          if (modules.cleanMode) applyCleanMode(n);
          if (modules.beigeKiller) applyBeigeKiller(n);
        });
      });
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  // ===== Run =====
  function init() {
    // UI
    makePanel();
    // Features
    if (modules.cleanMode) applyCleanMode(document);
    if (modules.beigeKiller) applyBeigeKiller(document);
    if (modules.shipIcons) applyShipRules();
    showChangelogOnce();
    observeDom();
    console.log('%c[GrepoFusion] ' + GF.VERSION + ' załadowany', 'color:'+accent+';font-weight:700;');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
