// ============================================
// EchoClicker - Constantes du jeu (Agregateur)
// ============================================
// Les donnees sont reparties dans des fichiers dedies :
//   - types.js          : TYPES, TYPE_CHART, RARITY_COLORS
//   - game-config.js    : GAME_CONFIG, SHOP
//   - regions-data.js   : REGIONS
//   - achievements-data.js : ACHIEVEMENTS

import { ECHOES_DB } from './echoesData.js';
import { REGIONS } from './regions-data.js';

// Helpers
export function getEchoById(id) {
  return ECHOES_DB.find((e) => e.id === id);
}
export function getRegionById(id) {
  return REGIONS.find((r) => r.id === id);
}
