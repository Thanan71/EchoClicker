// ============================================
// ÉchoClicker - Constantes du jeu
// ============================================

const TYPES = {
    FEU:     { name: 'Feu',     color: '#ff6b35', emoji: '🔥' },
    GLACE:   { name: 'Glace',   color: '#74b9ff', emoji: '❄️' },
    VENT:    { name: 'Vent',    color: '#a8e6cf', emoji: '🌪️' },
    OMBRE:   { name: 'Ombre',   color: '#6c5ce7', emoji: '🌑' },
    LUMIERE: { name: 'Lumière', color: '#ffeaa7', emoji: '☀️' },
    FLORE:   { name: 'Flore',   color: '#55a630', emoji: '🌿' },
    FOUDRE:  { name: 'Foudre',  color: '#fdcb6e', emoji: '⚡' },
    CRISTAL: { name: 'Cristal', color: '#dfe6e9', emoji: '💎' },
    CHAOS:   { name: 'Chaos',   color: '#e17055', emoji: '🌀' },
    OCEAN:   { name: 'Océan',   color: '#0984e3', emoji: '🌊' },
    TERRE:   { name: 'Terre',   color: '#b8860b', emoji: '🪨' },
    ARCANE:  { name: 'Arcane',  color: '#a855f7', emoji: '✨' }
};

// Table des faiblesses/résistances (multiplicateur de dégâts)
const TYPE_CHART = {
    FEU:     { strong: ['FLORE','GLACE','CRISTAL'], weak: ['OCEAN','TERRE','CHAOS'] },
    GLACE:   { strong: ['VENT','FLORE','TERRE'],    weak: ['FEU','FOUDRE','ARCANE'] },
    VENT:    { strong: ['FLORE','ARCANE'],          weak: ['FOUDRE','CRISTAL','TERRE'] },
    OMBRE:   { strong: ['LUMIERE','ARCANE'],        weak: ['LUMIERE','FOUDRE','CHAOS'] },
    LUMIERE: { strong: ['OMBRE','CHAOS'],           weak: ['OMBRE','CRISTAL','TERRE'] },
    FLORE:   { strong: ['OCEAN','TERRE','CRISTAL'], weak: ['FEU','GLACE','VENT'] },
    FOUDRE:  { strong: ['OCEAN','VENT','GLACE'],    weak: ['TERRE','CRISTAL','CHAOS'] },
    CRISTAL: { strong: ['VENT','LUMIERE','ARCANE'], weak: ['FEU','TERRE','CHAOS'] },
    CHAOS:   { strong: ['ARCANE','OMBRE','CRISTAL'],weak: ['LUMIERE','FLORE','OCEAN'] },
    OCEAN:   { strong: ['FEU','TERRE','CHAOS'],     weak: ['FLORE','FOUDRE','GLACE'] },
    TERRE:   { strong: ['FEU','FOUDRE','CRISTAL'],  weak: ['OCEAN','FLORE','GLACE'] },
    ARCANE:  { strong: ['GLACE','OMBRE','CHAOS'],   weak: ['FLORE','VENT','CRISTAL'] }
};

// Couleurs de rareté
const RARITY_COLORS = {
    common:    '#a0a0c0',
    uncommon:  '#55a630',
    rare:      '#3b82f6',
    epic:      '#a855f7',
    legendary: '#f59e0b',
    mythical:  '#ec4899'
};

// Paramètres de jeu
const GAME_CONFIG = {
    TICK_RATE: 50,              // ms entre chaque tick (20 ticks/sec)
    PASSIVE_BASE: 0.1,          // Énergie passive de base par tick
    CPS_WINDOW: 5000,           // Fenêtre de calcul du CPS (ms)
    MAX_PARTY: 6,               // Max d'Échos en équipe
    CAPTURE_BASE_RATE: 30,      // Taux de capture de base (%)
    CAPTURE_HP_BONUS: 40,       // Bonus de capture quand HP bas (%)
    PRIMORDIAL_CHANCE: 0.005,   // 0.5% de chance Primordial
    XP_BASE: 50,                // XP de base pour niveau 1
    XP_GROWTH: 1.15,            // Croissance XP par niveau
    KILLS_FOR_ROUTE: 10,        // Kills pour débloquer route suivante
    AUTO_SAVE_INTERVAL: 30000,  // Auto-sauvegarde (ms)
    ENERGY_PER_CLICK_BASE: 1,   // Énergie par clic de base
    COMBAT_CLICK_MULTIPLIER: 2, // Multiplicateur dégâts clic en combat
    MAX_LOG_ENTRIES: 50         // Max entrées dans le log de combat
};