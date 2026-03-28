# feat/issue-24 : Narration et lore

## Description

Cette PR implémente le système de narration et lore pour EchoClicker, ajoutant de la profondeur au monde du jeu avec un PNJ guide, des dialogues de boss, du lore débloquable et des cinématiques textuelles.

## Changements effectués

### Nouveaux fichiers
- `js/data/narrative-data.js` : Données de narration (dialogues du PNJ guide, dialogues de boss, lore débloquable, cinématiques)
- `js/systems/narrative.js` : Système de narration complet avec gestion des dialogues, lore, cinématiques et Logbook

### Fichiers modifiés
- `index.html` : Ajout des scripts narrative-data.js et narrative.js, ajout du bouton Logbook dans le header
- `js/game.js` : Initialisation de NarrativeSystem et ajout de l'event listener pour le bouton Logbook
- `js/save-serializer.js` : Ajout de la sérialisation/désérialisation des données de narration
- `js/save.js` : Intégration de NarrativeSystem dans la sauvegarde et le chargement
- `css/style.css` : Ajout du CSS pour le Logbook de narration

## Fonctionnalités implémentées

### 1. PNJ Guide - Le Tisseur Ancien
- Dialogues d'introduction au jeu
- Conseils et astuces contextuels (capture, équipe, évolution, boss)
- Réactions aux événements (Echo Primordial, nouvelle région, boss vaincu)

### 2. Dialogues de Boss
- Chaque boss a des dialogues avant et après le combat
- 7 boss avec dialogues uniques (Forêt, Océan, Montagnes, Volcan, Forêt Maudite, Dimension Arcane, Ciel Éthéré)

### 3. Lore débloquable
- Lore du monde (origine, Tisserands, nature des Echoes)
- Lore des régions (débloqué en explorant)
- Lore des Echoes Primordiales

### 4. Cinématiques textuelles
- Cinématique de début de jeu
- Cinématique du premier boss
- Cinématique de la région finale

### 5. Logbook
- Onglet Dialogues : historique des dialogues du Tisseur Ancien
- Onglet Lore : entrées de lore débloquées
- Onglet Cinématiques : cinématiques vues

### 6. Sauvegarde
- Progression de narration sauvegardée automatiquement
- Chargement correct au démarrage du jeu

## Critères d'acceptation vérifiés

- [x] Un PNJ guide est implémenté
- [x] Chaque boss a des dialogues
- [x] Des entrées de lore sont débloquables
- [x] Des cinématiques textuelles sont affichées aux moments clés
- [x] Un Logbook affiche tout le lore débloqué
- [x] Le système de narration est sauvegardé

## Tests

- Tous les tests existants passent (668 tests passent)
- Aucun test cassé par les modifications

## Notes

- Le système utilise l'EventBus existant pour la communication entre modules
- Le Logbook est accessible via un bouton dans le header (📕)
- Les dialogues sont affichés dans des modales
- Le CSS respecte le thème Dark Fantasy existant