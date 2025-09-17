// ==UserScript==
// @name         GrepoFusion
// @namespace    https://github.com/KID6767/GrepoFusion
// @version      1.5.0.1
// @description  Pirate Edition + Auto Build + Lab + changelog + emerald-gold redesign.
// @author       KID6767 & ChatGPT
// @match        https://*.grepolis.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// ==/UserScript==

(function() {
  'use strict';
  console.log('[GrepoFusion] v1.5.0.1 running...');

  // === Motyw Emerald+Gold ===
  GM_addStyle(`
    body, .gpwindow_content { background-color:#013220 !important; color:#d4af37 !important; }
    .ui-dialog .ui-dialog-titlebar, .game_header { background:#013220 !important; border-color:#d4af37 !important; color:#d4af37 !important; }
    .gf-gold { color:#d4af37 !important; }
  `);

  // === Auto Build (gp-builder zintegrowany) ===
  const blackList = [];
  const instructions = [
    { lumber: 20, stoner: 20, ironer: 20, storage: 15, farm: 10, barracks: 5, academy: 13, main: 25 },
    { lumber: 40, stoner: 40, ironer: 40, storage: 35, farm: 20 },
    { temple: 30, market: 30, hide: 10, academy: 36, farm: 45 },
    { docks: 30, statue: 1, thermal: 1, barracks: 30 }
  ];
  const freeze = ms => new Promise(res => setTimeout(res, ms));
  const hasRes = (town, need) => {
    const r = ITowns.towns[town].resources();
    return r.wood>=need.wood && r.stone>=need.stone && r.iron>=need.iron;
  };
  const buildOrder = async o => new Promise((res,rej)=>{
    gpAjax.ajaxPost('frontend_bridge','execute',{
      model_url:'BuildingOrder', action_name:'buildUp',
      arguments:{building_id:o.name}, town_id:o.town
    }, false, {success:res,error:rej});
  });
  const runAutoBuild = async ()=>{
    const models = Object.values(MM.getModels().BuildingBuildData||{});
    for(const {attributes:a} of models){
      if(a.is_building_order_queue_full) continue;
      const targets = instructions.find(t=>Object.entries(t).find(([n,l])=>!a.building_data[n].has_max_level&&a.building_data[n].next_level<=l));
      if(!targets) continue;
      for(const [n,l] of Object.entries(targets)){
        const d=a.building_data[n];
        if(!d.has_max_level && d.next_level<=l && hasRes(a.id,d.resources_for)){
          try{
            await buildOrder({name:n, level:d.next_level, town:a.id});
            console.log(`[AutoBuild] ${n} lvl ${d.next_level} in ${ITowns.towns[a.id].name}`);
          }catch(e){ blackList.push({name:n, level:d.next_level, town:a.id}); }
          await freeze(2000);
        }
      }
    }
    await freeze(60000);
    runAutoBuild();
  };
  jQuery.Observer(GameEvents.game.load).subscribe(()=>setTimeout(runAutoBuild,3000));

  // === Changelog ===
  console.log(`[GrepoFusion] Changelog v1.5.0.1: +AutoBuild, +emerald-gold UI, poprawki.`);
})(); 
