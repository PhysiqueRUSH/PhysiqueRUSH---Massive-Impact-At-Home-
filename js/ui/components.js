import { getExercise } from '../data/exercises.js';
import { CONFIG, vimeoEmbedUrl } from '../config.js';

export const esc = v => String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
export const fmtTime = s => `${Math.floor(Math.max(0,s)/60)}:${String(Math.max(0,s)%60).padStart(2,'0')}`;

export function appHeader(title='', {back=true,subtitle=''}={}){
  return `<header class="app-header">${back?'<button class="icon-button" data-action="back" aria-label="Retour">‹</button>':'<div class="logo-mini"><b>PHYSIQUE<span>RUSH</span></b><small>MASSIVE IMPACT</small></div>'}<div class="header-copy">${title?`<h1>${esc(title)}</h1>`:''}${subtitle?`<small>${esc(subtitle)}</small>`:''}</div>${back?'<div class="header-spacer"></div>':'<button class="icon-button" data-page="settings" aria-label="Réglages">⚙</button>'}</header>`;
}

export function visualPlaceholder(type='impact',label=''){
  const map={camp:'⛺',level:'📈',performance:'🏆',community:'🤝',push:'💥',pull:'🧲',legs:'🦵',core:'⚡',cardio:'🔥',challenge:'👹',test:'🎯',impact:'⚔️',rush:'💣',settings:'⚙️',video:'▶️'};
  return `<div class="visual-placeholder visual-${type}"><span>${map[type]||'⚔️'}</span>${label?`<small>${esc(label)}</small>`:''}</div>`;
}

export function exerciseFrame(stage, {small=false,side=null}={}){
  const ex=getExercise(stage.exerciseId||stage); const label=stage.label||ex.name;
  return `<div class="exercise-frame ${small?'small':''}">
    <img src="${esc(ex.frame)}" alt="" onerror="this.hidden=true;this.nextElementSibling.hidden=false">
    <div class="media-fallback" hidden>${ex.emoji}</div>
    <div class="exercise-frame-copy"><b>${esc(label)}</b>${side?`<small>Côté ${side==='D'?'DROIT':'GAUCHE'}</small>`:''}</div>
  </div>`;
}

export function exerciseLoop(stage,{side=null,clickable=true}={}){
  const ex=getExercise(stage.exerciseId||stage); const label=stage.label||ex.name;
  const vimeo=CONFIG.exerciseVimeo[ex.id]||ex.vimeo;
  return `<button class="exercise-loop ${clickable?'clickable':''}" ${clickable?`data-action="open-exercise-video" data-exercise="${esc(ex.id)}"`:''} aria-label="Démonstration ${esc(label)}">
    <video autoplay muted loop playsinline preload="metadata" src="${esc(ex.loop)}" onerror="this.hidden=true;this.nextElementSibling.hidden=false"></video>
    <div class="loop-fallback" hidden><span>${ex.emoji}</span><small>BOUCLE VIDÉO À AJOUTER</small></div>
    ${side?`<div class="side-badge">${side==='D'?'DROITE':'GAUCHE'}</div>`:''}
    ${vimeo?'<div class="tap-video">VOIR LA VIDÉO</div>':'<div class="tap-video">DÉMO</div>'}
  </button>`;
}

export function modal({title,body,confirmText=null,cancelText='ANNULER',confirmAction=null,danger=false}){
  return `<div class="modal-backdrop"><div class="modal-card"><h2>${esc(title)}</h2><div class="modal-body">${body}</div><div class="modal-actions">${cancelText?`<button class="btn ghost" data-action="modal-cancel">${esc(cancelText)}</button>`:''}${confirmText?`<button class="btn ${danger?'danger':'primary'}" data-action="${esc(confirmAction||'modal-confirm')}">${esc(confirmText)}</button>`:''}</div></div></div>`;
}

export function videoModal(exerciseId){
  const ex=getExercise(exerciseId),id=CONFIG.exerciseVimeo[exerciseId]||ex.vimeo;
  const body=id?`<div class="vimeo-wrap"><iframe src="${vimeoEmbedUrl(id)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`:`<div class="empty-media">${ex.emoji}<h3>${esc(ex.name)}</h3><p>Ajoute l’ID Vimeo de cet exercice dans <code>js/config.js</code>. La boucle locale se place dans <code>assets/media/loops/${esc(ex.id)}.mp4</code>.</p></div>`;
  return modal({title:ex.name,body,cancelText:'FERMER'});
}

export function radarSvg(values,{compare=null}={}){
  const keys=['legs','push','pull','core','cardio'];
  const labels=['LEGS','PUSH','PULL','CORE','CARDIO'];
  const center=150,maxR=105;
  const points=(vals)=>keys.map((k,i)=>{const a=-Math.PI/2+i*2*Math.PI/5;const v=vals?.[k]||0;const r=maxR*(v/10);return `${center+Math.cos(a)*r},${center+Math.sin(a)*r}`}).join(' ');
  const rings=[2,4,6,8,10].map(v=>`<polygon points="${keys.map((_,i)=>{const a=-Math.PI/2+i*2*Math.PI/5,r=maxR*(v/10);return `${center+Math.cos(a)*r},${center+Math.sin(a)*r}`}).join(' ')}"/>`).join('');
  const axes=keys.map((_,i)=>{const a=-Math.PI/2+i*2*Math.PI/5;return `<line x1="${center}" y1="${center}" x2="${center+Math.cos(a)*maxR}" y2="${center+Math.sin(a)*maxR}"/>`}).join('');
  const txt=labels.map((l,i)=>{const a=-Math.PI/2+i*2*Math.PI/5,r=128;return `<text x="${center+Math.cos(a)*r}" y="${center+Math.sin(a)*r+4}" text-anchor="middle">${l}</text>`}).join('');
  const comp=compare?`<polygon class="radar-compare" points="${points(compare)}"/>`:'';
  return `<svg class="radar" viewBox="0 0 300 300" role="img" aria-label="Radar de niveau"><g class="radar-grid">${rings}${axes}</g>${comp}<polygon class="radar-current" points="${points(values)}"/>${txt}</svg>`;
}

export function progressBar(percent){ return `<div class="progress"><i style="width:${Math.max(0,Math.min(100,percent))}%"></i></div>`; }

export function rewardOverlay(reward){
  if(!reward) return '';
  return `<div class="reward-overlay"><div class="comic-burst"><div class="boom">RUSH!</div><div class="reward-effective">${reward.effective||0}<small>RÉPÉTITIONS EFFICACES</small></div><div class="reward-points">+${Math.max(0,reward.points||0).toLocaleString('fr-FR')}<small>pts RUSH</small></div>${reward.extra?`<div class="reward-extra">${esc(reward.extra)}</div>`:''}</div></div>`;
}
