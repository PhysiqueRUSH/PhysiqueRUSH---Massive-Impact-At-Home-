// PhysiqueRUSH – Massive Impact
// Catalogue média maître. Chaque ID peut recevoir plus tard :
// assets/media/loops/<id>.mp4 (boucle 2–3 reps), assets/media/frames/<id>.webp et une URL Vimeo.

const E = (id, name, category, {unilateral=false, equipment='Aucun', ballistic=false, emoji='🏋️'}={}) => ({
  id, name, category, unilateral, equipment, ballistic, emoji,
  loop:`./assets/media/loops/${id}.mp4`,
  frame:`./assets/media/frames/${id}.webp`,
  vimeo:null,
});

export const EXERCISES = {
  // LEGS — A1
  air_squat_heels: E('air_squat_heels','Air Squat talons surélevés','LEGS',{emoji:'🦵'}),
  kb_squat_heels: E('kb_squat_heels','KB Squat talons surélevés','LEGS',{equipment:'Kettlebell',emoji:'🦵'}),
  bulgarian_bw: E('bulgarian_bw','Bulgarian Split Squat BW — version quadriceps','LEGS',{unilateral:true,emoji:'🦵'}),
  bulgarian_kb: E('bulgarian_kb','Bulgarian Split Squat + KB — version quadriceps','LEGS',{unilateral:true,equipment:'Kettlebell',emoji:'🦵'}),
  levitation_bw: E('levitation_bw','Levitation Squat BW — talon surélevé','LEGS',{unilateral:true,emoji:'🦵'}),
  pistol_bw: E('pistol_bw','Pistol Squat BW — talon surélevé','LEGS',{unilateral:true,emoji:'🦵'}),
  levitation_kb: E('levitation_kb','Levitation Squat + KB — talon surélevé','LEGS',{unilateral:true,equipment:'Kettlebell',emoji:'🦵'}),
  pistol_kb: E('pistol_kb','Pistol Squat + KB — talon surélevé','LEGS',{unilateral:true,equipment:'Kettlebell',emoji:'🦵'}),
  wall_sit: E('wall_sit','Chaise dos au mur / Wall Sit','LEGS',{emoji:'🧱'}),

  // LEGS — A2
  kb_deadlift: E('kb_deadlift','KB Deadlift','LEGS',{equipment:'Kettlebell',emoji:'🦵'}),
  kb_rdl: E('kb_rdl','KB Romanian Deadlift bilatéral','LEGS',{equipment:'Kettlebell',emoji:'🦵'}),
  kb_rdl_bstance: E('kb_rdl_bstance','KB Romanian Deadlift B-stance','LEGS',{unilateral:true,equipment:'Kettlebell',emoji:'🦵'}),
  kb_rdl_single: E('kb_rdl_single','Single-Leg KB Romanian Deadlift','LEGS',{unilateral:true,equipment:'Kettlebell',emoji:'🦵'}),

  // LEGS — A3
  reverse_lunge: E('reverse_lunge','Fentes arrière alternées','LEGS',{unilateral:true,emoji:'🦵'}),
  jump_lunge_center: E('jump_lunge_center','Fentes sautées avec réception centrale','LEGS',{unilateral:true,ballistic:true,emoji:'⚡'}),
  jump_lunge_direct: E('jump_lunge_direct','Fentes sautées directes alternées','LEGS',{unilateral:true,ballistic:true,emoji:'⚡'}),
  reverse_lunge_kb: E('reverse_lunge_kb','Fentes arrière alternées + KB','LEGS',{unilateral:true,equipment:'Kettlebell',emoji:'🦵'}),
  jump_lunge_center_kb: E('jump_lunge_center_kb','Fentes sautées avec réception centrale + KB','LEGS',{unilateral:true,equipment:'Kettlebell',ballistic:true,emoji:'⚡'}),
  jump_lunge_direct_kb: E('jump_lunge_direct_kb','Fentes sautées directes + KB','LEGS',{unilateral:true,equipment:'Kettlebell',ballistic:true,emoji:'⚡'}),

  // QUADRICEPS
  sissy_assisted: E('sissy_assisted','Sissy Squat partiel très assisté — deux mains sur chaise','QUADRICEPS',{emoji:'🦵'}),
  sissy_partial: E('sissy_partial','Sissy Squat partiel non assisté — une main au mur','QUADRICEPS',{emoji:'🦵'}),
  sissy_full: E('sissy_full','Sissy Squat amplitude complète — une main au mur','QUADRICEPS',{emoji:'🦵'}),
  sissy_kb: E('sissy_kb','Sissy Squat amplitude complète + KB','QUADRICEPS',{equipment:'Kettlebell',emoji:'🦵'}),
  reverse_nordic_arms_down: E('reverse_nordic_arms_down','Reverse Nordic — bras le long du corps','QUADRICEPS',{emoji:'🦵'}),
  reverse_nordic_arms_up: E('reverse_nordic_arms_up','Reverse Nordic — bras au-dessus de la tête','QUADRICEPS',{emoji:'🦵'}),
  reverse_nordic_kb: E('reverse_nordic_kb','Reverse Nordic + KB','QUADRICEPS',{equipment:'Kettlebell',emoji:'🦵'}),
  leg_ext_chair_bi: E('leg_ext_chair_bi','Leg Extension assistance chaise bilatéral','QUADRICEPS',{emoji:'🦵'}),
  leg_ext_chair_uni: E('leg_ext_chair_uni','Leg Extension unilatéral assistance chaise','QUADRICEPS',{unilateral:true,emoji:'🦵'}),
  quad_killer: E('quad_killer','Kettlebell Quad Killer','QUADRICEPS',{equipment:'Kettlebell',emoji:'🔥'}),
  leg_ext_table_uni: E('leg_ext_table_uni','Leg Extension unilatéral assis sur table','QUADRICEPS',{unilateral:true,emoji:'🦵'}),
  leg_ext_kb_supine: E('leg_ext_kb_supine','Leg Extension unilatéral + KB allongé sur le dos','QUADRICEPS',{unilateral:true,equipment:'Kettlebell',emoji:'🦵'}),

  // ISCHIOS
  hip_bridge_chair: E('hip_bridge_chair','Hip Bridge talons sur chaise','ISCHIOS',{emoji:'🦵'}),
  hip_bridge_chair_kb: E('hip_bridge_chair_kb','Hip Bridge talons sur chaise + KB','ISCHIOS',{equipment:'Kettlebell',emoji:'🦵'}),
  sliding_leg_curl: E('sliding_leg_curl','Sliding Leg Curl bilatéral','ISCHIOS',{equipment:'Chaussettes / sol glissant',emoji:'🦵'}),
  sliding_leg_curl_kb: E('sliding_leg_curl_kb','Sliding Leg Curl bilatéral + KB','ISCHIOS',{equipment:'Kettlebell + sol glissant',emoji:'🦵'}),
  sliding_leg_curl_uni: E('sliding_leg_curl_uni','Sliding Leg Curl unilatéral','ISCHIOS',{unilateral:true,equipment:'Chaussettes / sol glissant',emoji:'🦵'}),

  // PUSH D10
  knee_push_partial: E('knee_push_partial','Pompes genoux partielles — moitié haute','PUSH',{emoji:'💥'}),
  knee_hand_release: E('knee_hand_release','Pompes Hand Release genoux','PUSH',{emoji:'💥'}),
  knee_diamond_kb: E('knee_diamond_kb','Pompes diamant genoux sur KB','PUSH',{equipment:'Kettlebell',emoji:'💥'}),
  pushup: E('pushup','Pompes classiques','PUSH',{emoji:'💥'}),
  offset_pushup: E('offset_pushup','Pompes décalées','PUSH',{emoji:'💥'}),
  diamond_pushup_kb: E('diamond_pushup_kb','Pompes diamant sur KB','PUSH',{equipment:'Kettlebell',emoji:'💥'}),
  archer_pushup_kb: E('archer_pushup_kb','Pompes Archer — main de travail sur KB','PUSH',{unilateral:true,equipment:'Kettlebell',emoji:'💥'}),
  one_arm_pushup_kb: E('one_arm_pushup_kb','Pompe à un bras — main sur KB','PUSH',{unilateral:true,equipment:'Kettlebell',emoji:'💥'}),
  knee_shoulder_taps: E('knee_shoulder_taps','Pompes genoux Shoulder Taps','PUSH',{emoji:'💥'}),
  hand_release_pushup: E('hand_release_pushup','Pompes Hand Release','PUSH',{emoji:'💥'}),
  pushup_shoulder_taps: E('pushup_shoulder_taps','Push-Up Shoulder Taps','PUSH',{emoji:'💥'}),
  explosive_pushup: E('explosive_pushup','Pompes explosives / plyométriques','PUSH',{ballistic:true,emoji:'⚡'}),

  // PUSH D11
  pushup_table: E('pushup_table','Pompes très inclinées sur table','PUSH',{equipment:'Table',emoji:'💥'}),
  pushup_2chairs: E('pushup_2chairs','Pompes inclinées — mains sur 2 chaises','PUSH',{equipment:'2 chaises',emoji:'💥'}),
  pushup_3chairs: E('pushup_3chairs','Pompes Deep ROM — 3 chaises','PUSH',{equipment:'3 chaises',emoji:'💥'}),
  decline_pushup: E('decline_pushup','Pompes déclinées — pieds sur chaise','PUSH',{equipment:'Chaise',emoji:'💥'}),
  decline_diamond_kb: E('decline_diamond_kb','Pompes diamant déclinées sur KB','PUSH',{equipment:'Chaise + kettlebell',emoji:'💥'}),

  // PUSH D12
  floor_press_bridge: E('floor_press_bridge','KB Floor Press bilatéral en pont','PUSH',{equipment:'Kettlebell',emoji:'💥'}),
  floor_press: E('floor_press','KB Floor Press bilatéral au sol','PUSH',{equipment:'Kettlebell',emoji:'💥'}),
  incline_press_chair: E('incline_press_chair','KB Press bilatéral incliné sur chaise','PUSH',{equipment:'Kettlebell + chaise',emoji:'💥'}),
  semi_uni_floor_press: E('semi_uni_floor_press','KB Floor Press semi-unilatéral','PUSH',{unilateral:true,equipment:'Kettlebell',emoji:'💥'}),
  uni_floor_press: E('uni_floor_press','KB Floor Press unilatéral','PUSH',{unilateral:true,equipment:'Kettlebell',emoji:'💥'}),
  uni_fly_press: E('uni_fly_press','KB Fly-Press unilatéral','PUSH',{unilateral:true,equipment:'Kettlebell',emoji:'💥'}),

  // PUSH dips / épaules
  dips_assisted: E('dips_assisted','Dips penchés assistés','PUSH',{equipment:'Chaises / support',emoji:'💥'}),
  dips: E('dips','Dips penchés non assistés','PUSH',{equipment:'Chaises / support',emoji:'💥'}),
  tyson_knees: E('tyson_knees','Tyson Push-Up genoux','PUSH',{emoji:'💥'}),
  tyson: E('tyson','Tyson Push-Up','PUSH',{emoji:'💥'}),
  ohp_bi_momentum: E('ohp_bi_momentum','KB Overhead Press bilatéral debout avec élan','PUSH',{equipment:'Kettlebell',emoji:'💥'}),
  ohp_bi_kneeling: E('ohp_bi_kneeling','KB Overhead Press bilatéral à genoux strict','PUSH',{equipment:'Kettlebell',emoji:'💥'}),
  ohp_uni_momentum: E('ohp_uni_momentum','KB Overhead Press unilatéral debout avec élan','PUSH',{unilateral:true,equipment:'Kettlebell',emoji:'💥'}),
  ohp_uni_seated: E('ohp_uni_seated','KB Overhead Press unilatéral assis','PUSH',{unilateral:true,equipment:'Kettlebell',emoji:'💥'}),
  wide_knee_partial: E('wide_knee_partial','Pompes larges genoux partielles','PUSH',{emoji:'💥'}),
  wide_knee_hr: E('wide_knee_hr','Pompes larges genoux Hand Release','PUSH',{emoji:'💥'}),
  wide_pushup: E('wide_pushup','Pompes larges','PUSH',{emoji:'💥'}),
  pendulum_pushup: E('pendulum_pushup','Pendulum Push-Up','PUSH',{emoji:'💥'}),
  pendulum_decline: E('pendulum_decline','Pendulum Push-Up décliné','PUSH',{equipment:'Chaise',emoji:'💥'}),

  // PULL
  superman_row: E('superman_row','Superman Row serviette','PULL',{equipment:'Serviette',emoji:'🧲'}),
  row_bi_towel: E('row_bi_towel','Row bilatéral KB avec serviette','PULL',{equipment:'Kettlebell + serviette',emoji:'🧲'}),
  row_bi_o: E('row_bi_o','Row bilatéral KB « en O »','PULL',{equipment:'Kettlebell',emoji:'🧲'}),
  row_uni_close: E('row_uni_close','Row unilatéral KB — coude au corps','PULL',{unilateral:true,equipment:'Kettlebell',emoji:'🧲'}),
  row_uni_open: E('row_uni_open','Row unilatéral KB — coude ouvert','PULL',{unilateral:true,equipment:'Kettlebell',emoji:'🧲'}),
  reverse_fly_uni: E('reverse_fly_uni','Reverse Fly unilatéral penché + KB','PULL',{unilateral:true,equipment:'Kettlebell',emoji:'🧲'}),
  face_pull_towel: E('face_pull_towel','Face Pull KB penché avec serviette','PULL',{equipment:'Kettlebell + serviette',emoji:'🧲'}),
  skier_pull_uni: E('skier_pull_uni','Skier Pull unilatéral penché + KB','PULL',{unilateral:true,equipment:'Kettlebell',emoji:'🧲'}),

  // BICEPS
  drag_curl_floor: E('drag_curl_floor','Drag Curl unilatéral frotté au sol','BICEPS',{unilateral:true,equipment:'Kettlebell',emoji:'💪'}),
  drag_curl_kb: E('drag_curl_kb','KB Drag Curl — coudes écartés','BICEPS',{equipment:'Kettlebell',emoji:'💪'}),
  curl_bi_towel: E('curl_bi_towel','Curl bilatéral KB avec rotation + serviette','BICEPS',{equipment:'Kettlebell + serviette',emoji:'💪'}),
  curl_row_uni: E('curl_row_uni','Curl-Row supination unilatéral','BICEPS',{unilateral:true,equipment:'Kettlebell',emoji:'💪'}),
  hammer_curl_momentum: E('hammer_curl_momentum','Curl marteau unilatéral avec élan standardisé','BICEPS',{unilateral:true,equipment:'Kettlebell',emoji:'💪'}),
  strict_curl_uni: E('strict_curl_uni','Curl KB unilatéral strict','BICEPS',{unilateral:true,equipment:'Kettlebell',emoji:'💪'}),

  // TRICEPS KB
  neck_crusher: E('neck_crusher','Neck Crusher KB','TRICEPS',{equipment:'Kettlebell',emoji:'💪'}),
  close_grip_floor_press: E('close_grip_floor_press','Close-Grip KB Floor Press','TRICEPS',{equipment:'Kettlebell',emoji:'💪'}),
  incline_neck_extension: E('incline_neck_extension','Extension nuque inclinée assis sur chaise','TRICEPS',{equipment:'Kettlebell + chaise',emoji:'💪'}),
  guillotine_press: E('guillotine_press','Guillotine Triceps Press KB','TRICEPS',{equipment:'Kettlebell',emoji:'💪'}),
  skull_crusher: E('skull_crusher','Skull Crusher KB','TRICEPS',{equipment:'Kettlebell',emoji:'💪'}),

  // TRICEPS PDC
  wall_triceps: E('wall_triceps','Wall Triceps Extension','TRICEPS',{equipment:'Mur',emoji:'💪'}),
  cobra_knees: E('cobra_knees','Pompes Cobra genoux avec support KB au bassin','TRICEPS',{equipment:'Kettlebell',emoji:'💪'}),
  chair_triceps: E('chair_triceps','Chair Triceps Extension','TRICEPS',{equipment:'Chaise',emoji:'💪'}),
  cobra_pushup: E('cobra_pushup','Pompes Cobra','TRICEPS',{emoji:'💪'}),
  tiger_knees: E('tiger_knees','Pompes Tigre genoux','TRICEPS',{emoji:'💪'}),
  tiger_pushup: E('tiger_pushup','Pompes Tigre','TRICEPS',{emoji:'💪'}),

  // CORE — pool 24
  side_plank_row: E('side_plank_row','Side Plank Row','CORE',{unilateral:true,equipment:'Kettlebell',emoji:'⚡'}),
  sliding_kb_plank: E('sliding_kb_plank','Sliding Kettlebell Plank','CORE',{unilateral:true,equipment:'Kettlebell + serviette',emoji:'⚡'}),
  seated_assisted_clean: E('seated_assisted_clean','Clean assisté assis','CORE',{unilateral:true,equipment:'Kettlebell',emoji:'⚡'}),
  seated_halo: E('seated_halo','Halo assis','CORE',{equipment:'Kettlebell',emoji:'⚡'}),
  side_kick_through: E('side_kick_through','Side Kick Through','CORE',{emoji:'⚡'}),
  lunge_uppercuts: E('lunge_uppercuts','Uppercuts en fente','CORE',{emoji:'⚡'}),
  bird_dog_hand_foot: E('bird_dog_hand_foot','Bird Dog pied-main','CORE',{unilateral:true,emoji:'⚡'}),
  lunge_kb_swing: E('lunge_kb_swing','KB Swing en fente','CORE',{unilateral:true,equipment:'Kettlebell',emoji:'⚡'}),
  candlestick_kb: E('candlestick_kb','Chandelles avec saisie KB','CORE',{equipment:'Kettlebell',emoji:'⚡'}),
  around_world: E('around_world','Around The World','CORE',{equipment:'Kettlebell',emoji:'⚡'}),
  sliding_toes_plank: E('sliding_toes_plank','Sliding Toes Plank','CORE',{equipment:'Chaussettes / sol glissant',emoji:'⚡'}),
  iron_trident: E('iron_trident','Iron Trident','CORE',{emoji:'⚡'}),
  russian_twist: E('russian_twist','Russian Twists','CORE',{emoji:'⚡'}),
  uni_kneel_to_squat: E('uni_kneel_to_squat','KB Kneel-To-Squat unilatéral','CORE',{unilateral:true,equipment:'Kettlebell',emoji:'⚡'}),
  kb_iso_leg_raise: E('kb_iso_leg_raise','KB Iso Hold Leg Raises','CORE',{equipment:'Kettlebell',emoji:'⚡'}),
  knee_sliding_mountain: E('knee_sliding_mountain','Knee Sliding Mountain Climbers sur KB','CORE',{equipment:'Kettlebell + sol glissant',emoji:'⚡'}),
  kb_crunch: E('kb_crunch','Crunches KB','CORE',{equipment:'Kettlebell',emoji:'⚡'}),
  plank_drag: E('plank_drag','Plank Drag','CORE',{equipment:'Kettlebell',emoji:'⚡'}),
  farmer_little_hops: E('farmer_little_hops','Farmer Little Hops','CORE',{unilateral:true,equipment:'Kettlebell',emoji:'⚡'}),
  strip_tease_plank: E('strip_tease_plank','Strip Tease Plank','CORE',{emoji:'⚡'}),
  starfish_crunch: E('starfish_crunch','Starfish Crunches','CORE',{emoji:'⚡'}),
  tuck_vups: E('tuck_vups','Tuck V-Ups','CORE',{emoji:'⚡'}),
  elbow_taps_kb: E('elbow_taps_kb','Elbow Taps KB','CORE',{equipment:'Kettlebell',emoji:'⚡'}),
  cross_hop_plank: E('cross_hop_plank','Cross Hop Planks','CORE',{emoji:'⚡'}),

  // CARDIO SANS KB
  burpee_no_pushup: E('burpee_no_pushup','Burpees sans pompe','CARDIO',{ballistic:true,emoji:'🔥'}),
  stepup_alt_chair: E('stepup_alt_chair','Step-Up alterné sur chaise','CARDIO',{equipment:'Chaise',emoji:'🔥'}),
  mountain_climber_high: E('mountain_climber_high','Mountain Climbers pied posé haut','CARDIO',{equipment:'Support',emoji:'🔥'}),
  short_shuttles: E('short_shuttles','Navettes courtes','CARDIO',{emoji:'🔥'}),
  bear_crawl: E('bear_crawl','Marche de l’ours','CARDIO',{emoji:'🔥'}),
  high_knees_dynamic: E('high_knees_dynamic','Montées de genoux dynamiques','CARDIO',{emoji:'🔥'}),
  partial_jump_lunges: E('partial_jump_lunges','Fentes sautées partielles','CARDIO',{ballistic:true,emoji:'🔥'}),
  jumping_jacks: E('jumping_jacks','Jumping Jacks','CARDIO',{emoji:'🔥'}),
  shadow_boxing_freq: E('shadow_boxing_freq','Shadow Boxing fréquence','CARDIO',{emoji:'🥊'}),
  burpee: E('burpee','Burpees','CARDIO',{ballistic:true,emoji:'🔥'}),
  plank_tuck: E('plank_tuck','Planche Regroupement','CARDIO',{emoji:'🔥'}),
  frog_jumps: E('frog_jumps','Frog Jumps','CARDIO',{ballistic:true,emoji:'🔥'}),
  fast_feet: E('fast_feet','Piétinements fréquence','CARDIO',{emoji:'🔥'}),
  advanced_skater: E('advanced_skater','Advanced Skater Jumps','CARDIO',{ballistic:true,emoji:'🔥'}),
  ninja_tuck_jumps: E('ninja_tuck_jumps','Ninja Tuck Jumps','CARDIO',{ballistic:true,emoji:'🔥'}),
  hannibal_pushup: E('hannibal_pushup','Pompes Hannibal','CARDIO',{emoji:'🔥'}),
  running_man: E('running_man','Running Man','CARDIO',{emoji:'🔥'}),
  mule_kicks: E('mule_kicks','Mule Kicks','CARDIO',{ballistic:true,emoji:'🔥'}),
  high_burpee_chair: E('high_burpee_chair','High Burpees sur chaise','CARDIO',{equipment:'Chaise',ballistic:true,emoji:'🔥'}),

  // CARDIO KB
  clean_bi: E('clean_bi','Cleans bilatéraux KB','CARDIO',{equipment:'Kettlebell',emoji:'🔥'}),
  goblet_squat: E('goblet_squat','KB Goblet Squat','CARDIO',{equipment:'Kettlebell',emoji:'🔥'}),
  swing_bi: E('swing_bi','Swings bilatéraux KB','CARDIO',{equipment:'Kettlebell',ballistic:true,emoji:'🔥'}),
  burpee_deadlift: E('burpee_deadlift','Burpee sans pompe + KB Deadlift','CARDIO',{equipment:'Kettlebell',emoji:'🔥'}),
  kneel_to_squat_bi: E('kneel_to_squat_bi','KB Kneel-To-Squat bilatéral','CARDIO',{equipment:'Kettlebell',emoji:'🔥'}),
  row_bi_cardio: E('row_bi_cardio','KB Row bilatéral','CARDIO',{equipment:'Kettlebell',emoji:'🔥'}),
  kb_butt_kicker: E('kb_butt_kicker','KB Butt Kicker','CARDIO',{equipment:'Kettlebell',emoji:'🔥'}),
  baby_skater_hops: E('baby_skater_hops','Baby Skater Hops','CARDIO',{equipment:'Kettlebell',emoji:'🔥'}),
  suitcase_high_knees: E('suitcase_high_knees','Suitcase High Knees','CARDIO',{unilateral:true,equipment:'Kettlebell',emoji:'🔥'}),
  kb_running_man: E('kb_running_man','KB Running Man','CARDIO',{equipment:'Kettlebell',emoji:'🔥'}),
  grave_diggers: E('grave_diggers','Grave Diggers','CARDIO',{equipment:'Kettlebell',emoji:'🔥'}),
  thruster_bi: E('thruster_bi','Thrusters bilatéraux KB','CARDIO',{equipment:'Kettlebell',emoji:'🔥'}),
  clean_uni: E('clean_uni','Clean unilatéral KB','CARDIO',{unilateral:true,equipment:'Kettlebell',emoji:'🔥'}),
  row_uni_cardio: E('row_uni_cardio','Row unilatéral KB — version cardio','CARDIO',{unilateral:true,equipment:'Kettlebell',emoji:'🔥'}),
  swing_uni: E('swing_uni','Swing unilatéral KB','CARDIO',{unilateral:true,equipment:'Kettlebell',ballistic:true,emoji:'🔥'}),
  burpee_clean_uni: E('burpee_clean_uni','Burpee & Clean unilatéral KB','CARDIO',{unilateral:true,equipment:'Kettlebell',emoji:'🔥'}),
  snatch_uni: E('snatch_uni','Snatch unilatéral KB','CARDIO',{unilateral:true,equipment:'Kettlebell',ballistic:true,emoji:'🔥'}),
  clean_press_uni: E('clean_press_uni','Clean & Press unilatéral KB','CARDIO',{unilateral:true,equipment:'Kettlebell',emoji:'🔥'}),
  goblet_jump_lunge: E('goblet_jump_lunge','Fentes sautées Goblet','CARDIO',{equipment:'Kettlebell',ballistic:true,emoji:'🔥'}),
  swing_90_90: E('swing_90_90','90-90 Swings','CARDIO',{equipment:'Kettlebell',ballistic:true,emoji:'🔥'}),

  // CHALLENGES / TESTS SPÉCIFIQUES
  knee_push_iso: E('knee_push_iso','Pompe isométrique sur genoux','CHALLENGE',{emoji:'🧨'}),
  knee_pushups: E('knee_pushups','Pompes sur genoux','CHALLENGE',{emoji:'🧨'}),
  pushup_iso: E('pushup_iso','Pompe isométrique','CHALLENGE',{emoji:'🧨'}),
  superman_hold: E('superman_hold','Superman Row Hold & Squeeze — serviette','CHALLENGE',{equipment:'Serviette',emoji:'🧨'}),
  row_supinated_bi: E('row_supinated_bi','Row KB 2 bras prise supination','CHALLENGE',{equipment:'Kettlebell',emoji:'🧨'}),
  row_iso_belly: E('row_iso_belly','Row KB 2 bras iso contre ventre','CHALLENGE',{equipment:'Kettlebell',emoji:'🧨'}),
  row_elbows_out_bi: E('row_elbows_out_bi','Row KB 2 bras coudes écartés','CHALLENGE',{equipment:'Kettlebell',emoji:'🧨'}),
  wall_sit_kb_hang: E('wall_sit_kb_hang','Chaise + KB suspendue sous les jambes','CHALLENGE',{equipment:'Kettlebell',emoji:'🧨'}),
  goblet_jump_squat: E('goblet_jump_squat','Goblet Squat explosif / sauté','CHALLENGE',{equipment:'Kettlebell',ballistic:true,emoji:'🧨'}),
  american_swing: E('american_swing','American KB Swing','CHALLENGE',{equipment:'Kettlebell',ballistic:true,emoji:'🧨'}),
  goblet_stepup: E('goblet_stepup','Step-Up Goblet alterné sur chaise','CHALLENGE',{equipment:'Kettlebell + chaise',emoji:'🧨'}),
};

export const getExercise = (id) => EXERCISES[id] || E(id, id, 'AUTRE',{emoji:'🏋️'});
export const allExercises = () => Object.values(EXERCISES);
