// ============================================
// ÉchoClicker - Données des Échos (Phase 1)
// 30 Échos, 10 types, 3 premières contrées
// ============================================

const ECHOES_DB = [
    // === FORÊT ÉVEILLÉE (Niveau 1-15) ===
    { id:1,  name:'Boulette',     type:'FLORE',   emoji:'🟢', rarity:'common',   baseHp:20, baseAtk:10, baseDef:15, baseSpd:25, captureRate:60, evo:{to:2,lv:8},  desc:'Une petite boule de mousse qui roule sans but.' },
    { id:2,  name:'Feuillame',    type:'FLORE',   emoji:'🌱', rarity:'uncommon', baseHp:35, baseAtk:20, baseDef:25, baseSpd:30, captureRate:45, evo:{to:3,lv:18}, desc:'Une pousse magique qui pulse de lumière verte.' },
    { id:3,  name:'Sylvegard',    type:'FLORE',   emoji:'🌳', rarity:'rare',     baseHp:55, baseAtk:35, baseDef:45, baseSpd:25, captureRate:30, desc:'Un arbre vivant dont les racines chantent.' },
    { id:4,  name:'Luciolette',   type:'LUMIERE', emoji:'✨', rarity:'common',   baseHp:28, baseAtk:15, baseDef:18, baseSpd:40, captureRate:50, evo:{to:5,lv:12}, desc:'Une luciole magique qui éclaire les sentiers.' },
    { id:5,  name:'Luminara',     type:'LUMIERE', emoji:'🌟', rarity:'rare',     baseHp:45, baseAtk:30, baseDef:30, baseSpd:55, captureRate:30, desc:'Une fée de lumière qui danse entre les rayons.' },
    { id:6,  name:'Mouchrel',     type:'VENT',    emoji:'🍃', rarity:'common',   baseHp:25, baseAtk:18, baseDef:15, baseSpd:45, captureRate:55, evo:{to:7,lv:10}, desc:'Une feuille vivante qui vole au gré du vent.' },
    { id:7,  name:'Tourbillame',  type:'VENT',    emoji:'🌬️',rarity:'uncommon', baseHp:40, baseAtk:35, baseDef:25, baseSpd:60, captureRate:35, desc:'Un tourbillon conscient qui aspire tout.' },
    { id:8,  name:'Champignou',   type:'FLORE',   emoji:'🍄', rarity:'common',   baseHp:40, baseAtk:12, baseDef:35, baseSpd:15, captureRate:50, evo:{to:9,lv:15}, desc:'Un champignon qui libère des spores endormantes.' },
    { id:9,  name:'Toxishroom',   type:'FLORE',   emoji:'🍄', rarity:'uncommon', baseHp:60, baseAtk:25, baseDef:55, baseSpd:12, captureRate:25, desc:'Un champignon géant dont les spores sont toxiques.' },
    { id:10, name:'Rossignuit',   type:'VENT',    emoji:'🐦', rarity:'common',   baseHp:30, baseAtk:22, baseDef:18, baseSpd:50, captureRate:45, desc:'Un oiseau dont le chant apaise les blessures.' },
    { id:11, name:'OmbretteMini', type:'OMBRE',   emoji:'👤', rarity:'uncommon', baseHp:18, baseAtk:20, baseDef:12, baseSpd:30, captureRate:50, desc:'Une mini-ombre qui imite les mouvements des autres.' },
    { id:12, name:'Gouttette',    type:'OCEAN',   emoji:'💧', rarity:'common',   baseHp:18, baseAtk:8,  baseDef:20, baseSpd:20, captureRate:60, desc:'Une goutte d\'eau magique qui ne s\'évapore jamais.' },

    // === MONTAGNES CRISTALLINES (Niveau 10-28) ===
    { id:13, name:'Gelurette',    type:'GLACE',   emoji:'🧊', rarity:'common',   baseHp:22, baseAtk:15, baseDef:25, baseSpd:18, captureRate:52, evo:{to:14,lv:16}, desc:'Un flocon de neige qui ne fond jamais.' },
    { id:14, name:'Gelacine',     type:'GLACE',   emoji:'🧊', rarity:'uncommon', baseHp:38, baseAtk:28, baseDef:35, baseSpd:22, captureRate:40, evo:{to:15,lv:25}, desc:'Un bloc de glace vivant qui gèle tout contact.' },
    { id:15, name:'Glacius',      type:'GLACE',   emoji:'❄️', rarity:'rare',     baseHp:60, baseAtk:48, baseDef:55, baseSpd:30, captureRate:20, desc:'Un dragon de glace qui crée des blizzards.' },
    { id:16, name:'Cristaline',   type:'CRISTAL', emoji:'💎', rarity:'common',   baseHp:20, baseAtk:18, baseDef:28, baseSpd:15, captureRate:48, evo:{to:17,lv:18}, desc:'Un petit cristal qui chante quand on le touche.' },
    { id:17, name:'Cristalame',   type:'CRISTAL', emoji:'💎', rarity:'uncommon', baseHp:40, baseAtk:30, baseDef:45, baseSpd:20, captureRate:35, evo:{to:18,lv:28}, desc:'Une entité de cristaux purs qui réfracte la lumière.' },
    { id:18, name:'Diamantor',    type:'CRISTAL', emoji:'💠', rarity:'epic',     baseHp:65, baseAtk:50, baseDef:75, baseSpd:18, captureRate:15, desc:'Un golem de diamant quasi indestructible.' },
    { id:19, name:'Etincelle',    type:'FOUDRE',  emoji:'⚡', rarity:'common',   baseHp:30, baseAtk:35, baseDef:20, baseSpd:50, captureRate:38, evo:{to:20,lv:20}, desc:'Une étincelle consciente qui court sur les cristaux.' },
    { id:20, name:'Foudrex',      type:'FOUDRE',  emoji:'🌩️',rarity:'rare',     baseHp:55, baseAtk:60, baseDef:35, baseSpd:70, captureRate:15, desc:'Un fauve de foudre qui frappe comme la foudre.' },
    { id:21, name:'Rochette',     type:'TERRE',   emoji:'🪨', rarity:'common',   baseHp:50, baseAtk:35, baseDef:55, baseSpd:10, captureRate:40, evo:{to:22,lv:22}, desc:'Un rocher animé qui dévale les pentes.' },
    { id:22, name:'Montagnor',    type:'TERRE',   emoji:'⛰️', rarity:'uncommon', baseHp:80, baseAtk:55, baseDef:85, baseSpd:8,  captureRate:18, desc:'Une montagne vivante dont les pas font trembler la terre.' },

    // === OCÉAN ABYSSAL (Niveau 14-32) ===
    { id:23, name:'Vaguelette',   type:'OCEAN',   emoji:'🌊', rarity:'common',   baseHp:35, baseAtk:22, baseDef:28, baseSpd:35, captureRate:45, evo:{to:24,lv:22}, desc:'Une petite vague consciente qui joue dans les courants.' },
    { id:24, name:'Tsunamis',     type:'OCEAN',   emoji:'🌊', rarity:'rare',     baseHp:70, baseAtk:55, baseDef:50, baseSpd:40, captureRate:15, desc:'Une vague titanesque qui dévore tout.' },
    { id:25, name:'Medusoir',     type:'OCEAN',   emoji:'🪼', rarity:'uncommon', baseHp:40, baseAtk:30, baseDef:25, baseSpd:28, captureRate:38, evo:{to:26,lv:26}, desc:'Une méduse lumineuse qui électrise ses proies.' },
    { id:26, name:'Krakos',       type:'OCEAN',   emoji:'🐙', rarity:'epic',     baseHp:75, baseAtk:50, baseDef:45, baseSpd:35, captureRate:12, desc:'Un kraken ancien qui règne sur les abysses.' },
    { id:27, name:'Corailame',    type:'OCEAN',   emoji:'🪸', rarity:'common',   baseHp:45, baseAtk:20, baseDef:50, baseSpd:15, captureRate:40, desc:'Un corail vivant qui crée des récifs protecteurs.' },
    { id:28, name:'Sirenette',    type:'OCEAN',   emoji:'🧜', rarity:'uncommon', baseHp:38, baseAtk:28, baseDef:30, baseSpd:42, captureRate:30, desc:'Une sirène espiègle qui attire les marins.' },

    // === ÉCHOS SPÉCIAUX / RARES ===
    { id:29, name:'Arcanette',    type:'ARCANE',  emoji:'✨', rarity:'rare',     baseHp:22, baseAtk:22, baseDef:18, baseSpd:25, captureRate:45, desc:'Une étincelle arcanique qui apparaît lors des rituels.' },
    { id:30, name:'ChaotineMini', type:'CHAOS',   emoji:'🌀', rarity:'epic',     baseHp:25, baseAtk:35, baseDef:18, baseSpd:40, captureRate:35, desc:'Un mini vortex de chaos qui déforme l\'air.' },
];

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