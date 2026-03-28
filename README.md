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
- **7 Contrées** : Forêt Éveillée, Montagnes Cristallines, Océan Abyssal, Volcan Infernal, Forêt Maudite, Ciel Éthéré, Dimension Arcane
- **35 Routes** avec des niveaux progressifs
- **7 Boss** à vaincre pour débloquer de nouvelles contrées

### ⚔️ Combat
- Combat automatique avec attaques manuelles
- Système de types (12 types) avec faiblesses/résistances
- Capture d'Échos sauvages en combat

### 🔮 Capture
- Zone de capture dédiée
- Taux de capture basé sur les HP et la rareté
- Chance de trouver des Échos **Primordiaux** (shiny)

### 👥 Collection
- **68 Échos** uniques à découvrir
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

### 📜 Quêtes
- **Quêtes quotidiennes** : 3 quêtes aléatoires chaque jour
- **Quêtes d'histoire** : Progression narrative avec prérequis
- Catégories : Capture, Niveau, Combat, Mine, Boss, Collection
- Récompenses : XP, Cristaux, Énergie, Objets

### 🏆 Succès
- 20 succès à débloquer
- Suivi de progression

### 🌍 Internationalisation
- **5 langues** : Français, English, Español, Deutsch, 日本語
- Sélection de langue dans les paramètres
- Fallback automatique vers le français

### 📖 Wiki
- Page wiki intégrée (`wiki.html`)
- Documentation complète du jeu
- Guide des Échos et mécaniques

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
├── wiki.html               # Page wiki
├── css/
│   ├── style.css           # Styles (dark fantasy theme)
│   └── wiki.css            # Styles du wiki
├── js/
│   ├── main.js             # Point d'entrée
│   ├── game.js             # Moteur principal (orchestrateur)
│   ├── combat.js           # Système de combat
│   ├── ui.js               # Interface utilisateur principale
│   ├── wiki.js             # Logique du wiki
│   ├── save.js             # Système de sauvegarde
│   ├── save-serializer.js  # Sérialisation des données
│   ├── data/               # Couche Données
│   │   ├── constants.js    # Config, types, table des faiblesses
│   │   ├── echoesData.js   # Données des 68 Échos
│   │   ├── game-config.js  # Configuration du jeu
│   │   ├── achievements-data.js # Données des succès
│   │   ├── narrative-data.js # Données narratives
│   │   ├── regions-data.js # Données des régions
│   │   ├── types.js        # Définitions de types
│   │   └── utils.js        # Fonctions utilitaires
│   ├── core/               # Couche Noyau
│   │   ├── echo.js         # Classe Echo (entité principale)
│   │   ├── eventBus.js     # Bus d'événements (pub/sub)
│   │   ├── gameLoop.js     # Boucle de jeu (RAF + delta time)
│   │   ├── interfaces.js   # Interfaces communes
│   │   └── shinyEffect.js  # Effet Primordialial
│   ├── systems/            # Couche Systèmes
│   │   ├── map.js          # Carte Canvas (rendu 2D)
│   │   ├── map-core.js     # Noyau de la carte
│   │   ├── mine.js         # Système de mine
│   │   ├── hatchery.js     # Système d'élevage
│   │   ├── narrative.js    # Système narratif
│   │   ├── quests.js       # Système de quêtes
│   │   └── regions/        # Régions spécifiques
│   │       ├── RegionRegistry.js # Registre des régions
│   │       ├── foret.js    # Forêt Éveillée
│   │       ├── montagnes.js # Montagnes Cristallines
│   │       ├── ocean.js    # Océan Abyssal
│   │       ├── volcan.js   # Volcan Infernal
│   │       ├── foret_maudite.js # Forêt Maudite
│   │       ├── ciel_ethere.js # Ciel Éthéré
│   │       └── dimension_arcane.js # Dimension Arcane
│   ├── combat/             # Modules de combat
│   │   ├── CombatEngine.js # Moteur de combat
│   │   ├── CombatAuto.js   # Combat automatique
│   │   ├── CombatCapture.js # Logique de capture
│   │   └── CombatParty.js  # Gestion de l'équipe
│   ├── modules/            # Modules du jeu
│   │   ├── game-currency.js # Gestion des monnaies
│   │   ├── game-party.js   # Gestion de l'équipe
│   │   ├── game-routes.js  # Gestion des routes
│   │   └── game-state.js   # État du jeu
│   ├── ui/                 # Modules d'interface
│   │   ├── ui-core.js      # Noyau de l'UI
│   │   ├── ui-combat.js    # Interface de combat
│   │   ├── ui-capture.js   # Interface de capture
│   │   ├── ui-party.js     # Interface de l'équipe
│   │   ├── ui-pokedex.js   # Interface du logbook
│   │   ├── ui-quests.js    # Interface des quêtes
│   │   ├── ui-routes.js    # Interface des routes
│   │   ├── ui-shop.js      # Interface du marché
│   │   └── ui-achievements.js # Interface des succès
│   └── i18n/               # Internationalisation
│       ├── i18n.js         # Système de traduction
│       ├── fr.json         # Français
│       ├── en.json         # English
│       ├── es.json         # Español
│       ├── de.json         # Deutsch
│       └── ja.json         # 日本語
├── tests/                  # Tests unitaires
│   ├── *.test.js           # Tests ESM
│   ├── *.test.cjs          # Tests CommonJS
│   ├── __mocks__/          # Mocks
│   └── helpers/            # Utilitaires de test
├── scripts/                # Scripts utilitaires
├── assets/
│   └── echos-no-bg/        # Sprites des Échos (68 images)
├── biome.json              # Configuration Biome (linting)
├── jest.config.js          # Configuration Jest
├── package.json            # Dépendances et scripts
└── .github/
    └── workflows/
        └── ci.yml          # Pipeline CI/CD
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
- **`echoesData.js`** : Base de données des 68 Échos (stats, rareté, évolution)
- **`game-config.js`** : Configuration avancée du jeu
- **`achievements-data.js`** : Données des 20 succès
- **`narrative-data.js`** : Contenu narratif et dialogues
- **`regions-data.js`** : Données des 7 régions et 35 routes
- **`types.js`** : Définitions de types TypeScript-like
- **`utils.js`** : Fonctions utilitaires (formatage, calculs de dégâts, taux de capture, génération d'UID)

#### 2. **Couche Noyau** (`js/core/`)
- **`echo.js`** : Classe `Echo` représentant une créature (stats, XP, évolution, combat). Gère la sérialisation JSON pour la sauvegarde
- **`eventBus.js`** : Système pub/sub pour la communication découplée entre modules. Définit tous les événements du jeu (`GAME_EVENTS`)
- **`gameLoop.js`** : Boucle de jeu basée sur `requestAnimationFrame` avec delta time fixe (20 ticks/sec) pour un gameplay indépendant du framerate
- **`interfaces.js`** : Interfaces communes pour la cohérence des données
- **`shinyEffect.js`** : Effet visuel pour les Échos Primordiaux

#### 3. **Couche Systèmes** (`js/systems/`)
- **`map.js`** : Rendu Canvas 2D de la carte avec animations (forêt, montagnes, océan). Gère les transitions, particules et interactions
- **`map-core.js`** : Noyau de la carte avec logique de rendu
- **`mine.js`** : Mini-jeu de mine (grille 48 tuiles, 3 outils, récompenses)
- **`hatchery.js`** : Système d'élevage (incubation, combinaison d'Échos)
- **`narrative.js`** : Système narratif avec dialogues et événements
- **`quests.js`** : Système de quêtes (quotidiennes et histoire)
- **`regions/`** : Régions spécifiques avec registre Open/Closed

#### 4. **Couche Combat** (`js/combat/`)
- **`CombatEngine.js`** : Moteur de combat principal
- **`CombatAuto.js`** : Logique de combat automatique
- **`CombatCapture.js`** : Mécanique de capture en combat
- **`CombatParty.js`** : Gestion de l'équipe de combat

#### 5. **Couche Modules** (`js/modules/`)
- **`game-currency.js`** : Gestion des monnaies (Énergie, Cristaux, Éclats)
- **`game-party.js`** : Gestion de l'équipe d'Échos
- **`game-routes.js`** : Gestion des routes et progression
- **`game-state.js`** : État global du jeu

#### 6. **Couche UI** (`js/ui/`)
- **`ui-core.js`** : Noyau de l'interface (navigation, modales, toasts)
- **`ui-combat.js`** : Interface de combat
- **`ui-capture.js`** : Interface de capture
- **`ui-party.js`** : Interface de gestion de l'équipe
- **`ui-pokedex.js`** : Interface du logbook (Pokédex)
- **`ui-quests.js`** : Interface des quêtes
- **`ui-routes.js`** : Interface de sélection des routes
- **`ui-shop.js`** : Interface du marché
- **`ui-achievements.js`** : Interface des succès

#### 7. **Couche Internationalisation** (`js/i18n/`)
- **`i18n.js`** : Système de traduction avec fallback
- **`fr.json`** : Traductions françaises
- **`en.json`** : Traductions anglaises
- **`es.json`** : Traductions espagnoles
- **`de.json`** : Traductions allemandes
- **`ja.json`** : Traductions japonaises

#### 8. **Couche Présentation**
- **`ui.js`** : Gestion complète de l'interface DOM (navigation, rendu des onglets, modales, toasts, particules)
- **`style.css`** : Thème dark fantasy avec variables CSS
- **`wiki.css`** : Styles spécifiques au wiki

#### 9. **Couche Persistance**
- **`save.js`** : Sauvegarde/chargement via `localStorage` avec sérialisation JSON. Auto-sauvegarde toutes les 30 secondes
- **`save-serializer.js`** : Sérialisation avancée des données de jeu

### Patterns de conception

| Pattern | Utilisation |
|---------|-------------|
| **Pub/Sub** | `EventBus` pour communication découplée entre modules |
| **Game Loop** | `GameLoop` avec update fixe + render par frame |
| **Singleton** | Tous les modules sont des objets uniques (`const Game = {}`) |
| **State Pattern** | État centralisé dans `Game.state` |
| **Factory** | `generateWildEcho()` pour créer des Échos sauvages |
| **MVC léger** | Game (Model) → UI (View) → EventBus (Controller) |
| **Open/Closed** | `RegionRegistry` pour ajouter des régions sans modifier le code existant |
| **Strategy** | Différents outils de mine et stratégies de combat |

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
| `ECHO_CAPTURED` | Game/Combat | UI, SaveSystem, Quests |
| `ECHO_LEVELED_UP` | Echo | Game, UI, Quests |
| `ROUTE_UNLOCKED` | Game | UI, MapSystem |
| `BOSS_DEFEATED` | Game | UI, MapSystem, Quests |
| `TICK` | Game | Systèmes divers |
| `QUEST_COMPLETED` | QuestSystem | UI |
| `LANGUAGE_CHANGED` | I18n | UI |

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
        │      ├──► QuestSystem.update()
        │      ├──► Calcul CPS
        │      ├──► Mise à jour boosts
        │      └──► Vérification succès
        │
        └──► Render (chaque frame)
               └──► UI.render()
```

## 🧪 Tests

Le projet utilise **Jest** pour les tests unitaires :

```bash
npm test
```

Structure des tests :
- `tests/*.test.js` - Tests ESM
- `tests/*.test.cjs` - Tests CommonJS
- `tests/__mocks__/` - Mocks des modules
- `tests/helpers/` - Utilitaires de test

## 🔧 Développement

### Scripts disponibles

```bash
npm test              # Lance les tests Jest
npm run lint          # Vérifie le code avec Biome
npm run lint:fix      # Corrige automatiquement les erreurs
npm run format        # Formate le code
npm run format:check  # Vérifie le formatage
```

### Linting et Formatage

Le projet utilise **Biome** pour le linting et le formatage :
- Configuration dans `biome.json`
- Règles strictes pour la qualité du code
- Formatage automatique

### CI/CD

Pipeline GitHub Actions configuré dans `.github/workflows/ci.yml` :
- Exécution des tests
- Vérification du linting
- Build automatique

## 📝 Version

**v1.0.0**

## 📜 Licence

Projet personnel - Tous droits réservés