# PhysiqueRUSH – Massive Impact · PWA v2.1

Application web progressive **100 jours / ≈15 minutes par jour**, sans build step, prête à être déposée sur GitHub et publiée avec GitHub Pages. Elle est installable en mode application sur Android et iPhone/iPad.

Cette livraison contient le **moteur complet du programme actuellement défini** : les 100 jours, les paliers, les niveaux cachés, les méthodes des 4 phases, les drops Phase IV, Core, Cardio, tests/retests, Challenges/Boss, pts RUSH, streak, performances, badges, replays, sauvegarde locale, reprise de séance interrompue, PWA/offline et l'interface mobile. Les médias définitifs sont volontairement remplaçables : tant qu'ils ne sont pas fournis, l'app affiche des fallbacks emoji/texte.

## Démarrage local

Ne pas ouvrir `index.html` directement en `file://` : les modules ES et le service worker nécessitent HTTP/HTTPS.

```bash
cd physiquerush_massive_impact_complete
python3 -m http.server 8080
```

Puis ouvrir `http://localhost:8080`.

Pour exécuter toutes les vérifications intégrées :

```bash
npm run verify
```

## Publication GitHub Pages

1. Créer un dépôt GitHub vide.
2. Copier **tout le contenu de ce dossier** à la racine du dépôt.
3. Commit + push sur `main`.
4. Dans GitHub : **Settings → Pages → Source = GitHub Actions**.
5. Le workflow `.github/workflows/deploy-pages.yml` déploie automatiquement le site.

Tous les chemins applicatifs sont relatifs : le projet accepte un sous-chemin GitHub Pages de type `https://utilisateur.github.io/nom-du-repo/`.

## Installation mobile

### Android
- Ouvrir la version HTTPS dans Chrome/Edge.
- Utiliser le bouton **Installer** de l'écran Réglages lorsqu'il est proposé, ou le menu navigateur → **Installer l'application**.

### iPhone / iPad
- Ouvrir la version HTTPS dans Safari.
- **Partager → Sur l'écran d'accueil → Ajouter**.

Le manifest, les meta Apple, les icônes et le mode `standalone` sont déjà présents.

**Icône officielle intégrée :** nouveau symbole PhysiqueRUSH rouge métallique (logo seul), avec déclinaisons Android/iOS/PWA et master haute résolution dans `assets/brand/`.

## Ce qui est implémenté

### Parcours 100 jours
- J1 : 4 vidéos d'accueil/structure/app+entraide/échauffement + validation.
- J2–J6 : tests initiaux LEGS / PUSH / PULL / CORE / CARDIO.
- J7–J27 : Phase I.
- J28–J48 : Phase II.
- J49–J53 : tests intermédiaires.
- J54–J74 : Phase III.
- J75–J95 : Phase IV.
- J96–J100 : tests finaux.
- 12 Challenge Days.
- progression strictement séquentielle ; les jours futurs restent verrouillés.
- jours validés consultables et rejouables ; le nouveau résultat remplace le précédent.

### Moteur musculaire
- 18 familles adaptatives, niveaux cachés séparés du radar officiel.
- **TROP FACILE ? / TROP DUR ?** avec confirmation et reset de la famille uniquement.
- saisie instantanée des répétitions efficaces : **5+ / 4 / 3 / 2 / 1**.
- séries à échec technique, balistiques arrêtés à perte du standard explosif/sûr.
- ordre D/G programmé automatiquement.
- Phase I : échec / volume / densité.
- Phase II : HOLD / SLOW / DRIVE.
- Phase III : Rest-Pause ; S3 au niveau temporairement -1.
- Phase IV : double-drops puis volume puis triple-drops denses, tables P1→P10 complètes.
- schéma de séance vertical stable + zone active séparée.
- passage à l'exercice suivant automatique après saisie ; repos chronométrés automatiques.
- reprise locale d'une séance musculaire interrompue.

### Core
- pool de 24 tirages.
- exactement 7 séquences × 60 s.
- unilatéral = 2 séquences consécutives D/G ou G/D.
- premier Core généré automatiquement.
- suivants : **Rematch** ou **New Shuffle**.
- Swap uniquement avant démarrage.
- 3–2–1, enchaînement automatique, Pause, reprise 3–2–1.
- séquence finale mémorisée pour le prochain Rematch.

### Cardio
- pools complets sans KB / avec KB.
- premier Cardio de la semaine sans KB, second avec KB.
- S1 : 3 séquences/tour ; S2 : 5 ; S3 : 7 ; 2 tours identiques.
- ratios exacts Phase I→IV.
- pondération de difficulté par palier P1→P10.
- tiers autorisés stricts : P1–4 débutant ; P5–7 débutant/intermédiaire ; P8–10 intermédiaire/avancé.
- aucun doublon de groupe ; paires unilatérales consécutives.
- algorithme de remplissage garantissant exactement 3/5/7 séquences sans casser les contraintes.
- Swap uniquement avant départ ; 3–2–1 ; chrono automatique ; Pause/reprise.

### Tests et retests libres
- progression +2 reps/minute : 2 → 4 → … → 20.
- palier officiel confirmé explicitement.
- retests libres depuis **Mon niveau**.
- hausse ou baisse confirmée = nouveau radar + recalibrage immédiat des familles de la capacité.
- meilleur historique conservé séparément.

### Challenges / Boss
- **Burn & Rush**.
- **Levels**.
- **Ascension**.
- Boss uniquement sur les Challenge Days.
- résultat Boss révélé à la fin.
- records personnels et anti-farming lors des replays.

### pts RUSH
- présence.
- répétitions efficaces pondérées par niveau / phase / semaine.
- bonus Core/Cardio et Flow sans Pause.
- bonus unique **niveau conquis**.
- progression de tests.
- Challenges/Boss/records.
- streak hebdomadaire exponentielle ×1,25.
- les pts RUSH acquis ne diminuent jamais.
- replay : seul un score rejouable supérieur à l'ancien peut ajouter la différence ; les bonus uniques ne sont jamais farmables.

### Mes performances
- pts RUSH.
- RUSH SCORE /100 : Régularité 40 %, Progression 25 %, Performance 20 %, Challenges 15 %.
- radar LEGS/PUSH/PULL/CORE/CARDIO.
- drill-downs : Régularité, Progression, Travail accompli, Flow, Challenges.
- records utiles.
- 21 badges significatifs.

### PWA / données
- service worker + cache shell offline.
- manifest Android/iOS.
- GitHub Actions pour Pages.
- sauvegarde `localStorage` versionnée avec migration v3→v4.
- export/import JSON depuis Réglages.
- sauvegarde séparée de la séance active pour reprise après fermeture.
- aucun compte, serveur ou dépendance externe obligatoire pour le moteur.

## Médias à fournir

### Exercices
L'app référence **171 exercices**. Pour chacun :
- boucle 2–3 répétitions : `assets/media/loops/<id>.mp4`
- frame fixe : `assets/media/frames/<id>.webp`
- vidéo Vimeo complète : renseigner l'ID dans `js/config.js > exerciseVimeo`

Fichiers :
- `assets/EXERCISE_MEDIA_CHECKLIST.csv`
- `assets/EXERCISE_MEDIA_MANIFEST.json`

### Visuels IA d'interface
Les exercices **n'utilisent pas de PNG IA**. Les visuels IA concernent l'identité, les menus, les phases, la gamification, les Boss et les badges.

Fichiers :
- `assets/VISUAL_ASSETS_CHECKLIST.md`
- `assets/VISUAL_ASSETS_MANIFEST.csv` (80 assets nommés avec chemin cible)

### J1 / communauté
Éditer `js/config.js` :
- `facebookUrl`
- les 4 `vimeoId` de l'onboarding
- `exerciseVimeo`

## Architecture

```text
index.html                         # coque SPA / PWA volontairement légère
manifest.webmanifest
sw.js
.nojekyll
.github/workflows/deploy-pages.yml
css/app.css
js/
  app.js                           # orchestration UI + événements
  config.js                        # URLs / Vimeo
  state.js                         # progression, migrations, replays, streak
  scoring.js                       # pts RUSH + statistiques
  sessionStore.js                  # reprise de séance active
  data/
    exercises.js                   # 171 exercices
    core.js                        # pool + shuffle/swap
    cardio.js                      # pools + pondérations + générateur
    tests.js
    challenges.js
    drops.js                       # double/triple drops Phase IV
    program.js                     # définition J1→J100
  engine/
    workout.js                     # compilation d'une séance en événements
    timer.js
  ui/
    components.js
    screens.js
assets/
  icons/
  media/loops/
  media/frames/
  visuals/
scripts/
  audit.mjs
  tests.mjs
  export-spec.mjs
PROGRAM_100_DAYS.csv
PROGRAM_100_DAYS.json
PROGRAM_RULES.md
AUDIT_RESULT.json
VERIFICATION_REPORT.md
SOURCE_REPORT.md
```

`index.html` est volontairement une petite coque SPA ; la logique et les écrans sont répartis dans les modules ci-dessus. La complétude du projet se juge donc sur l'ensemble du dépôt, pas sur le nombre de lignes du fichier HTML.

## Vérification automatique

```bash
npm run test
npm run audit
npm run verify
```

La suite de tests vérifie notamment :
- 100 jours et structure hebdomadaire.
- Core 7 séquences, paires et swaps.
- Cardio 3/5/7 séquences, tiers autorisés, unicité et swaps.
- règles D/G Phase IV sur plusieurs chaînes mixtes/100 % unilatérales.
- niveau -1 temporaire Phase III S3.
- pts RUSH, tests, Challenges et anti-farming.
- migration de state.

L'audit stresse **720 plans musculaires** (72 séances régulières × 10 paliers) et les générateurs aléatoires Core/Cardio.

## Ce qui reste volontairement externe ou à calibrer

Aucune donnée manquante n'est masquée : les éléments suivants nécessitent encore tes assets ou du bêta-test réel :
- les PNG/visuels IA définitifs ;
- les frames et boucles vidéos d'exercices ;
- les IDs Vimeo ;
- l'URL du groupe Facebook ;
- les cibles numériques Boss et certains coefficients pts RUSH pourront être affinés au bêta-test ;
- le timing réel des séances les plus limites devra être validé avec des pratiquants.

Le moteur du programme a été isolé afin que ces changements ne nécessitent pas de réécrire l'application.
