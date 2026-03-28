// ============================================
// ÉchoClicker - Configuration du jeu & Boutique
// ============================================

// Paramètres de jeu
export const GAME_CONFIG = {
    TICK_RATE: 50, // ms entre chaque tick (20 ticks/sec)
    PASSIVE_BASE: 0.1, // Énergie passive de base par tick
    CPS_WINDOW: 5000, // Fenêtre de calcul du CPS (ms)
    MAX_PARTY: 6, // Max d'Échos en équipe
    CAPTURE_BASE_RATE: 30, // Taux de capture de base (%)
    CAPTURE_HP_BONUS: 40, // Bonus de capture quand HP bas (%)
    PRIMORDIAL_CHANCE: 0.005, // 0.5% de chance Primordial
    XP_BASE: 50, // XP de base pour niveau 1
    XP_GROWTH: 1.15, // Croissance XP par niveau
    KILLS_FOR_ROUTE: 10, // Kills pour débloquer route suivante
    AUTO_SAVE_INTERVAL: 30000, // Auto-sauvegarde (ms)
    ENERGY_PER_CLICK_BASE: 1, // Énergie par clic de base
    COMBAT_CLICK_MULTIPLIER: 2, // Multiplicateur dégâts clic en combat
    MAX_LOG_ENTRIES: 50, // Max entrées dans le log de combat
    MINE_ENERGY_REGEN_RATE: 1, // Énergie régénérée par tick de mine
    MINE_ENERGY_REGEN_INTERVAL: 30000, // Intervalle de régénération (ms) = 30 secondes
};

// === BOUTIQUE ===
export const SHOP = {
    links: [
        { id: 'l10', name: '10 Liens', icon: '🔗', price: 50, currency: 'energy', amount: 10 },
        { id: 'l50', name: '50 Liens', icon: '🔗', price: 200, currency: 'energy', amount: 50 },
        { id: 'l100', name: '100 Liens', icon: '🔗', price: 350, currency: 'energy', amount: 100 },
        { id: 'l500', name: '500 Liens', icon: '🔗', price: 1500, currency: 'energy', amount: 500 },
    ],
    boosts: [
        { id: 'bxp', name: 'Boost XP (1h)', icon: '📈', price: 100, currency: 'energy', duration: 3600, type: 'xp' },
        {
            id: 'bcap',
            name: 'Boost Capture (1h)',
            icon: '🎯',
            price: 150,
            currency: 'energy',
            duration: 3600,
            type: 'capture',
        },
        {
            id: 'beng',
            name: 'Boost Énergie (1h)',
            icon: '⚡',
            price: 200,
            currency: 'energy',
            duration: 3600,
            type: 'energy',
        },
    ],
    items: [
        { id: 'evo', name: "Cristal d'Évolution", icon: '💎', price: 500, currency: 'energy' },
        { id: 'candy', name: 'Bonbon Rare', icon: '🍬', price: 200, currency: 'energy' },
        { id: 'potion', name: 'Potion Max', icon: '❤️', price: 100, currency: 'energy' },
    ],
};
