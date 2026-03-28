// ============================================
// ÉchoClicker - Point d'entrée principal (Modules ES6)
// ============================================
// Ce fichier importe le module Game et initialise le jeu

import { Game } from './game.js';

// Initialiser le jeu quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    Game.init();
  });
} else {
  Game.init();
}
