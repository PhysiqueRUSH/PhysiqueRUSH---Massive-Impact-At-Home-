# SOURCE REPORT — PhysiqueRUSH Massive Impact v2.0

- Fichiers applicatifs/test principaux : **22**
- Lignes de code/source : **5 521**
- Taille code/source : **218.0 KiB**
- Fichiers totaux dans le projet : **44**
- Taille totale avant ZIP : **389.4 KiB**
- `index.html` : **22 lignes** — volontairement une coque SPA ; les écrans et le moteur sont modulaires.

## Principaux modules

- `css/app.css` — 1684 lignes — 28.5 KiB
- `js/app.js` — 1132 lignes — 34.2 KiB
- `js/ui/screens.js` — 549 lignes — 36.8 KiB
- `js/engine/workout.js` — 508 lignes — 15.9 KiB
- `js/scoring.js` — 242 lignes — 9.3 KiB
- `js/data/exercises.js` — 220 lignes — 20.0 KiB
- `js/state.js` — 201 lignes — 6.5 KiB
- `js/data/program.js` — 169 lignes — 13.6 KiB
- `scripts/tests.mjs` — 161 lignes — 9.4 KiB
- `js/data/cardio.js` — 128 lignes — 5.4 KiB
- `scripts/audit.mjs` — 96 lignes — 5.8 KiB
- `js/data/drops.js` — 76 lignes — 11.9 KiB
- `js/data/core.js` — 69 lignes — 3.3 KiB
- `js/ui/components.js` — 63 lignes — 5.5 KiB
- `js/data/challenges.js` — 54 lignes — 2.5 KiB
- `js/sessionStore.js` — 52 lignes — 1.6 KiB
- `scripts/export-spec.mjs` — 34 lignes — 2.1 KiB
- `index.html` — 22 lignes — 1.0 KiB

## Données structurées

- 100 définitions de jours exportées dans `PROGRAM_100_DAYS.json` et `.csv`.
- 171 exercices dans `js/data/exercises.js`.
- 171 entrées médias dans `assets/EXERCISE_MEDIA_MANIFEST.json`.
- 80 visuels IA d'interface/badges nommés dans `assets/VISUAL_ASSETS_MANIFEST.csv`.

## Architecture

Le fichier `index.html` est volontairement minimal : il charge la feuille de style et `js/app.js`. Le volume fonctionnel se trouve dans `js/data`, `js/engine`, `js/ui`, `state.js`, `scoring.js` et les scripts de vérification.
