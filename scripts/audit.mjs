import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { allProgramDays,FAMILY_LEVELS } from '../js/data/program.js';
import { EXERCISES } from '../js/data/exercises.js';
import { CORE_POOL,generateCoreSequence,coreGroups } from '../js/data/core.js';
import { CARDIO_BW,CARDIO_KB,generateCardioCircuit,cardioGroups,CARDIO_SEQUENCES_PER_TOUR } from '../js/data/cardio.js';
import { DROP_TABLES,TRIPLE_TABLES } from '../js/data/drops.js';
import { buildWorkoutPlan } from '../js/engine/workout.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const errors=[]; const warnings=[]; const days=allProgramDays();
const must=(condition,message)=>{if(!condition)errors.push(message)};

must(days.length===100,`Programme: ${days.length} jours au lieu de 100`);
for(let i=0;i<100;i++) must(days[i].day===i+1,`Jour mal indexé à ${i+1}`);
const counts=days.reduce((a,d)=>(a[d.type]=(a[d.type]||0)+1,a),{});
must(counts.onboarding===1&&counts.test===15&&counts.regular===72&&counts.challenge===12,`Répartition jours inattendue: ${JSON.stringify(counts)}`);

for(const [fam,levels] of Object.entries(FAMILY_LEVELS)) for(let p=1;p<=10;p++){
  const s=levels[p]; must(!!s,`${fam} P${p} manquant`);
  const ids=s?.random||[s?.exerciseId]; for(const id of ids) if(id) must(!!EXERCISES[id],`${fam} P${p}: exercice ${id} inconnu`);
}
for(const [name,table] of Object.entries(DROP_TABLES)) for(let p=1;p<=10;p++){
  const chain=table[p]; must(chain?.length===2,`${name} P${p}: double-drop invalide`);
  for(const s of chain||[]) must(!!EXERCISES[s.exerciseId],`${name} P${p}: ${s.exerciseId} inconnu`);
}
for(const [name,table] of Object.entries(TRIPLE_TABLES)) for(let p=1;p<=10;p++){
  const chain=table[p]; must(chain?.length===3,`${name} P${p}: triple-drop invalide`);
  for(const s of chain||[]) must(!!EXERCISES[s.exerciseId],`${name} P${p}: ${s.exerciseId} inconnu`);
}
for(const item of CORE_POOL) must(!!EXERCISES[item.id],`Core: ${item.id} inconnu`);
for(const pool of [CARDIO_BW,CARDIO_KB]) for(const tier of ['beg','int','adv']) for(const [id] of pool[tier]) must(!!EXERCISES[id],`Cardio: ${id} inconnu`);

let regularPlans=0,maxEvents={day:0,palier:0,count:0};
for(let palier=1;palier<=10;palier++){
  const state={official:{legs:palier,push:palier,pull:palier,core:palier,cardio:palier},hidden:{}};
  for(const d of days){
    if(d.type!=='regular') continue;
    const plan=buildWorkoutPlan(d,state); regularPlans++;
    must(plan.events.length>0,`J${d.day} P${palier}: plan vide`);
    if(plan.events.length>maxEvents.count) maxEvents={day:d.day,palier,count:plan.events.length};
    for(const e of plan.events){
      if(e.type==='exercise') must(!!EXERCISES[e.stage.exerciseId],`J${d.day} P${palier}: event ${e.stage.exerciseId} inconnu`);
      if(e.type==='rest') must(e.seconds>0,`J${d.day} P${palier}: repos invalide`);
    }
  }
}
for(let i=0;i<400;i++){
  const c=generateCoreSequence(); must(c.length===7,`Core généré avec ${c.length} séquences`);
  const groups=coreGroups(c); const ids=groups.map(g=>c[g.start].exerciseId); must(new Set(ids).size===ids.length,'Core: doublon dans un shuffle');
}
for(let p=1;p<=10;p++) for(let w=1;w<=3;w++) for(const withKB of [false,true]) for(let i=0;i<60;i++){
  const c=generateCardioCircuit({withKB,level:p,week:w});
  const expected=CARDIO_SEQUENCES_PER_TOUR[w-1]; must(c.length===expected,`Cardio P${p} S${w} KB=${withKB}: ${c.length}/${expected}`);
  const ids=cardioGroups(c).map(g=>c[g.start].exerciseId); must(new Set(ids).size===ids.length,`Cardio P${p} S${w}: doublon`);
}
for(const d of days){
  if(d.type==='regular') must(!!d.blocks?.length,`J${d.day}: aucun bloc`);
  if(d.type==='challenge') must(!!d.challenge,`J${d.day}: challenge absent`);
  if(d.type==='test') must(!!d.test,`J${d.day}: test absent`);
}

// Vérifie que tous les data-action produits par les écrans ont un handler explicite dans app.js.
const screens=fs.readFileSync(path.join(root,'js/ui/screens.js'),'utf8');
const components=fs.readFileSync(path.join(root,'js/ui/components.js'),'utf8');
const app=fs.readFileSync(path.join(root,'js/app.js'),'utf8');
const actions=[...new Set([...screens.matchAll(/data-action=["']([^"']+)["']/g),...components.matchAll(/data-action=["']([^"']+)["']/g)].map(m=>m[1]).filter(x=>!x.includes('${')))];
for(const action of actions) must(app.includes(`action === '${action}'`)||app.includes(`action==='${action}'`)||app.includes(`case '${action}'`),`Action UI sans handler détecté: ${action}`);

// Fichiers indispensables à GitHub Pages / PWA.
const required=['index.html','manifest.webmanifest','sw.js','.nojekyll','.github/workflows/deploy-pages.yml','js/app.js','js/sessionStore.js','css/app.css','assets/icons/icon-192.png','assets/icons/icon-512.png'];
for(const rel of required) must(fs.existsSync(path.join(root,rel)),`Fichier requis absent: ${rel}`);
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
must(sw.includes("'./js/sessionStore.js'"),'Service worker: sessionStore.js absent du cache shell');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
must(manifest.display==='standalone','Manifest PWA: display doit être standalone');
must(Array.isArray(manifest.icons)&&manifest.icons.length>=2,'Manifest PWA: icônes insuffisantes');

const result={
  ok:errors.length===0,
  generatedAt:new Date().toISOString(),
  counts,
  exerciseCount:Object.keys(EXERCISES).length,
  familyCount:Object.keys(FAMILY_LEVELS).length,
  dropTables:Object.keys(DROP_TABLES).length,
  tripleTables:Object.keys(TRIPLE_TABLES).length,
  regularPlansAudited:regularPlans,
  maxEvents,
  uiActionsAudited:actions.length,
  requiredFilesAudited:required.length,
  warnings,errors
};
fs.writeFileSync(path.join(root,'AUDIT_RESULT.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
if(errors.length) process.exit(1);
