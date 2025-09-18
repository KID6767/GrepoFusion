// ==UserScript==
// @name         GrepoFusion
// @namespace    https://github.com/KID6767/GrepoFusion
// @version      1.5.0.2-alpha
// @description  GrepoFusion — Aegis themes, AssetMap (bireme test + placeholders), Panel, Welcome, Changelog, Pomocnik Budowlańca, Rekruter, Asystent Akademii. Legal-friendly (no auto actions by default).
// @author       KID6767 & ChatGPT
// @match        https://*.grepolis.com/*
// @icon         https://raw.githubusercontent.com/KID6767/GrepoFusion/main/assets/ui/logo.png
// @updateURL    https://raw.githubusercontent.com/KID6767/GrepoFusion/main/dist/grepofusion.user.js
// @downloadURL  https://raw.githubusercontent.com/KID6767/GrepoFusion/main/dist/grepofusion.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// ==/UserScript==

(function(){
  'use strict';

  /**************************************************************************
   * GrepoFusion 1.5.0.2-alpha
   * - Motywy (Aegis)
   * - AssetMap (podmiana grafik)
   * - Panel ustawień
   * - Welcome + changelog
   * - Pomocnik Budowlańca (interaktywny kolejnik, manual exec)
   * - Rekruter (Koszary/Port) - kolejka rekrutacji
   * - Asystent Akademii - kolejka badań
   * - Estetyczne poprawki UI (rounded icons)
   *
   * Zasada: funkcjonalności przygotowane -> manualny/bezpieczny wykonawca.
   * Automatyzację zostawiamy wyłączoną (można rozszerzyć w przyszłych wersjach).
   **************************************************************************/

  /* ===============================
     Minimalne helpery / storage
     =============================== */
  const VER = "1.5.0.2-alpha";
  const gget = (k, d) => (typeof GM_getValue === "function" ? GM_getValue(k, d) : d);
  const gset = (k, v) => (typeof GM_setValue === "function" ? GM_setValue(k, v) : null);
  const onReady = fn => (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", fn) : fn());
  const logPrefix = "%c[GrepoFusion]";
  function log(...a){ console.log(logPrefix, "color:#d4af37;font-weight:700", ...a); }
  function toast(msg, t=2200){
    try{
      const id = "gf-toast";
      let el = document.getElementById(id);
      if(el) el.remove();
      el = document.createElement("div");
      el.id = id;
      el.textContent = msg;
      el.style.cssText = "position:fixed;left:50%;bottom:56px;transform:translateX(-50%);background:#0f0f0f;color:#d4af37;border:1px solid #d4af37;border-radius:10px;padding:8px 12px;z-index:2147483647;box-shadow:0 8px 24px rgba(0,0,0,.55);font:13px/1.3 system-ui,Arial";
      document.body.appendChild(el);
      setTimeout(()=>el.remove(), t);
    }catch(e){}
  }

  /* ===============================
     THEMES / STYLES (Aegis)
     =============================== */
  const THEME_CSS = {
    classic: `
      :root{--gf-gold:#d4af37;--gf-bg:#f4e2b2;--gf-text:#222;--gf-line:#a57e36;}
      body, .gpwindow_content, .ui-dialog, .ui_box { background: var(--gf-bg) !important; color: var(--gf-text) !important; }
      .ui-dialog .ui-dialog-titlebar, .ui-tabs .ui-tabs-nav li.ui-state-active a { background: var(--gf-line) !important; color: var(--gf-text) !important; }
    `,
    remaster: `
      :root{--gf-gold:#f2d98d;--gf-bg:#1b2326;--gf-text:#f2d98d;--gf-line:#a8832b;}
      body, .gpwindow_content, .ui-dialog, .ui_box { background: var(--gf-bg) !important; color: var(--gf-text) !important; }
      .ui-dialog .ui-dialog-titlebar, .ui-tabs .ui-tabs-nav li.ui-state-active a { background: #111 !important; color: var(--gf-text) !important; border-color: var(--gf-line) !important; }
      .btn, .button, .ui-button { background:#1f1a17 !important; color:var(--gf-text) !important; border:1px solid var(--gf-line) !important; }
    `,
    pirate: `
      :root{--gf-gold:#d4af37;--gf-bg:#0b0b0b;--gf-text:#d4af37;--gf-line:#d4af37;}
      body, .gpwindow_content { background: var(--gf-bg) !important; color: var(--gf-text) !important; }
      .ui-dialog .ui-dialog-titlebar { background: #0a0a0a !important; color: var(--gf-text) !important; border-color: var(--gf-line) !important;}
    `,
    dark: `
      :root{--gf-bg:#111;--gf-text:#ddd;--gf-line:#555;}
      body, .gpwindow_content { background: var(--gf-bg) !important; color: var(--gf-text) !important; }
      .btn, .button { background:#222 !important; color:#ddd !important; border:1px solid var(--gf-line) !important; }
    `
  };

  function applyTheme(name){
    const css = THEME_CSS[name] || THEME_CSS.pirate;
    let s = document.getElementById("gf-theme");
    if(!s){ s = document.createElement("style"); s.id = "gf-theme"; document.head.appendChild(s); }
    s.textContent = css + `
      /* Estetyka: zaokrąglenia ikon i elementów prawy panel */
      #ui_box .menu_wrapper .menue img, #ui_box .gp_main_menu .item img, .game_header .game_header_link img { border-radius:8px !important; box-shadow:0 2px 6px rgba(0,0,0,.25) !important; }
      .gp_city_list .city, .ui-tabs .ui-tabs-nav li a { border-radius:10px !important; }
      .gf-fab { border-radius:50%; box-shadow:0 12px 40px rgba(0,0,0,.55); }
      .gf-panel { border-radius:12px; box-shadow:0 18px 48px rgba(0,0,0,.6); }
    `;
    gset("gf_theme", name);
  }

  /* ===============================
     ASSET MAP (podmiana grafik)
     - RAW_BASE możesz ustawić w panelu (domyślnie repo)
     - mapowanie ścieżek => url (funkcja lub string)
     =============================== */
  let RAW_BASE = gget("gf_raw_base", "https://raw.githubusercontent.com/KID6767/GrepoFusion/main/assets");

  // Placeholdery w SVG (data URI)
  const PH_GOLD = "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' rx='12' fill='#d4af37'/><text x='50%' y='56%' font-family='Arial' font-size='16' text-anchor='middle' fill='#080808'>GF</text></svg>`);
  const PH_EMERALD = "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' rx='12' fill='#14623a'/><text x='50%' y='56%' font-family='Arial' font-size='16' text-anchor='middle' fill='#f2d98d'>GF</text></svg>`);

  // Static map — core entries (bireme test + placeholders)
  const STATIC_MAP = {
    "ships/bireme.png": () => `${RAW_BASE}/ships/bireme.png`,
    "ships/bireme_pirate.png": () => `${RAW_BASE}/ships/bireme_pirate.png`,
    "ships/trireme.png": () => PH_GOLD,
    "ships/lightship.png": () => PH_GOLD,
    "ships/colony_ship.png": () => PH_GOLD,
    "ships/fire_ship.png": () => PH_GOLD,
    "buildings/senate.png": () => PH_EMERALD,
    "buildings/academy.png": () => PH_EMERALD,
    "ui/report.png": () => PH_GOLD,
    "ui/message.png": () => PH_GOLD,
    "ui/settings.png": () => PH_GOLD
  };

  function getAssetMap(){
    const ext = gget("gf_asset_map_ext", {});
    const out = {};
    Object.keys(STATIC_MAP).forEach(k => { try{ out[k] = typeof STATIC_MAP[k] === "function" ? STATIC_MAP[k]() : STATIC_MAP[k]; }catch(e){} });
    Object.keys(ext).forEach(k => out[k] = ext[k]);
    // add common aliases for Grepolis (12x/48x)
    Object.keys(out).forEach(k => { out[`12x/${k}`] = out[k]; out[`48x/${k}`] = out[k]; });
    return out;
  }

  function mapUrl(url){
    try{
      if(!url || typeof url !== "string") return url;
      const clean = url.split("?")[0].split("#")[0];
      const m = getAssetMap();
      for(const needle in m){ if(clean.includes(needle)) return m[needle]; }
    }catch(e){}
    return url;
  }

  // Patch HTMLImageElement.src and setAttribute('src', ...)
  (function patchImgs(){
    const desc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
    if(desc && desc.set){
      Object.defineProperty(HTMLImageElement.prototype,'src',{
        set:function(v){ return desc.set.call(this, mapUrl(v)); },
        get:desc.get
      });
    }
    const _setAttr = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name, val){
      if(this.tagName === 'IMG' && name === 'src') return _setAttr.call(this, name, mapUrl(val));
      return _setAttr.call(this, name, val);
    };
  })();

  // MutationObserver: patch already present
  function patchExistingImgs(root){
    try{
      (root.querySelectorAll ? root : document).querySelectorAll('img[src]').forEach(img=>{
        const src = img.getAttribute('src');
        const mapped = mapUrl(src);
        if(mapped && mapped !== src) img.setAttribute('src', mapped);
      });
    }catch(e){}
  }

  const MO = new MutationObserver((mutations)=>{
    for(const m of mutations){
      for(const n of m.addedNodes || []){
        if(n && n.nodeType === 1){
          if(n.tagName === "IMG" && n.src) n.src = mapUrl(n.src);
          patchExistingImgs(n);
        }
      }
    }
  });
  MO.observe(document.documentElement, {childList:true, subtree:true});

  /* ===============================
     UI: Floating FAB + Panel
     =============================== */
  function mountFAB(){
    if(document.getElementById("gf-fab")) return;
    const fab = document.createElement("div");
    fab.id = "gf-fab";
    fab.className = "gf-fab";
    fab.title = "GrepoFusion — ustawienia";
    fab.textContent = "⚙";
    Object.assign(fab.style, {
      position: "fixed", right: "18px", bottom: "18px", width: "48px", height: "48px",
      background: "#111", color: "#d4af37", display: "flex", alignItems: "center", justifyContent: "center",
      border: "2px solid #d4af37", cursor: "pointer", zIndex: 2147483647, borderRadius: "50%"
    });
    fab.onclick = togglePanel;
    document.body.appendChild(fab);
  }

  function togglePanel(){
    const ex = document.getElementById("gf-panel");
    if(ex) return ex.remove();
    openPanel();
  }

  function openPanel(){
    if(document.getElementById("gf-panel")) return;
    const p = document.createElement("div");
    p.id = "gf-panel";
    Object.assign(p.style, { position:"fixed", right:"18px", bottom:"80px", width:"360px", background:"#0f0f0f", color:"#d4af37", border:"1px solid #d4af37", padding:"12px", zIndex:2147483647, borderRadius:"12px", boxShadow:"0 18px 48px rgba(0,0,0,.6)"});
    p.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <b>GrepoFusion ${VER}</b>
        <button id="gf-panel-close" style="background:#111;color:#d4af37;border:1px solid #d4af37;border-radius:6px;padding:2px 8px;cursor:pointer">×</button>
      </div>
      <div style="margin-top:10px;font-size:13px">
        <div style="margin-bottom:6px">Motyw (Aegis):</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
          <button class="gf-theme-btn" data-theme="classic">Classic</button>
          <button class="gf-theme-btn" data-theme="remaster">Remaster</button>
          <button class="gf-theme-btn" data-theme="pirate">Pirate</button>
          <button class="gf-theme-btn" data-theme="dark">Dark</button>
        </div>

        <div style="margin-top:6px">RAW base (assets):</div>
        <input id="gf-rawbase" style="width:100%;padding:6px;border-radius:8px;border:1px solid #d4af37;background:#111;color:#d4af37" value="${RAW_BASE}">
        <button id="gf-save-raw" style="margin-top:6px;width:100%;padding:6px;border-radius:8px;border:1px solid #d4af37;background:#111;color:#d4af37;cursor:pointer">Zapisz RAW base</button>

        <div style="margin-top:10px">Importer mapy (JSON):</div>
        <input id="gf-map-json" placeholder='{"ships/lightship.png":"https://.../file.png"}' style="width:100%;padding:6px;border-radius:8px;border:1px solid #d4af37;background:#111;color:#d4af37">
        <button id="gf-map-apply" style="margin-top:6px;width:100%;padding:6px;border-radius:8px;border:1px solid #d4af37;background:#111;color:#d4af37;cursor:pointer">Dodaj mapowanie</button>

        <div style="margin-top:12px">
          <label style="display:flex;align-items:center;gap:8px"><input id="gf-enable-builder" type="checkbox" ${gget("gf_enable_builder", true) ? "checked":""}/> Pomocnik budowlańca</label>
          <label style="display:flex;align-items:center;gap:8px"><input id="gf-enable-recruiter" type="checkbox" ${gget("gf_enable_recruiter", true) ? "checked":""}/> Rekruter (Koszary/Port)</label>
          <label style="display:flex;align-items:center;gap:8px"><input id="gf-enable-academy" type="checkbox" ${gget("gf_enable_academy", true) ? "checked":""}/> Asystent Akademii</label>
        </div>

        <div style="margin-top:10px;display:flex;gap:8px">
          <button id="gf-open-builder" style="flex:1;padding:6px;border-radius:8px;border:1px solid #d4af37;background:#111;color:#d4af37;cursor:pointer">Otwórz Budowlańca</button>
          <button id="gf-open-recruit" style="flex:1;padding:6px;border-radius:8px;border:1px solid #d4af37;background:#111;color:#d4af37;cursor:pointer">Rekruter</button>
        </div>

        <div style="margin-top:10px;display:flex;gap:8px">
          <button id="gf-reset-settings" style="flex:1;padding:6px;border-radius:8px;border:1px solid #a33;background:#111;color:#d4af37;cursor:pointer">Reset ustawień</button>
        </div>
      </div>
    `;
    document.body.appendChild(p);

    // handlers
    p.querySelectorAll(".gf-theme-btn").forEach(b=>{
      b.style.cssText = "background:#111;color:#d4af37;border:1px solid #d4af37;border-radius:8px;padding:6px;cursor:pointer";
      b.onclick = ()=>{ applyTheme(b.dataset.theme); toast("Motyw: "+b.dataset.theme); };
    });
    p.querySelector("#gf-panel-close").onclick = ()=>p.remove();
    p.querySelector("#gf-save-raw").onclick = ()=>{
      const v = p.querySelector("#gf-rawbase").value.trim();
      if(v){ RAW_BASE = v; gset("gf_raw_base", v); toast("Zapisano RAW base"); }
    };
    p.querySelector("#gf-map-apply").onclick = ()=>{
      try{
        const val = p.querySelector("#gf-map-json").value.trim();
        const cur = gget("gf_asset_map_ext", {});
        const add = JSON.parse(val || "{}");
        Object.assign(cur, add);
        gset("gf_asset_map_ext", cur);
        toast("Dodano mapowanie assetów");
      }catch(e){ toast("Błędny JSON"); }
    };
    p.querySelector("#gf-reset-settings").onclick = ()=>{
      ["gf_theme","gf_raw_base","gf_asset_map_ext"].forEach(k=>gset(k,null));
      toast("Ustawienia zresetowane - odśwież stronę");
    };
    p.querySelector("#gf-open-builder").onclick = ()=>{ openBuilderUI(); };
    p.querySelector("#gf-open-recruit").onclick = ()=>{ openRecruitUI(); };

    // toggles
    p.querySelector("#gf-enable-builder").onchange = (e)=> gset("gf_enable_builder", !!e.target.checked);
    p.querySelector("#gf-enable-recruiter").onchange = (e)=> gset("gf_enable_recruiter", !!e.target.checked);
    p.querySelector("#gf-enable-academy").onchange = (e)=> gset("gf_enable_academy", !!e.target.checked);
  }

  /* ===============================
     Welcome overlay + changelog
     =============================== */
  function showWelcome(){
    if(gget("gf_seen_welcome", false)) return;
    const w = document.createElement("div");
    Object.assign(w.style, { position:"fixed", left:"50%", top:"50%", transform:"translate(-50%,-50%)", width:"min(720px,92vw)", background:"#0f0f0f", color:"#d4af37", border:"2px solid #d4af37", padding:"14px", zIndex:2147483647, borderRadius:"12px", boxShadow:"0 20px 50px rgba(0,0,0,.6)" });
    w.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <b>Witaj w GrepoFusion ${VER}</b>
        <button id="gf-w-x" style="background:#111;color:#d4af37;border:1px solid #d4af37;border-radius:6px;padding:2px 8px;cursor:pointer">×</button>
      </div>
      <div style="margin-top:10px">GrepoFusion łączy: motywy, podmianę grafik i moduły asystentów. Wszystko w trybie legal-friendly (brak automatycznych akcji domyślnie).</div>
      <div style="margin-top:10px;display:flex;gap:8px">
        <button class="gf-w-theme" data-theme="pirate" style="flex:1">Pirate</button>
        <button class="gf-w-theme" data-theme="remaster" style="flex:1">Remaster</button>
      </div>
      <div style="margin-top:10px">RAW base (assets): <input id="gf-w-raw" style="width:100%;padding:6px;border-radius:6px;border:1px solid #d4af37;background:#111;color:#d4af37;margin-top:6px" value="${RAW_BASE}"></div>
      <div style="margin-top:10px;display:flex;justify-content:flex-end;gap:8px"><button id="gf-w-save" style="background:#111;color:#d4af37;border:1px solid #d4af37;padding:6px;border-radius:6px;cursor:pointer">Zapisz</button></div>
    `;
    document.body.appendChild(w);
    w.querySelectorAll(".gf-w-theme").forEach(b=>{ b.onclick = ()=>applyTheme(b.dataset.theme); });
    w.querySelector("#gf-w-x").onclick = ()=>{ w.remove(); gset("gf_seen_welcome", true); };
    w.querySelector("#gf-w-save").onclick = ()=>{
      const v = w.querySelector("#gf-w-raw").value.trim();
      if(v){ RAW_BASE = v; gset("gf_raw_base", v); }
      w.remove(); gset("gf_seen_welcome", true); toast("Zapisano startowe ustawienia");
    };
  }

  function showChangelog(){
    const box = document.createElement("div");
    Object.assign(box.style, { position:"fixed", left:"50%", top:"18px", transform:"translateX(-50%)", width:"min(720px,92vw)", background:"#0f0f0f", color:"#d4af37", border:"2px solid #d4af37", padding:"12px", zIndex:2147483647, borderRadius:"10px", boxShadow:"0 16px 40px rgba(0,0,0,.55)" });
    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <b>GrepoFusion ${VER} — Changelog</b>
        <button id="gf-chg-x" style="background:#111;color:#d4af37;border:1px solid #d4af37;padding:2px 8px;border-radius:6px;cursor:pointer">×</button>
      </div>
      <ul style="margin:8px 0 0 18px;line-height:1.35">
        <li>Aegis (Classic / Remaster / Pirate / Dark).</li>
        <li>AssetMap: test bireme + placeholders.</li>
        <li>Pomocnik Budowlańca, Rekruter, Asystent Akademii (UI + manual exec).</li>
        <li>Zaokrąglenia ikon prawego panelu i estetyczne poprawki.</li>
      </ul>
    `;
    document.body.appendChild(box);
    box.querySelector("#gf-chg-x").onclick = ()=>box.remove();
  }

  /* ===============================
     Pomocnik Budowlańca (Senat)
     - UI: okno z listą miast -> budynki -> celowy poziom
     - Wygenerowanie "orderów", przycisk Execute ( ręczne wykonanie)
     - Wykonanie przez frontend_bridge (model BuildingOrder) - ręczne i z retry
     - UWAGA: działamy bez automatyzacji; użytkownik klika execute.
     =============================== */

  // Lista docelowych budynków i przykładowe mapowanie (key = building internal name)
  const BUILDING_KEYS = [
    { key: "main", label: "Główny budynek" },
    { key: "farm", label: "Gospodarstwo" },
    { key: "storage", label: "Magazyn" },
    { key: "lumber", label: "Tartak" },
    { key: "stoner", label: "Kamieniołom" },
    { key: "ironer", label: "Huta" },
    { key: "barracks", label: "Koszary" },
    { key: "docks", label: "Port" },
    { key: "academy", label: "Akademia" },
    { key: "temple", label: "Świątynia" },
    { key: "market", label: "Rynek" }
  ];

  // helper: read model data
  function getBuildingModels(){
    if(typeof MM === "undefined" || !MM.getModels) return [];
    const models = MM.getModels().BuildingBuildData || {};
    return Object.values(models).map(m => m.attributes).filter(Boolean);
  }

  // Create builder panel
  function openBuilderUI(){
    if(!gget("gf_enable_builder", true)){ toast("Pomocnik budowlańca wyłączony w panelu"); return; }
    // remove old
    const id = "gf-builder";
    const ex = document.getElementById(id); if(ex) return ex.remove();

    const panel = document.createElement("div");
    panel.id = id;
    Object.assign(panel.style, { position:"fixed", left:"50%", top:"50%", transform:"translate(-50%,-50%)", width:"min(900px,96vw)", maxHeight:"80vh", overflow:"auto", background:"#0f0f0f", color:"#d4af37", border:"2px solid #d4af37", padding:"12px", zIndex:2147483647, borderRadius:"10px", boxShadow:"0 20px 60px rgba(0,0,0,.6)"});
    panel.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center">
        <b>Pomocnik Budowlańca</b>
        <div>
          <button id="gf-builder-refresh" style="margin-right:6px">Odśwież</button>
          <button id="gf-builder-close">Zamknij</button>
        </div>
      </div>
      <div style="margin-top:8px">Poniżej ustaw docelowy poziom dla każdego budynku w każdej Twojej miejscowości. Po ustawieniu kliknij <b>Generuj zlecenia</b>, a następnie <b>Wykonaj</b> by zlecić budowę.</div>
      <div id="gf-builder-content" style="margin-top:10px"></div>
      <div style="margin-top:10px;display:flex;gap:8px;justify-content:flex-end">
        <button id="gf-builder-gen" style="padding:6px;border-radius:6px">Generuj zlecenia</button>
        <button id="gf-builder-exec" style="padding:6px;border-radius:6px">Wykonaj (ręcznie)</button>
      </div>`;

    document.body.appendChild(panel);
    panel.querySelector("#gf-builder-close").onclick = ()=>panel.remove();
    panel.querySelector("#gf-builder-refresh").onclick = ()=> renderBuilderContent(panel.querySelector("#gf-builder-content"));
    panel.querySelector("#gf-builder-gen").onclick = ()=> generateOrders(panel.querySelector("#gf-builder-content"));
    panel.querySelector("#gf-builder-exec").onclick = ()=> executeOrders();

    renderBuilderContent(panel.querySelector("#gf-builder-content"));
  }

  // Render content: for each town, show building current next_level and inputs to set target
  function renderBuilderContent(container){
    container.innerHTML = "<div>Ładowanie modeli...</div>";
    const models = getBuildingModels();
    if(!models || models.length === 0){
      container.innerHTML = "<div>Brak danych modelu budynków (poczekaj, odśwież stronę). Jeśli błąd - odczekaj chwilę i spróbuj ponownie.</div>";
      return;
    }
    // Build HTML
    const wrap = document.createElement("div");
    models.forEach(m => {
      const townId = m.id;
      const townName = (window.ITowns && ITowns.towns && ITowns.towns[townId]) ? ITowns.towns[townId].name : ("Town " + townId);
      const box = document.createElement("div");
      box.style.cssText = "border:1px solid rgba(212,175,55,.12);padding:8px;margin-bottom:8px;border-radius:8px;background:rgba(0,0,0,.35)";
      box.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><b>${townName}</b><span style="font-size:12px">ID: ${townId}</span></div>`;
      const table = document.createElement("div");
      table.style.cssText = "display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px";
      BUILDING_KEYS.forEach(bk=>{
        const data = m.building_data[bk.key] || {};
        const curLevel = data.current_level || data.level || 0;
        const nextLevel = data.next_level || curLevel + 1;
        const hasMax = !!data.has_max_level;
        const row = document.createElement("div");
        row.innerHTML = `<div style="font-size:12px">${bk.label}</div>
          <div style="font-size:12px">obecnie: ${curLevel} → następnie: ${nextLevel} </div>
          <div><input type="number" min="${nextLevel}" value="${nextLevel}" data-town="${townId}" data-key="${bk.key}" class="gf-target-input" style="width:100%;padding:6px;border-radius:6px;border:1px solid #333;background:#111;color:#d4af37"></div>`;
        table.appendChild(row);
      });
      box.appendChild(table);
      wrap.appendChild(box);
    });
    container.innerHTML = "";
    container.appendChild(wrap);
  }

  // Orders store
  let GF_ORDERS = []; // {town, building, targetLevel}

  function generateOrders(container){
    GF_ORDERS = [];
    container.querySelectorAll(".gf-target-input").forEach(inp=>{
      const town = inp.dataset.town;
      const key = inp.dataset.key;
      const val = parseInt(inp.value) || 0;
      // get model to know next_level
      const models = getBuildingModels();
      const model = models.find(m=>String(m.id)===String(town));
      if(!model) return;
      const bd = model.building_data[key];
      if(!bd) return;
      const currentNext = bd.next_level || 0;
      if(val > currentNext){
        GF_ORDERS.push({ town: parseInt(town), building: key, target: val });
      }
    });
    if(GF_ORDERS.length === 0){ toast("Brak zleceń (upewnij się, że ustawiasz wyższe poziomy)."); return; }
    toast("Wygenerowano " + GF_ORDERS.length + " zleceń");
    // display small summary
    const summary = document.createElement("div");
    summary.innerHTML = `<div style="margin-top:8px;padding:8px;background:rgba(0,0,0,.3);border-radius:8px">Wygenerowane zlecenia: <b>${GF_ORDERS.length}</b>. Kliknij 'Wykonaj' by próbować wykonać (ręcznie).</div>`;
    const content = document.querySelector("#gf-builder-content");
    content.insertBefore(summary, content.firstChild);
    // store in memory (optional)
    gset("gf_last_orders", JSON.stringify(GF_ORDERS));
  }

  // Executor: tries to call gpAjax frontend_bridge for each order step-by-step
  async function executeOrders(){
    if(!GF_ORDERS || GF_ORDERS.length === 0){
      const stored = gget("gf_last_orders", "[]");
      try{ GF_ORDERS = JSON.parse(stored); }catch(e){ GF_ORDERS = []; }
      if(GF_ORDERS.length === 0){ toast("Brak zleceń do wykonania"); return; }
    }
    toast("Rozpoczynam wykonywanie zleceń (ręcznie) - proszę cierpliwie.");
    for(const o of GF_ORDERS){
      try{
        // prepare call: build level-by-level until target
        const townId = o.town;
        const buildingKey = o.building;
        const target = o.target;
        // get building data
        const models = getBuildingModels();
        const model = models.find(m=>m.id === townId);
        if(!model) { log("Brak modelu dla miasta", townId); continue; }
        const bd = model.building_data[buildingKey];
        if(!bd){ log("Brak building data dla", buildingKey); continue; }
        // repeatedly build until reach target or fail
        while((bd.next_level || 0) <= target){
          await doBuild(townId, buildingKey).then(r=>{
            log("Zbudowano step", buildingKey, "w", townId, r);
          }).catch(e=>{
            log("Błąd budowy", e);
            throw e;
          });
          // small pause
          await new Promise(r=>setTimeout(r, 1200 + Math.floor(Math.random()*700)));
          // update model snapshot
          // note: in many setups, model will update automatically via server push
        }
      }catch(e){
        log("Wykonanie zlecenia nie powiodło się:", e);
      }
    }
    toast("Wykonywanie zleceń zakończone (ręcznie).");
    GF_ORDERS = [];
    gset("gf_last_orders", JSON.stringify(GF_ORDERS));
  }

  function doBuild(town_id, building_id){
    return new Promise((resolve, reject)=>{
      try{
        // safety: use gpAjax if available
        if(typeof gpAjax === "undefined" || !gpAjax.ajaxPost){
          reject("gpAjax not available in this context");
          return;
        }
        gpAjax.ajaxPost("frontend_bridge", "execute", {
          model_url: "BuildingOrder",
          action_name: "buildUp",
          arguments: { building_id: building_id },
          town_id: town_id
        }, false, {
          success: function(res){ resolve(res); },
          error: function(err){ reject(err); }
        });
      }catch(e){ reject(e); }
    });
  }

  /* ===============================
     Rekruter (Koszary / Port) - UI + manual exec
     - prepare recruitment orders per town (unit key + amount)
     - manual Execute uses frontend_bridge -> ArmyOrder / Unit creation
     =============================== */

  function openRecruitUI(){
    if(!gget("gf_enable_recruiter", true)){ toast("Rekruter wyłączony w panelu"); return; }
    const id = "gf-recruit";
    if(document.getElementById(id)) return;
    const panel = document.createElement("div");
    panel.id = id;
    Object.assign(panel.style, { position:"fixed", left:"50%", top:"50%", transform:"translate(-50%,-50%)", width:"min(760px,96vw)", maxHeight:"80vh", overflow:"auto", background:"#0f0f0f", color:"#d4af37", border:"2px solid #d4af37", padding:"12px", zIndex:2147483647, borderRadius:"10px", boxShadow:"0 20px 60px rgba(0,0,0,.6)"});
    panel.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center">
      <b>Rekruter — Koszary / Port</b>
      <div>
        <button id="gf-recruit-close">Zamknij</button>
      </div>
    </div>
    <div style="margin-top:8px">Wybierz miasto, jednostkę i ilość. Kliknij 'Generuj', następnie 'Wykonaj' żeby rozpocząć rekrutację (manualnie).</div>
    <div id="gf-recruit-content" style="margin-top:8px"></div>
    <div style="margin-top:10px;display:flex;gap:8px;justify-content:flex-end">
      <button id="gf-recruit-gen" style="padding:6px">Generuj</button>
      <button id="gf-recruit-exec" style="padding:6px">Wykonaj</button>
    </div>`;
    document.body.appendChild(panel);
    panel.querySelector("#gf-recruit-close").onclick = ()=>panel.remove();
    panel.querySelector("#gf-recruit-gen").onclick = ()=> genRecruitOrders();
    panel.querySelector("#gf-recruit-exec").onclick = ()=> execRecruitOrders();
    renderRecruitContent(panel.querySelector("#gf-recruit-content"));
  }

  function renderRecruitContent(container){
    // gather towns
    const towns = (window.ITowns && ITowns.towns) ? Object.values(ITowns.towns) : [];
    container.innerHTML = "";
    if(towns.length === 0){ container.innerHTML = "<div>Brak danych o miastach (poczekaj i odśwież).</div>"; return; }
    towns.forEach(t=>{
      const box = document.createElement("div");
      box.style.cssText = "border:1px solid rgba(212,175,55,.08);padding:8px;margin-bottom:8px;border-radius:8px";
      box.innerHTML = `<div style="display:flex;justify-content:space-between"><b>${t.name}</b><span style="font-size:12px">ID: ${t.id}</span></div>`;
      // units input: we don't know keys across servers - provide text input: "sword:10,spear:20"
      box.innerHTML += `<div style="margin-top:6px">Zlecenia (format: unit_key:count,oddzielone przecinkiem) <input class="gf-recruit-input" data-town="${t.id}" style="width:100%;padding:6px;border-radius:6px;border:1px solid #333;background:#111;color:#d4af37" placeholder="sword:10,spear:20"></div>`;
      container.appendChild(box);
    });
  }

  let GF_RECRUIT_ORDERS = [];

  function genRecruitOrders(){
    GF_RECRUIT_ORDERS = [];
    document.querySelectorAll(".gf-recruit-input").forEach(inp=>{
      const town = inp.dataset.town;
      const val = inp.value.trim();
      if(!val) return;
      const parts = val.split(",").map(s=>s.trim()).filter(Boolean);
      parts.forEach(p=>{
        const [unit, count] = p.split(":").map(s=>s.trim());
        const cnt = parseInt(count) || 0;
        if(unit && cnt>0) GF_RECRUIT_ORDERS.push({ town:parseInt(town), unit, count:cnt });
      });
    });
    toast("Wygenerowano " + GF_RECRUIT_ORDERS.length + " zleceń rekrutacji");
    gset("gf_recruit_orders", JSON.stringify(GF_RECRUIT_ORDERS));
  }

  async function execRecruitOrders(){
    if(!GF_RECRUIT_ORDERS || GF_RECRUIT_ORDERS.length === 0){
      const stored = gget("gf_recruit_orders", "[]");
      try{ GF_RECRUIT_ORDERS = JSON.parse(stored); }catch(e){ GF_RECRUIT_ORDERS = []; }
      if(GF_RECRUIT_ORDERS.length === 0){ toast("Brak zleceń"); return; }
    }
    toast("Wykonywanie rekrutacji (ręcznie) — proszę czekać...");
    for(const o of GF_RECRUIT_ORDERS){
      try{
        // attempt invocation - note: exact model/action depends on server, may need tuning
        await new Promise((resolve, reject)=>{
          if(typeof gpAjax === "undefined" || !gpAjax.ajaxPost){ reject("gpAjax unavailable"); return; }
          gpAjax.ajaxPost("frontend_bridge","execute",{
            model_url:"ArmyOrder",
            action_name:"recruitUnits",
            arguments:{ unit_type: o.unit, amount: o.count },
            town_id: o.town
          }, false, {
            success: resolve,
            error: reject
          });
        });
        await new Promise(r=>setTimeout(r, 1200 + Math.random()*900));
      }catch(e){
        log("Rekrutacja błąd", e);
      }
    }
    toast("Rekrutacja zakończona (ręcznie)");
    GF_RECRUIT_ORDERS = [];
    gset("gf_recruit_orders", JSON.stringify(GF_RECRUIT_ORDERS));
  }

  /* ===============================
     Asystent Akademii — plan badań (manual exec)
     - user wpisuje docelowy poziom dla badań (unit names or research keys)
     - generated orders can be executed via frontend_bridge (if available)
     =============================== */
  function openAcademyUI(){
    if(!gget("gf_enable_academy", true)){ toast("Asystent Akademii wyłączony w panelu"); return; }
    const id = "gf-acad";
    if(document.getElementById(id)) return;
    const panel = document.createElement("div");
    panel.id = id;
    Object.assign(panel.style, { position:"fixed", left:"50%", top:"50%", transform:"translate(-50%,-50%)", width:"min(720px,96vw)", maxHeight:"80vh", overflow:"auto", background:"#0f0f0f", color:"#d4af37", border:"2px solid #d4af37", padding:"12px", zIndex:2147483647, borderRadius:"10px" });
    panel.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><b>Asystent Akademii</b><button id="gf-acad-close">Zamknij</button></div>
      <div style="margin-top:8px">Podaj plan badań dla miast: format "<unit_key>:target_level,..."</div>
      <div id="gf-acad-content" style="margin-top:8px"></div>
      <div style="margin-top:10px;display:flex;gap:8px;justify-content:flex-end">
        <button id="gf-acad-gen">Generuj</button>
        <button id="gf-acad-exec">Wykonaj</button>
      </div>`;
    document.body.appendChild(panel);
    panel.querySelector("#gf-acad-close").onclick = ()=>panel.remove();
    panel.querySelector("#gf-acad-gen").onclick = ()=> genAcademyOrders();
    panel.querySelector("#gf-acad-exec").onclick = ()=> execAcademyOrders();
    renderAcademyContent(panel.querySelector("#gf-acad-content"));
  }

  function renderAcademyContent(container){
    const towns = (window.ITowns && ITowns.towns) ? Object.values(ITowns.towns) : [];
    container.innerHTML = "";
    if(towns.length === 0){ container.innerHTML = "<div>Brak danych o miastach.</div>"; return; }
    towns.forEach(t=>{
      const box = document.createElement("div");
      box.style.cssText = "border:1px solid rgba(212,175,55,.08);padding:8px;margin-bottom:8px;border-radius:8px";
      box.innerHTML = `<div style="display:flex;justify-content:space-between"><b>${t.name}</b><span style="font-size:12px">ID: ${t.id}</span></div>
        <div style="margin-top:6px">Plan (format research_key:target_level,coma): <input class="gf-acad-input" data-town="${t.id}" style="width:100%;padding:6px;border-radius:6px;border:1px solid #333;background:#111;color:#d4af37" placeholder="research_sword:2,research_archers:3"></div>`;
      container.appendChild(box);
    });
  }

  let GF_ACAD_ORDERS = [];

  function genAcademyOrders(){
    GF_ACAD_ORDERS = [];
    document.querySelectorAll(".gf-acad-input").forEach(inp=>{
      const town = parseInt(inp.dataset.town);
      const val = inp.value.trim();
      if(!val) return;
      val.split(",").map(s=>s.trim()).forEach(p=>{
        const [key, lvl] = p.split(":").map(s=>s.trim());
        const target = parseInt(lvl) || 0;
        if(key && target>0) GF_ACAD_ORDERS.push({ town, key, target });
      });
    });
    gset("gf_acad_orders", JSON.stringify(GF_ACAD_ORDERS));
    toast("Wygenerowano " + GF_ACAD_ORDERS.length + " zadań badawczych");
  }

  async function execAcademyOrders(){
    if(!GF_ACAD_ORDERS || GF_ACAD_ORDERS.length===0){
      try{ GF_ACAD_ORDERS = JSON.parse(gget("gf_acad_orders","[]")); }catch(e){ GF_ACAD_ORDERS=[]; }
      if(GF_ACAD_ORDERS.length===0){ toast("Brak zadań"); return; }
    }
    toast("Wykonywanie badań (ręcznie)...");
    for(const o of GF_ACAD_ORDERS){
      try{
        await new Promise((resolve,reject)=>{
          if(typeof gpAjax === "undefined" || !gpAjax.ajaxPost){ reject("gpAjax brakuje"); return; }
          gpAjax.ajaxPost("frontend_bridge","execute",{
            model_url: "ResearchOrder",
            action_name: "researchUp",
            arguments: { research_key: o.key },
            town_id: o.town
          }, false, { success: resolve, error: reject });
        });
        await new Promise(r=>setTimeout(r, 1200 + Math.random()*700));
      }catch(e){ log("Błąd badań", e); }
    }
    toast("Zakończono wykonywanie badań (ręcznie)");
    GF_ACAD_ORDERS = [];
    gset("gf_acad_orders", JSON.stringify(GF_ACAD_ORDERS));
  }

  /* ===============================
     Small helpers: console API + start
     =============================== */
  function initGlobalAPI(){
    window.GF = window.GF || {};
    Object.assign(window.GF, {
      version: VER,
      applyTheme: applyTheme,
      setRawBase: (u)=>{ RAW_BASE = u; gset("gf_raw_base", u); toast("RAW base updated"); },
      addAssetMappings: (obj)=>{ const cur = gget("gf_asset_map_ext", {}); Object.assign(cur, obj); gset("gf_asset_map_ext", cur); toast("Added asset mappings"); },
      openBuilderUI,
      openRecruitUI,
      openAcademyUI,
      debug: ()=>({ theme: gget("gf_theme"), raw: gget("gf_raw_base"), orders: { builder: gget("gf_last_orders","[]") } })
    });
  }

  /* ===============================
     Start
     =============================== */
  function start(){
    applyTheme(gget("gf_theme","pirate"));
    mountFAB();
    patchExistingImgs(document);
    showWelcome();
    showChangelog();
    initGlobalAPI();
    // attach some quick shortcuts: builder / recruit / academy
    document.addEventListener("keydown", (e)=>{
      if(e.altKey && e.key === "b") openBuilderUI();
      if(e.altKey && e.key === "r") openRecruitUI();
      if(e.altKey && e.key === "a") openAcademyUI();
    });
    log("GrepoFusion", VER, "started");
  }

  // Ensure DOM ready before starting some parts
  onReady(()=>{ setTimeout(start, 250); });

  // expose some internal debugging
  window.__GrepoFusion_internal = { mapUrl, getAssetMap };

  /**************************************************************************
   * End of script
   **************************************************************************/
})();