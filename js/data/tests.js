export const TESTS = [
  {cap:'legs', label:'LEGS', exerciseId:'bulgarian_bw', unilateral:true, tempo:'≈1 s / rep / côté', criteria:['Amplitude standardisée','Buste et genou contrôlés','Même objectif de reps sur les deux côtés']},
  {cap:'push', label:'PUSH', exerciseId:'hand_release_pushup', unilateral:false, tempo:'≈3 s / rep', criteria:['Poitrine au sol','Mains décollées à chaque rep','Gainage continu']},
  {cap:'pull', label:'PULL', exerciseId:'row_uni_close', unilateral:true, tempo:'≈1 s / rep / côté', criteria:['Amplitude identique','Buste stable','Coude au corps']},
  {cap:'core', label:'CORE', exerciseId:'tuck_vups', unilateral:false, tempo:'≈3 s / rep', criteria:['Contrôle du tronc','Amplitude constante','Pas d’élan parasite']},
  {cap:'cardio', label:'CARDIO', exerciseId:'burpee', unilateral:false, tempo:'≈3 s / rep', criteria:['Mouvement complet','Rythme régulier','Technique conservée']},
];

export const repsForTestPalier = palier => palier*2;
export const getTest = cap => TESTS.find(t=>t.cap===cap);
