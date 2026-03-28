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

// Lookup Maps pour O(1) au lieu de O(n)
const ECHOES_MAP = new Map(ECHOES_DB.map((e) => [e.id, e]));
const REGIONS_MAP = new Map(REGIONS.map((r) => [r.id, r]));

// Helpers - O(1) lookup via Map
export function getEchoById(id) {
  return ECHOES_MAP.get(id);
}
export function getRegionById(id) {
  return REGIONS_MAP.get(id);
}
