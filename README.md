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
├── index.html              # Page principale (SPA)
├── css/
│   └── style.css           # Styles (dark fantasy theme)
├── js/
│   ├── data/               # Couche Données
│   │   ├── constants.js    # Config, types, table des faiblesses
│   │   ├── echoesData.js   # Données des 30 Échos
│   │   └── utils.js        # Fonctions utilitaires
│   ├── core/               # Couche Noyau
│   │   ├── echo.js         # Classe Echo (entité principale)
│   │   ├── eventBus.js     # Bus d'événements (pub/sub)
│   │   └── gameLoop.js     # Boucle de jeu (RAF + delta time)
│   ├── systems/            # Couche Systèmes
│   │   ├── map.js          # Carte Canvas (rendu 2D)
│   │   ├── mine.js         # Système de mine
│   │   └── hatchery.js     # Système d'élevage
│   ├── combat.js           # Système de combat
│   ├── game.js             # Moteur principal (orchestrateur)
│   ├── save.js             # Système de sauvegarde (localStorage)
│   └── ui.js               # Interface utilisateur (DOM)
└── README.md
```

## 🏗️ Architecture

### Vue d'ensemble

Le projet suit une **architecture modulaire événementielle** avec séparation claire des responsabilités :

```
┌─────────────────────────────────────────────────────────────┐
│                      index.html (SPA)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Game (Orchestrateur)                      │
│         État global • Initialisation • Boucle principale     │
└─────────────────────────────────────────────────────────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
   │ Combat  │   │   UI    │   │  Mine   │   │Hatchery │
   │ System  │   │ Manager │   │ System  │   │ System  │
   └─────────┘   └─────────┘   └─────────┘   └─────────┘
        │              │              │              │
        └──────────────┴──────────────┴──────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │        EventBus (Pub/Sub)      │
              │   Communication inter-modules  │
              └───────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   ┌─────────┐         ┌──────────┐         ┌──────────┐
   │  Echo   │         │SaveSystem│         │MapSystem │
   │ (Class) │         │(Storage) │         │(Canvas)  │
   └─────────┘         └──────────┘         └──────────┘
```

### Couches de l'architecture

#### 1. **Couche Données** (`js/data/`)
- **`constants.js`** : Configuration globale, types élémentaires (12 types), table des faiblesses/résistances, paramètres de jeu
- **`echoesData.js`** : Base de données des 30 Échos (stats, rareté, évolution)
- **`utils.js`** : Fonctions utilitaires (formatage, calculs de dégâts, taux de capture, génération d'UID)

#### 2. **Couche Noyau** (`js/core/`)
- **`echo.js`** : Classe `Echo` représentant une créature (stats, XP, évolution, combat). Gère la sérialisation JSON pour la sauvegarde
- **`eventBus.js`** : Système pub/sub pour la communication découplée entre modules. Définit tous les événements du jeu (`GAME_EVENTS`)
- **`gameLoop.js`** : Boucle de jeu basée sur `requestAnimationFrame` avec delta time fixe (20 ticks/sec) pour un gameplay indépendant du framerate

#### 3. **Couche Systèmes** (`js/systems/`)
- **`map.js`** : Rendu Canvas 2D de la carte avec animations (forêt, montagnes, océan). Gère les transitions, particules et interactions
- **`mine.js`** : Mini-jeu de mine (grille 48 tuiles, 3 outils, récompenses)
- **`hatchery.js`** : Système d'élevage (incubation, combinaison d'Échos)

#### 4. **Couche Logique Métier**
- **`combat.js`** : Système de combat automatique avec attaques manuelles. Gère les ennemis, boss, captures et progression
- **`game.js`** : Moteur principal qui orchestre tous les systèmes. Contient l'état global du jeu et la logique de progression

#### 5. **Couche Présentation**
- **`ui.js`** : Gestion complète de l'interface DOM (navigation, rendu des onglets, modales, toasts, particules)
- **`style.css`** : Thème dark fantasy avec variables CSS

#### 6. **Couche Persistance**
- **`save.js`** : Sauvegarde/chargement via `localStorage` avec sérialisation JSON. Auto-sauvegarde toutes les 30 secondes

### Patterns de conception

| Pattern | Utilisation |
|---------|-------------|
| **Pub/Sub** | `EventBus` pour communication découplée entre modules |
| **Game Loop** | `GameLoop` avec update fixe + render par frame |
| **Singleton** | Tous les modules sont des objets uniques (`const Game = {}`) |
| **State Pattern** | État centralisé dans `Game.state` |
| **Factory** | `generateWildEcho()` pour créer des Échos sauvages |
| **MVC léger** | Game (Model) → UI (View) → EventBus (Controller) |

### Flux de données

```
Clic utilisateur
      │
      ▼
  Game.click()
      │
      ├──► Game.state.energy += power
      ├──► EventBus.emit(CLICK)
      │         │
      │         ├──► UI.spawnParticle()
      │         └──► Combat.playerClick()
      │
      └──► UI.updateCurrencies()
```

### Système d'événements

L'`EventBus` permet une communication découplée. Principaux événements :

| Événement | Émetteur | Consommateurs |
|-----------|----------|---------------|
| `CLICK` | Game | UI, Combat |
| `COMBAT_START` | Combat | UI |
| `ECHO_CAPTURED` | Game/Combat | UI, SaveSystem |
| `ECHO_LEVELED_UP` | Echo | Game, UI |
| `ROUTE_UNLOCKED` | Game | UI, MapSystem |
| `BOSS_DEFEATED` | Game | UI, MapSystem |
| `TICK` | Game | Systèmes divers |

### Boucle de jeu

```
requestAnimationFrame
        │
        ▼
  GameLoop._loop()
        │
        ├──► Update (fixe: 20 ticks/sec)
        │      ├──► Revenu passif
        │      ├──► Combat.update()
        │      ├──► Hatchery.update()
        │      ├──► Calcul CPS
        │      ├──► Mise à jour boosts
        │      └──► Vérification succès
        │
        └──► Render (chaque frame)
               └──► UI.render()
```

## 📝 Version

**v0.2.0 Alpha**

## 📜 Licence

Projet personnel - Tous droits réservés