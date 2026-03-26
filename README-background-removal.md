# Suppression de Background des Images

Ce script permet de retirer automatiquement le background de toutes les images générées dans le dossier `assets/echos/`.

## Installation

Les dépendances ont déjà été installées. Le script utilise `@imgly/background-removal` pour la suppression de fond.

## Utilisation

### Traiter toutes les images

```bash
node remove-backgrounds.js
```

Cela va :
- Scanner le dossier `assets/echos/` pour toutes les images PNG
- Créer un nouveau dossier `assets/echos-no-bg/` avec les images sans background
- Afficher le progrès et le résumé des traitements

### Traiter une seule image

```bash
node remove-backgrounds.js --file=echo_001.png
```

### Changer la qualité du modèle

Le script supporte 3 modèles de qualité :
- `small` : Plus rapide, qualité moindre
- `medium` : Équilibre vitesse/qualité (défaut)
- `large` : Plus lent, meilleure qualité

```bash
node remove-backgrounds.js --model=large
```

## Options de ligne de commande

- `--file=<nom_fichier>` : Traiter un seul fichier spécifique
- `--model=<small|medium|large>` : Changer le modèle de qualité

## Structure des fichiers

```
assets/
├── echos/              # Images originales (avec background)
│   ├── echo_001.png
│   ├── echo_001_shiny.png
│   └── ...
└── echos-no-bg/        # Images sans background (créé automatiquement)
    ├── echo_001.png
    ├── echo_001_shiny.png
    └── ...
```

## Intégration avec le jeu

Pour utiliser les images sans background dans votre jeu :

1. **Option 1** : Remplacer les fichiers originaux
   ```bash
   cp assets/echos-no-bg/* assets/echos/
   ```

2. **Option 2** : Mettre à jour les chemins dans le code
   Modifiez les références dans `js/data/echoesData.js` pour pointer vers `assets/echos-no-bg/`

## Exemple de sortie

```
🚀 Démarrage de la suppression des backgrounds...

📁 60 images trouvées à traiter

🎨 Traitement: echo_001.png
✅ Sauvegardé: echo_001.png
🎨 Traitement: echo_001_shiny.png
✅ Sauvegardé: echo_001_shiny.png
...

📊 Résumé:
✅ Succès: 60
❌ Échecs: 0
📁 Images sans background dans: ./assets/echos-no-bg/

💡 Pour utiliser les images sans background:
   - Remplacez les fichiers dans assets/echos/ par ceux de ./assets/echos-no-bg/
   - Ou mettez à jour les chemins dans votre code pour pointer vers le nouveau dossier

🎉 Traitement terminé!
```

## Notes

- Le traitement peut prendre du temps selon le nombre d'images et la qualité choisie
- Les images originales ne sont jamais modifiées
- Le script gère automatiquement les erreurs et continue avec les autres images
- Une pause de 500ms est ajoutée entre chaque traitement pour éviter la surcharge