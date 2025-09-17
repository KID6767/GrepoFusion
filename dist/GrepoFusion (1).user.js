// ==UserScript==
// @name         GrepoFusion
// @namespace    https://github.com/KID6767/GrepoFusion
// @version      1.4.5
// @description  Remaster 2025 (Gold+Emerald): panel ustawień (zakładki), Clean Mode, Beige Killer, Raporty→BBCode (Ctrl+B), Attack Alarm (głośność/tryby/test), Transport kalkulator, Back Button, pełna podmiana ikon (statki+piechota+mityczne+budynki), compare, Easter Bunny, GrepoFusion Lab (beta). Wszystko konfigurowalne, zapis w GM storage.
// @author       KID6767 & ChatGPT
// @match        https://*.grepolis.com/*
// @icon         https://raw.githubusercontent.com/KID6767/GrepoFusion/main/assets/logo/logo-small.png
// @updateURL    https://raw.githubusercontent.com/KID6767/GrepoFusion/main/dist/grepofusion.user.js
// @downloadURL  https://raw.githubusercontent.com/KID6767/GrepoFusion/main/dist/grepofusion.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// ==/UserScript==
(function(){
'use strict';

/* =========================
   Core & Defaults
========================= */
const GF = {
  VERSION: '1.4.5',
  KEY: {
    ACCENT:'gf_accent', BG:'gf_bg', MODULES:'gf_modules',
    VOL:'gf_alarm_vol', ALARM_ON:'gf_alarm_on', ALARM_HOSTILE:'gf_alarm_hostile',
    SEEN:'gf_seen_145', TAB:'gf_ui_tab',
  },
  DEF: {
    accent:'#d4af37', bg:'#0f221a',
    modules:{theme:true,cleanMode:true,beigeKiller:true,reports:true,alarm:true,transport:true,backBtn:true,icons:true,lab:true}
  },
  ASSET: {
    base: 'https://raw.githubusercontent.com/KID6767/GrepoFusion/main/assets',
    // Repo URLs
    repo:{
      ships:{
        fire:'pirate/ships/blackpearl.png',
        colony:'pirate/ships/titanic.png',
        bireme:'pirate/ships/bireme.png',
        trireme:'pirate/ships/trireme.png',
      },
      inf:{
        sword:'pirate/infantry/swordsman.png',
        slinger:'pirate/infantry/slinger.png',
        hoplite:'pirate/infantry/hoplite.png',
      },
      myth:{
        minotaur:'pirate/mythical/minotaur.png',
        medusa:'pirate/mythical/medusa.png',
        hydra:'pirate/mythical/hydra.png',
      },
      bld:{
        senate:'pirate/buildings/senate.png',
        barracks:'pirate/buildings/barracks.png',
        harbor:'pirate/buildings/harbor.png',
      },
      bunny:'easter/bunny.png'
    },
    // Minimalne wbudowane placeholdery jako fallback (data URL)
    data:{ // wstawione male placeholdy, jeśli repo jeszcze nie posiada pliku
      fire:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAABo8...==',
      colony:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAABo8...==',
      bireme:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAABo8...==',
      trireme:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAABo8...==',
      sword:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAABo8...==',
      slinger:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAABo8...==',
      hoplite:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAABo8...==',
      minotaur:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAABo8...==',
      medusa:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAABo8...==',
      hydra:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAABo8...==',
      senate:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAABo8...==',
      barracks:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAABo8...==',
      harbor:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAABo8...==',
    }
  }
};
const S=(k,d)=>{try{return GM_getValue(k,d)}catch{return d}},
      W=(k,v)=>{try{GM_setValue(k,v)}catch{}};

/* =========================
   State
========================= */
let accent=S(GF.KEY.ACCENT,GF.DEF.accent),
    bg=S(GF.KEY.BG,GF.DEF.bg),
    modules=Object.assign({},GF.DEF.modules,S(GF.KEY.MODULES,{})),
    volume=S(GF.KEY.VOL,0.8),
    alarmOn=S(GF.KEY.ALARM_ON,true),
    alarmHostile=S(GF.KEY.ALARM_HOSTILE,true),
    activeTab=S(GF.KEY.TAB,'theme');

/* =========================
   Styles (Theme + UI)
========================= */
function injectTheme(){
  if(!modules.theme) return;
  GM_addStyle(`
    :root{--gf-bg:${bg};--gf-gold:${accent};--gf-input:#112b22}
    body,.ui-widget-content,.ui-dialog,.gpwindow_content,.ui-tabs-panel,.ui-dialog .ui-dialog-content{background-color:var(--gf-bg)!important;color:var(--gf-gold)!important}
    .ui-dialog .ui-dialog-titlebar,.gpwindow .gpwindow_header,.ui-tabs .ui-tabs-nav{background-color:var(--gf-bg)!important;color:var(--gf-gold)!important;border-color:var(--gf-gold)!important}
    .gpwindow_content,.ui-dialog,.ui-dialog-titlebar,.ui-widget-content,.report_title,.message_header{border-color:var(--gf-gold)!important}
    a{color:var(--gf-gold)!important}
    .button,.button_new,.btn{background:transparent!important;color:var(--gf-gold)!important;border:1px solid var(--gf-gold)!important}
    input,select,textarea{background:var(--gf-input)!important;color:var(--gf-gold)!important;border:1px solid var(--gf-gold)!important}
    /* Panel */
    .gf-toggle{position:fixed;right:14px;bottom:18px;z-index:2147483647;background:var(--gf-bg);color:var(--gf-gold);border:1px solid var(--gf-gold);border-radius:10px;padding:8px 12px;font-weight:700;cursor:pointer}
    .gf-float{position:fixed;right:14px;bottom:66px;z-index:2147483646;width:520px;max-height:72vh;overflow:auto;background:var(--gf-bg);color:var(--gf-gold);border:2px solid var(--gf-gold);border-radius:14px;box-shadow:0 12px 28px rgba(0,0,0,.45);display:none}
    .gf-float.show{display:block}
    .gf-h{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-bottom:1px solid var(--gf-gold);font-weight:800}
    .gf-tabs{display:flex;gap:8px;border-bottom:1px solid var(--gf-gold);padding:8px 12px}
    .gf-tab{padding:6px 10px;border:1px solid var(--gf-gold);border-bottom:none;border-radius:8px 8px 0 0;cursor:pointer}
    .gf-tab.active{background:var(--gf-gold);color:#0b1a0f;font-weight:800}
    .gf-b{padding:10px 12px}
    .gf-sec{margin-bottom:12px}.gf-sec h4{margin:0 0 6px 0;font-size:14px}
    .gf-btn{background:transparent;color:var(--gf-gold);border:1px solid var(--gf-gold);border-radius:8px;padding:6px 10px;cursor:pointer;margin-top:6px}
    .gf-check{display:flex;gap:8px;align-items:center;margin:4px 0}
    .gf-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .gf-hidden{display:none!important}
    .gf-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:var(--gf-bg);color:var(--gf-gold);border:1px solid var(--gf-gold);padding:6px 10px;border-radius:8px;z-index:2147483647}
    .gf-back{margin-right:6px}
  `);
}

/* =========================
   Utils
========================= */
const toast=msg=>{const t=document.createElement('div');t.className='gf-toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),1600)};
const repoURL=(rel)=>`${GF.ASSET.base}/${rel}`;
const safe=(rel, fallback)=> (rel ? repoURL(rel) : fallback);

/* =========================
   Clean Mode & Beige Killer
========================= */
function clean(root=document){
  if(!modules.cleanMode) return;
  const RX=/(GRCR|GRCRTools|DIO[- ]?TOOLS|Quack|Toolsammlung|Octopus|Ośmiorniczka)/i;
  const tw=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT,null);let n;
  while(n=tw.nextNode()){
    const text=(n.textContent||'').trim();
    const ids=((n.id||'')+' '+(n.className||'')).toString();
    const tt=n.getAttribute?.('title')||n.getAttribute?.('alt')||'';
    if(RX.test(text)||RX.test(ids)||RX.test(tt)) n.classList.add('gf-hidden');
  }
}
function toRGB(v){if(!v)return null;if(v.startsWith('#')){const s=v.slice(1);const n=s.length===3?s.split('').map(c=>c+c).join(''):s;return[parseInt(n.slice(0,2),16),parseInt(n.slice(2,4),16),parseInt(n.slice(4,6),16)]}const m=v.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);return m?[m[1]*1,m[2]*1,m[3]*1]:null}
function near(rgb){const T=[244,226,178],tol=[26,24,22];return Math.abs(rgb[0]-T[0])<=tol[0]&&Math.abs(rgb[1]-T[1])<=tol[1]&&Math.abs(rgb[2]-T[2])<=tol[2]}
function beige(root=document){
  if(!modules.beigeKiller) return;
  root.querySelectorAll('*').forEach(el=>{
    const cs=getComputedStyle(el);
    const a=toRGB(cs.backgroundColor), b=toRGB(cs.borderTopColor);
    if(a&&near(a)){el.style.setProperty('background-color',bg,'important');el.style.setProperty('color',accent,'important')}
    if(b&&near(b)) el.style.setProperty('border-color',accent,'important');
  });
}

/* =========================
   Icons Replacement
========================= */
function injectIconCSS(){
  if(!modules.icons) return;
  const I = GF.ASSET.repo;
  GM_addStyle(`
    /* Ships */
    img[src*="unit_fire_ship"],img[src*="ship_fire"]{content:url("${safe(I.ships.fire,GF.ASSET.data.fire)}");width:32px;height:32px}
    img[src*="unit_colonize_ship"],img[src*="colony"]{content:url("${safe(I.ships.colony,GF.ASSET.data.colony)}");width:32px;height:32px}
    img[src*="unit_bireme"],img[src*="bireme"]{content:url("${safe(I.ships.bireme,GF.ASSET.data.bireme)}");width:32px;height:32px}
    img[src*="unit_trireme"],img[src*="trireme"]{content:url("${safe(I.ships.trireme,GF.ASSET.data.trireme)}");width:32px;height:32px}
    /* Infantry */
    img[src*="unit_sword"]{content:url("${safe(I.inf.sword,GF.ASSET.data.sword)}");width:32px;height:32px}
    img[src*="unit_slinger"]{content:url("${safe(I.inf.slinger,GF.ASSET.data.slinger)}");width:32px;height:32px}
    img[src*="unit_hoplite"]{content:url("${safe(I.inf.hoplite,GF.ASSET.data.hoplite)}");width:32px;height:32px}
    /* Mythical */
    img[src*="unit_minotaur"]{content:url("${safe(I.myth.minotaur,GF.ASSET.data.minotaur)}");width:32px;height:32px}
    img[src*="unit_medusa"]{content:url("${safe(I.myth.medusa,GF.ASSET.data.medusa)}");width:32px;height:32px}
    img[src*="unit_hydra"]{content:url("${safe(I.myth.hydra,GF.ASSET.data.hydra)}");width:32px;height:32px}
  `);
}
function overrideIcons(root=document){
  if(!modules.icons) return;
  const I = GF.ASSET.repo;
  const map = [
    [/unit_fire_ship|ship_fire/ , safe(I.ships.fire,GF.ASSET.data.fire)],
    [/unit_colonize_ship|colony/ , safe(I.ships.colony,GF.ASSET.data.colony)],
    [/unit_bireme|bireme/ , safe(I.ships.bireme,GF.ASSET.data.bireme)],
    [/unit_trireme|trireme/ , safe(I.ships.trireme,GF.ASSET.data.trireme)],
    [/unit_sword/ , safe(I.inf.sword,GF.ASSET.data.sword)],
    [/unit_slinger/ , safe(I.inf.slinger,GF.ASSET.data.slinger)],
    [/unit_hoplite/ , safe(I.inf.hoplite,GF.ASSET.data.hoplite)],
    [/unit_minotaur/ , safe(I.myth.minotaur,GF.ASSET.data.minotaur)],
    [/unit_medusa/ , safe(I.myth.medusa,GF.ASSET.data.medusa)],
    [/unit_hydra/ , safe(I.myth.hydra,GF.ASSET.data.hydra)]
  ];
  root.querySelectorAll('img').forEach(img=>{
    const s=img.getAttribute('src')||'';
    for(const [rx,url] of map){ if(rx.test(s)){ img.src=url; break; } }
  });
}

/* =========================
   Reports → BBCode
========================= */
function addBBButtons(root=document){
  if(!modules.reports) return;
  root.querySelectorAll('.report_header,.report_title').forEach(h=>{
    if(h.dataset.gfBb) return; h.dataset.gfBb='1';
    const b=document.createElement('button'); b.className='btn'; b.textContent='Kopiuj BBCode'; b.style.marginLeft='8px';
    b.onclick=copyBB; h.appendChild(b);
  });
}
function copyBB(){
  const box=document.querySelector('.report_view,.gpwindow_content')||document.body;
  let txt=box.innerText||''; txt=txt.replace(/\n\n+/g,'\n').trim();
  const bb='[report]\n'+txt+'\n[/report]';
  navigator.clipboard.writeText(bb).then(()=>toast('BBCode skopiowany ✔')).catch(()=>alert(bb));
}
document.addEventListener('keydown',e=>{ if(e.ctrlKey&&e.key.toLowerCase()==='b'){ copyBB(); e.preventDefault(); }});

/* =========================
   Attack Alarm
========================= */
const sounds = {
  ping:'data:audio/wav;base64,UklGRiIAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAAAABAAACaW1hZGUtd2F2ZQAAAP8AAP8A/wD/AP8A/wD/AP8A',
  beep:'data:audio/wav;base64,UklGRiIAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAAAABAAACaW1hZGUtd2F2ZQAAAP8A//8AAP8A//8AAP8A'
};
let audio=new Audio(sounds.ping); audio.volume=volume;
function playAlarm(kind='hostile'){
  if(!modules.alarm||!alarmOn) return;
  if(alarmHostile && kind!=='hostile') return;
  try{ audio.pause(); audio.currentTime=0; audio.volume=volume; audio.play(); }catch(e){}
}

/* =========================
   Transport calculator
========================= */
function calcShips(pop,cap){pop=+pop||0;cap=+cap||16;return Math.ceil(pop/cap)}

/* =========================
   Back Button
========================= */
function ensureBack(root=document){
  if(!modules.backBtn) return;
  root.querySelectorAll('.gpwindow .gpwindow_header,.ui-dialog-titlebar').forEach(h=>{
    if(h.querySelector('.gf-back')) return;
    const b=document.createElement('button'); b.textContent='⟵'; b.title='Wróć'; b.className='gf-back btn'; b.onclick=()=>history.back(); h.prepend(b);
  });
}

/* =========================
   Panel (tabs)
========================= */
function createPanel(){
  const el=document.createElement('div'); el.innerHTML=`
    <div class="gf-float">
      <div class="gf-h"><span>🏴‍☠️ GrepoFusion ${GF.VERSION}</span><button class="gf-x gf-btn">✕</button></div>
      <div class="gf-tabs">
        <div class="gf-tab" data-tab="theme">Motyw</div>
        <div class="gf-tab" data-tab="modules">Moduły</div>
        <div class="gf-tab" data-tab="reports">Raporty</div>
        <div class="gf-tab" data-tab="alarm">Alarm</div>
        <div class="gf-tab" data-tab="transport">Transport</div>
        <div class="gf-tab" data-tab="graphics">Grafiki</div>
      </div>
      <div class="gf-b">
        <div class="gf-pane" data-pane="theme">
          <div class="gf-sec gf-grid">
            <label>Akcent <input type="color" id="gf-accent" value="${accent}"></label>
            <label>Tło <input type="color" id="gf-bg" value="${bg}"></label>
            <button class="gf-btn" id="gf-save-colors">Zapisz</button>
          </div>
        </div>
        <div class="gf-pane" data-pane="modules">
          <div class="gf-sec">
            ${Object.entries(modules).map(([k,v])=>`<label class="gf-check"><input type="checkbox" data-mod="${k}" ${v?'checked':''}> ${k}</label>`).join('')}
            <button class="gf-btn" id="gf-save-mods">Zapisz moduły</button>
          </div>
        </div>
        <div class="gf-pane" data-pane="reports">
          <div class="gf-sec">
            <button class="gf-btn" id="gf-add-bb">Dodaj przycisk BBCode</button>
            <p>Skrót: <b>Ctrl+B</b></p>
          </div>
        </div>
        <div class="gf-pane" data-pane="alarm">
          <div class="gf-sec">
            <label class="gf-check"><input type="checkbox" id="gf-alarm-on" ${alarmOn?'checked':''}> Włącz alarm</label>
            <label class="gf-check"><input type="checkbox" id="gf-alarm-hostile" ${alarmHostile?'checked':''}> Tylko wrogie</label>
            <label>Głośność: <input type="range" id="gf-vol" min="0" max="1" step="0.05" value="${volume}"></label>
            <label>Sound:
              <select id="gf-sound">
                <option value="ping">ping</option>
                <option value="beep">beep</option>
              </select>
            </label>
            <button class="gf-btn" id="gf-alarm-test">Test</button>
          </div>
        </div>
        <div class="gf-pane" data-pane="transport">
          <div class="gf-sec">
            <label>Populacja: <input id="gf-pop" type="number" min="0" value="300"></label>
            <label>Pojemność/stat.: <input id="gf-cap" type="number" min="1" value="16"></label>
            <button class="gf-btn" id="gf-calc">Oblicz</button>
            <span id="gf-out"></span>
          </div>
        </div>
        <div class="gf-pane" data-pane="graphics">
          <div class="gf-sec">
            <p>Podmiana ikon jednostek i budynków jest aktywna. Upewnij się, że folder <code>assets/</code> jest w repo.</p>
          </div>
        </div>
      </div>
    </div>
    <button class="gf-toggle">⚙️ GrepoFusion</button>
  `;
  document.body.appendChild(el);
  const $=(s,p=el)=>p.querySelector(s), $$=(s,p=el)=>Array.from(p.querySelectorAll(s));
  const win=$('.gf-float'), toggle=$('.gf-toggle'), closeBtn=$('.gf-x');
  toggle.onclick=()=>win.classList.toggle('show'); closeBtn.onclick=()=>win.classList.remove('show');
  // Tabs
  function act(tab){ activeTab=tab; W(GF.KEY.TAB,tab); $$('.gf-tab').forEach(t=>t.classList.toggle('active', t.dataset.tab===tab)); $$('.gf-pane').forEach(p=>p.classList.toggle('gf-hidden', p.dataset.pane!==tab)); }
  $$('.gf-tab').forEach(t=>t.onclick=()=>act(t.dataset.tab));
  act(activeTab||'theme');

  // Save handlers
  $('#gf-save-colors').onclick=()=>{accent=$('#gf-accent').value; bg=$('#gf-bg').value; W(GF.KEY.ACCENT,accent); W(GF.KEY.BG,bg); alert('Zapisano. Odśwież (F5).')};
  $('#gf-save-mods').onclick=()=>{const m={}; $$('input[type="checkbox"][data-mod]').forEach(ch=>m[ch.dataset.mod]=ch.checked); modules=m; W(GF.KEY.MODULES,m); alert('Zapisano. Odśwież (F5).')};
  $('#gf-add-bb').onclick=()=>addBBButtons(document);
  $('#gf-alarm-on').onchange=e=>{alarmOn=e.target.checked; W(GF.KEY.ALARM_ON,alarmOn)};
  $('#gf-alarm-hostile').onchange=e=>{alarmHostile=e.target.checked; W(GF.KEY.ALARM_HOSTILE,alarmHostile)};
  $('#gf-vol').oninput=e=>{volume=parseFloat(e.target.value||'0.8'); W(GF.KEY.VOL,volume); audio.volume=volume;};
  $('#gf-sound').onchange=e=>{audio=new Audio(sounds[e.target.value]||sounds.ping); audio.volume=volume;};
  $('#gf-alarm-test').onclick=()=>playAlarm('hostile');
  $('#gf-calc').onclick=()=>{const pop=+$('#gf-pop').value||0; const cap=+$('#gf-cap').value||16; $('#gf-out').textContent=' Statków: '+calcShips(pop,cap)};
}

/* =========================
   Easter Bunny + Once
========================= */
function bunny(){let c=0; const hook=()=>{const b=document.querySelector('.gf-toggle'); if(!b) return setTimeout(hook,200); b.addEventListener('click',()=>{c++; if(c>=10){c=0; toast('🐰 GrepoFusion Bunny!')}})}; hook()}
function firstToast(){ if(S(GF.KEY.SEEN,false)) return; toast('GrepoFusion '+GF.VERSION+' — pełny remaster aktywny.'); W(GF.KEY.SEEN,true); }

/* =========================
   Observer (auto-attach)
========================= */
function observe(){
  const o=new MutationObserver(ms=>ms.forEach(m=>{
    m.addedNodes&&m.addedNodes.forEach(n=>{
      if(n.nodeType!==1) return;
      clean(n); beige(n); overrideIcons(n); ensureBack(n); addBBButtons(n);
    });
  }));
  o.observe(document.documentElement,{childList:true,subtree:true});
}

/* =========================
   Init
========================= */
function init(){
  injectTheme();
  createPanel();
  bunny();
  firstToast();

  clean(document);
  beige(document);
  injectIconCSS();
  overrideIcons(document);
  ensureBack(document);
  addBBButtons(document);

  observe();
  console.log('%c[GrepoFusion] 1.4.5 ready','color:'+accent+';font-weight:700;');
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();

})();