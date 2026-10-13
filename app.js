'use strict';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const tasks = [
  {id:'hanoi',name:'Hanoi',description:'Coordinate disk manipulation and ordered placement.'},
  {id:'photograph',name:'Photograph',description:'Support the camera while operating the shutter.'},
  {id:'unlock-ipad',name:'Unlock iPad',description:'Keep the tablet supported through keypad interaction.'},
  {id:'assembly',name:'Assembly',description:'Stabilize the socket while aligning and inserting the peg.'},
  {id:'microwave',name:'Microwave',description:'Coordinate food handling, door operation, and activation.'}
];
const benchmark = {
  obj:[['ACT',[6,7.3,9.3,0,66,17.7]],['DP-T',[24.7,56.7,8,4.7,73.3,33.5]],['DP-C',[12.7,24,52,3.3,54,29.2]],['DP3',[26,24,16,4.7,45.3,23.2]],['GR00T N1.5',[.7,40.7,12.7,.7,50.7,21.1]],['π₀.₅',[15.3,56.7,12,5.3,70,31.9]],['Coordi-π',[48.7,72,52,7.3,76.7,51.3]]],
  full:[['ACT',[4.7,3.3,.7,0,50,11.7]],['DP-T',[.7,7.3,2,0,21.3,6.3]],['DP-C',[9.3,8.7,12,0,62.7,18.5]],['DP3',[13.3,13.3,13.3,0,36.7,15.3]],['GR00T N1.5',[0,18.7,0,1.3,42,12.4]],['π₀.₅',[15.3,21.3,0,0,54.7,18.3]],['Coordi-π',[36,28.7,28,2,66.7,32.3]]]
};
const settings = {
  obj:{title:'Object randomization',subtitle:'Object placement and table height vary.',gain:'51.3% vs. 31.9% · +19.4 percentage points'},
  full:{title:'Full randomization',subtitle:'Additional variation in camera poses, lighting and tabletop textures.',gain:'32.3% vs. 18.3% · +14.0 percentage points'}
};
let domain='simulation', setting='obj';

function activateTab(button, list) {
  $$('[role="tab"]',list).forEach(b=>{const active=b===button;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
}
$$('[role="tablist"]').forEach(list=>list.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  const tabs=$$('[role="tab"]',list),index=tabs.indexOf(document.activeElement);
  if(index<0)return;
  event.preventDefault();
  const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
  tabs[next].focus();tabs[next].click();
}));

function chartRow(label,baseline,coordi,isMean=false){
  return `<div class="chart-row ${isMean?'mean-row':''}" role="img" aria-label="${label}: pi zero point five ${baseline.toFixed(1)} percent; Coordi-pi ${coordi.toFixed(1)} percent"><div class="task-label">${label}</div><div class="bar-pair" aria-hidden="true"><div class="bar-track" style="--value:${baseline}%"><span class="bar"></span><span class="bar-value">${baseline.toFixed(1)}%</span></div><div class="bar-track" style="--value:${coordi}%"><span class="bar coordi"></span><span class="bar-value coordi-value">${coordi.toFixed(1)}%</span></div></div></div>`;
}
function renderResults(){
  let labels,base,ours,config;
  if(domain==='simulation'){
    labels=tasks.map(t=>t.name);base=benchmark[setting][5][1];ours=benchmark[setting][6][1];config=settings[setting];
  }else{
    labels=['Photograph','Hanoi','Assembly','Microwave'];base=[65,75,30,75,61.3];ours=[90,80,50,80,75];
    config={title:'Real-world evaluation',subtitle:'Four tasks · 20 trials per task and method · same demonstration set.',gain:'60 / 80 vs. 49 / 80 successful trials'};
  }
  $('#result-title').textContent=config.title;$('#result-subtitle').textContent=config.subtitle;
  $('#setting-controls').hidden=domain!=='simulation';
  $('#result-panel').setAttribute('aria-labelledby',domain==='simulation'?'result-sim-tab':'result-real-tab');
  $('#success-chart').innerHTML=[...labels,'Mean'].map((name,i)=>chartRow(name,base[i],ours[i],i===labels.length)).join('');
  $('#comparison-caption').textContent=`DexJoCo · ${setting==='obj'?'object':'full'} randomization`;
  $('#benchmark-table').innerHTML=benchmark[setting].map(([name,values])=>`<tr class="${name==='Coordi-π'?'ours':''}"><th scope="row">${name}</th>${values.map(v=>`<td>${v.toFixed(1)}</td>`).join('')}</tr>`).join('');
}
$$('[data-domain]').forEach(button=>button.addEventListener('click',()=>{domain=button.dataset.domain;activateTab(button,button.closest('[role="tablist"]'));renderResults();}));
$$('[data-setting]').forEach(button=>button.addEventListener('click',()=>{setting=button.dataset.setting;$$('[data-setting]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});renderResults();}));
renderResults();
$('#ablation-chart').innerHTML=[['Interleaved',39.7],['+ Hand identity',42.4],['+ Factorized RoPE',44.3],['Full Coordi-π',51.3]].map(([name,value])=>`<div class="ablation-row" role="img" aria-label="${name}: ${value} percent mean success"><span>${name}</span><div class="bar-track" style="--value:${value/60*100}%" aria-hidden="true"><span class="bar"></span><span class="bar-value">${value.toFixed(1)}%</span></div></div>`).join('');

function renderDemos(mode){
  $$('#demo-grid video').forEach(v=>v.pause());
  const order=mode==='real'?['photograph','hanoi','assembly','microwave']:tasks.map(t=>t.id);
  $('#demo-grid').classList.toggle('simulation',mode!=='real');
  $('#demo-grid').setAttribute('aria-labelledby',`demo-${mode}-tab`);
  $('#demo-context').textContent=mode==='real'?'TianJi Marvin Pro · BrainCo Revo 2 hands':mode==='obj'?'DexJoCo · object placement and table-height variation':'DexJoCo · additional camera, lighting and texture variation';
  $('#demo-grid').innerHTML=order.map((id,i)=>{
    const task=tasks.find(t=>t.id===id),file=mode==='real'?`real-${id}`:`sim-${mode}-${id}`;
    return `<article class="demo-card"><div class="video-shell"><video controls playsinline muted loop preload="none" poster="assets/${file}.webp" aria-label="${task.name}: ${mode==='real'?'real robot':'simulation'} demonstration"><source src="assets/${file}.mp4" type="video/mp4"></video></div><div class="demo-caption"><div><h3>${task.name}</h3><p>${task.description}</p></div></div></article>`;
  }).join('');
  $$('#demo-grid video').forEach(video=>video.addEventListener('play',()=>{$$('#demo-grid video').forEach(other=>{if(other!==video)other.pause();});}));
}
$$('[data-demo]').forEach(button=>button.addEventListener('click',()=>{activateTab(button,button.closest('[role="tablist"]'));renderDemos(button.dataset.demo);}));
renderDemos('real');

const hero=$('#hero-video');

const overviewDialog=$('#overview-dialog'),figureDialog=$('#figure-dialog');
$$('[data-open-overview]').forEach(button=>button.addEventListener('click',()=>{hero.pause();$$('#demo-grid video').forEach(v=>v.pause());overviewDialog.showModal();$('video',overviewDialog).play().catch(()=>{});}));
$('[data-open-figure]').addEventListener('click',()=>figureDialog.showModal());
$$('dialog').forEach(dialog=>{ $('.dialog-close',dialog).addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});dialog.addEventListener('close',()=>$$('video',dialog).forEach(v=>v.pause()));});

const menuButton=$('.menu-button');menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));$('#navigation').classList.toggle('open',open);});
$$('#navigation a').forEach(link=>link.addEventListener('click',()=>{menuButton.setAttribute('aria-expanded','false');$('#navigation').classList.remove('open');}));
