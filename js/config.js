export const CONFIG = {
  appName:'PhysiqueRUSH – Massive Impact',
  version:'2.3',
  facebookUrl:'', // À remplacer par l'URL du groupe Facebook 7j/7.
  onboardingVideos:[
    {id:'welcome',title:'Bienvenue dans Massive Impact',duration:'≈ 1 min',impact:'100 jours. 15 minutes. Ton impact commence ici.',vimeoId:''},
    {id:'structure',title:'La structure des 100 jours',duration:'≈ 1 min 30',impact:'Comprends le parcours. Puis laisse l’app te guider.',vimeoId:''},
    {id:'app',title:'L’application + Entraide 7j/7',duration:'≈ 1 min 30',impact:'Une seule mission : suivre ce qui s’affiche et donner tout.',vimeoId:''},
    {id:'warmup',title:'L’échauffement conseillé',duration:'≈ 1 min 15',impact:'Prépare le corps. Puis attaque.',vimeoId:''},
  ],
  // Ajouter les IDs Vimeo des démonstrations dans cette table. Exemple : pushup:'123456789'.
  exerciseVimeo:{},
};

export function vimeoEmbedUrl(id){ return id?`https://player.vimeo.com/video/${id}?autoplay=1&title=0&byline=0&portrait=0`:''; }
