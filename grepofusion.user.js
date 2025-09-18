// ==UserScript==
// @name         GrepoFusion
// @namespace    https://github.com/KID6767/GrepoFusion
// @version      1.5.0.2-rc
// @description  Legal-friendly: Aegis (Classic/Remaster/Pirate/Dark), Asset Map (podmiana grafik), panel ustawień, dock „pomocników” bez automatyzacji, welcome + changelog.
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

  /* =========================
   * UTIL
   * ======================= */
  const VER = "1.5.0.2-rc";
  const gget = (k, d) => (typeof GM_getValue === "function" ? GM_getValue(k, d) : d);
  const gset = (k, v) => (typeof GM_setValue === "function" ? GM_setValue(k, v) : null);
  const onReady = fn => (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", fn) : fn());
  function log(...a){ console.log("%c[GrepoFusion]", "color:#d4af37;font-weight:700", ...a); }
  function toast(msg, ms=2200){
    const t = document.createElement("div");
    t.textContent = msg;
    t.style.cssText = "position:fixed;left:50%;bottom:56px;transform:translateX(-50%);background:#0f0f0f;color:#d4af37;border:1px solid #d4af37;border-radius:10px;padding:8px 12px;z-index:2147483647;box-shadow:0 8px 24px rgba(0,0,0,.55);font:13px/1.3 system-ui,Arial";
    document.body.appendChild(t);
    setTimeout(()=>t.remove(), ms);
  }
  function el(id){ return document.getElementById(id); }

  /* =========================
   * THEMES (Aegis)
   * ======================= */
  const THEMES = {
    classic: `
      :root { --gf-gold:#d4af37; --gf-bg:#1a1a1a; --gf-ink:#2a2a2a; --gf-line:#a8832b; }
      .gpwindow_content a { color:#b68c3a !important; }
    `,
    remaster: `
      :root{--gf-gold:#f2d98d;--gf-ink:#232a36;--gf-bg:#1a1f29;--gf-line:#a8832b;}
      body, .gpwindow_content, .game_inner_box, .ui_box { background:var(--gf-bg) !important; color:var(--gf-gold) !important; }
      .ui-dialog .ui-dialog-titlebar, .game_header { background:var(--gf-ink) !important; color:var(--gf-gold) !important; border-color:var(--gf-line) !important; }
      .btn, .button, .context_menu, .ui-button { background:#2a2731 !important; color:var(--gf-gold) !important; border:1px solid var(--gf-line) !important; }
      a, .gpwindow_content a { color:#ffd77a !important; }
      .gp_table th, .gp_table td { border-color:var(--gf-line) !important; }
    `,
    pirate: `
      :root{--gf-gold:#d4af37;--gf-ink:#111;--gf-bg:#0b0b0b;--gf-line:#d4af37;}
      body, .gpwindow_content, .game_inner_box, .ui_box { background:var(--gf-bg) !important; color:var(--gf-gold) !important; }
      .ui-dialog .ui-dialog-titlebar, .game_header { background:var(--gf-ink) !important; color:var(--gf-gold) !important; border-color:var(--gf-line) !important; }
      .btn, .button, .context_menu, .ui-button { background:#151515 !important; color:var(--gf-gold) !important; border:1px solid var(--gf-line) !important; }
      a, .gpwindow_content a { color:#e5c66a !important; }
      .gp_table th, .gp_table td { border-color:var(--gf-line) !important; }
    `,
    dark: `
      :root{--gf-bg:#111;--gf-line:#555;}
      body, .gpwindow_content, .game_inner_box, .ui_box, .forum_content { background:#111 !important; color:#ddd !important; }
      a, .gpwindow_content a, .forum_content a { color:#4da6ff !important; }
      .button, .btn, .ui-button { background:#333 !important; color:#eee !important; border:1px solid var(--gf-line) !important; }
    `
  };
  function applyTheme(name){
    const css = THEMES[name] || THEMES.classic;
    let s = document.getElementById("gf-theme-style");
    if(!s){ s = document.createElement("style"); s.id="gf-theme-style"; document.head.appendChild(s); }
    s.textContent = `.gf-theme{}` + css + `
      /* Ujednolicenia okien – z-index, tła */
      .gpwindow, .ui-dialog, .gpwindow_content { z-index: 99999 !important; background: rgba(10,10,10,0.94) !important; }
      .ui-dialog .ui-dialog-titlebar { border-bottom:1px solid var(--gf-line) !important; }
      .gp_tab, .ui-tabs .ui-tabs-nav li a { color: inherit !important; }
    `;
    document.documentElement.classList.add("gf-theme");
    gset("gf_theme", name);
  }

  /* =========================
   * ASSET MAP (no-automation; tylko podmiana URL obrazków)
   * ======================= */
  let RAW_BASE = gget("gf_raw_base", "https://raw.githubusercontent.com/KID6767/GrepoFusion/main/assets");
  const assetMapStatic = {
    "ships/bireme.png"         : () => `${RAW_BASE}/ships/bireme.png`,
    "ships/bireme_pirate.png"  : () => `${RAW_BASE}/ships/bireme_pirate.png`,
    "ships/trireme.png"        : () => `${RAW_BASE}/ships/trireme.png`,
    "ships/colony_ship.png"    : () => `${RAW_BASE}/ships/titanic.png`,
    "ships/fire_ship.png"      : () => `${RAW_BASE}/ships/black_pearl.png`,
    "buildings/senate.png"     : () => `${RAW_BASE}/buildings/senate.png`,
    "buildings/academy.png"    : () => `${RAW_BASE}/buildings/academy.png`,
    "ui/settings.png"          : () => `${RAW_BASE}/ui/settings.png`,
    "ui/report.png"            : () => `${RAW_BASE}/ui/report.png`,
    "ui/message.png"           : () => `${RAW_BASE}/ui/message.png`
  };
  const assetMapUser = gget("gf_asset_map_ext", {}); // rozszerzenia z panelu / konsoli
  function assetMap(){
    const out = {};
    Object.keys(assetMapStatic).forEach(k => out[k] = assetMapStatic[k]());
    Object.keys(assetMapUser).forEach(k => out[k] = assetMapUser[k]);
    // aliases 12x/48x (spotykane w Grepolis)
    if(out["ships/bireme.png"]){
      out["12x/ships/bireme.png"] = out["ships/bireme.png"];
      out["48x/ships/bireme.png"] = out["ships/bireme.png"];
    }
    return out;
  }
  function mapSrc(url){
    try{
      if(!url || typeof url!=='string') return url;
      const clean = url.split('?')[0].split('#')[0];
      const m = assetMap();
      for(const [needle, dest] of Object.entries(m)){
        if(clean.includes(needle)) return dest;
      }
      return url;
    }catch(e){ return url; }
  }

  // przechwycenie IMG.src i setAttribute
  const desc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
  if(desc && desc.set){
    Object.defineProperty(HTMLImageElement.prototype,'src',{
      set:function(v){ return desc.set.call(this, mapSrc(v)); },
      get:desc.get
    });
  }
  const _setAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(name,val){
    if(this.tagName==='IMG' && name==='src') return _setAttr.call(this,name,mapSrc(val));
    return _setAttr.call(this,name,val);
  };
  // patch istniejące + nowe
  function patchImgs(root){
    root.querySelectorAll && root.querySelectorAll('img[src]').forEach(img=>{
      const m = mapSrc(img.getAttribute('src'));
      if(m && m!==img.getAttribute('src')) img.setAttribute('src', m);
    });
  }
  const mo = new MutationObserver(m=>m.forEach(x=>x.addedNodes&&x.addedNodes.forEach(n=>{
    if(n.nodeType===1){ if(n.tagName==='IMG'){ const m = mapSrc(n.getAttribute('src')); if(m) n.setAttribute('src',m); } patchImgs(n); }
  })));
  mo.observe(document.documentElement,{childList:true,subtree:true});
  onReady(()=>patchImgs(document));

  /* =========================
   * PANEL ⚙ (motywy, RAW base, importer mapy assetów)
   * ======================= */
  function mountFAB(){
    if(el("gf-fab")) return;
    const fab = document.createElement("div");
    fab.id = "gf-fab";
    fab.textContent = "⚙";
    fab.title = "GrepoFusion – ustawienia i motywy";
    fab.style.cssText = "position:fixed;right:18px;bottom:18px;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#111;color:#d4af37;border:2px solid #d4af37;cursor:pointer;z-index:2147483647;box-shadow:0 10px 30px rgba(0,0,0,.55)";
    fab.onclick = openPanel;
    document.body.appendChild(fab);
  }
  function openPanel(){
    if(el("gf-panel")) return;
    const w = document.createElement("div");
    w.id = "gf-panel";
    w.style.cssText = "position:fixed;bottom:76px;right:18px;width:320px;background:#0f0f0f;color:#d4af37;border:1px solid #d4af37;border-radius:12px;padding:12px;z-index:2147483647;box-shadow:0 16px 40px rgba(0,0,0,.55);font:13px/1.35 system-ui,Arial";
    w.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px">
        <b>GrepoFusion ${VER}</b>
        <button id="gf-close" style="background:#111;color:#d4af37;border:1px solid #d4af37;border-radius:6px;padding:2px 8px;cursor:pointer">×</button>
      </div>

      <div>
        <div style="margin:4px 0 4px;">Motyw (Aegis):</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
          <button class="gf-theme" data-theme="classic">Classic</button>
          <button class="gf-theme" data-theme="remaster">Remaster 2025</button>
          <button class="gf-theme" data-theme="pirate">Pirate</button>
          <button class="gf-theme" data-theme="dark">Dark</button>
        </div>
      </div>

      <div style="margin-top:10px;">
        <div>RAW base (assets):</div>
        <input id="gf-raw" style="width:100%;padding:6px;border-radius:8px;border:1px solid #d4af37;background:#111;color:#d4af37" value="${RAW_BASE}">
        <button id="gf-raw-save" style="margin-top:6px;width:100%;background:#111;color:#d4af37;border:1px solid #d4af37;border-radius:8px;padding:6px;cursor:pointer">Zapisz RAW base</button>
      </div>

      <div style="margin-top:10px;">
        <div>Importer mapy assetów (JSON, linia):</div>
        <input id="gf-map-json" placeholder='{"ships/lightship.png":"https://…/ls.png"}' style="width:100%;padding:6px;border-radius:8px;border:1px solid #d4af37;background:#111;color:#d4af37">
        <button id="gf-map-apply" style="margin-top:6px;width:100%;background:#111;color:#d4af37;border:1px solid #d4af37;border-radius:8px;padding:6px;cursor:pointer">Dodaj/Podmień mapowania</button>
      </div>
    `;
    document.body.appendChild(w);

    w.querySelectorAll(".gf-theme").forEach(b=>{
      b.style.cssText="background:#111;color:#d4af37;border:1px solid #d4af37;border-radius:8px;padding:6px;cursor:pointer";
      b.onclick = ()=>{ applyTheme(b.getAttribute("data-theme")); toast("Zmieniono motyw"); };
    });
    el("gf-raw-save").onclick = ()=>{
      const v = el("gf-raw").value.trim();
      if(v){ RAW_BASE = v; gset("gf_raw_base", v); toast("Zapisano RAW base"); }
    };
    el("gf-map-apply").onclick = ()=>{
      try{
        const cur = gget("gf_asset_map_ext", {});
        const add = JSON.parse(el("gf-map-json").value || "{}");
        Object.assign(cur, add||{});
        gset("gf_asset_map_ext", cur);
        toast("Zapisano mapowanie assetów");
      }catch(e){ toast("Błędny JSON"); }
    };
    el("gf-close").onclick = ()=>w.remove();
  }

  /* =========================
   * DOCK „POMOCNIKÓW” (zero auto–akcji, tylko przyciski użytkownika)
   * ======================= */
  function mountDock(){
    if(el("gf-dock")) return;
    const d = document.createElement("div");
    d.id = "gf-dock";
    d.style.cssText = `
      position:fixed; right:14px; top:110px; width:330px; max-height:76vh; overflow:auto;
      border:1px solid #d4af37; background:#0f0f0f; color:#d4af37; border-radius:12px;
      box-shadow:0 18px 44px rgba(0,0,0,.55); font:13px/1.35 system-ui,Arial; padding:10px; z-index:2147483200;
    `;
    d.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px">
        <b>GrepoFusion — Narzędzia (manual)</b>
        <button id="gf-dock-close" style="background:#111;color:#d4af37;border:1px solid #d4af37;border-radius:8px;padding:2px 8px;cursor:pointer">×</button>
      </div>

      <div class="gf-card" style="border:1px solid #d4af37;border-radius:10px;padding:10px;background:#0b0b0b;margin-bottom:8px">
        <b>Pomocnik Budowlańca (Senat)</b>
        <p style="margin:6px 0 8px;opacity:.9">Ustaw cele i kliknij „Dodaj do kolejki” wewnątrz okna Senatu. Ten moduł niczego nie klika sam — tylko podświetla i ułatwia dostęp.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="gf-open" data-target="senate">Otwórz Senat</button>
          <button class="gf-hl" data-target="senate">Podświetl UI</button>
        </div>
      </div>

      <div class="gf-card" style="border:1px solid #d4af37;border-radius:10px;padding:10px;background:#0b0b0b;margin-bottom:8px">
        <b>Rekruter (Koszary / Port)</b>
        <p style="margin:6px 0 8px;opacity:.9">Szybkie dojście do okna rekrutacji. Samodzielnie potwierdzasz przyciskami w grze.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="gf-open" data-target="barracks">Koszary</button>
          <button class="gf-open" data-target="harbor">Port</button>
          <button class="gf-hl" data-target="recruit">Podświetl pola rekrutacji</button>
        </div>
      </div>

      <div class="gf-card" style="border:1px solid #d4af37;border-radius:10px;padding:10px;background:#0b0b0b">
        <b>Mentor Akademicki</b>
        <p style="margin:6px 0 8px;opacity:.9">Szybkie dojście do Akademii i skupienie uwagi na badaniach. Zero auto-kolejkowania.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="gf-open" data-target="academy">Otwórz Akademię</button>
          <button class="gf-hl" data-target="academy">Podświetl badania</button>
        </div>
      </div>
    `;
    document.body.appendChild(d);
    d.querySelectorAll("button").forEach(b=>{
      b.style.cssText = "background:#111;color:#d4af37;border:1px solid #d4af37;border-radius:8px;padding:6px;cursor:pointer";
    });
    d.querySelector("#gf-dock-close").onclick = ()=>d.remove();

    // „Otwarcia” – bez automatyzacji: tylko próba odpalenia odpowiednich okien gry.
    d.querySelectorAll(".gf-open").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const tgt = btn.getAttribute("data-target");
        try{
          if(!window.Layout || !Layout.wnd) throw 0;
          // nazwy zakładek mogą się różnić per świat/wersja; obsłużymy najczęstsze
          const map = {
            senate : ['building_main','senate','main'],
            barracks: ['barracks','barrack'],
            harbor : ['docks','harbor','port'],
            academy: ['academy']
          };
          const keys = map[tgt]||[];
          let ok=false;
          for(const k of keys){
            try{ Layout.wnd.Create(k); ok=true; break; }catch(e){}
          }
          toast(ok?`Otwieram: ${tgt}`:`Nie udało się otworzyć okna (${tgt})`);
        }catch(e){ toast("UI nie gotowe"); }
      });
    });

    // „Podświetlenia” – tylko wizualne
    d.querySelectorAll(".gf-hl").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const tgt = btn.getAttribute("data-target");
        const overlay = document.createElement("div");
        overlay.style.cssText = "position:fixed;inset:0;z-index:2147483500;pointer-events:none";
        overlay.innerHTML = `<div style="position:absolute;right:20px;top:20px;background:#000000cc;color:#d4af37;border:1px solid #d4af37;border-radius:10px;padding:10px;max-width:340px">
          <b>Wskazówka GrepoFusion</b><br>
          ${tgt==='senate' ? 'W oknie Senatu wybierz budynek, ustaw docelowy poziom i kliknij „Dodaj do kolejki”.' :
            tgt==='recruit' ? 'W Koszarach/Porcie wpisz ilości jednostek i zatwierdź w grze przyciskiem rekrutacji.' :
            'W Akademii wybierz badanie i potwierdź.'}
          <div style="margin-top:6px;opacity:.8">To tylko podpowiedź wizualna — GrepoFusion nie klika za Ciebie.</div>
        </div>`;
        document.body.appendChild(overlay);
        setTimeout(()=>overlay.remove(), 3000);
      });
    });
  }

  /* =========================
   * WELCOME + CHANGELOG (legal-friendly)
   * ======================= */
  function showWelcomeOnce(){
    if(gget("gf_welcome_done", false)) return;
    const w = document.createElement("div");
    w.style.cssText="position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(640px,92vw);background:#0f0f0f;color:#d4af37;border:2px solid #d4af37;border-radius:12px;padding:14px;z-index:2147483647;box-shadow:0 20px 48px rgba(0,0,0,.65);font:14px/1.35 system-ui,Arial";
    w.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
        <b>Witaj w GrepoFusion ${VER}</b>
        <button id="gf-w-x" style="background:#111;color:#d4af37;border:1px solid #d4af37;border-radius:6px;padding:2px 8px;cursor:pointer">×</button>
      </div>
      <p style="margin:8px 0 10px">Wybierz motyw i bazę grafik. GrepoFusion nie wykonuje akcji za gracza — to legalny zestaw ulepszeń wizualnych i pomocników UI.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
        <button class="gf-w-theme" data-theme="classic">Classic</button>
        <button class="gf-w-theme" data-theme="remaster">Remaster 2025</button>
        <button class="gf-w-theme" data-theme="pirate">Pirate</button>
        <button class="gf-w-theme" data-theme="dark">Dark</button>
      </div>
      <div>RAW base (assets):</div>
      <input id="gf-w-raw" style="width:100%;padding:6px;border-radius:8px;border:1px solid #d4af37;background:#111;color:#d4af37" value="${RAW_BASE}">
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px">
        <button id="gf-w-ok" style="background:#111;color:#d4af37;border:1px solid #d4af37;border-radius:8px;padding:6px 10px;cursor:pointer">Zapisz</button>
      </div>
    `;
    document.body.appendChild(w);
    w.querySelectorAll(".gf-w-theme").forEach(b=>{
      b.style.cssText="background:#111;color:#d4af37;border:1px solid #d4af37;border-radius:8px;padding:6px;cursor:pointer";
      b.onclick = ()=> applyTheme(b.getAttribute("data-theme"));
    });
    el("gf-w-x").onclick = ()=>{ w.remove(); gset("gf_welcome_done", true); };
    el("gf-w-ok").onclick = ()=>{
      const v = el("gf-w-raw").value.trim();
      if(v){ RAW_BASE=v; gset("gf_raw_base", v); }
      w.remove(); gset("gf_welcome_done", true); toast("Zapisano startowe ustawienia");
    };
  }
  function showChangelog(){
    const box = document.createElement("div");
    box.style.cssText="position:fixed;left:50%;top:18px;transform:translateX(-50%);width:min(680px,92vw);background:#0f0f0f;color:#d4af37;border:2px solid #d4af37;border-radius:12px;padding:12px;z-index:2147483647;box-shadow:0 16px 40px rgba(0,0,0,.55)";
    box.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
        <b>⚓ GrepoFusion ${VER} — Changelog</b>
        <button id="gf-chg-x" style="background:#111;color:#d4af37;border:1px solid #d4af37;border-radius:6px;padding:2px 8px;cursor:pointer">×</button>
      </div>
      <ul style="margin:8px 0 0 18px;line-height:1.35">
        <li>Pełna korekta wizualna (Aegis: Classic/Remaster/Pirate/Dark).</li>
        <li>Asset Map: czysta podmiana grafik z repo (bez akcji w grze).</li>
        <li>Dock „pomocników” — tylko skróty UI i podświetlenia (manual).</li>
        <li>Panel ⚙: motyw, RAW base, importer map.</li>
        <li>Ekran powitalny (pierwsze uruchomienie).</li>
      </ul>
    `;
    document.body.appendChild(box);
    el("gf-chg-x").onclick = ()=>box.remove();
  }

  /* =========================
   * START
   * ======================= */
  function start(){
    applyTheme(gget("gf_theme","pirate"));
    mountFAB();
    mountDock();
    showWelcomeOnce();
    showChangelog();

    // Eksport narzędzi konsolowych (bez automatyzacji)
    window.GF = {
      version: VER,
      setTheme: applyTheme,
      setRawBase: (u)=>{ RAW_BASE=u; gset("gf_raw_base", u); toast("RAW base updated"); },
      addAssetMap: (obj)=>{ const cur = gget("gf_asset_map_ext",{}); Object.assign(cur, obj||{}); gset("gf_asset_map_ext", cur); toast("Asset map extended"); },
      debug: ()=>({ theme: gget("gf_theme"), raw: gget("gf_raw_base") })
    };

    log(`v${VER} ready (no-automation)`);
  }

  onReady(start);
})();