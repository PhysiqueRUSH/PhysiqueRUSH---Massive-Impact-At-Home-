import { getExercise } from './exercises.js';

export const CORE_POOL = [
  ['side_plank_row',true],['sliding_kb_plank',true],['seated_assisted_clean',true],['seated_halo',false],
  ['side_kick_through',false],['lunge_uppercuts',false],['bird_dog_hand_foot',true],['lunge_kb_swing',true],
  ['candlestick_kb',false],['around_world',false],['sliding_toes_plank',false],['iron_trident',false],
  ['russian_twist',false],['uni_kneel_to_squat',true],['kb_iso_leg_raise',false],['knee_sliding_mountain',false],
  ['kb_crunch',false],['plank_drag',false],['farmer_little_hops',true],['strip_tease_plank',false],
  ['starfish_crunch',false],['tuck_vups',false],['elbow_taps_kb',false],['cross_hop_plank',false],
].map(([id,unilateral])=>({id,unilateral,exercise:getExercise(id)}));

const shuffle = arr => [...arr].sort(()=>Math.random()-.5);

export function generateCoreSequence(){
  // 7 séquences de 60 s exactement. Un tirage unilatéral occupe deux séquences consécutives.
  const picked=[]; let slots=0;
  for(const item of shuffle(CORE_POOL)){
    const cost=item.unilateral?2:1;
    if(slots+cost>7) continue;
    if(item.unilateral){
      const rightFirst=Math.random()>=.5;
      picked.push({exerciseId:item.id, side:rightFirst?'D':'G', pairId:item.id});
      picked.push({exerciseId:item.id, side:rightFirst?'G':'D', pairId:item.id});
    } else picked.push({exerciseId:item.id, side:null, pairId:null});
    slots+=cost;
    if(slots===7) break;
  }
  // Très improbable fallback si la combinaison aléatoire n'a pas rempli 7.
  if(slots<7){
    for(const item of shuffle(CORE_POOL.filter(x=>!x.unilateral && !picked.some(p=>p.exerciseId===x.id)))){
      picked.push({exerciseId:item.id,side:null,pairId:null}); slots++;
      if(slots===7) break;
    }
  }
  return picked.slice(0,7);
}

export function coreGroups(sequence){
  const groups=[];
  for(let i=0;i<sequence.length;){
    const x=sequence[i];
    if(x.pairId && sequence[i+1]?.pairId===x.pairId){ groups.push({start:i,length:2,pairId:x.pairId}); i+=2; }
    else { groups.push({start:i,length:1,pairId:null}); i++; }
  }
  return groups;
}

export function swapCoreGroup(sequence,groupStart){
  const seq=sequence.map(x=>({...x})); const groups=coreGroups(seq); const g=groups.find(x=>x.start===groupStart); if(!g) return seq;
  const used=new Set(seq.filter((_,i)=>i<g.start||i>=g.start+g.length).map(x=>x.exerciseId));
  if(g.length===1){
    const candidates=CORE_POOL.filter(x=>!x.unilateral&&!used.has(x.id));
    if(!candidates.length) return seq;
    const pick=candidates[Math.floor(Math.random()*candidates.length)];
    seq.splice(g.start,1,{exerciseId:pick.id,side:null,pairId:null});
  } else {
    const uni=CORE_POOL.filter(x=>x.unilateral&&!used.has(x.id));
    const bi=CORE_POOL.filter(x=>!x.unilateral&&!used.has(x.id));
    const chooseUni=uni.length && (bi.length<2 || Math.random()>.5);
    if(chooseUni){
      const pick=uni[Math.floor(Math.random()*uni.length)],rightFirst=Math.random()>.5;
      seq.splice(g.start,2,{exerciseId:pick.id,side:rightFirst?'D':'G',pairId:pick.id},{exerciseId:pick.id,side:rightFirst?'G':'D',pairId:pick.id});
    } else if(bi.length>=2){
      const shuffled=[...bi].sort(()=>Math.random()-.5).slice(0,2);
      seq.splice(g.start,2,...shuffled.map(x=>({exerciseId:x.id,side:null,pairId:null})));
    }
  }
  return seq;
}
