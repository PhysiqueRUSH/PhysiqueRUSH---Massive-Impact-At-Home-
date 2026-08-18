import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { allProgramDays } from '../js/data/program.js';
import { EXERCISES } from '../js/data/exercises.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const days=allProgramDays();
const blockSummary=block=>{
  if(block.kind==='family') return `${block.label} · ${block.protocol?.label||block.protocol?.type||''}`;
  if(block.kind==='shared') return `${block.label} · ${block.protocol?.label||block.protocol?.type||''}`;
  if(block.kind==='drop') return `${block.label} · ${block.triple?'TRIPLE':'DOUBLE'} DROP ×${block.repeats}`;
  if(block.kind==='dropShared') return `${block.label} · ${block.items?.some(x=>x.triple)?'TRIPLE':'DOUBLE'} DROP · ${block.rounds} rounds`;
  return block.kind||'';
};
const exportDays=days.map(d=>({
  day:d.day,type:d.type,phase:d.phase,week:d.week||0,title:d.title,session:d.session||d.title,
  blocks:(d.blocks||[]).map(blockSummary),
  secondary:d.secondary?`${d.secondary.kind}${d.secondary.withKB?' + KB':''}`:'',
  full15:!!d.full15,
  test:d.test?.cap||'',challenge:d.challenge?.id||'',
}));
fs.writeFileSync(path.join(root,'PROGRAM_100_DAYS.json'),JSON.stringify(exportDays,null,2));
const q=v=>`"${String(v??'').replaceAll('"','""')}"`;
const header=['jour','type','phase','semaine','titre','blocs','secondaire','plein_15_min','test','challenge'];
const rows=[header.join(';'),...exportDays.map(d=>[d.day,d.type,d.phase,d.week,d.title,d.blocks.join(' | '),d.secondary,d.full15?'oui':'non',d.test,d.challenge].map(q).join(';'))];
fs.writeFileSync(path.join(root,'PROGRAM_100_DAYS.csv'),rows.join('\n')+'\n');

const media=Object.values(EXERCISES).map(ex=>({
  id:ex.id,name:ex.name,category:ex.category,unilateral:!!ex.unilateral,ballistic:!!ex.ballistic,equipment:ex.equipment||'',
  loop:`assets/media/loops/${ex.id}.mp4`,frame:`assets/media/frames/${ex.id}.webp`,vimeoConfigKey:ex.id,
}));
fs.writeFileSync(path.join(root,'assets','EXERCISE_MEDIA_MANIFEST.json'),JSON.stringify(media,null,2));
console.log(JSON.stringify({days:exportDays.length,media:media.length},null,2));
