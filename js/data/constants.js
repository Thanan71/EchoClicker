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
    MAX_LOG_ENTRIES: 50,        // Max entrées dans le log de combat
    MINE_ENERGY_REGEN_RATE: 1,  // Énergie régénérée par tick de mine
    MINE_ENERGY_REGEN_INTERVAL: 30000  // Intervalle de régénération (ms) = 30 secondes
};

// === CONTRÉES & ROUTES (Phase 1 : 3 premières) ===
const REGIONS = [
    {
        id: 'foret', name: 'Forêt Éveillée', emoji: '🌲',
        desc: 'Une forêt ancienne où les Échos de Flore et de Lumière dansent entre les arbres.',
        color: '#55a630', unlocked: true, bossDefeated: false,
        routes: [
            { id:'r1', name:'Sentier de Mousse',    lv:'1-5',  ids:[1,4,6,12],    unlocked:true },
            { id:'r2', name:'Clairière Lumineuse',  lv:'3-8',  ids:[2,4,10,8,12], unlocked:true },
            { id:'r3', name:'Sous-bois Sombre',     lv:'5-10', ids:[8,2,6,10,11], unlocked:false },
            { id:'r4', name:'Cascade Enchantée',    lv:'7-12', ids:[3,5,7,9,12],  unlocked:false },
            { id:'r5', name:'Cœur de la Forêt',     lv:'10-15',ids:[3,5,7,9,10],  unlocked:false }
        ],
        bosses: [{ name:'Gardien Sylvain', echoId:3, level:15 }]
    },
    {
        id: 'montagnes', name: 'Montagnes Cristallines', emoji: '🏔️',
        desc: 'Des pics enneigés où résonne le chant des cristaux et où la foudre danse.',
        color: '#74b9ff', unlocked: false, bossDefeated: false,
        routes: [
            { id:'r6',  name:'Sentier Rocailleux',  lv:'12-16', ids:[21,14,16,13],   unlocked:false },
            { id:'r7',  name:'Grotte de Cristal',   lv:'14-18', ids:[17,19,16,13],   unlocked:false },
            { id:'r8',  name:'Falaise Orageuse',    lv:'16-20', ids:[19,22,14,17],   unlocked:false },
            { id:'r9',  name:'Sommet Gelé',         lv:'18-22', ids:[15,22,20,18,17],unlocked:false },
            { id:'r10', name:'Pic du Tonnerre',     lv:'20-25', ids:[18,15,20,22,17],unlocked:false }
        ],
        bosses: [{ name:'Titan de Cristal', echoId:18, level:28 }]
    },
    {
        id: 'ocean', name: 'Océan Abyssal', emoji: '🌊',
        desc: 'Les profondeurs mystérieuses où règnent les créatures marines les plus anciennes.',
        color: '#0984e3', unlocked: false, bossDefeated: false,
        routes: [
            { id:'r11', name:'Rivage Paisible',     lv:'14-18', ids:[23,27,12,25],   unlocked:false },
            { id:'r12', name:'Récif Corallien',    lv:'16-20', ids:[23,25,27,28],   unlocked:false },
            { id:'r13', name:'Gouffre Marin',      lv:'18-22', ids:[25,28,23,27],   unlocked:false },
            { id:'r14', name:'Tranchée des Abysses',lv:'20-25',ids:[26,24,25,28],   unlocked:false },
            { id:'r15', name:'Fosse Éternelle',    lv:'22-28', ids:[24,26,28,25],   unlocked:false }
        ],
        bosses: [{ name:'Léviathan', echoId:26, level:32 }]
    }
];

// === SUCCÈS ===
const ACHIEVEMENTS = [
    { id:'click1',     name:'Premier Pas',      desc:'Clique pour la première fois',       icon:'👆', cond:s=>s.totalClicks>=1 },
    { id:'click100',   name:'Cliquer Débutant', desc:'100 clics au total',                 icon:'👆', cond:s=>s.totalClicks>=100 },
    { id:'click1k',    name:'Cliquer Confirmé', desc:'1 000 clics au total',               icon:'💪', cond:s=>s.totalClicks>=1000 },
    { id:'click10k',   name:'Maître Cliqueur',  desc:'10 000 clics au total',              icon:'🏆', cond:s=>s.totalClicks>=10000 },
    { id:'cap1',       name:'Nouveau Lien',     desc:'Capture ton premier Écho',           icon:'🔗', cond:s=>s.totalCaptures>=1 },
    { id:'cap10',      name:'Collectionneur',   desc:'Capture 10 Échos',                   icon:'📦', cond:s=>s.totalCaptures>=10 },
    { id:'cap50',      name:'Tisseur Expérimenté',desc:'Capture 50 Échos',                icon:'🎯', cond:s=>s.totalCaptures>=50 },
    { id:'uniq10',     name:'Explorateur',      desc:'Découvre 10 Échos uniques',          icon:'📖', cond:s=>s.uniqueCaptures>=10 },
    { id:'uniq20',     name:'Naturaliste',      desc:'Découvre 20 Échos uniques',          icon:'📚', cond:s=>s.uniqueCaptures>=20 },
    { id:'prim1',      name:'Étoile Rare',      desc:'Trouve un Écho Primordial',          icon:'✨', cond:s=>s.primordialCount>=1 },
    { id:'win1',       name:'Première Victoire',desc:'Gagne ton premier combat',           icon:'⚔️', cond:s=>s.totalWins>=1 },
    { id:'win50',      name:'Guerrier',         desc:'Gagne 50 combats',                   icon:'🗡️', cond:s=>s.totalWins>=50 },
    { id:'energy1k',   name:'Énergie Naissante',desc:'Accumule 1 000 Énergie Aether',      icon:'💎', cond:s=>s.totalEnergy>=1000 },
    { id:'energy100k', name:'Réserve Puissante',desc:'Accumule 100 000 Énergie Aether',    icon:'💠', cond:s=>s.totalEnergy>=100000 },
    { id:'lv10',       name:'Écho Entraîné',    desc:'Amène un Écho au niveau 10',         icon:'📈', cond:s=>s.maxLevel>=10 },
    { id:'lv25',       name:'Écho Vétéran',     desc:'Amène un Écho au niveau 25',         icon:'📊', cond:s=>s.maxLevel>=25 },
    { id:'boss1',      name:'Tombeur de Boss',  desc:'Bat ton premier boss',               icon:'👹', cond:s=>s.bossesDefeated>=1 },
    { id:'region2',    name:'Nouveau Territoire',desc:'Débloque la 2ème contrée',          icon:'🗺️', cond:s=>s.regionsUnlocked>=2 },
    { id:'region3',    name:'Explorateur Ultime',desc:'Débloque la 3ème contrée',          icon:'🌍', cond:s=>s.regionsUnlocked>=3 },
    { id:'play1h',     name:'Joueur Dévoué',    desc:'Joue pendant 1 heure',              icon:'⏰', cond:s=>s.playTime>=3600 },
];

// === BOUTIQUE ===
const SHOP = {
    links: [
        { id:'l10',  name:'10 Liens',  icon:'🔗', price:50,   currency:'energy', amount:10 },
        { id:'l50',  name:'50 Liens',  icon:'🔗', price:200,  currency:'energy', amount:50 },
        { id:'l100', name:'100 Liens', icon:'🔗', price:350,  currency:'energy', amount:100 },
        { id:'l500', name:'500 Liens', icon:'🔗', price:1500, currency:'energy', amount:500 },
    ],
    boosts: [
        { id:'bxp',  name:'Boost XP (1h)',      icon:'📈', price:100, currency:'energy', duration:3600, type:'xp' },
        { id:'bcap', name:'Boost Capture (1h)',  icon:'🎯', price:150, currency:'energy', duration:3600, type:'capture' },
        { id:'beng', name:'Boost Énergie (1h)',  icon:'⚡', price:200, currency:'energy', duration:3600, type:'energy' },
    ],
    items: [
        { id:'evo',  name:'Cristal d\'Évolution',icon:'💎', price:500, currency:'energy' },
        { id:'candy',name:'Bonbon Rare',         icon:'🍬', price:200, currency:'energy' },
        { id:'potion',name:'Potion Max',         icon:'❤️', price:100, currency:'energy' },
    ]
};

// Helpers
function getEchoById(id) { return ECHOES_DB.find(e=>e.id===id); }
function getRegionById(id) { return REGIONS.find(r=>r.id===id); }
