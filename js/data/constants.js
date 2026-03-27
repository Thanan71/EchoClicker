// ============================================
// EchoClicker - Constantes du jeu (Agregateur)
// ============================================
// Les donnees sont reparties dans des fichiers dedies :
//   - types.js          : TYPES, TYPE_CHART, RARITY_COLORS
//   - game-config.js    : GAME_CONFIG, SHOP
//   - regions-data.js   : REGIONS
//   - achievements-data.js : ACHIEVEMENTS

// Helpers
function getEchoById(id) { return ECHOES_DB.find(e=>e.id===id); }
function getRegionById(id) { return REGIONS.find(r=>r.id===id); }
