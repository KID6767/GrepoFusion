// ==UserScript==
// @name         GrepoFusion
// @namespace    https://github.com/KID6767/GrepoFusion
// @version      1.5.0.2
// @description  Theme Switcher + Asset Map + Helpers (Build/Recruit/Academy) + Panel + Changelog
// @author       KID6767 & ChatGPT
// @match        https://*.grepolis.com/*
// @match        https://*.grepolis.pl/*
// @updateURL    https://raw.githubusercontent.com/KID6767/GrepoFusion/main/dist/grepofusion.user.js
// @downloadURL  https://raw.githubusercontent.com/KID6767/GrepoFusion/main/dist/grepofusion.user.js
// @grant        none
// ==/UserScript==

(function(){
  'use strict';
  const VER = "1.5.0.2";

  function toast(m,ms){ms=ms||2000;const t=document.createElement('div');t.textContent=m;t.style.cssText='position:fixed;left:50%;bottom:60px;transform:translateX(-50%);background:#111;color:#d4af37;padding:8px 12px;border-radius:8px;border:1px solid #d4af37;z-index:2147483647;font:13px system-ui';document.body.appendChild(t);setTimeout(()=>t.remove(),ms);}

  function applyTheme(name){
    var css='';
    switch(name){
      case 'classic': css = `:root{--gf-gold:#d4af37;--gf-bg:#f4e2b2;--gf-text:#222}
body,.gpwindow_content,.game_inner_box,.ui_box{background:var(--gf-bg)!important;color:var(--gf-text)!important}
a,.gpwindow_content a{color:#996515!important}`; break;
      case 'remaster': css = `:root{--gf-gold:#f2d98d;--gf-ink:#232a36;--gf-bg:#1a1f29;--gf-fg:#e9e6de}
body,.gpwindow_content,.game_inner_box,.ui_box{background:var(--gf-bg)!important;color:var(--gf-fg)!important}
.ui-dialog .ui-dialog-titlebar,.game_header{background:var(--gf-ink)!important;color:var(--gf-gold)!important;border-color:#a8832b!important}
.btn,.button,.context_menu,.ui-button{background:#3c2f2f!important;color:var(--gf-gold)!important;border:1px solid #a8832b!important}
a,.gpwindow_content a{color:#ffd77a!important}
.gp_table th,.gp_table td{border-color:#a8832b!important}`; break;
      case 'dark': css = `:root{--gf-bg:#111;--gf-fg:#ddd;--gf-accent:#4da6ff}
body,.gpwindow_content,.game_inner_box,.ui_box,.forum_content{background:var(--gf-bg)!important;color:var(--gf-fg)!important}
a,.gpwindow_content a,.forum_content a{color:#4da6ff!important}
.button,.btn,.ui-button{background:#333!important;color:#eee!important;border:1px solid #555!important}`; break;
      default: css = `:root{--gf-gold:#d4af37;--gf-ink:#0f0f0f;--gf-bg:#0a0a0a}
body,.gpwindow_content,.game_inner_box,.ui_box{background:var(--gf-bg)!important;color:var(--gf-gold)!important}
.ui-dialog .ui-dialog-titlebar,.game_header{background:var(--gf-ink)!important;color:var(--gf-gold)!important;border-color:var(--gf-gold)!important}
.btn,.button,.context_menu,.ui-button{background:#151515!important;color:var(--gf-gold)!important;border:1px solid var(--gf-gold)!important}
a,.gpwindow_content a{color:#e5c66a!important}
.gp_table th,.gp_table td{border-color:var(--gf-gold)!important}`;
    }
    css += `\n` + `#gf-panel{position:fixed;right:18px;bottom:76px;width:280px;background:#0f0f0f;color:#d4af37;border:1px solid #d4af37;border-radius:12px;padding:12px;z-index:2147483647;box-shadow:0 16px 40px rgba(0,0,0,.55);font:13px/1.35 system-ui,Arial}
#gf-fab{position:fixed;right:18px;bottom:18px;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#111;color:#d4af37;border:2px solid #d4af37;cursor:pointer;z-index:2147483647;box-shadow:0 10px 30px rgba(0,0,0,.55)}
.gf-theme-btn{background:#111;color:#d4af37;border:1px solid #d4af37;border-radius:8px;padding:6px;cursor:pointer}
`;
    var el=document.getElementById('gf-theme-style');
    if(!el){ el=document.createElement('style'); el.id='gf-theme-style'; document.head.appendChild(el); }
    el.textContent = css;
    localStorage.setItem('GF_THEME', name);
    toast('Motyw: '+name);
  }

  function mountFAB(){
    if(document.getElementById('gf-fab')) return;
    const f=document.createElement('div');f.id='gf-fab';f.textContent='⚙';f.title='GrepoFusion — ustawienia';f.onclick=mountPanel;document.body.appendChild(f);
  }

  function mountPanel(){
    if(document.getElementById('gf-panel')) return;
    const w=document.createElement('div');w.id='gf-panel';
    w.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;">
        <b>GrepoFusion 1.5.0.2</b>
        <button id="gf-close" class="gf-theme-btn">×</button>
      </div>
      <div>
        <div style="margin:4px 0 4px;">Motyw:</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
          <button class="gf-theme-btn" data-t="classic">Classic</button>
          <button class="gf-theme-btn" data-t="remaster">Remaster</button>
          <button class="gf-theme-btn" data-t="pirate">Pirate</button>
          <button class="gf-theme-btn" data-t="dark">Dark</button>
        </div>
      </div>
      <div style="margin-top:10px;">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
          <input id="gf-autobuild" type="checkbox" checked /> <span>Pomocnik budowlańca</span>
        </label>
      </div>
    `;
    document.body.appendChild(w);
    w.querySelectorAll('.gf-theme-btn[data-t]').forEach(b=>b.addEventListener('click',()=>applyTheme(b.getAttribute('data-t'))));
    document.getElementById('gf-close').onclick=()=>w.remove();
  }

  function changelog(){
    if(document.getElementById('gf-changelog')) return;
    const x=document.createElement('div'); x.id='gf-changelog';
    x.style.cssText='position:fixed;left:50%;top:16px;transform:translateX(-50%);width:min(680px,92vw);background:#0f0f0f;color:#d4af37;border:2px solid #d4af37;border-radius:12px;padding:12px;z-index:2147483647;box-shadow:0 16px 40px rgba(0,0,0,.55)';
    x.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b>⚓ GrepoFusion 1.5.0.2</b><button id="gf-chg-x" class="gf-theme-btn">×</button></div><ul style="margin:8px 0 0 18px"><li>Motywy: Classic/Remaster/Pirate/Dark</li><li>Panel ustawień (⚙)</li><li>Asset Map (podmiana ikon)</li><li>Helpery: Budowniczy/Rekruter/Akademik (start)</li></ul>`;
    document.body.appendChild(x);
    document.getElementById('gf-chg-x').onclick=()=>x.remove();
  }

  // Theme init
  applyTheme(localStorage.getItem('GF_THEME') || 'pirate');

  // FAB
  mountFAB();

  // Asset override
  (function(){
    const RAW_MAP = {"units": {"bireme": {"classic": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAF0lEQVQoU2NkYGD4z0AEYBxVSFUAAG1mAgC1kA9w6l9mRwAAAABJRU5ErkJggg==", "pirate": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAIklEQVQoU2P8////fwYiAHEgCkYg0QAxEIxGQwYGBgYGsQEAACr2B5r1lGQbAAAAAElFTkSuQmCC"}, "trireme": {"classic": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAHUlEQVQoU2P8////fwYsgImBQQYGBkaDgYEBQwAAdtQG3Jgk3nEAAAAASUVORK5CYII=", "pirate": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAG0lEQVQoU2P8////fwYqgAmGQYGBgQFDAQAA1KUGbvfO2WQAAAAASUVORK5CYII="}}, "buildings": {"senate": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAI0lEQVQoU2P8////fwYiQGZgYGBg2D8xMTH4////GQYGAQAA1Y8G0m8o0F8AAAAASUVORK5CYII=", "academy": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAIklEQVQoU2P8////fwYiQGZgYGBgGJgZGBgYGMQCAAArfgbp3d8C1gAAAABJRU5ErkJggg=="}, "ui": {"settings": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAH0lEQVQoU2P8////fwYigImBQQYGBgZGQAEYBAAAwNUGB1j6p3oAAAAASUVORK5CYII="}};
    function pickUnit(src,mode){
      for(const [k,v] of Object.entries(RAW_MAP.units||{})){
        if(src.includes(k)) return (v[mode]||v.classic||src);
      }
      return null;
    }
    function mapSrc(src){
      if(!src) return src;
      const mode = (localStorage.getItem('GF_THEME')||'pirate').includes('pirate')?'pirate':'classic';
      let u = pickUnit(src,mode); if(u) return u;
      for(const [k,v] of Object.entries(RAW_MAP.buildings||{})){
        if(src.includes(k)) return v;
      }
      return src;
    }
    const _create=document.createElement;
    document.createElement=function(tag){
      const el=_create.call(document,tag);
      if((''+tag).toLowerCase()==='img'){
        const _set=el.setAttribute;
        el.setAttribute=function(n,val){
          if(n==='src' && typeof val==='string'){ val=mapSrc(val); }
          return _set.call(this,n,val);
        }
      }
      return el;
    };
    const mo=new MutationObserver(m=>m.forEach(x=>x.addedNodes&&x.addedNodes.forEach(n=>{ if(n.nodeType===1) n.querySelectorAll&&n.querySelectorAll('img[src]').forEach(img=>img.src=mapSrc(img.src)); })));
    mo.observe(document.documentElement,{childList:true,subtree:true});
  })();

  // Helper stubs (start)
  window.GF_Helper_Build = window.GF_Helper_Build || { run: ()=>{} };
  window.GF_Helper_Recruit = window.GF_Helper_Recruit || { run: ()=>{} };
  window.GF_Helper_Academy = window.GF_Helper_Academy || { run: ()=>{} };

  setTimeout(changelog,600);
  console.log('%c[GrepoFusion] 1.5.0.2 ready','color:#d4af37;font-weight:700');
})();
