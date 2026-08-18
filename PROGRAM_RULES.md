# PhysiqueRUSH – Massive Impact · Règles moteur verrouillées

Ce document décrit les règles fonctionnelles que le code doit respecter. Les tables exactes d'exercices et drops sont dans `js/data/program.js` et `js/data/drops.js`.

## 1. Parcours

- 100 jours exactement.
- Aucun jour de repos ajouté, aucun deload, aucune séance légère artificielle.
- Un jour futur reste verrouillé tant que le jour précédent n'est pas validé.
- Un ancien jour validé peut être rejoué ; son nouveau résultat remplace l'ancien résultat affiché.
- Les pts RUSH déjà acquis ne diminuent jamais et un replay ne peut pas être utilisé pour farmer.
- Progression globale : 1 jour validé = 1 % du programme accompli.

### Découpage
- J1 : onboarding.
- J2–J6 : tests initiaux.
- J7–J27 : Phase I.
- J28–J48 : Phase II.
- J49–J53 : tests intermédiaires.
- J54–J74 : Phase III.
- J75–J95 : Phase IV.
- J96–J100 : tests finaux.

### Structure hebdomadaire universelle
1. LEGS + CORE
2. PUSH + CARDIO
3. PULL + CORE
4. ARMS + CARDIO
5. QUADRICEPS + ISCHIOS + CORE
6. PUSH + PULL
7. CHALLENGE DAY

## 2. Philosophie S1 / S2 / S3

- S1 = base / installation.
- S2 = pic de volume.
- S3 = pic de densité.
- S3 peut avoir moins de répétitions efficaces théoriques que S2 si la densité est clairement supérieure.

## 3. Timing

- Cible forte : environ 15 minutes par jour.
- Un léger dépassement exceptionnel est accepté.
- Bloc musculaire nominal : 7 min 30 lorsqu'un Core/Cardio suit.
- Si 7 min 30 est atteint au milieu d'une série ou d'une drop-chain, terminer la série/chaîne en cours.
- Le Core/Cardio n'est jamais amputé pour compenser un léger dépassement musculaire.
- PUSH/PULL est un bloc plein d'environ 15 minutes.
- Core = exactement 7:00 hors pauses utilisateur.
- Cardio : S1=6:00, S2=6:40, S3=7:00 hors pauses utilisateur.

## 4. Intensité musculaire

- Toutes les séries musculaires vont à l'échec technique total.
- Aucun RIR demandé.
- Balistique/sauts : échec = impossibilité de maintenir l'intention explosive, la technique ou une réception sûre.
- Core/Cardio sont les exceptions : critères objectifs de temps/séquence.

## 5. Répétitions efficaces

À chaque passage musculaire terminé, l'utilisateur touche un seul bouton :

`5+   4   3   2   1`

- 5+ crédite 5 répétitions efficaces.
- Aucun bouton 0.
- Isométrie : bouton ÉCHEC dédié.
- Les codes internes RépFIVE ne sont pas affichés pendant l'effort ; l'UI parle de « répétitions efficaces ».

## 6. Niveaux officiels et niveaux cachés

- Radar officiel : LEGS / PUSH / PULL / CORE / CARDIO, P1→P10.
- Le radar ne change qu'après validation d'un test/retest.
- Chaque famille d'exercices possède en plus un niveau caché autonome.
- `TROP FACILE ?` = +1 niveau caché.
- `TROP DUR ?` = -1 niveau caché.
- Les boutons apparaissent dans cet ordre : TROP FACILE ? puis TROP DUR ?.
- Ils sont absents des Tests, Challenges, Core et Cardio.
- Dans une famille comportant plusieurs exercices, ils ne concernent que l'exercice le plus difficile du bloc.
- Appui → confirmation → nouveau niveau → reset de cette famille uniquement.
- Les autres familles de la séance conservent leurs résultats/progression.
- Répétitions effectuées avant reset : restent dans le total « répétitions efficaces du jour », mais zéro pt RUSH.
- Nouveau niveau caché persistant après confirmation.

## 7. Tests de niveau

Ordre : LEGS → PUSH → PULL → CORE → CARDIO.

- P1=2 reps, P2=4, …, P10=20.
- Une minute par palier.
- Dernier palier complet = résultat.
- LEGS : Bulgarian Split Squat BW.
- PUSH : Hand Release Push-Up.
- PULL : Row unilatéral KB coude au corps.
- CORE : Tuck V-Ups.
- CARDIO : Burpees.
- Unilatéraux : côté 1 complet puis côté 2 dans la même minute.
- Un retest libre est accessible depuis Mon niveau.
- Le résultat libre n'est appliqué qu'après confirmation.
- Une baisse comme une hausse devient immédiatement le nouveau palier officiel et rebase les familles associées.

## 8. Phase I — ÉCHEC

### Famille standard
- S1 : 3 séries, repos bilatéral 120 s ; unilatéral D→G puis 60 s.
- S2 : 4 séries, repos bilatéral 60 s ; unilatéral D→G puis 30 s.
- S3 : 3 séries, repos bilatéral 30 s ; unilatéral D→G puis 15 s.

### ARMS / QUAD-HAM
- S1 : 2 séries par muscle, 120 s entre séries ; travail muscle par muscle.
- S2 : 3 séries par muscle, 60 s ; travail muscle par muscle.
- S3 : 2 supersets antagonistes, environ 30 s entre rounds.
- ARMS : Biceps avant Triceps en S1/S2.
- QUAD-HAM : Quadriceps avant Ischios en S1/S2.

### PUSH/PULL
- S3 antagoniste sur le bloc plein.

## 9. Phase II — TEMPO

### S1 HOLD
- 4 séries standard.
- 2 s isométrie.
- repos 60 s bilatéral / 30 s unilatéral après D/G.
- cible fraîche ~6–12 reps.

### S2 SLOW
- 5 séries standard.
- 4 s excentrique.
- repos 30 s bilatéral / aucun repos supplémentaire après D/G.
- cible fraîche ~6–10 reps.

### S3 DRIVE
- 4 séries standard.
- intention concentrique maximale.
- repos 20 s bilatéral / 10 s unilatéral après D/G.
- cible fraîche ~6–15 reps.

### ARMS / QUAD-HAM
- S1 : 3 séries par muscle, 60 s, séquentiel.
- S2 : 4 séries par muscle, 30 s, séquentiel.
- S3 : 3 supersets antagonistes.

## 10. Phase III — REST-PAUSE

- S1 : activation à l'échec + 5 relances, 20 s.
- S2 : activation + 7 relances, 20 s.
- S3 : exercice temporairement 1 niveau plus facile + 5 relances, 10 s.
- Si niveau minimal : conserver l'exercice minimal.
- La baisse S3 est temporaire et ne modifie pas le hidden permanent.
- Activation S1/S2 ~6–15 ; S3 ~12–20.
- Unilatéral : alternance des passages D/G sans repos programmé supplémentaire.

### ARMS / QUAD-HAM
- S1 : 1 activation +4 relances par muscle.
- S2 : 1+5.
- S3 : niveau -1, relay antagoniste sans repos programmé, 1+4.

### PUSH/PULL
- S3 : niveau -1, 1+5 par groupe, relay antagoniste sans repos programmé.

Les jours Phase II/III réutilisent les familles/mappings des jours correspondants de Phase I ; la méthode change, pas la logique des familles.

## 11. Phase IV — DROP SYSTEM

### Règles universelles
- Chaque étage va à l'échec technique.
- Ne jamais couper une drop-chain par le côté opposé ou un antagoniste.
- Chaîne 100 % unilatérale : chaîne complète côté de départ, puis chaîne complète côté opposé ; même côté de départ d'un drop-set au suivant.
- Chaîne mixte uni/bilatérale : alterner le côté de départ entre drop-sets.
- Plusieurs étages unilatéraux consécutifs : terminer ces étages sur un côté avant l'autre.

### Architecture LEGS
- S1 : A1 + A2.
- S2 : A2 + A3.
- S3 : A1 + A3.

### Architecture PUSH
- S1 : D10 + D11.
- S2 : D11 + D12.
- S3 : D10 + D12.

### S1
- J75/J76 : 2 double-drops/famille, 60 s entre mêmes drops, 30 s transition famille.
- J77 PULL : 4 double-drops ; repos 45 s bilatéral / 30 s mixte / 15 s 100 % unilatéral.
- J78 ARMS : 3 rounds Biceps drop → Triceps drop → 30 s après rounds 1/2.
- J79 QUAD-HAM : 3 rounds Quad → Ham → 30 s après rounds 1/2.
- J80 PUSH/PULL : 4 Push drops + 4 Pull drops, bloc plein 15 min.

### S2
- Legs/Push : 3 double-drops/famille, 30 s.
- PULL : 5 double-drops, 30/20/10 s selon bilatéral/mixte/uni.
- ARMS / QUAD-HAM : 4 rounds, 15 s.
- PUSH/PULL : 5 rounds antagonistes, aucun repos programmé.

### S3
- Legs/Push : 2 triple-drops/famille, 15 s entre les deux, transition immédiate entre familles.
- PULL : 3 triple-drops, 10 s.
- ARMS / QUAD-HAM : 2 rounds antagonistes, 10 s.
- PUSH/PULL : 3 rounds antagonistes, aucun repos programmé.

Les tables exactes P1→P10 sont verrouillées dans `js/data/drops.js`.

## 12. Core

- Pool de 24 tirages verrouillés.
- 7 séquences de 60 s exactement.
- Bilatéral = 1 séquence ; paire unilatérale = 2 séquences consécutives.
- Aucun tirage de pool dupliqué dans un Shuffle.
- Premier Core du programme : auto-généré.
- À partir du suivant : Rematch ou New Shuffle, aucun présélectionné.
- Swap uniquement avant démarrage.
- Swap bilatéral → autre bilatéral non présent.
- Swap paire → autre paire ou 2 bilatéraux non présents.
- D/G d'une paire tiré aléatoirement.
- 3–2–1 avant démarrage ; ensuite automatique.
- Pause accessible ; reprise 3–2–1 au temps restant.
- Séquence réellement réalisée mémorisée pour Rematch.

## 13. Cardio

### Affectation hebdomadaire
- Premier Cardio = sans KB.
- Second Cardio = avec KB.

### Format
- S1 CARDIO60 : 3 séquences × 2 tours = 6:00.
- S2 CARDIO40 : 5 × 2 = 6:40.
- S3 CARDIO30 : 7 × 2 = 7:00.
- Tour 2 identique au Tour 1.

### Ratios travail/repos
- Phase I : 30/30 ; 20/20 ; 15/15.
- Phase II : 35/25 ; 23/17 ; 17/13.
- Phase III : 40/20 ; 27/13 ; 20/10.
- Phase IV : 45/15 ; 30/10 ; 22/8.

### Paliers
- P1–P4 : débutant uniquement.
- P5 : 70 % débutant / 30 % intermédiaire.
- P6 : 50/50.
- P7 : 30/70.
- P8 : 70 % intermédiaire / 30 % avancé.
- P9 : 50/50.
- P10 : 30 % intermédiaire / 70 % avancé.
- À l'intérieur d'un pool : difficulté cible ×3, rang adjacent ×2, reste ×1.
- Aucun exercice/groupe dupliqué dans un circuit.
- Unilatéral = deux séquences D/G consécutives.
- Swap uniquement avant le départ ; même logique de pondération et même coût de séquence.
- 3–2–1 puis automatique ; Pause accessible ; reprise 3–2–1.

## 14. Challenges / Boss

- 12 Challenge Days : 3 formats répétés sur les 4 phases.
- Boss uniquement sur les Challenge Days.
- Aucun indicateur Boss pendant une séance ordinaire.
- Résultat Boss révélé en fin de Challenge.

### Burn & Rush
- 3 tours.
- Push → Pull → Legs.
- Burn isométrique jusqu'à 60 s max ou échec → Rush immédiatement à l'échec.
- Score = total reps Rush.

### Levels
- 15 min.
- 4 exercices en boucle.
- Débutant +1 rep par niveau ; Intermédiaire +2 ; Avancé +3.

### Ascension
- 15 min.
- Step-Up Goblet alterné.
- cibles 100 / 200 / 300 selon tier.
- toute pause impose 5 × palier PUSH pompes ; le chrono continue.

## 15. pts RUSH

### Sources
- Présence : +100 pts à la première validation d'un jour.
- Musculaire : répétitions efficaces ×2 × coefficient niveau × coefficient phase × coefficient semaine.
- Coefficient niveau : `0,75 + 0,05 × niveau` → P1 .80 à P10 1.25.
- Phases : I 1.00 ; II 1.05 ; III 1.10 ; IV 1.15.
- Semaines : S1 1.00 ; S2 1.05 ; S3 1.10.
- Core/Cardio terminé : +50 ; sans Pause : +25 Flow.
- Niveau conquis : `25 × nouveau niveau`, une seule fois par famille/niveau supérieur.
- Test planifié : +100 +20×palier +150×palier meilleur nouvellement gagné.
- Retest libre : +150 par nouveau meilleur palier gagné ; pas de bonus de présence.
- Challenge : +100 + performance `300×ratio` plafonnée à 150 % +300 BossDown +100 record.

### Streak
- Une validation par jour calendaire maximum pour faire avancer la streak.
- Bonus chaque bloc de 7 jours : +100 puis bonus précédent ×1,25.
- Une interruption remet le cycle de bonus à sa base, sans retirer les pts acquis.

### Replay / anti-farming
- Presence/streak jamais redonnées pour le même jour.
- Seule la différence positive entre nouveau score rejouable et meilleur score déjà payé est ajoutée.
- Bonus uniques (niveau conquis, etc.) ne sont pas farmables.
- Les pts RUSH acquis ne diminuent jamais.

## 16. Mes performances

- pts RUSH.
- RUSH SCORE /100 : Régularité 40 %, Progression 25 %, Performance 20 %, Challenges 15 %.
- Radar officiel actuel et comparaison initiale.
- Régularité : streak actuelle, meilleure streak, validations.
- Progression : paliers initial/intermédiaire/final/actuel/meilleur.
- Travail accompli : répétitions efficaces globales et par groupe.
- Flow : Core/Cardio terminés, sans Pause et séquences cumulées.
- Challenges : historique Boss.
- Records utiles uniquement.
- Badges : Assiduité, Progression, Performance, Challenges, 100 jours.

## 17. UX séance

- Codes internes A1/D10/etc. invisibles.
- Deux encadrés distincts mais collés pour bloc principal et bloc secondaire.
- Schéma global vertical et stable.
- Noms exercices + frame fixe + flèches + repos.
- Répétitions de cycle représentées par boucle visuelle.
- Zone active sous le schéma : exercice courant en grand + boucle auto ; uniquement la suite de la chaîne en petit.
- Toutes les boucles visibles sont autoplay, muettes, loop, 2–3 répétitions.
- Clic sur boucle → vidéo Vimeo complète.
- Core/Cardio : exercice suivant et chrono automatiques.
- Repos musculaire : démarre automatiquement après saisie des reps ; signal/vibration sur les 3 dernières secondes.

## 18. Direction artistique

- Semi-réalisme comics adulte premium.
- Noir / anthracite / rouge.
- Un seul personnage masculin récurrent.
- Ultra-athlétique, style men’s physique.
- Visage non visible, capuche relevée.
- Sweat à capuche sans manches avec logo PhysiqueRUSH.
- Short training, chaussures noires sobres.
- Kettlebell rouge.
- Aucun PNG d'exercice : frame/loop issues de la vidéo réelle.
