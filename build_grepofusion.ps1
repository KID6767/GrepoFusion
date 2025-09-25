# ======================================================================
# AEGIS 1.0.0 → GrepoFusion Integration
# ======================================================================

# --- Ścieżki Aegis ---
$ThemeAegis   = Join-Path $Themes 'aegis'
$AegisLogoPng = Join-Path $Branding 'logo_aegis.png'
$AegisSmoke   = Join-Path $Branding 'smoke.svg'
EnsureDir $ThemeAegis

# --- Motyw Aegis CSS ---
$AegisCss = @'
:root{
  --aegis-green:#0a2e22; --aegis-green-2:#113c2d;
  --aegis-gold:#d4af37;  --aegis-gold-2:#f2d574;
  --aegis-fg:#f3f3f3;    --aegis-ink:#0f1213;
}
body,.gpwindow_content,.game_inner_box,.ui_box{
  background:linear-gradient(180deg,#0a2e22,#113c2d)!important;
  color:var(--aegis-gold)!important;
}
.ui-dialog .ui-dialog-titlebar,.game_header{
  background:rgba(15,18,19,.9)!important;
  color:var(--aegis-gold)!important;
  border-color:rgba(212,175,55,.45)!important;
}
.button,.btn,.ui-button{
  background:#1b2421!important;
  color:#f7e9c1!important;
  border:1px solid rgba(212,175,55,.45)!important;
}
a,.gpwindow_content a{ color:#f2d574!important }
.gp_table th,.gp_table td{ border-color:rgba(212,175,55,.35)!important }
#aegis-badge{
  position:fixed; right:10px; top:10px; z-index:99998;
  background: linear-gradient(135deg,var(--aegis-green),var(--aegis-green-2));
  border:1px solid rgba(212,175,55,.35);
  color:var(--aegis-gold);
  padding:6px 10px; border-radius:10px; font:600 12px/1.2 system-ui,Segoe UI,Arial;
  animation:aegis-glow 3.2s ease-in-out infinite;
  user-select:none; pointer-events:none;
}
@keyframes aegis-glow{
  0%,100%{ box-shadow:0 0 0 rgba(212,175,55,0.0) }
  50%    { box-shadow:0 0 12px rgba(212,175,55,0.45) }
}
#aegis-smoke{
  position:fixed; left:0; right:0; bottom:-30px; height:140px; z-index:1;
  pointer-events:none; opacity:.75;
  background: radial-gradient(120px 60px at 10% 80%, rgba(255,255,255,.05), transparent 60%),
              radial-gradient(180px 70px at 40% 90%, rgba(255,255,255,.07), transparent 60%),
              radial-gradient(140px 60px at 70% 85%, rgba(255,255,255,.06), transparent 60%),
              radial-gradient(200px 80px at 90% 95%, rgba(255,255,255,.05), transparent 60%);
  animation:aegis-smoke 9s ease-in-out infinite;
}
'@
WriteUtf8 (Join-Path $ThemeAegis 'theme.css') $AegisCss

# --- Logo Aegis (1x1 PNG placeholder złoty) ---
$AegisLogoB64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mO0dQ0AAgMB3e1IBZwAAAAASUVORK5CYII="
$AegisLogoBytes = SafeB64 $AegisLogoB64
if($AegisLogoBytes.Length -gt 0){ WriteBytes $AegisLogoPng $AegisLogoBytes }

# --- Smoke.svg ---
$AegisSmokeSvg = @'
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="160" viewBox="0 0 1200 160">
  <defs>
    <radialGradient id="g" cx="50%" cy="80%" r="60%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity=".12"/>
      <stop offset="70%" stop-color="#ffffff" stop-opacity=".02"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="160" fill="url(#g)">
    <animate attributeName="x" values="0;-30;0" dur="9s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.7;0.95;0.7" dur="9s" repeatCount="indefinite"/>
  </rect>
</svg>
'@
WriteUtf8 $AegisSmoke $AegisSmokeSvg

# --- Loader z obsługą Aegis ---
$ThemeSwitcherJs = @"
(function(){
  'use strict';
  var name = localStorage.getItem('GF_THEME') || 'aegis';
  var css = '';
  switch(name){
    case 'classic':  css = `$(($ThemeClassic  -replace '`', '``'))`; break;
    case 'remaster': css = `$(($ThemeRemaster -replace '`', '``'))`; break;
    case 'pirate':   css = `$(($ThemePirate   -replace '`', '``'))`; break;
    case 'dark':     css = `$(($ThemeDark     -replace '`', '``'))`; break;
    default:         css = `$( (Get-Content -Raw (Join-Path $ThemeAegis 'theme.css')) -replace '`', '``')`;
  }
  var el=document.getElementById('gf-theme-style');
  if(!el){ el=document.createElement('style'); el.id='gf-theme-style'; document.head.appendChild(el) }
  el.textContent = css + `$( (Get-Content -Raw (Join-Path $ThemeDir 'config.css')) -replace '`', '``' )`;
})();
"

# --- Badge + Smoke ---
$AegisBadgeAndSmokeJs = @'
(function(){
  "use strict";
  if(!document.getElementById("aegis-badge")){
    const b=document.createElement("div");
    b.id="aegis-badge"; b.textContent="Aegis 1.0.0";
    document.addEventListener("DOMContentLoaded",()=>document.body.appendChild(b));
  }
  if(!document.getElementById("aegis-smoke")){
    const s=document.createElement("div"); s.id="aegis-smoke";
    document.addEventListener("DOMContentLoaded",()=>document.body.appendChild(s));
  }
})();
'

# --- Welcome + Fireworks ---
$AegisWelcomeJs = @'
(function(){
  "use strict";
  const VER="1.0.0-Aegis";
  function onceKey(){ return "Aegis::seen::"+VER; }
  function firstTime(){
    if(localStorage.getItem(onceKey())) return false;
    localStorage.setItem(onceKey(),Date.now().toString());
    return true;
  }
  function fireworks(ms=3200){
    const c=document.createElement("canvas");
    Object.assign(c.style,{position:"fixed",inset:"0",zIndex:99999,pointerEvents:"none"});
    const ctx=c.getContext("2d"); document.body.appendChild(c);
    const DPR=Math.max(1,window.devicePixelRatio||1);
    function resize(){ c.width=innerWidth*DPR; c.height=innerHeight*DPR; ctx.setTransform(DPR,0,0,DPR,0,0) }
    resize(); addEventListener("resize",resize);
    const parts=[]; function boom(x,y){
      const N=60+Math.floor(Math.random()*60);
      const cols=["#ffd86b","#e6c55e","#f2e5a3","#fff9d2","#fbe6a4"];
      for(let i=0;i<N;i++){
        const a=Math.random()*Math.PI*2, s=2+Math.random()*4;
        parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1.5,life:60+Math.random()*40,color:cols[i%cols.length]});
      }
    }
    for(let i=0;i<4;i++) boom(innerWidth*(.2+.6*Math.random()), innerHeight*(.25+.5*Math.random()));
    const stopAt=performance.now()+ms;
    (function loop(){
      ctx.clearRect(0,0,innerWidth,innerHeight);
      for(const p of parts){
        p.vy+=0.045; p.x+=p.vx; p.y+=p.vy; p.life-=1;
        ctx.globalAlpha=Math.max(0,p.life/90);
        ctx.beginPath(); ctx.arc(p.x,p.y,2.1,0,Math.PI*2); ctx.fillStyle=p.color; ctx.fill();
      }
      for(let i=parts.length-1;i>=0;i--) if(parts[i].life<=0) parts.splice(i,1);
      if(performance.now()<stopAt && parts.length) requestAnimationFrame(loop); else c.remove();
    })();
  }
  function welcome(){
    if(document.getElementById("aegis-welcome-wrap")) return;
    const wrap=document.createElement("div"); wrap.id="aegis-welcome-wrap";
    wrap.style.cssText="position:fixed;inset:0;z-index:99997;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at center, rgba(0,0,0,.55), rgba(0,0,0,.85))";
    wrap.innerHTML = `
      <div id="aegis-card" style="width:min(720px,92vw);color:#f3f3f3;background:linear-gradient(180deg,rgba(10,46,34,.96),rgba(10,46,34,.92));border:1px solid rgba(212,175,55,.35);border-radius:16px;padding:18px 20px;box-shadow:0 10px 30px rgba(0,0,0,.5)">
        <h1 style="margin:0;font:800 20px/1.2 system-ui,Segoe UI,Arial;color:#d4af37">Aegis 1.0.0</h1>
        <p>Remaster UI aktywny. Miłej gry! (fajerwerki jednorazowo dla tej wersji)</p>
        <button id="aegis-close" style="margin-top:12px;background:linear-gradient(180deg,#d4af37,#f2d574);color:#2a2000;border:none;border-radius:12px;padding:10px 16px;font-weight:700;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,.35)">Zaczynamy!</button>
      </div>`;
    document.body.appendChild(wrap);
    document.getElementById("aegis-close").onclick=()=>wrap.remove();
  }
  if(firstTime()){
    document.addEventListener("DOMContentLoaded",()=>{
      welcome(); setTimeout(()=>fireworks(),200);
    });
  }
})();
'

# --- FAB z logiem ---
$FabLogoJs = @'
(function(){
  "use strict";
  if(document.getElementById("gf-fab")) return;
  const b=document.createElement("div");
  b.id="gf-fab"; b.title="GrepoFusion – ustawienia";
  b.style.cssText="position:fixed;right:18px;bottom:18px;width:48px;height:48px;border-radius:12px;border:2px solid #d4af37;background:#0f0f0f url('https://raw.githubusercontent.com/KID6767/GrepoFusion/main/assets/branding/logo_aegis.png') center/70% no-repeat;cursor:pointer;z-index:2147483647;box-shadow:0 10px 30px rgba(0,0,0,.55)";
  b.onclick=function(){ try{ window.GF_OpenPanel && GF_OpenPanel(); }catch(e){} };
  document.addEventListener("DOMContentLoaded",()=>document.body.appendChild(b));
})();
'

# --- Userscript główny ---
$MainUserJs = @"
// ==UserScript==
// @name         GrepoFusion (Aegis merged)
// ==/UserScript==
(function(){
  'use strict';
  $ThemeSwitcherJs
  $AegisBadgeAndSmokeJs
  $AegisWelcomeJs
  $ConfigJsRaw
  $AssetOverrideWithMap
  $HelpersStubRaw
  $HelperBuildRaw
  $HelperRecruitRaw
  $HelperAcademyRaw
  $FabLogoJs
  $ChangelogOverlayRaw
  console.log('%c[GrepoFusion] $VersionGF ready (Aegis merged)','color:#d4af37;font-weight:700');
})();
"
WriteUtf8 (Join-Path $Userscripts 'grepofusion.user.js') $MainUserJs
