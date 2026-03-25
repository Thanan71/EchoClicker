# ⚡ ÉchoClicker : Liens Éternels

Un jeu clicker/collector dans un univers dark fantasy où vous capturez et collectionnez des créatures magiques appelées **Échos**.

## 🎮 Jouer

Lancez un serveur local et ouvrez `index.html` :

```bash
python3 -m http.server 8080
# Puis ouvrez http://localhost:8080 dans votre navigateur
```

## ✨ Fonctionnalités

### 🗺️ Exploration
- **3 Contrées** : Forêt Éveillée, Montagnes Cristallines, Océan Abyssal
- **15 Routes** avec des niveaux progressifs
- **3 Boss** à vaincre pour débloquer de nouvelles contrées

### ⚔️ Combat
- Combat automatique avec attaques manuelles
- Système de types (12 types) avec faiblesses/résistances
- Capture d'Échos sauvages en combat

### 🔮 Capture
- Zone de capture dédiée
- Taux de capture basé sur les HP et la rareté
- Chance de trouver des Échos **Primordiaux** (shiny)

### 👥 Collection
- **30 Échos** uniques à découvrir
- Système d'évolution
- Équipe de 6 Échos + réserves illimitées
- Logbook pour suivre les captures

### 🥚 Élevage
- Incubateur avec 4 slots
- Combinez deux Échos pour créer un œuf
- Temps d'incubation basé sur la rareté
- Accélération possible avec des cristaux

### ⛏️ Mine Souterraine
- Grille de 48 tuiles à creuser
- 3 outils : Pioche, Bombe, Radar
- Récompenses : Cristaux, Éclats, Or

### 🏪 Marché des Esprits
- Achetez des Liens, Boosts et Objets
- Monnaies : Énergie, Cristaux, Éclats

### 🏆 Succès
- 20 succès à débloquer
- Suivi de progression

### 💾 Sauvegarde
- Sauvegarde automatique toutes les 30 secondes
- Export/Import de sauvegarde
- Stockage local (localStorage)

## 🎨 Types d'Échos

| Type | Emoji | Couleur |
|------|-------|---------|
| Feu | 🔥 | Orange |
| Glace | ❄️ | Bleu clair |
| Vent | 🌪️ | Vert menthe |
| Ombre | 🌑 | Violet foncé |
| Lumière | ☀️ | Jaune |
| Flore | 🌿 | Vert |
| Foudre | ⚡ | Jaune doré |
| Cristal | 💎 | Gris clair |
| Chaos | 🌀 | Rouge orangé |
| Océan | 🌊 | Bleu |
| Terre | 🪨 | Marron |
| Arcane | ✨ | Violet |

## 🛠️ Structure du Projet

```
EchoClicker/
├── index.html          # Page principale
├── css/
│   └── style.css       # Styles (dark fantasy theme)
├── js/
│   ├── data/
│   │   ├── constants.js    # Config, types, table des faiblesses
│   │   ├── echoesData.js   # Données des 30 Échos
│   │   └── utils.js        # Fonctions utilitaires
│   ├── core/
│   │   ├── echo.js         # Classe Echo
│   │   ├── eventBus.js     # Système d'événements
│   │   └── gameLoop.js     # Boucle de jeu (RAF)
│   ├── systems/
│   │   ├── mine.js         # Système de mine
│   │   └── hatchery.js     # Système d'élevage
│   ├── combat.js           # Système de combat
│   ├── game.js             # Moteur principal
│   ├── save.js             # Système de sauvegarde
│   └── ui.js               # Interface utilisateur
└── README.md
```

## 📝 Version

**v0.2.0 Alpha**

## 📜 Licence

Projet personnel - Tous droits réservés