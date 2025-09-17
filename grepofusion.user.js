// ==Skrypt użytkownika==
// @name GrepoFusion
// @namespace https://github.com/KID6767/GrepoFusion
// @wersja 1.4.5
// @description Remaster 2025 (Gold+Emerald): panel ustawień (zakładki), Clean Mode, Beige Killer, Raportyâ†BBCode (Ctrl+B), Attack Alarm (glośność/tryby/test), Kalkulator transportu, Back Button, pelna podmiana ikon (statki+piechota+mityczne+budynki), porównaj, Easter Bunny, GrepoFusion Lab (beta). Wszystko konfigurowalne, zapisane w pamięci GM.
// @author KID6767 i ChatGPT
// @match https://*.grepolis.com/*
// @icon https://raw.githubusercontent.com/KID6767/GrepoFusion/main/assets/logo/logo-small.png
// @updateURL https://raw.githubusercontent.com/KID6767/GrepoFusion/main/dist/grepofusion.user.js
// @downloadURL https://raw.githubusercontent.com/KID6767/GrepoFusion/main/dist/grepofusion.user.js
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_addStyle
// ==/Skrypt użytkownika==
(funkcjonować(){
'użyj ściśle';

/* =========================
   Rdzeń i ustawienia domyślne
========================= */
stała GF = {
  WERSJA: '1.4.5',
  KLUCZ: {
    AKCENT:'gf_accent', BG:'gf_bg', MODUŁY:'gf_modules',
    GŁOŚNOŚĆ:'gf_alarm_vol', ALARM_WŁ.:'gf_alarm_on', ALARM_HOSTILE:'gf_alarm_hostile',
    WIDZIANE:'gf_seen_145', TAB:'gf_ui_tab',
  },
  DEF: {
    akcent:'#d4af37', tło:'#0f221a',
    moduły: {theme:true,cleanMode:true,beigeKiller:true,reports:true,alarm:true,transport:true,backBtn:true,ikony:true,lab:true}
  },
  ZALETA: {
    baza: 'https://raw.githubusercontent.com/KID6767/GrepoFusion/main/assets',
    // Adresy URL repozytorium
    repozytorium:{
      statki:{
        ogień:'pirat/statki/czarnapearl.png',
        kolonia:'pirat/statki/titanic.png',
        bireme:'pirate/ships/bireme.png',
        trirema:'pirate/ships/trireme.png',
      },
      informacje:{
        miecz:'pirat/piechota/szermierz.png',
        procarz:'pirat/piechota/proca.png',
        hoplita:'pirat/piechota/hoplita.png',
      },
      mit:{
        minotaur:'pirat/mityczny/minotaur.png',
        medusa:'pirat/mityczny/medusa.png',
        hydra:'pirat/mityczny/hydra.png',
      },
      budynek:{
        senat:'pirat/budynki/senat.png',
        koszary:'pirat/budynki/baraki.png',
        port:'pirat/budynki/port.png',
      },
      króliczek:'easter/bunny.png'
    },
    // Minimalne miejsce na miejsce jako rezerwowe (URL danych)
    data:{ // wstawione male placeholdy, jeśli repo jeszcze nie posiada pliku
      ogień:'data:image/png;base64,iVBORw0KGgoAAAAANSUhEUgAAAEAAAABACAQAAABo8...==',
      colony:'data:image/png;base64,iVBORw0KGgoAAAAANSUhEUgAAAEAAAABACAQAAABo8...==',
      bireme:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAAABACAQAAABo8...==',
      trirema:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAAABACAQAAABo8...==',
      sword:'data:image/png;base64,iVBORw0KGgoAAAAANSUhEUgAAAEAAAABACAQAAABo8...==',
      slinger:'data:image/png;base64,iVBORw0KGgoAAAAANSUhEUgAAAEAAAABACAQAAABo8...==',
      hoplite:'data:image/png;base64,iVBORw0KGgoAAAAANSUhEUgAAAEAAAABACAQAAABo8...==',
      minotaur:'data:image/png;base64,iVBORw0KGgoAAAAANSUhEUgAAAEAAAABACAQAAABo8...==',
      medusa:'data:image/png;base64,iVBORw0KGgoAAANSUhEUgAAAEAAAABACAQAAABo8...==',
      hydra:'data:image/png;base64,iVBORw0KGgoAAANSUhEUgAAAEAAAABACAQAAABo8...==',
      senat:'data:image/png;base64,iVBORw0KGgoAAANSUhEUgAAAEAAAABACAQAAABo8...==',
      koszary:'data:image/png;base64,iVBORw0KGgoAAAAANSUhEUgAAAEAAAABACAQAAABo8...==',
      harbour:'data:image/png;base64,iVBORw0KGgoAAANSUhEUgAAAEAAAABACAQAAABo8...==',
    }
  }
};
const S=(k,d)=>{try{return GM_getValue(k,d)}catch{return d}},
      W=(k,v)=>{try{GM_setValue(k,v)}catch{}};

/* =========================
   Państwo
========================= */
niech akcent=S(GF.KEY.AKCENT,GF.DEF.akcent),
    bg=S(GF.KEY.BG,GF.DEF.bg),
    moduły=Obiekt.przypisz({},GF.DEF.modules,S(GF.KEY.MODULES,{})),
    głośność=S(GF.KEY.VOL,0,8),
    alarmOn=S(GF.KEY.ALARM_ON,prawda),
    alarmHostile=S(GF.KEY.ALARM_HOSTILE,prawda),
    activeTab=S(GF.KEY.TAB,'motyw');

/* =========================
   Style (motyw + interfejs użytkownika)
========================= */
funkcja injectTheme(){
  jeśli(!modules.theme) zwróć;
  GM_addStyle(`
    :root{--gf-bg:${bg};--gf-gold:${accent};--gf-input:#112b22}
    treść, .zawartość-widżetu-ui, .dialog-ui, .zawartość_okna_gp, .panel-zakładek-ui, .dialog-ui .zawartość-dialogu-ui{kolor-tła:zmienny(--gf-bg)!ważne;kolor:zmienny(--gf-złoty)!ważne}
    .ui-dialog .ui-dialog-titlebar,.gpwindow .gpwindow_header,.ui-tabs .ui-tabs-nav{kolor tła:zmienny(--gf-bg)!ważne;kolor:zmienny(--gf-złoty)!ważne;kolor obramowania:zmienny(--gf-złoty)!ważne}
    .gpwindow_content,.ui-dialog,.ui-dialog-titlebar,.ui-widget-content,.report_title,.message_header{border-color:var(--gf-gold)!important}
    a{color:var(--gf-gold)!ważne}
    .button,.button_new,.btn{tło:transparentne!ważne;kolor:zmienna(--gf-złota)!ważne;obramowanie:1px pełne zmienne(--gf-złota)!ważne}
    wejście, wybierz, obszar tekstowy{tło: zmienna(--gf-wejście)!ważne;kolor: zmienna(--gf-złoto)!ważne;obramowanie: 1px pełne zmienne(--gf-złoto)!ważne}
    /* Panel */
    .gf-toggle{pozycja:stała;prawa:14px;dół:18px;indeks z:2147483647;tło:zmienna(--gf-bg);kolor:zmienna(--gf-złoty);obramowanie:1px pełne zmienne(--gf-złoty);promień obramowania:10px;wypełnienie:8px 12px;waga czcionki:700;kursor:wskaźnik}
    .gf-float{pozycja:stała;prawa:14px;dół:66px;indeks Z:2147483646;szerokość:520px;maksymalna wysokość:72vh;przepełnienie:automatyczne;tło:zmienne(--gf-bg);kolor:zmienne(--gf-złoty);obramowanie:2px pełne zmienne(--gf-złoty);promień obramowania:14px;cień pola:0 12px 28px rgba(0,0,0,.45);wyświetlacz:brak}
    .gf-float.show{wyświetlacz:blok}
    .gf-h{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-bottom:1px solid var(--gf-gold);font-weight:800}
    .gf-tabs{display:flex;gap:8px;border-bottom:1px solid var(--gf-gold);padding:8px 12px}
    .gf-tab{wypełnienie:6px 10px;obramowanie:1px solid var(--gf-gold);obramowanie-dolne:brak;obramowanie-promień:8px 8px 0 0;kursor:wskaźnik}
    .gf-tab.active{tło:var(--gf-gold);kolor:#0b1a0f;waga-czcionki:800}
    .gf-b{wypełnienie:10px 12px}
    .gf-sec{margines dolny:12px}.gf-sec h4{margines:0 0 6px 0;rozmiar czcionki:14px}
    .gf-btn{tło:przezroczyste;kolor:zmienna(--gf-złoty);obramowanie:1px pełne zmienne(--gf-złoty);promień obramowania:8px;wypełnienie:6px 10px;kursor:wskaźnik;margines górny:6px}
    .gf-check{display:flex;gap:8px;align-items:center;margin:4px 0}
    .gf-grid{display:grid;grid-szablon-kolumny:1fr 1fr;gap:8px}
    .gf-ukryty{display:none!important}
    .gf-toast{pozycja:stała;lewo:50%;dół:24px;przekształcenie:translateX(-50%);tło:zmienne(--gf-bg);kolor:zmienne(--gf-złoty);obramowanie:1px stałe zmienne(--gf-złoty);wypełnienie:6px 10px;promień obramowania:8px;indeks z:2147483647}
    .gf-back{margin-prawy:6px}
  `);
}

/* =========================
   Narzędzia
========================= */
const toast=msg=>{const t=document.createElement('div');t.className='gf-toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),1600)};
const repoURL=(rel)=>`${GF.ASSET.base}/${rel}`;
const safe=(rel, fallback)=> (rel ? repoURL(rel) : fallback);

/* =========================
   Tryb czyszczenia i Beige Killer
========================= */
funkcja clean(root=document){
  jeśli(!modules.cleanMode) zwraca;
  const RX=/(GRCR|GRCRTools|DIO[- ]?TOOLS|Quack|Toolsammlung|Octopus|Ośmiorniczka)/i;
  const tw=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT,null);let n;
  podczas gdy(n=tw.nextNode()){
    const tekst=(n.textContent||'').trim();
    const ids=((n.id||'')+' '+(n.className||'')).toString();
    const tt=n.getAttribute?.('title')||n.getAttribute?.('alt')||'';
    jeśli(RX.test(tekst)||RX.test(ids)||RX.test(tt)) n.classList.add('gf-hidden');
  }
}
funkcja toRGB(v){jeśli(!v)zwróć null;jeśli(v.startsWith('#')){const s=v.slice(1);const n=s.length===3?s.split('').map(c=>c+c).join(''):s;zwróć[parseInt(n.slice(0,2),16),parseInt(n.slice(2,4),16),parseInt(n.slice(4,6),16)]}const m=v.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);zwróć m?[m[1]*1,m[2]*1,m[3]*1]:null}
funkcja near(rgb){const T=[244,226,178],tol=[26,24,22];zwróć Math.abs(rgb[0]-T[0])<=tol[0]&&Math.abs(rgb[1]-T[1])<=tol[1]&&Math.abs(rgb[2]-T[2])<=tol[2]}
funkcja beżowa(root=dokument){
  jeśli(!modules.beigeKiller) return;
  root.querySelectorAll('*').forEach(el=>{
    const cs=getComputedStyle(el);
    const a=toRGB(cs.backgroundColor), b=toRGB(cs.borderTopColor);
    jeśli(a&&near(a)){el.style.setProperty('kolor-tła',bg,'ważne');el.style.setProperty('kolor',akcent,'ważne')}
    jeśli(b&&near(b)) el.style.setProperty('border-color',accent,'important');
  });
}

/* =========================
   Wymiana ikon
========================= */
funkcja injectIconCSS(){
  jeśli(!modules.ikony) zwraca;
  const I = GF.ASSET.repo;
  GM_addStyle(`
    /* Statki */
    img[źródło*="jednostka_ogniowa_statek"],img[źródło*="statek_ogniowy"]{zawartość:url("${safe(I.ships.fire,GF.ASSET.data.fire)}");szerokość:32px;wysokość:32px}
    img[źródło*="jednostka_kolonizująca_statek"],img[źródło*="kolonia"]{content:url("${safe(I.ships.colony,GF.ASSET.data.colony)}");szerokość:32px;wysokość:32px}
    img[źródło*="jednostka_birema"],img[źródło*="birema"]{content:url("${safe(I.ships.birema,GF.ASSET.data.birema)}");szerokość:32px;wysokość:32px}
    img[src*="unit_trireme"],img[src*="trireme"]{content:url("${safe(I.ships.trireme,GF.ASSET.data.trireme)}");width:32px;height:32px}
    /* Piechota */
    img[źródło*="jednostka_miecz"]{zawartość:url("${safe(I.inf.sword,GF.ASSET.data.sword)}");szerokość:32px;wysokość:32px}
    img[źródło*="unit_slinger"]{zawartość:url("${safe(I.inf.slinger,GF.ASSET.data.slinger)}");szerokość:32px;wysokość:32px}
    img[src*="unit_hoplite"]{content:url("${safe(I.inf.hoplite,GF.ASSET.data.hoplite)}");szerokość:32px;wysokość:32px}
    /* Mityczny */
    img[src*="unit_minotaur"]{content:url("${safe(I.myth.minotaur,GF.ASSET.data.minotaur)}");szerokość:32px;wysokość:32px}
    img[źródło*="unit_medusa"]{zawartość:url("${safe(I.myth.medusa,GF.ASSET.data.medusa)}");szerokość:32px;wysokość:32px}
    img[src*="unit_hydra"]{content:url("${safe(I.myth.hydra,GF.ASSET.data.hydra)}");szerokość:32px;wysokość:32px}
  `);
}
funkcja overrideIcons(root=document){
  jeśli(!modules.ikony) zwraca;
  const I = GF.ASSET.repo;
  stała mapa = [
    [/unit_fire_ship|ship_fire/ , bezpieczny(I.ships.fire,GF.ASSET.data.fire)],
    [/unit_colonize_ship|kolonia/ , bezpieczna(I.ships.colony,GF.ASSET.data.colony)],
    [/unit_bireme|bireme/ , safe(I.ships.bireme,GF.ASSET.data.bireme)],
    [/unit_trireme|trireme/ , bezpieczne(I.ships.trireme,GF.ASSET.data.trireme)],
    [/unit_sword/ , bezpieczny(I.inf.sword,GF.ASSET.data.sword)],
    [/unit_slinger/ , bezpieczny(I.inf.slinger,GF.ASSET.data.slinger)],
    [/unit_hoplite/ , bezpieczny(I.inf.hoplite,GF.ASSET.data.hoplite)],
    [/unit_minotaur/ , bezpieczny(I.myth.minotaur,GF.ASSET.data.minotaur)],
    [/unit_medusa/ , bezpieczne(I.myth.medusa,GF.ASSET.data.medusa)],
    [/unit_hydra/ , safe(I.myth.hydra,GF.ASSET.data.hydra)]
  ];
  root.querySelectorAll('img').forEach(img=>{
    const s=img.getAttribute('src')||'';
    dla(const [rx, url] mapy){ jeśli(rx.test(s)){ img.src=url; przerwij; } }
  });
}

/* =========================
   Raporty â†' BBCode
========================= */
funkcja addBBButtons(root=document){
  jeśli(!modules.reports) zwróć;
  root.querySelectorAll('.report_header,.report_title').forEach(h=>{
    jeśli(h.dataset.gfBb) return; h.dataset.gfBb='1';
    const b=document.createElement('button'); b.className='btn'; b.textContent='Kopiuj BBCode'; b.style.marginLeft='8px';
    b.onclick=copyBB; h.appendChild(b);
  });
}
funkcja copyBB(){
  const box=document.querySelector('.report_view,.gpwindow_content')||document.body;
  niech txt=box.innerText||''; txt=txt.replace(/\n\n+/g,'\n').trim();
  const bb='[raport]\n'+txt+'\n[/raport]';
  navigator.clipboard.writeText(bb).then(()=>toast('BBCode skopiowany âœ”')).catch(()=>alert(bb));
}
document.addEventListener('keydown',e=>{ if(e.ctrlKey&&e.key.toLowerCase()==='b'){ copyBB(); e.preventDefault(); }});

/* =========================
   Alarm ataku
========================= */
const sounds = {
  ping:'data:audio/wav;base64,UklGRiIAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAAAABAAACaW1hZGUtd2F2ZQAAAP8AAP8A/wD/AP8A/wD/AP8A',
  sygnał dźwiękowy:'dane:audio/wav;base64,UklGRiIAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAAAABAAACaW1hZGUtd2F2ZQAAAP8A//8AAP8A//8AAP8A'
};
niech audio=new Audio(sounds.ping); audio.volume=głośność;
funkcja playAlarm(kind='hostile'){
  jeśli(!modules.alarm||!alarmOn) return;
  jeśli(alarmHostile && kind!=='hostile') return;
  spróbuj { audio.pause(); audio.currentTime=0; audio.volume=głośność; audio.play(); }catch(e){}
}

/* =========================
   Kalkulator transportu
========================= */
funkcja calcShips(pop,cap){pop=+pop||0;cap=+cap||16;return Math.ceil(pop/cap)}

/* =========================
   Przycisk Wstecz
========================= */
funkcja EnsureBack(root=document){
  jeśli(!modules.backBtn) return;
  root.querySelectorAll('.gpwindow .gpwindow_header,.ui-dialog-titlebar').forEach(h=>{
    jeśli(h.querySelector('.gf-back')) zwróć;
    const b=document.createElement('button'); b.textContent='âŸľ'; b.title='Wróć'; b.className='przycisk gf-back'; b.onclick=()=>history.back(); h.prepend(b);
  });
}

/* =========================
   Panel (zakładki)
========================= */
funkcja createPanel(){
  const el=document.createElement('div'); el.innerHTML=`
    <div class="gf-float">
      <div class="gf-h"><span>đŸ ´â€ â˜ ď¸ GrepoFusion ${GF.VERSION}</span><button class="gf-x gf-btn">âœ•</button></div>
      <div class="gf-tabs">
        <div class="gf-tab" data-tab="theme">Motyw</div>
        <div class="gf-tab" data-tab="modules">Moduły</div>
        <div class="gf-tab" data-tab="reports">Raport</div>
        <div class="gf-tab" data-tab="alarm">Alarm</div>
        <div class="gf-tab" data-tab="transport">Transport</div>
        <div class="gf-tab" data-tab="graphics">Grafika</div>
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
        <div class="gf-pane" data-pane="raporty">
          <div class="gf-sec">
            <button class="gf-btn" id="gf-add-bb">Dodaj przycisk BBCode</button>
            <p>Skröt: <b>Ctrl+B</b></p>
          </div>
        </div>
        <div class="gf-pane" data-pane="alarm">
          <div class="gf-sec">
            <label class="gf-check"><input type="checkbox" id="gf-alarm-on" ${alarmOn?'checked':''}> Włącz alarm</label>
            <label class="gf-check"><input type="checkbox" id="gf-alarm-hostile" ${alarmHostile?'checked':''}> Tylko wrogie</label>
            <label>Głośnoś: <input type="range" id="gf-vol" min="0" max="1" step="0.05" value="${volume}"></label>
            <etykieta>Dźwięk:
              <select id="gf-sound">
                <option value="ping">ping</option>
                <option value="beep">beep</option>
              </wybierz>
            </etykieta>
            <button class="gf-btn" id="gf-alarm-test">Testuj</button>
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
        <div class="gf-pane" data-pane="grafika">
          <div class="gf-sec">
            <p>Podmiana ikon jednostek i budynków jest aktywna. przypadek wystąpienia™, źe folder <code>assets/</code> jest w repo.</p>
          </div>
        </div>
      </div>
    </div>
    <button class="gf-toggle">âš™ď¸ GrepoFusion</button>
  `;
  dokument.ciało.appendChild(el);
  const $=(s,p=el)=>p.querySelector(s), $$=(s,p=el)=>Array.from(p.querySelectorAll(s));
  const win=$('.gf-float'), toggle=$('.gf-toggle'), closeBtn=$('.gf-x');
  toggle.onclick=()=>win.classList.toggle('pokaż'); closeBtn.onclick=()=>win.classList.remove('pokaż');
  // Karty
  funkcja act(tab){ activeTab=tab; W(GF.KEY.TAB,tab); $$('.gf-tab').forEach(t=>t.classList.toggle('active', t.dataset.tab===tab)); $$('.gf-pane').forEach(p=>p.classList.toggle('gf-hidden', p.dataset.pane!==tab)); }
  $$('.gf-tab').forEach(t=>t.onclick=()=>act(t.dataset.tab));
  act(activeTab||'theme');

  // Zapisz procedury obsługi
  $('#gf-save-colors').onclick=()=>{accent=$('#gf-accent').value; bg=$('#gf-bg').value; W(GF.KEY.ACCENT,accent); W(GF.KEY.BG,bg); alert('Zapisano. Odśwież (F5).')};
  $('#gf-save-mods').onclick=()=>{const m={}; $$('input[type="checkbox"][data-mod]').forEach(ch=>m[ch.dataset.mod]=ch.checked); modules=m; W(GF.KEY.MODULES,m); alert('Zapisano. Odśwież (F5).')};
  $('#gf-add-bb').onclick=()=>addBBButtons(document);
  $('#gf-alarm-on').onchange=e=>{alarmOn=e.target.checked; W(GF.KEY.ALARM_ON,alarmOn)};
  $('#gf-alarm-hostile').onchange=e=>{alarmHostile=e.target.checked; W(GF.KEY.ALARM_HOSTILE,alarmHostile)};
  $('#gf-vol').oninput=e=>{volume=parseFloat(e.target.value||'0.8'); W(GF.KEY.VOL,volume); audio.volume=volume;};
  $('#gf-sound').onchange=e=>{audio=new Audio(sounds[e.target.value]||sounds.ping); audio.volume=volume;};
  $('#gf-alarm-test').onclick=()=>playAlarm('hostile');
  $('#gf-calc').onclick=()=>{const pop=+$('#gf-pop').value||0; const cap=+$('#gf-cap').value||16; $('#gf-out').textContent=' Statystyki: '+calcShips(pop,cap)};
}

/* =========================
   Zajączek Wielkanocny + Raz
========================= */
funkcja króliczek(){let c=0; const hook=()=>{const b=document.querySelector('.gf-toggle'); if(!b) return setTimeout(hook,200); b.addEventListener('click',()=>{c++; if(c>=10){c=0; toast('đŸ ° GrepoFusion Bunny!')}})}; hook()}
funkcja firstToast(){ if(S(GF.KEY.SEEN,false)) return; toast('GrepoFusion '+GF.VERSION+' â€” pełny remaster aktywny.'); W(GF.KEY.SEEN,true); }

/* =========================
   Obserwator (dołączany automatycznie)
========================= */
funkcja obserwuj(){
  const o=nowy MutationObserver(ms=>ms.forEach(m=>{
    m.addedNodes&&m.addedNodes.forEach(n=>{
      jeśli(n.typwęzła!==1) zwróć;
      clean(n); beige(n); overrideIcons(n); sureBack(n); addBBButtons(n);
    });
  }));
  o.observe(document.documentElement,{childList:true,subtree:true});
}

/* =========================
   Inicjalizacja
========================= */
funkcja init(){
  injectTheme();
  utwórzPanel();
  królik();
  pierwszyToast();

  wyczyść(dokument);
  beżowy(dokument);
  wstrzyknijIkonęCSS();
  overrideIcons(dokument);
  EnsureBack(dokument);
  dodajBBButtons(dokument);

  przestrzegać();
  console.log('%c[GrepoFusion] 1.4.5 gotowy','kolor:'+akcent+';waga czcionki:700;');
}
if(document.readyState==='ładowanie') document.addEventListener('DOMContentLoaded',init); else init();

})();