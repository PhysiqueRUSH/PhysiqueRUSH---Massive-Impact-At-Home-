import assert from 'node:assert/strict';
import { allProgramDays, getDayDefinition, FAMILY_LEVELS } from '../js/data/program.js';
import { EXERCISES } from '../js/data/exercises.js';
import { CORE_POOL, generateCoreSequence, coreGroups, swapCoreGroup } from '../js/data/core.js';
import { CARDIO_BW, CARDIO_KB, generateCardioCircuit, cardioGroups, swapCardioGroup, CARDIO_SEQUENCES_PER_TOUR } from '../js/data/cardio.js';
import { buildWorkoutPlan } from '../js/engine/workout.js';
import { emptyState, completeProgramDay, hydrateState, setFamilyLevel, familyLevel } from '../js/state.js';
import { musclePerformancePoints, scheduledTestPoints, freeRetestPoints, challengePoints, applyConquestBonuses } from '../js/scoring.js';

const results=[];
const test=(name,fn)=>{ try{ fn(); results.push({name,ok:true}); } catch(error){ results.push({name,ok:false,error:error.message}); } };
const exSeq=(plan,family,round=1)=>plan.events.filter(e=>e.type==='exercise'&&e.family===family&&e.round===round).map(e=>`${e.stage.exerciseId}${e.side?`:${e.side}`:''}`);
const stateAt=(level=5)=>{ const s=emptyState(); s.official={legs:level,push:level,pull:level,core:level,cardio:level}; return s; };

// Node localStorage shim for state functions that persist.
const memory=new Map();
globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};

test('100 jours strictement indexés',()=>{
  const days=allProgramDays(); assert.equal(days.length,100); days.forEach((d,i)=>assert.equal(d.day,i+1));
});

test('Répartition exacte des jours',()=>{
  const counts=allProgramDays().reduce((a,d)=>(a[d.type]=(a[d.type]||0)+1,a),{});
  assert.deepEqual(counts,{onboarding:1,test:15,regular:72,challenge:12});
});

test('Structure hebdomadaire identique dans les 4 phases',()=>{
  const starts=[7,28,54,75];
  const expected=['LEGS + CORE','PUSH + CARDIO','PULL + CORE','ARMS + CARDIO','QUADRICEPS + ISCHIOS + CORE','PUSH + PULL'];
  for(const start of starts){
    for(let week=0;week<3;week++){
      for(let dow=0;dow<6;dow++) assert.equal(getDayDefinition(start+week*7+dow).title,expected[dow]);
      assert.equal(getDayDefinition(start+week*7+6).type,'challenge');
    }
  }
});

test('Tests initiaux/intermédiaires/finals dans le même ordre',()=>{
  const expected=['legs','push','pull','core','cardio'];
  for(const base of [2,49,96]) assert.deepEqual(Array.from({length:5},(_,i)=>getDayDefinition(base+i).test.cap),expected);
});

test('Toutes les références de familles existent',()=>{
  for(const [family,levels] of Object.entries(FAMILY_LEVELS)) for(let p=1;p<=10;p++){
    assert.ok(levels[p],`${family} P${p}`);
    for(const id of levels[p].random||[levels[p].exerciseId]) assert.ok(EXERCISES[id],`${family} P${p}: ${id}`);
  }
});

test('Core: 7 séquences, aucune duplication hors paire, paires consécutives',()=>{
  const pairIds=new Set(CORE_POOL.filter(x=>x.unilateral).map(x=>x.id));
  for(let n=0;n<500;n++){
    const seq=generateCoreSequence(); assert.equal(seq.length,7);
    const groups=coreGroups(seq); let slots=0; const ids=[];
    for(const g of groups){
      slots+=g.length; const item=seq[g.start]; ids.push(item.exerciseId);
      if(g.length===2){ assert.ok(pairIds.has(item.exerciseId)); assert.equal(seq[g.start+1].exerciseId,item.exerciseId); assert.notEqual(seq[g.start+1].side,item.side); }
    }
    assert.equal(slots,7); assert.equal(new Set(ids).size,ids.length);
  }
});

test('Core Swap conserve exactement 7 séquences et les règles de paire',()=>{
  for(let n=0;n<100;n++){
    const original=generateCoreSequence();
    for(const g of coreGroups(original)){
      const swapped=swapCoreGroup(original,g.start); assert.equal(swapped.length,7);
      for(const gg of coreGroups(swapped)) if(gg.length===2){
        assert.equal(swapped[gg.start].exerciseId,swapped[gg.start+1].exerciseId);
        assert.notEqual(swapped[gg.start].side,swapped[gg.start+1].side);
      }
    }
  }
});

const allowedTiers=level=>level<=4?new Set(['beg']):level<=7?new Set(['beg','int']):new Set(['int','adv']);
for(const [label,pool] of [['BW',CARDIO_BW],['KB',CARDIO_KB]]) test(`Cardio ${label}: longueur, unicité, paires et tiers autorisés`,()=>{
  const tierById=new Map(); for(const tier of ['beg','int','adv']) for(const [id] of pool[tier]) tierById.set(id,tier);
  for(let level=1;level<=10;level++) for(let week=1;week<=3;week++) for(let n=0;n<120;n++){
    const seq=generateCardioCircuit({withKB:label==='KB',level,week}); assert.equal(seq.length,CARDIO_SEQUENCES_PER_TOUR[week-1]);
    const groups=cardioGroups(seq); const uniqueGroupIds=[];
    for(const g of groups){ const first=seq[g.start]; uniqueGroupIds.push(first.exerciseId); assert.ok(allowedTiers(level).has(tierById.get(first.exerciseId)),`P${level}: tier ${tierById.get(first.exerciseId)}`);
      if(g.length===2){ assert.equal(seq[g.start+1].exerciseId,first.exerciseId); assert.deepEqual([first.side,seq[g.start+1].side],['D','G']); }
    }
    assert.equal(new Set(uniqueGroupIds).size,uniqueGroupIds.length);
  }
});

test('Cardio Swap conserve la taille du groupe et le circuit',()=>{
  for(const withKB of [false,true]) for(let level=1;level<=10;level++){
    const seq=generateCardioCircuit({withKB,level,week:3});
    for(const g of cardioGroups(seq)){
      const swapped=swapCardioGroup(seq,{withKB,level},g.start); assert.equal(swapped.length,7);
      const ng=cardioGroups(swapped).find(x=>x.start===g.start); assert.equal(ng.length,g.length);
    }
  }
});

test('J90 P10 D10: sous-chaîne unilatérale complète puis bilatéral, alternance série 2',()=>{
  const s=stateAt(10); setFamilyLevel(s,'D10',10); setFamilyLevel(s,'D12',10);
  const plan=buildWorkoutPlan(getDayDefinition(90),s);
  assert.deepEqual(exSeq(plan,'D10',1),['one_arm_pushup_kb:D','archer_pushup_kb:D','one_arm_pushup_kb:G','archer_pushup_kb:G','diamond_pushup_kb']);
  assert.deepEqual(exSeq(plan,'D10',2),['one_arm_pushup_kb:G','archer_pushup_kb:G','one_arm_pushup_kb:D','archer_pushup_kb:D','diamond_pushup_kb']);
});

test('J90 P10 D12: chaîne 100% unilatérale, même côté de départ',()=>{
  const s=stateAt(10); setFamilyLevel(s,'D12',10);
  const plan=buildWorkoutPlan(getDayDefinition(90),s);
  const expected=['uni_fly_press:D','uni_floor_press:D','semi_uni_floor_press:D','uni_fly_press:G','uni_floor_press:G','semi_uni_floor_press:G'];
  assert.deepEqual(exSeq(plan,'D12',1),expected); assert.deepEqual(exSeq(plan,'D12',2),expected);
});

test('J77 P9: bilatéral puis D/G, alternance du côté de départ',()=>{
  const s=stateAt(9); setFamilyLevel(s,'pullFirst',9); const plan=buildWorkoutPlan(getDayDefinition(77),s);
  assert.deepEqual(exSeq(plan,'pullFirst',1),['face_pull_towel','row_uni_close:D','row_uni_close:G']);
  assert.deepEqual(exSeq(plan,'pullFirst',2),['face_pull_towel','row_uni_close:G','row_uni_close:D']);
});

test('J77 P7: chaîne 100% unilatérale garde le même départ',()=>{
  const s=stateAt(7); setFamilyLevel(s,'pullFirst',7); const plan=buildWorkoutPlan(getDayDefinition(77),s);
  const expected=['row_uni_open:D','row_uni_close:D','row_uni_open:G','row_uni_close:G'];
  assert.deepEqual(exSeq(plan,'pullFirst',1),expected); assert.deepEqual(exSeq(plan,'pullFirst',2),expected);
});

test('Phase III S3 utilise temporairement niveau -1 sans modifier le hidden',()=>{
  const s=stateAt(7); setFamilyLevel(s,'D12',7); const before=familyLevel(s,'D12');
  const plan=buildWorkoutPlan(getDayDefinition(69),s); // Phase III S3 PUSH + CARDIO
  const e=plan.events.find(x=>x.type==='exercise'&&x.family==='D12');
  assert.equal(e.level,6); assert.equal(familyLevel(s,'D12'),before);
});

test('Scoring répétitions efficaces: 5 reps P5 Phase I S1 = 10 pts',()=>{
  assert.equal(musclePerformancePoints([{reps:5,level:5,eligible:true}],'Phase I',1),10);
  assert.equal(musclePerformancePoints([{reps:5,level:5,eligible:false}],'Phase I',1),0);
});

test('Scoring tests/retests/challenge conforme',()=>{
  assert.deepEqual(scheduledTestPoints(8,2),{presence:100,test:160,progression:300,total:560});
  assert.equal(freeRetestPoints(2),300);
  assert.deepEqual(challengePoints({ratio:1.25,bossDown:true,record:true}),{presence:100,performance:375,boss:300,record:100,total:875});
});

test('Bonus niveau conquis payé une seule fois',()=>{
  const s=stateAt(5); s.conquered.D10=5; const a=applyConquestBonuses(s,{D10:6}); assert.equal(a.total,150); const b=applyConquestBonuses(s,{D10:6}); assert.equal(b.total,0);
});

test('Replay d’un jour ne farme que la différence positive',()=>{
  const s=emptyState(); s.currentDay=1;
  let a=completeProgramDay(s,1,{effective:20,pointsCandidate:200,type:'regular'}); assert.equal(a.newAward,200); assert.equal(s.pts,200); assert.equal(s.currentDay,2);
  let b=completeProgramDay(s,1,{effective:30,pointsCandidate:260,type:'regular'}); assert.equal(b.newAward,60); assert.equal(s.pts,260); assert.equal(s.effectiveTotal,30);
  let c=completeProgramDay(s,1,{effective:10,pointsCandidate:120,type:'regular'}); assert.equal(c.newAward,0); assert.equal(s.pts,260); assert.equal(s.effectiveTotal,10);
});

test('Hydratation v4 conserve les données et ajoute les champs',()=>{
  const s=hydrateState({version:3,currentDay:42,pts:1234,official:{legs:7}}); assert.equal(s.version,4); assert.equal(s.currentDay,42); assert.equal(s.pts,1234); assert.equal(s.official.legs,7); assert.ok(s.flow);
});

const failed=results.filter(x=>!x.ok);
console.log(JSON.stringify({ok:!failed.length,total:results.length,passed:results.length-failed.length,failed},null,2));
if(failed.length) process.exit(1);
