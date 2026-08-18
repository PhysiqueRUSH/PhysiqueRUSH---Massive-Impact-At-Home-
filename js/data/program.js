import { DROP_TABLES, TRIPLE_TABLES } from './drops.js';
import { TESTS } from './tests.js';
import { challengeForWeek } from './challenges.js';

const S=(exerciseId,label=null)=>({exerciseId,label});
const assist=p=>S('dips_assisted',`Dips penchés assistés ${p} %`);

export const FAMILY_LABELS = {
  A1:'LEGS — Squat',A2:'LEGS — Chaîne postérieure',A3:'LEGS — Fentes / explosivité',
  D10:'PUSH — Pompes',D11:'PUSH — Angles',D12:'PUSH — Press KB',E13:'PUSH — Dips',E14:'PUSH — Épaules',E15:'PUSH — Larges / Pendulum',
  pullFirst:'PULL',pullSecond:'PULL',biceps:'BICEPS',tricepsKB:'TRICEPS KB',tricepsBW:'TRICEPS poids du corps',
  quadB1:'QUADRICEPS — Sissy',quadB2:'QUADRICEPS — Reverse Nordic',quadB3:'QUADRICEPS — Leg Extension',ham:'ISCHIOS'
};

export const FAMILY_CAPACITY = {
  A1:'legs',A2:'legs',A3:'legs',quadB1:'legs',quadB2:'legs',quadB3:'legs',ham:'legs',
  D10:'push',D11:'push',D12:'push',E13:'push',E14:'push',E15:'push',tricepsKB:'push',tricepsBW:'push',
  pullFirst:'pull',pullSecond:'pull',biceps:'pull'
};

export const FAMILY_LEVELS = {
  A1:{1:S('air_squat_heels'),2:S('kb_squat_heels'),3:S('bulgarian_bw'),4:S('bulgarian_kb'),5:S('bulgarian_kb'),6:S('levitation_bw'),7:S('levitation_bw'),8:S('pistol_bw'),9:S('levitation_kb'),10:S('pistol_kb')},
  A2:{1:S('kb_deadlift'),2:S('kb_deadlift'),3:S('kb_deadlift'),4:S('kb_rdl'),5:S('kb_rdl'),6:S('kb_rdl_bstance'),7:S('kb_rdl_single'),8:S('kb_rdl_single'),9:S('kb_rdl_single'),10:S('kb_rdl_single')},
  A3:{1:S('reverse_lunge'),2:S('jump_lunge_center'),3:S('jump_lunge_center'),4:S('jump_lunge_direct'),5:S('jump_lunge_direct'),6:S('reverse_lunge_kb'),7:S('reverse_lunge_kb'),8:S('jump_lunge_center_kb'),9:S('jump_lunge_direct_kb'),10:S('jump_lunge_direct_kb')},
  D10:{1:S('knee_push_partial'),2:S('knee_hand_release'),3:S('knee_hand_release'),4:S('knee_diamond_kb'),5:S('pushup'),6:S('offset_pushup'),7:S('diamond_pushup_kb'),8:S('archer_pushup_kb'),9:S('archer_pushup_kb'),10:S('one_arm_pushup_kb')},
  D11:{1:S('pushup_table'),2:S('pushup_table'),3:S('pushup_2chairs'),4:S('pushup_2chairs'),5:S('pushup_2chairs'),6:S('pushup_3chairs'),7:S('pushup_3chairs'),8:S('decline_pushup'),9:S('decline_diamond_kb'),10:S('decline_diamond_kb')},
  D12:{1:S('floor_press_bridge'),2:S('floor_press_bridge'),3:S('floor_press'),4:S('floor_press'),5:S('incline_press_chair'),6:S('semi_uni_floor_press'),7:S('uni_floor_press'),8:S('uni_floor_press'),9:S('uni_fly_press'),10:S('uni_fly_press')},
  E13:{1:assist(70),2:assist(60),3:assist(50),4:assist(40),5:assist(30),6:assist(20),7:S('dips'),8:S('dips'),9:S('dips'),10:S('dips')},
  E14:{1:S('tyson_knees'),2:S('tyson_knees'),3:S('tyson_knees'),4:S('tyson'),5:S('tyson'),6:S('ohp_bi_momentum'),7:S('ohp_bi_kneeling'),8:S('ohp_uni_momentum'),9:S('ohp_uni_seated'),10:S('ohp_uni_seated')},
  E15:{1:S('wide_knee_partial'),2:S('wide_knee_partial'),3:S('wide_knee_hr'),4:S('wide_knee_hr'),5:S('wide_pushup'),6:S('wide_pushup'),7:S('wide_pushup'),8:S('pendulum_pushup'),9:S('pendulum_pushup'),10:S('pendulum_decline')},
  pullFirst:{1:S('superman_row'),2:S('row_bi_towel'),3:S('row_bi_towel'),4:S('row_bi_o'),5:S('row_uni_close'),6:S('row_uni_close'),7:S('row_uni_open'),8:{random:['reverse_fly_uni','face_pull_towel','skier_pull_uni']},9:{random:['reverse_fly_uni','face_pull_towel','skier_pull_uni']},10:{random:['reverse_fly_uni','face_pull_towel','skier_pull_uni']}},
  pullSecond:{1:S('superman_row'),2:S('row_bi_towel'),3:S('row_bi_towel'),4:S('row_bi_o'),5:S('row_uni_close'),6:S('row_uni_close'),7:S('row_uni_close'),8:S('row_uni_close'),9:S('row_uni_close'),10:S('row_uni_close')},
  biceps:{1:S('drag_curl_floor'),2:S('drag_curl_floor'),3:S('drag_curl_kb'),4:S('drag_curl_kb'),5:S('curl_bi_towel'),6:S('curl_bi_towel'),7:S('curl_row_uni'),8:S('hammer_curl_momentum'),9:S('strict_curl_uni'),10:S('strict_curl_uni')},
  tricepsKB:{1:S('neck_crusher'),2:S('neck_crusher'),3:S('close_grip_floor_press'),4:S('close_grip_floor_press'),5:S('incline_neck_extension'),6:S('incline_neck_extension'),7:S('guillotine_press'),8:S('guillotine_press'),9:S('skull_crusher'),10:S('skull_crusher')},
  tricepsBW:{1:S('wall_triceps'),2:S('wall_triceps'),3:S('cobra_knees'),4:S('cobra_knees'),5:S('chair_triceps'),6:S('chair_triceps'),7:S('cobra_pushup'),8:S('tiger_knees'),9:S('tiger_pushup'),10:S('tiger_pushup')},
  quadB1:{1:S('sissy_assisted'),2:S('sissy_assisted'),3:S('sissy_partial'),4:S('sissy_partial'),5:S('sissy_full'),6:S('sissy_full'),7:S('sissy_full'),8:S('sissy_full'),9:S('sissy_kb'),10:S('sissy_kb')},
  quadB2:{1:S('reverse_nordic_arms_down'),2:S('reverse_nordic_arms_down'),3:S('reverse_nordic_arms_down'),4:S('reverse_nordic_arms_down'),5:S('reverse_nordic_arms_up'),6:S('reverse_nordic_arms_up'),7:S('reverse_nordic_arms_up'),8:S('reverse_nordic_kb'),9:S('reverse_nordic_kb'),10:S('reverse_nordic_kb')},
  quadB3:{1:S('leg_ext_chair_bi'),2:S('leg_ext_chair_uni'),3:S('leg_ext_chair_uni'),4:S('leg_ext_chair_uni'),5:S('quad_killer'),6:S('quad_killer'),7:S('quad_killer'),8:S('leg_ext_table_uni'),9:S('leg_ext_kb_supine'),10:S('leg_ext_kb_supine')},
  ham:{1:S('hip_bridge_chair'),2:S('hip_bridge_chair'),3:S('hip_bridge_chair_kb'),4:S('hip_bridge_chair_kb'),5:S('sliding_leg_curl'),6:S('sliding_leg_curl'),7:S('sliding_leg_curl_kb'),8:S('sliding_leg_curl_kb'),9:S('sliding_leg_curl_uni'),10:S('sliding_leg_curl_uni')},
};

export function resolveFamilyStage(family, level, {easier=false, random=Math.random}={}){
  let lvl=Math.max(1,Math.min(10,level||1)); if(easier) lvl=Math.max(1,lvl-1);
  const item=FAMILY_LEVELS[family][lvl];
  if(item?.random){ const id=item.random[Math.floor(random()*item.random.length)]; return S(id); }
  return {...item};
}

export function phaseInfo(day){
  if(day===1) return {phase:'Démarrage',week:0,dow:1};
  if(day>=2&&day<=6) return {phase:'Tests initiaux',week:0,dow:day};
  if(day>=7&&day<=27) return {phase:'Phase I',week:Math.floor((day-7)/7)+1,dow:(day-7)%7+1};
  if(day>=28&&day<=48) return {phase:'Phase II',week:Math.floor((day-28)/7)+1,dow:(day-28)%7+1};
  if(day>=49&&day<=53) return {phase:'Tests intermédiaires',week:0,dow:day-48};
  if(day>=54&&day<=74) return {phase:'Phase III',week:Math.floor((day-54)/7)+1,dow:(day-54)%7+1};
  if(day>=75&&day<=95) return {phase:'Phase IV',week:Math.floor((day-75)/7)+1,dow:(day-75)%7+1};
  return {phase:'Tests finaux',week:0,dow:day-95};
}

const standardProtocol=(phase,week)=>{
  if(phase==='Phase I') return [
    {type:'failure',sets:3,restBi:120,restUni:60,label:'ÉCHEC · BASE'},
    {type:'failure',sets:4,restBi:60,restUni:30,label:'ÉCHEC · VOLUME'},
    {type:'failure',sets:3,restBi:30,restUni:15,label:'ÉCHEC · DENSITÉ'},
  ][week-1];
  if(phase==='Phase II') return [
    {type:'tempo',tempo:'HOLD',sets:4,restBi:60,restUni:30,iso:2,label:'HOLD · 2 s isométrie'},
    {type:'tempo',tempo:'SLOW',sets:5,restBi:30,restUni:0,eccentric:4,label:'SLOW · 4 s excentrique'},
    {type:'tempo',tempo:'DRIVE',sets:4,restBi:20,restUni:10,label:'DRIVE · intention concentrique maximale'},
  ][week-1];
  return [
    {type:'restpause',activation:1,relances:5,rest:20,easier:false,label:'REST-PAUSE · 1 + 5'},
    {type:'restpause',activation:1,relances:7,rest:20,easier:false,label:'REST-PAUSE · 1 + 7'},
    {type:'restpause',activation:1,relances:5,rest:10,easier:true,label:'REST-PAUSE DENSITÉ · niveau -1'},
  ][week-1];
};

const sharedProtocol=(phase,week)=>{
  if(phase==='Phase I') return [
    {type:'sharedSequential',sets:2,rest:120,label:'2 séries / muscle'},
    {type:'sharedSequential',sets:3,rest:60,label:'3 séries / muscle'},
    {type:'sharedAntagonist',sets:2,rest:30,label:'2 supersets antagonistes'},
  ][week-1];
  if(phase==='Phase II') return [
    {type:'sharedSequentialTempo',tempo:'HOLD',sets:3,rest:60,iso:2,label:'HOLD · 3 séries / muscle'},
    {type:'sharedSequentialTempo',tempo:'SLOW',sets:4,rest:30,eccentric:4,label:'SLOW · 4 séries / muscle'},
    {type:'sharedAntagonistTempo',tempo:'DRIVE',sets:3,rest:20,label:'DRIVE · 3 supersets antagonistes'},
  ][week-1];
  return [
    {type:'sharedRestPauseSequential',relances:4,rest:20,easier:false,label:'REST-PAUSE · 1 + 4 / muscle'},
    {type:'sharedRestPauseSequential',relances:5,rest:20,easier:false,label:'REST-PAUSE · 1 + 5 / muscle'},
    {type:'sharedRestPauseRelay',relances:4,rest:0,easier:true,label:'REST-PAUSE RELAY · niveau -1'},
  ][week-1];
};

const B=(family,protocol,opts={})=>({kind:'family',family,label:FAMILY_LABELS[family],protocol,...opts});
const SH=(label,families,protocol,opts={})=>({kind:'shared',label,families,protocol,...opts});
const D=(family,table,repeats,rest,{triple=false}={})=>({kind:'drop',family,label:FAMILY_LABELS[family],table,repeats,rest,triple});
const DS=(label,items,rounds,rest)=>({kind:'dropShared',label,items,rounds,rest});

function regularDay(day,pi){
  const {phase,week,dow}=pi;
  const p=standardProtocol(phase,week); const sp=sharedProtocol(phase,week);
  if(dow===1) return {day,type:'regular',phase,week,title:'LEGS + CORE',blocks:[B(['A1','A2','A3'][week-1],p)],secondary:{kind:'core'}};
  if(dow===2) return {day,type:'regular',phase,week,title:'PUSH + CARDIO',blocks:[B(['D10','D11','D12'][week-1],p)],secondary:{kind:'cardio',withKB:false}};
  if(dow===3) return {day,type:'regular',phase,week,title:'PULL + CORE',blocks:[B('pullFirst',p)],secondary:{kind:'core'}};
  if(dow===4){
    const tri=week===3?'tricepsBW':'tricepsKB';
    return {day,type:'regular',phase,week,title:'ARMS + CARDIO',blocks:[SH('ARMS',['biceps',tri],sp)],secondary:{kind:'cardio',withKB:true}};
  }
  if(dow===5){
    const q=['quadB1','quadB2','quadB3'][week-1];
    return {day,type:'regular',phase,week,title:'QUADRICEPS + ISCHIOS + CORE',blocks:[SH('QUADRICEPS / ISCHIOS',[q,'ham'],sp)],secondary:{kind:'core'}};
  }
  // PUSH/PULL : plein 15 min. S3 = densité antagoniste ; Phase III S3 = relay Rest-Pause.
  const push=['E13','E14','E15'][week-1];
  if(week===3){
    if(phase==='Phase III') return {day,type:'regular',phase,week,title:'PUSH + PULL',full15:true,blocks:[SH('PUSH / PULL',[push,'pullSecond'],{type:'sharedRestPauseRelay',relances:5,rest:0,easier:true,label:'REST-PAUSE RELAY · 1 + 5'})]};
    const sets=phase==='Phase I'?3:4; const rest=phase==='Phase I'?30:20;
    return {day,type:'regular',phase,week,title:'PUSH + PULL',full15:true,blocks:[SH('PUSH / PULL',[push,'pullSecond'],{type:'sharedAntagonist',sets,rest,label:`${sets} supersets antagonistes`})]};
  }
  return {day,type:'regular',phase,week,title:'PUSH + PULL',full15:true,blocks:[B(push,p),B('pullSecond',p)]};
}

function phaseIVDay(day,pi){
  const {week,dow}=pi; const base={day,type:'regular',phase:'Phase IV',week,title:'',blocks:[],secondary:null,full15:false};
  if(dow===1){
    base.title='LEGS + CORE';
    base.blocks=week===1?[D('A1','J75_A1',2,60),D('A2','J75_A2',2,60)]:week===2?[D('A2','J75_A2',3,30),D('A3','J82_A3',3,30)]:[D('A1','J89_A1',2,15,{triple:true}),D('A3','J89_A3',2,15,{triple:true})];
    base.transitionRest=week===3?0:30; base.secondary={kind:'core'};
  }
  if(dow===2){
    base.title='PUSH + CARDIO';
    base.blocks=week===1?[D('D10','J76_D10',2,60),D('D11','J76_D11',2,60)]:week===2?[D('D11','J76_D11',3,30),D('D12','J83_D12',3,30)]:[D('D10','J90_D10',2,15,{triple:true}),D('D12','J90_D12',2,15,{triple:true})];
    base.transitionRest=week===3?0:30; base.secondary={kind:'cardio',withKB:false};
  }
  if(dow===3){
    base.title='PULL + CORE';
    base.blocks=week===1?[D('pullFirst','J77_PULL',4,'auto')]:week===2?[D('pullFirst','J77_PULL',5,'autoS2')]:[D('pullFirst','J91_PULL',3,10,{triple:true})]; base.secondary={kind:'core'};
  }
  if(dow===4){
    base.title='ARMS + CARDIO';
    base.blocks=week===1?[DS('ARMS',[D('biceps','J78_BI',1,0),D('tricepsKB','J78_TRI',1,0)],3,30)]:week===2?[DS('ARMS',[D('biceps','J78_BI',1,0),D('tricepsKB','J78_TRI',1,0)],4,15)]:[DS('ARMS',[D('biceps','J92_BI',1,0,{triple:true}),D('tricepsBW','J92_TRI',1,0,{triple:true})],2,10)]; base.secondary={kind:'cardio',withKB:true};
  }
  if(dow===5){
    base.title='QUADRICEPS + ISCHIOS + CORE';
    base.blocks=week===1?[DS('QUADRICEPS / ISCHIOS',[D('quadB1','J79_QUAD',1,0),D('ham','J79_HAM',1,0)],3,30)]:week===2?[DS('QUADRICEPS / ISCHIOS',[D('quadB1','J79_QUAD',1,0),D('ham','J79_HAM',1,0)],4,15)]:[DS('QUADRICEPS / ISCHIOS',[D('quadB1','J93_QUAD',1,0,{triple:true}),D('ham','J93_HAM',1,0,{triple:true})],2,10)]; base.secondary={kind:'core'};
  }
  if(dow===6){
    base.title='PUSH + PULL'; base.full15=true;
    base.blocks=week===1?[D('E13','J80_PUSH',4,45),D('pullSecond','J77_PULL',4,'auto')]:week===2?[DS('PUSH / PULL',[D('E13','J80_PUSH',1,0),D('pullSecond','J77_PULL',1,0)],5,0)]:[DS('PUSH / PULL',[D('E13','J94_PUSH',1,0,{triple:true}),D('pullSecond','J91_PULL',1,0,{triple:true})],3,0)]; base.transitionRest=0;
  }
  return base;
}

export function getDayDefinition(day){
  const pi=phaseInfo(day);
  if(day===1) return {day,type:'onboarding',phase:'Démarrage',title:'ENTRÉE DANS LE CAMP',session:'JOUR 1'};
  if((day>=2&&day<=6)||(day>=49&&day<=53)||(day>=96&&day<=100)){
    const idx=day<=6?day-2:day<=53?day-49:day-96;
    const prefix=day<=6?'TEST':day<=53?'RETEST':'TEST FINAL';
    return {day,type:'test',phase:pi.phase,title:`${prefix} ${TESTS[idx].label}`,session:`${prefix} ${TESTS[idx].label}`,test:TESTS[idx],snapshot:day<=6?'initial':day<=53?'intermediate':'final'};
  }
  if(pi.dow===7){ const challenge=challengeForWeek(pi.week); return {day,type:'challenge',phase:pi.phase,week:pi.week,title:`CHALLENGE DAY — ${challenge.name}`,session:'CHALLENGE DAY',challenge}; }
  return pi.phase==='Phase IV'?phaseIVDay(day,pi):regularDay(day,pi);
}

export function dropChain(tableName,level,triple=false){ const table=(triple?TRIPLE_TABLES:DROP_TABLES)[tableName]; return (table?.[Math.max(1,Math.min(10,level))]||[]).map(x=>({...x})); }
export const allProgramDays = () => Array.from({length:100},(_,i)=>getDayDefinition(i+1));
