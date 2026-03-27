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

    // === VOLCAN INFERNAL (Niveau 25-35) - Phase 2 ===
    { id:31, name:'Braise',       type:'FEU',     emoji:'🔥', rarity:'common',   baseHp:45, baseAtk:40, baseDef:30, baseSpd:25, captureRate:45, evo:{to:32,lv:30}, desc:'Une braise vivante qui roule dans la lave.' },
    { id:32, name:'Flammide',     type:'FEU',     emoji:'🔥', rarity:'uncommon', baseHp:65, baseAtk:55, baseDef:45, baseSpd:30, captureRate:35, evo:{to:33,lv:38}, desc:'Une flamme consciente qui consume tout sur son passage.' },
    { id:33, name:'Infernus',     type:'FEU',     emoji:'🌋', rarity:'rare',     baseHp:90, baseAtk:75, baseDef:60, baseSpd:35, captureRate:20, desc:'Un démon de feu qui fait trembler les volcans.' },
    { id:34, name:'Scorielle',    type:'TERRE',   emoji:'🪨', rarity:'common',   baseHp:60, baseAtk:35, baseDef:55, baseSpd:15, captureRate:45, evo:{to:35,lv:32}, desc:'Un morceau de roche volcanique animé par la chaleur.' },
    { id:35, name:'Magmior',      type:'FEU',     emoji:'🌋', rarity:'uncommon', baseHp:80, baseAtk:60, baseDef:70, baseSpd:18, captureRate:25, desc:'Un golem de magma qui laisse un sillon de feu.' },
    { id:36, name:'Chaotik',      type:'CHAOS',   emoji:'🌀', rarity:'common',   baseHp:40, baseAtk:45, baseDef:25, baseSpd:40, captureRate:40, evo:{to:37,lv:32}, desc:'Une anomalie chaotique qui distord la réalité.' },
    { id:37, name:'Vortexia',     type:'CHAOS',   emoji:'🌀', rarity:'rare',     baseHp:70, baseAtk:70, baseDef:45, baseSpd:55, captureRate:18, desc:'Un vortex de chaos pur qui aspire l\'énergie.' },
    { id:38, name:'Pyrodrak',     type:'FEU',     emoji:'🐉', rarity:'epic',     baseHp:100,baseAtk:85, baseDef:65, baseSpd:45, captureRate:12, desc:'Un dragon des enfers qui crache des flammes dévoreuses.' },
    { id:39, name:'Cendrille',    type:'FEU',     emoji:'🌫️',rarity:'common',   baseHp:35, baseAtk:30, baseDef:20, baseSpd:50, captureRate:48, desc:'Un nuage de cendres conscient qui aveugle ses proies.' },
    { id:40, name:'Obsidiame',    type:'TERRE',   emoji:'🖤', rarity:'rare',     baseHp:85, baseAtk:50, baseDef:80, baseSpd:12, captureRate:20, desc:'Une entité d\'obsidienne quasi indestructible.' },

    // === FORET MAUDITE (Niveau 30-40) - Phase 2 ===
    { id:41, name:'Ombrette',     type:'OMBRE',   emoji:'👤', rarity:'common',   baseHp:40, baseAtk:35, baseDef:25, baseSpd:45, captureRate:45, evo:{to:42,lv:35}, desc:'Une ombre maléfique qui se cache entre les arbres morts.' },
    { id:42, name:'Spectralis',   type:'OMBRE',   emoji:'👻', rarity:'uncommon', baseHp:60, baseAtk:55, baseDef:35, baseSpd:55, captureRate:30, evo:{to:43,lv:42}, desc:'Un spectre qui hante la forêt maudite depuis des siècles.' },
    { id:43, name:'Nuitshade',    type:'OMBRE',   emoji:'🌑', rarity:'rare',     baseHp:85, baseAtk:75, baseDef:55, baseSpd:60, captureRate:15, desc:'Une entité d\'ombre pure qui éteint toute lumière.' },
    { id:44, name:'Morbillon',    type:'FLORE',   emoji:'🌿', rarity:'common',   baseHp:55, baseAtk:30, baseDef:45, baseSpd:20, captureRate:45, evo:{to:45,lv:36}, desc:'Une plante carnivère corrompue par l\'ombre.' },
    { id:45, name:'Viperoak',     type:'FLORE',   emoji:'🌳', rarity:'uncommon', baseHp:80, baseAtk:50, baseDef:65, baseSpd:18, captureRate:25, desc:'Un arbre maudit dont les branches sont des serpents.' },
    { id:46, name:'Necroflore',   type:'FLORE',   emoji:'💀', rarity:'epic',     baseHp:95, baseAtk:70, baseDef:75, baseSpd:25, captureRate:12, desc:'Une fleur de mort qui se nourrit des âmes perdues.' },
    { id:47, name:'Champitox',    type:'FLORE',   emoji:'🍄', rarity:'common',   baseHp:50, baseAtk:40, baseDef:40, baseSpd:15, captureRate:42, desc:'Un champignon toxique dont les spores corrompent tout.' },
    { id:48, name:'Ombrelune',    type:'OMBRE',   emoji:'🌙', rarity:'rare',     baseHp:75, baseAtk:65, baseDef:50, baseSpd:50, captureRate:18, desc:'Une créature lunaire qui tire sa puissance de la nuit.' },
    { id:49, name:'Spectrillon',  type:'OMBRE',   emoji:'👁️',rarity:'common',   baseHp:35, baseAtk:45, baseDef:20, baseSpd:55, captureRate:40, desc:'Un petit œil spectral qui observe depuis les ombres.' },
    { id:50, name:'Creepvine',    type:'FLORE',   emoji:'🌱', rarity:'uncommon', baseHp:65, baseAtk:45, baseDef:55, baseSpd:22, captureRate:30, desc:'Une vigne rampante qui étrangle tout ce qu\'elle touche.' },

    // === CIEL ETHERE (Niveau 35-45) - Phase 2 ===
    { id:51, name:'Lumiette',     type:'LUMIERE', emoji:'✨', rarity:'common',   baseHp:45, baseAtk:40, baseDef:30, baseSpd:55, captureRate:42, evo:{to:52,lv:40}, desc:'Une petite boule de lumière qui flotte dans les cieux.' },
    { id:52, name:'Aurorella',    type:'LUMIERE', emoji:'🌟', rarity:'uncommon', baseHp:65, baseAtk:60, baseDef:45, baseSpd:65, captureRate:28, evo:{to:53,lv:48}, desc:'Une fée de lumière australe qui danse dans le ciel.' },
    { id:53, name:'Seraphiel',    type:'LUMIERE', emoji:'👼', rarity:'rare',     baseHp:90, baseAtk:80, baseDef:60, baseSpd:70, captureRate:12, desc:'Un ange de lumière qui protège les cieux éthérés.' },
    { id:54, name:'Zephyrion',    type:'VENT',    emoji:'🌬️',rarity:'common',   baseHp:40, baseAtk:45, baseDef:25, baseSpd:65, captureRate:40, evo:{to:55,lv:40}, desc:'Un esprit du vent qui vole à travers les nuages.' },
    { id:55, name:'Tempestia',    type:'VENT',    emoji:'🌪️',rarity:'uncommon', baseHp:60, baseAtk:65, baseDef:35, baseSpd:80, captureRate:25, desc:'Une tornade consciente qui dévaste tout sur son passage.' },
    { id:56, name:'Celestino',    type:'LUMIERE', emoji:'☀️', rarity:'common',   baseHp:50, baseAtk:35, baseDef:40, baseSpd:45, captureRate:40, desc:'Un petit être céleste qui apporte la joie partout.' },
    { id:57, name:'Nimbus',       type:'VENT',    emoji:'☁️', rarity:'rare',     baseHp:80, baseAtk:70, baseDef:55, baseSpd:75, captureRate:15, desc:'Un nuage vivant qui crée des orages à volonté.' },
    { id:58, name:'Solarius',     type:'LUMIERE', emoji:'⭐', rarity:'epic',     baseHp:100,baseAtk:90, baseDef:65, baseSpd:60, captureRate:10, desc:'Une étoile vivante dont la lumière perce les ténèbres.' },
    { id:59, name:'Ailedevent',   type:'VENT',    emoji:'🦅', rarity:'common',   baseHp:42, baseAtk:50, baseDef:28, baseSpd:70, captureRate:38, desc:'Un oiseau de tempête qui plane au-dessus des nuages.' },
    { id:60, name:'Eclairoz',     type:'LUMIERE', emoji:'💫', rarity:'uncommon', baseHp:55, baseAtk:55, baseDef:40, baseSpd:58, captureRate:28, desc:'Une étincelle divine qui aveugle les ennemis.' },

    // === DIMENSION ARCANE (Niveau 40-50) - Phase 2 ===
    { id:61, name:'Arcafox',      type:'ARCANE',  emoji:'🦊', rarity:'common',   baseHp:50, baseAtk:50, baseDef:35, baseSpd:55, captureRate:38, evo:{to:62,lv:45}, desc:'Un renard arcanique dont la queue brille de magie.' },
    { id:62, name:'Mystigard',    type:'ARCANE',  emoji:'🔮', rarity:'uncommon', baseHp:70, baseAtk:70, baseDef:50, baseSpd:60, captureRate:25, evo:{to:63,lv:52}, desc:'Un gardien mystique qui protège les secrets arcaniques.' },
    { id:63, name:'Archanos',     type:'ARCANE',  emoji:'✨', rarity:'rare',     baseHp:95, baseAtk:85, baseDef:65, baseSpd:65, captureRate:12, desc:'Un archimage arcanique dont le pouvoir transcende la réalité.' },
    { id:64, name:'Cristalite',   type:'CRISTAL', emoji:'💎', rarity:'common',   baseHp:55, baseAtk:45, baseDef:50, baseSpd:20, captureRate:38, evo:{to:65,lv:46}, desc:'Un cristal conscient qui réfracte la magie ambiante.' },
    { id:65, name:'Prismatik',    type:'CRISTAL', emoji:'💎', rarity:'uncommon', baseHp:75, baseAtk:60, baseDef:70, baseSpd:25, captureRate:25, desc:'Un prisme vivant qui décompose la lumière en arcs-en-ciel.' },
    { id:66, name:'Runestone',    type:'ARCANE',  emoji:'🪨', rarity:'common',   baseHp:60, baseAtk:45, baseDef:55, baseSpd:18, captureRate:40, desc:'Une pierre runique gravée d\'anciens symboles magiques.' },
    { id:67, name:'Cristallus',   type:'CRISTAL', emoji:'💠', rarity:'epic',     baseHp:110,baseAtk:80, baseDef:90, baseSpd:22, captureRate:8,  desc:'Un dragon de cristal dont les écailles brillent de magie pure.' },
    { id:68, name:'Arcanexus',    type:'ARCANE',  emoji:'🌌', rarity:'epic',     baseHp:100,baseAtk:95, baseDef:60, baseSpd:70, captureRate:8,  desc:'Le nexus de toute magie arcanique, une entité cosmique.' },
];
