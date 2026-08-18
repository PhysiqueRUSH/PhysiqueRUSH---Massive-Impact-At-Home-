export const challengeTierFromPaliers = official => {
  const vals=['legs','push','pull','core','cardio'].map(k=>official[k]||1);
  const avg=vals.reduce((a,b)=>a+b,0)/vals.length;
  return avg<=4?'beg':avg<=7?'int':'adv';
};

export const BURN_RUSH = {
  id:'burn-rush', name:'BURN & RUSH', description:'3 tours. Burn isométrique jusqu’à 60 s max ou échec, puis Rush immédiatement à l’échec. Push → Pull → Legs. Score = total des reps Rush.',
  zones:{
    push:{
      beg:{burn:'knee_push_iso',rush:'knee_pushups'},
      int:{burn:'pushup_iso',rush:'pushup'},
      adv:{burn:'pushup_iso',rush:'explosive_pushup'},
    },
    pull:{
      beg:{burn:'superman_hold',rush:'row_supinated_bi'},
      int:{burn:'row_iso_belly',rush:'row_elbows_out_bi'},
      adv:{burn:'row_iso_belly',rush:'face_pull_towel'},
    },
    legs:{
      beg:{burn:'wall_sit',rush:'frog_jumps'},
      int:{burn:'wall_sit_kb_hang',rush:'goblet_squat'},
      adv:{burn:'wall_sit_kb_hang',rush:'goblet_jump_squat'},
    },
  }
};

export const LEVELS = {
  id:'levels', name:'LEVELS', duration:900,
  description:'15 minutes. 4 exercices en boucle. Chaque niveau doit valider les 4 exercices. Débutant +1 rep/exercice/niveau ; Intermédiaire +2 ; Avancé +3.',
  tiers:{
    beg:{increment:1, exercises:['floor_press_bridge','clean_bi','goblet_squat','swing_bi'], bossTarget:100},
    int:{increment:2, exercises:['incline_press_chair','clean_uni','clean_uni','thruster_bi'], sides:[null,'D','G',null], bossTarget:140},
    adv:{increment:3, exercises:['clean_press_uni','clean_press_uni','goblet_jump_lunge','american_swing'], sides:['D','G',null,null], bossTarget:180},
  }
};

export const ASCENSION = {
  id:'ascension', name:'ASCENSION', duration:900, exerciseId:'goblet_stepup',
  description:'Step-Ups Goblet alternés continus, un pied reste toujours sur la chaise. Toute pause impose 5 × palier PUSH pompes avant reprise ; le chrono continue.',
  tiers:{beg:{goal:100},int:{goal:200},adv:{goal:300}},
};

export function challengeForWeek(week){ return [BURN_RUSH,LEVELS,ASCENSION][week-1]; }

export function challengeBossTarget(challengeId, official){
  const tier=challengeTierFromPaliers(official);
  if(challengeId==='burn-rush'){
    const avg=((official.push||1)+(official.pull||1)+(official.legs||1))/3;
    return Math.round(36 + avg*5.5); // calibrage bêta : ajustable sans toucher au moteur.
  }
  if(challengeId==='levels') return LEVELS.tiers[tier].bossTarget;
  return ASCENSION.tiers[tier].goal;
}
