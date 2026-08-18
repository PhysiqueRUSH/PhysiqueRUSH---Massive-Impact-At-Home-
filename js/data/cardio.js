import { getExercise } from './exercises.js';

export const CARDIO_RATIOS = {
  'Phase I': [[30,30],[20,20],[15,15]],
  'Phase II': [[35,25],[23,17],[17,13]],
  'Phase III': [[40,20],[27,13],[20,10]],
  'Phase IV': [[45,15],[30,10],[22,8]],
};
export const CARDIO_SEQUENCES_PER_TOUR = [3,5,7];

// difficulty: 1 = le plus difficile à l'intérieur de son pool.
export const CARDIO_BW = {
  beg:[
    ['burpee_no_pushup',10],['stepup_alt_chair',9],['mountain_climber_high',8],['short_shuttles',7],['bear_crawl',6],
    ['high_knees_dynamic',5],['partial_jump_lunges',4],['jumping_jacks',3],['side_kick_through',2],['shadow_boxing_freq',1],
  ],
  int:[['burpee',5],['plank_tuck',4],['frog_jumps',3],['fast_feet',2],['advanced_skater',1]],
  adv:[['ninja_tuck_jumps',5],['hannibal_pushup',4],['running_man',3],['mule_kicks',2],['high_burpee_chair',1]],
};

export const CARDIO_KB = {
  beg:[
    ['clean_bi',9],['goblet_squat',8],['swing_bi',5],['burpee_deadlift',6],['kneel_to_squat_bi',7],
    ['row_bi_cardio',10],['kb_butt_kicker',4],['baby_skater_hops',1],['suitcase_high_knees',2],['kb_running_man',3],
  ],
  int:[['grave_diggers',4],['thruster_bi',3],['clean_uni',1],['row_uni_cardio',5],['swing_uni',2]],
  adv:[['burpee_clean_uni',3],['snatch_uni',1],['clean_press_uni',4],['goblet_jump_lunge',2],['swing_90_90',5]],
};

function allowedTiers(level){
  if(level<=4) return ['beg'];
  if(level<=7) return ['beg','int'];
  return ['int','adv'];
}

function tierWeights(level){
  if(level<=4) return {beg:1};
  if(level===5) return {beg:.70,int:.30};
  if(level===6) return {beg:.50,int:.50};
  if(level===7) return {beg:.30,int:.70};
  if(level===8) return {int:.70,adv:.30};
  if(level===9) return {int:.50,adv:.50};
  return {int:.30,adv:.70};
}

function targetDifficulty(level,tier,maxRank){
  // P1→P4 : on glisse progressivement de l'exercice le plus accessible au plus difficile.
  if(tier==='beg') return Math.max(1, Math.round(maxRank - ((Math.min(level,4)-1)/3)*(maxRank-1)));
  if(tier==='int') return level<=7 ? Math.max(1, 8-level) : Math.max(1, 10-level);
  return Math.max(1, 11-level);
}

function flattenedCandidates(pool, level, used=new Set()){
  const tw=tierWeights(level); const out=[];
  for(const tier of allowedTiers(level)){
    const maxRank=Math.max(...pool[tier].map(([,d])=>d));
    const target=targetDifficulty(level,tier,maxRank);
    for(const [id,difficulty] of pool[tier]){
      if(used.has(id)) continue;
      const delta=Math.abs(difficulty-target);
      const difficultyWeight=delta===0?3:delta===1?2:1;
      out.push({id,tier,difficulty,weight:(tw[tier]||0)*difficultyWeight,cost:getExercise(id).unilateral?2:1});
    }
  }
  return out;
}

function canFillSlots(remaining,candidates,index=0,memo=new Map()){
  if(remaining===0) return true;
  if(remaining<0||index>=candidates.length) return false;
  const key=`${remaining}:${index}`; if(memo.has(key)) return memo.get(key);
  const cost=candidates[index].cost;
  const possible=canFillSlots(remaining-cost,candidates,index+1,memo)||canFillSlots(remaining,candidates,index+1,memo);
  memo.set(key,possible); return possible;
}

function weightedChoice(items){
  const total=items.reduce((s,x)=>s+Math.max(.0001,x.weight),0);
  let needle=Math.random()*total;
  for(const item of items){ needle-=Math.max(.0001,item.weight); if(needle<=0) return item; }
  return items.at(-1)||null;
}

export function generateCardioCircuit({withKB=false, level=5, week=1}){
  const pool=withKB?CARDIO_KB:CARDIO_BW;
  const targetSlots=CARDIO_SEQUENCES_PER_TOUR[week-1];
  const used=new Set(); const result=[]; let slots=0;

  while(slots<targetSlots){
    const remaining=targetSlots-slots;
    const all=flattenedCandidates(pool,level,used);
    const feasible=all.filter(candidate=>{
      if(candidate.cost>remaining) return false;
      const after=all.filter(x=>x.id!==candidate.id);
      return canFillSlots(remaining-candidate.cost,after);
    });
    if(!feasible.length) throw new Error(`Cardio impossible à remplir: P${level}, semaine ${week}, KB=${withKB}, reste ${remaining}`);
    const pick=weightedChoice(feasible); used.add(pick.id);
    const ex=getExercise(pick.id);
    if(ex.unilateral) result.push({exerciseId:pick.id,side:'D',pairId:pick.id},{exerciseId:pick.id,side:'G',pairId:pick.id});
    else result.push({exerciseId:pick.id,side:null,pairId:null});
    slots+=pick.cost;
  }
  return result;
}

export function cardioGroups(sequence){
  const groups=[];
  for(let i=0;i<sequence.length;){
    const x=sequence[i];
    if(x.pairId && sequence[i+1]?.pairId===x.pairId){groups.push({start:i,length:2,pairId:x.pairId});i+=2;}
    else{groups.push({start:i,length:1,pairId:null});i++;}
  }
  return groups;
}

export function swapCardioGroup(sequence,{withKB=false,level=5},groupStart){
  const seq=sequence.map(x=>({...x})); const groups=cardioGroups(seq); const g=groups.find(x=>x.start===groupStart); if(!g) return seq;
  const pool=withKB?CARDIO_KB:CARDIO_BW;
  const used=new Set(seq.filter((_,i)=>i<g.start||i>=g.start+g.length).map(x=>x.exerciseId));
  const wantedCost=g.length;
  const candidates=flattenedCandidates(pool,level,used).filter(x=>x.cost===wantedCost);
  if(!candidates.length) return seq;
  const pick=weightedChoice(candidates);
  if(wantedCost===2) seq.splice(g.start,2,{exerciseId:pick.id,side:'D',pairId:pick.id},{exerciseId:pick.id,side:'G',pairId:pick.id});
  else seq.splice(g.start,1,{exerciseId:pick.id,side:null,pairId:null});
  return seq;
}
