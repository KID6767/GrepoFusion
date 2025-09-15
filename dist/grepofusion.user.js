// ==UserScript==
// @name         GrepoFusion
// @namespace    https://github.com/KID6767/GrepoFusion
// @version      1.4.0-beta-easter
// @description  Redesign/Remaster 2025 + Easter Bunny secret event 🐇
// @author       KID6767 & ChatGPT
// @match        https://*.grepolis.com/*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAABGklEQVRoge3YsQ3CMBQE0c94AA9gAA+gAA/gAA8gAB+QAJyoG6mx7aqqCeK9DVuH46zs+Dx4e3t7e3t7e3t7S0vi8RiqleP9/4HHLmcplMplMp/Ps21arVbFYjEajQa/XE0Eaj8dvtqFQKBQKBaVSqUSiUajcZjNZlEqlUqlUolGo9Fzq9UKhUKlUqkUqlUqlUqlUqlUqlUqlUqlUqlUqlUqv1Arv6Ki/xjggZAAAAAElFTkSuQmCC
// @updateURL    https://raw.githubusercontent.com/KID6767/GrepoFusion/main/dist/grepofusion.user.js
// @downloadURL  https://raw.githubusercontent.com/KID6767/GrepoFusion/main/dist/grepofusion.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// ==/UserScript==

(function(){
 'use strict';
 const VERSION='1.4.0-beta-easter';

 // Easter Bunny trigger
 let clicks=0;
 function triggerBunny(){
   const bunny=document.createElement('div');
   bunny.innerHTML=`<div class="gf-bunny"><img src="assets/easter/bunny.png" style="width:128px;height:128px"/><p>🐰 Happy Easter from GrepoFusion!</p></div>`;
   document.body.appendChild(bunny);
   GM_addStyle(`.gf-bunny{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);background:#1a3d2f;color:#d4af37;border:2px solid #d4af37;border-radius:12px;padding:12px;z-index:2147483647;text-align:center}`);
   setTimeout(()=>bunny.remove(),5000);
 }

 function init(){
   const logoBtn=document.querySelector('.gf-toggle')||document.querySelector('button.gf-toggle');
   if(logoBtn){
     logoBtn.addEventListener('click',()=>{
       clicks++;
       if(clicks>=10){
         triggerBunny();
         clicks=0;
       }
     });
   }
   console.log('[GrepoFusion] Easter Bunny ready 🐇');
 }
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();

})();