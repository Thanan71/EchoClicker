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
