# Assets PhysiqueRUSH

L'application fonctionne sans médias définitifs grâce à des fallbacks emoji/texte.

## Exercices
Pour chaque ID présent dans `EXERCISE_MEDIA_MANIFEST.json` :
- `media/loops/<id>.mp4` : boucle autoplay muette de 2–3 répétitions ;
- `media/frames/<id>.webp` : frame fixe utilisée dans le schéma vertical ;
- vidéo Vimeo complète : ID dans `../js/config.js`.

Il n'y a **pas de PNG IA d'exercice**.

## Visuels IA
Les 80 visuels d'identité/interface sont listés dans `VISUAL_ASSETS_MANIFEST.csv`. Direction artistique : semi-réalisme comics adulte, noir/anthracite/rouge, personnage masculin unique ultra-athlétique, visage caché sous capuche, sweat sans manches PhysiqueRUSH, short training, chaussures noires, kettlebell rouge.

Les formats `.webp` proposés dans le manifeste sont recommandés pour le poids. Les masters peuvent être produits en PNG transparent, puis exportés en WebP pour l'app.

## Identité de marque intégrée
Le symbole officiel PhysiqueRUSH (logo seul rouge métallique) est intégré dans `brand/physiquerush-symbol-master.png` et décliné dans `icons/` pour Android, iOS et navigateur. Les variantes maskable/iOS utilisent un fond anthracite uniquement pour respecter les contraintes des lanceurs mobiles ; le symbole lui-même reste inchangé.
