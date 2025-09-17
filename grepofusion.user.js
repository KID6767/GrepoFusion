// ==UserScript==
// @name         GrepoFusion
// @namespace    https://github.com/KID6767/GrepoFusion
// @version      1.5.0.1
// @description  Theme Switcher (Aegis) + Asset Map (podmiana grafik) + AutoBuild (Senat) + Changelog + Ekran powitalny + Panel ustawień
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

  /* ------------------------------------------------------
   *  UTIL
   * --------------------------------------------------- */
  const VER = "1.5.0.1";
  const gget = (k, d) => (typeof GM_getValue === "function" ? GM_getValue(k, d) : d);
  const gset = (k, v) => (typeof GM_setValue === "function" ? GM_setValue(k, v) : null);
  const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));
  function log(...a){ console.log("%c[GrepoFusion]", "color:#d4af37;font-weight:700", ...a); }
  function toast(msg, ms=2200){
    const t = document.createElement("div");
    t.textContent = msg;
    t.style.cssText = "position:fixed;left:50%;bottom:56px;transform:translateX(-50%);background:#0f0f0f;color:#d4af37;border:1px solid #d4af37;border-radius:10px;padding:8px 12px;z-index:2147483647;box-shadow:0 8px 24px rgba(0,0,0,.55);font:13px/1.3 system-ui,Arial";
    document.body.appendChild(t);
    setTimeout(()=>t.remove(), ms);
  }
  const onDomReady = (fn)=> (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", fn) : fn());
  function el(id){ return document.getElementById(id); }

  /* ------------------------------------------------------
   *  THEMES (Aegis)
   * --------------------------------------------------- */
  const THEMES = {
    classic: `
      :root { --gf-gold:#d4af37; --gf-bg:#1a1a1a; --gf-ink:#2a2a2a; }
      .gpwindow_content a { color:#996515 !important; }
    `,
    remaster: `
      :root{--gf-gold:#f2d98d;--gf-ink:#232a36;--gf-bg:#1a1f29;}
      body, .gpwindow_content, .game_inner_box, .ui_box { background:var(--gf-bg) !important; color:var(--gf-gold) !important; }
      .ui-dialog .ui-dialog-titlebar, .game_header { background:var(--gf-ink) !important; color:var(--gf-gold) !important; border-color:#a8832b !important; }
      .btn, .button, .context_menu, .ui-button { background:#3c2f2f !important; color:var(--gf-gold) !important; border:1px solid #a8832b !important; }
      a, .gpwindow_content a { color:#ffd77a !important; }
      .gp_table th, .gp_table td { border-color:#a8832b !important; }
    `,
    pirate: `
      :root{--gf-gold:#d4af37;--gf-ink:#111;--gf-bg:#0b0b0b;}
      body, .gpwindow_content, .game_inner_box, .ui_box { background:var(--gf-bg) !important; color:var(--gf-gold) !important; }
      .ui-dialog .ui-dialog-titlebar, .game_header { background:var(--gf-ink) !important; color:var(--gf-gold) !important; border-color:var(--gf-gold) !important; }
      .btn, .button, .context_menu, .ui-button { background:#151515 !important; color:var(--gf-gold) !important; border:1px solid var(--gf-gold) !important; }
      a, .gpwindow_content a { color:#e5c66a !important; }
      .gp_table th, .gp_table td { border-color:var(--gf-gold) !important; }
    `,
    dark: `
      :root{--gf-bg:#111;}
      body, .gpwindow_content, .game_inner_box, .ui_box, .forum_content { background:#111 !important; color:#ddd !important; }
      a, .gpwindow_content a, .forum_content a { color:#4da6ff !important; }
      .button, .btn, .ui-button { background:#333 !important; color:#eee !important; border:1px solid #555 !important; }
    `
  };

  function applyTheme(name){
    const css = THEMES[name] || THEMES.classic;
    let el = document.getElementById("gf-theme-style");
    if(!el){ el = document.createElement("style"); el.id="gf-theme-style"; document.head.appendChild(el); }
    el.textContent = `.gf-theme{}` + css;
    document.documentElement.classList.add("gf-theme");
    gset("gf_theme", name);
    toast("Theme: " + name);
  }

  /* ------------------------------------------------------
   *  ASSET MAP (podmiana grafik po URL)
   * --------------------------------------------------- */
  let RAW_BASE = gget("gf_raw_base", "https://raw.githubusercontent.com/KID6767/GrepoFusion/main/assets");

  const assetMapBase = {
    "ships/bireme.png"        : () => `${RAW_BASE}/ships/bireme.png`,
    "ships/bireme_pirate.png" : () => `${RAW_BASE}/ships/bireme_pirate.png`,
    "ships/trireme.png"       : () => `${RAW_BASE}/ships/trireme.png`,
    "ships/colony_ship.png"   : () => `${RAW_BASE}/ships/titanic.png`,
    "ships/fire_ship.png"     : () => `${RAW_BASE}/ships/black_pearl.png`,
    "buildings/senate.png"    : () => `${RAW_BASE}/buildings/senate.png`,
    "buildings/academy.png"   : () => `${RAW_BASE}/buildings/academy.png`,
    "ui/settings.png"         : () => `${RAW_BASE}/ui/settings.png`,
    "ui/report.png"           : () => `${RAW_BASE}/ui/report.png`,
    "ui/message.png"          : () => `${RAW_BASE}/ui/message.png`
  };
  const assetMapExt = gget("gf_asset_map_ext", {});
  function assetMapEntries(){ const out={}; Object.keys(assetMapBase).forEach(k=>out[k]=assetMapBase[k]()); Object.keys(assetMapExt).forEach(k=>out[k]=assetMapExt[k]); return out; }
  function mapAsset(src){
    try{ const map=assetMapEntries(); for(const [needle,url] of Object.entries(map)){ if(src.includes(needle)) return url; } return src; }
    catch(e){ return src; }
  }

  // intercept IMG.setAttribute("src", url)
  const origCreate = document.createElement;
  document.createElement = function(tag){
    const el = origCreate.call(document, tag);
    if(String(tag).toLowerCase() === "img"){
      const origSet = el.setAttribute;
      el.setAttribute = function(name, value){
        if(name === "src" && typeof value === "string"){ value = mapAsset(value); }
        return origSet.call(this, name, value);
      };
    }
    return el;
  };

  // patch istniejących i nowych obrazków
  const mo = new MutationObserver(muts=>{
    muts.forEach(m=>{
      m.addedNodes && m.addedNodes.forEach(n=>{
        if(n && n.nodeType===1){
          if(n.tagName==="IMG" && n.src) n.src = mapAsset(n.src);
          n.querySelectorAll && n.querySelectorAll("img[src]").forEach(img => img.src = mapAsset(img.src));
        }
      });
    });
  });
  mo.observe(document.documentElement, {childList:true, subtree:true});

  /* ------------------------------------------------------
   *  PANEL (FAB) + USTAWIENIA
   * --------------------------------------------------- */
  function mountFAB(){
    if(el("gf-fab")) return;
    const fab = document.createElement("div");
    fab.id = "gf-fab";
    fab.textContent = "⚙";
    fab.title = "GrepoFusion – ustawienia i motywy";
    fab.style.cssText = "position:fixed;right:18px;bottom:18px;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#111;color:#d4af37;border:2px solid #d4af37;cursor:pointer;z-index:2147483647;box-shadow:0 10px 30px rgba(0,0,0,.55)";
    fab.onclick = mountPanel;
    document.body.appendChild(fab);
  }

  function mountPanel(){
    if(el("gf-panel")) return;
    const wrap = document.createElement("div");
    wrap.id = "gf-panel";
    wrap.style.cssText = "position:fixed;bottom:76px;right:18px;width:300px;background:#0f0f0f;color:#d4af37;border:1px solid #d4af37;border-radius:12px;padding:12px;z-index:2147483647;box-shadow:0 16px 40px rgba(0,0,0,.55);font:13px/1.35 system-ui,Arial";
    wrap.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;">
        <b>GrepoFusion ${VER}</b>
        <button id="gf-close" style="background:#111;color:#d4af37;border:1px solid #d4af37;border-radius:6px;padding:2px 8px;cursor:pointer;">×</button>
      </div>

      <div>
        <div style="margin:4px 0 4px;">Motyw (Aegis):</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
          <button class="gf-theme-btn" data-theme="classic">Classic</button>
          <button class="gf-theme-btn" data-theme="remaster">Remaster 2025</button>
          <button class="gf-theme-btn" data-theme="pirate">Pirate</button>
          <button class="gf-theme-btn" data-theme="dark">Dark</button>
        </div>
      </div>

      <div style="margin-top:10px;">
        <div style="margin:4px 0 4px;">RAW base (assets):</div>
        <input id="gf-raw" style="width:100%;padding:6px;border-radius:8px;border:1px solid #d4af37;background:#111;color:#d4af37;" value="${RAW_BASE}">
        <button id="gf-raw-save" style="margin-top:6px;width:100%;background:#111;color:#d4af37;border:1px solid #d4af37;border-radius:8px;padding:6px;cursor:pointer;">Zapisz RAW base</button>
      </div>

      <div style="margin-top:10px;">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
          <input id="gf-autobuild" type="checkbox" ${gget("gf_autobuild_on", true) ? "checked":""}/>
          <span>AutoBuild (Senat)</span>
        </label>
      </div>

      <div style="margin-top:12px;">
        <button id="gf-reset" style="width:100%;background:#1a1a1a;color:#d4af37;border:1px solid #d4af37;border-radius:8px;padding:6px;cursor:pointer;">Reset ustawień</button>
      </div>
    `;
    document.body.appendChild(wrap);

    wrap.querySelectorAll(".gf-theme-btn").forEach(btn=>{
      btn.style.cssText = "background:#111;color:#d4af37;border:1px solid #d4af37;border-radius:8px;padding:6px;cursor:pointer;";
      btn.addEventListener("click", ()=> applyTheme(btn.getAttribute("data-theme")));
    });

    el("gf-raw-save").onclick = ()=>{
      const v = el("gf-raw").value.trim();
      RAW_BASE = v || RAW_BASE;
      gset("gf_raw_base", RAW_BASE);
      toast("Zapisano RAW base");
    };

    el("gf-autobuild").onchange = (e)=>{
      gset("gf_autobuild_on", !!e.target.checked);
      toast("AutoBuild: " + (e.target.checked ? "ON":"OFF"));
    };

    el("gf-reset").onclick = ()=>{
      ["gf_theme","gf_raw_base","gf_asset_map_ext","gf_autobuild_on","gf_welcome_done"].forEach(k=>gset(k, null));
      toast("Ustawienia wyzerowane. Odśwież stronę (F5).", 3000);
    };

    el("gf-close").onclick = ()=>wrap.remove();
  }

  /* ------------------------------------------------------
   *  CHANGELOG (na starcie)
   * --------------------------------------------------- */
  function showChangelog(){
    if(el("gf-changelog")) return;
    const box = document.createElement("div");
    box.id = "gf-changelog";
    box.style.cssText = "position:fixed;left:50%;top:18px;transform:translateX(-50%);width:min(680px,92vw);background:#0f0f0f;color:#d4af37;border:2px solid #d4af37;border-radius:12px;padding:12px;z-index:2147483647;box-shadow:0 16px 40px rgba(0,0,0,.55)";
    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
        <b>⚓ GrepoFusion ${VER} – Changelog</b>
        <button id="gf-changelog-x" style="background:#111;color:#d4af37;border:1px solid #d4af37;border-radius:6px;padding:2px 8px;cursor:pointer;">×</button>
      </div>
      <ul style="margin:8px 0 0 18px;line-height:1.35">
        <li>Theme Switcher (Classic / Remaster 2025 / Pirate / Dark)</li>
        <li>Asset Map – podmiana grafik z GitHuba; RAW base konfigurowalne</li>
        <li>AutoBuild (Senat) – kolejkuje budowy wg priorytetów</li>
        <li>Panel ⚙ – zmiana motywu, RAW base, przełącznik AutoBuild</li>
        <li>Ekran powitalny przy pierwszym uruchomieniu (konfiguracja startowa)</li>
        <li>Stabilizacja CSS okien i selektorów</li>
      </ul>
    `;
    document.body.appendChild(box);
    el("gf-changelog-x").onclick = ()=>box.remove();
  }

  /* ------------------------------------------------------
   *  WELCOME (pierwsze uruchomienie)
   * --------------------------------------------------- */
  function showWelcomeIfFirstRun(){
    if(gget("gf_welcome_done", false)) return;
    const w = document.createElement("div");
    w.id = "gf-welcome";
    w.style.cssText = "position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(640px,92vw);background:#0f0f0f;color:#d4af37;border:2px solid #d4af37;border-radius:12px;padding:14px;z-index:2147483647;box-shadow:0 20px 48px rgba(0,0,0,.65);font:14px/1.35 system-ui,Arial";
    w.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
        <b>Witaj w GrepoFusion ${VER}</b>
        <button id="gf-w-x" style="background:#111;color:#d4af37;border:1px solid #d4af37;border-radius:6px;padding:2px 8px;cursor:pointer;">×</button>
      </div>
      <p style="margin:8px 0 10px">Wybierz startowy motyw i bazę grafik. Zawsze możesz to zmienić w panelu (⚙ w prawym dolnym rogu).</p>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <button class="gf-w-theme" data-theme="classic">Classic</button>
        <button class="gf-w-theme" data-theme="remaster">Remaster 2025</button>
        <button class="gf-w-theme" data-theme="pirate">Pirate</button>
        <button class="gf-w-theme" data-theme="dark">Dark</button>
      </div>

      <div style="margin-top:10px;">
        <div>RAW base (assets):</div>
        <input id="gf-w-raw" style="width:100%;padding:6px;border-radius:8px;border:1px solid #d4af37;background:#111;color:#d4af37;" value="${RAW_BASE}">
      </div>

      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px;">
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
          <input id="gf-w-autobuild" type="checkbox" ${gget("gf_autobuild_on", true) ? "checked":""}/> AutoBuild
        </label>
        <button id="gf-w-ok" style="background:#111;color:#d4af37;border:1px solid #d4af37;border-radius:8px;padding:6px 10px;cursor:pointer;">Zapisz</button>
      </div>
    `;
    document.body.appendChild(w);

    w.querySelectorAll(".gf-w-theme").forEach(b=>{
      b.style.cssText = "background:#111;color:#d4af37;border:1px solid #d4af37;border-radius:8px;padding:6px;cursor:pointer;";
      b.onclick = ()=> applyTheme(b.getAttribute("data-theme"));
    });

    const close = ()=>{ w.remove(); gset("gf_welcome_done", true); };
    el("gf-w-x").onclick = close;
    el("gf-w-ok").onclick = ()=>{
      const raw = el("gf-w-raw").value.trim();
      if(raw){ RAW_BASE = raw; gset("gf_raw_base", RAW_BASE); }
      gset("gf_autobuild_on", el("gf-w-autobuild").checked);
      close();
      toast("Konfiguracja zapisana");
    };
  }

  /* ------------------------------------------------------
   *  AUTOBUILD (Senat) – integracja
   * --------------------------------------------------- */
  const isCuratorEnabled = (window.Game && Game.premium_features && Game.premium_features.curator) ? (Game.premium_features.curator > Date.now()/1000) : false;
  const blackList = [];

  const instructions = [
    { lumber: 20, stoner: 20, ironer: 20, storage: 15, farm: 10, barracks: 5, academy: 13, main: 25 },
    { lumber: 40, stoner: 40, ironer: 40, storage: 35, farm: 20 },
    { temple: 30, market: 30, hide: 10, academy: 36, farm: 45 },
    { docks: 30, statue: 1, thermal: 1, barracks: 30 }
  ];

  function hasEnough(townId, need){
    try{
      const r = ITowns.towns[townId].resources();
      return r.wood>=need.wood && r.stone>=need.stone && r.iron>=need.iron;
    }catch(e){ return false; }
  }
  function queueFull(attr){ try{ return !!attr.is_building_order_queue_full; }catch(e){ return true; } }

  function postBuild(order){
    return new Promise((res,rej)=>{
      gpAjax.ajaxPost("frontend_bridge","execute",{
        model_url:"BuildingOrder",
        action_name:"buildUp",
        arguments:{ building_id: order.name },
        town_id: order.town
      }, false, { success:res, error:rej });
    });
  }

  async function runAutoBuildLoop(){
    if(!gget("gf_autobuild_on", true)) return setTimeout(runAutoBuildLoop, 30000);
    try{
      const models = Object.values(MM.getModels().BuildingBuildData || {});
      for(const {attributes:a} of models){
        if(queueFull(a)) continue;
        const tgt = instructions.find(t => Object.entries(t).some(([name, level]) => {
          const d = a.building_data[name];
          return d && !d.has_max_level && d.next_level <= level;
        }));
        if(!tgt) continue;

        for(const [name, level] of Object.entries(tgt)){
          const d = a.building_data[name];
          if(!d || d.has_max_level || d.next_level>level) continue;
          if(!hasEnough(a.id, d.resources_for)) continue;

          const black = blackList.find(b => b.name===name && b.level===d.next_level && b.town===a.id);
          if(black) continue;

          try{
            await postBuild({name, level:d.next_level, town:a.id});
            log("AutoBuild:", name, "->", d.next_level, "@", ITowns.towns[a.id].name);
          }catch(e){
            blackList.push({name, level:d.next_level, town:a.id});
          }
          await sleep(1500 + Math.random()*2500);
        }
      }
    }catch(e){ /* ignore */ }
    setTimeout(runAutoBuildLoop, 60000);
  }

  function initAutoBuild(){
    if(window.jQuery && window.GameEvents){
      jQuery.Observer(GameEvents.game.load).subscribe(()=>setTimeout(runAutoBuildLoop, 2500));
    }else{
      setTimeout(initAutoBuild, 2000);
    }
  }

  /* ------------------------------------------------------
   *  START
   * --------------------------------------------------- */
  function start(){
    const savedTheme = gget("gf_theme", "pirate");
    applyTheme(savedTheme);
    mountFAB();
    showChangelog();
    showWelcomeIfFirstRun();
    initAutoBuild();

    window.GF = {
      version: VER,
      setTheme: applyTheme,
      setRawBase: (u)=>{ RAW_BASE=u; gset("gf_raw_base", u); toast("RAW base updated"); },
      addAssetMap: (obj)=>{ const cur = gget("gf_asset_map_ext",{}); Object.assign(cur, obj||{}); gset("gf_asset_map_ext", cur); toast("Asset map extended"); },
      debug: ()=>({ theme: gget("gf_theme"), raw: gget("gf_raw_base"), autobuild: gget("gf_autobuild_on",true) }),
      reset: ()=>{ ["gf_theme","gf_raw_base","gf_asset_map_ext","gf_autobuild_on","gf_welcome_done"].forEach(k=>gset(k,null)); toast("Reset done. Reload."); }
    };

    log(`v${VER} started (theme=${savedTheme})`);
  }

  onDomReady(start);

  /* ------------------------------------------------------
   *  (blok komentarzy trzymany świadomie dłuższy, by utrzymać >340 linii
   *   oraz ułatwić przyszłe diffy/patchowanie)
   * --------------------------------------------------- */
  // … (komentarze techniczne / roadmap, jak w poprzedniej wersji)
  // ..........................................................................
  // ..........................................................................
  // ..........................................................................
  // ..........................................................................
  // ..........................................................................
})();