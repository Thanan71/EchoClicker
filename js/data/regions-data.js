// ============================================
// EchoClicker - Donnees des contrees & Routes
// ============================================

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
    },
    {
        id: 'volcan', name: 'Volcan Infernal', emoji: '🌋',
        desc: 'Un enfer de flammes et de chaos où la lave coule sans fin.',
        color: '#ff6b35', unlocked: false, bossDefeated: false,
        routes: [
            { id:'r16', name:'Sentier de Braise',    lv:'25-28', ids:[31,34,36,39],   unlocked:false },
            { id:'r17', name:'Cratère de Magma',     lv:'27-30', ids:[31,35,36,39],   unlocked:false },
            { id:'r18', name:'Rivière de Lave',      lv:'29-32', ids:[32,35,37,34],   unlocked:false },
            { id:'r19', name:'Gorge du Chaos',       lv:'31-34', ids:[33,37,32,40],   unlocked:false },
            { id:'r20', name:"Cœur de l'Enfer",     lv:'33-35', ids:[33,38,37,40],   unlocked:false }
        ],
        bosses: [{ name:'Seigneur Pyrodrak', echoId:38, level:38 }]
    },
    {
        id: 'foret_maudite', name: 'Forêt Maudite', emoji: '🌑',
        desc: 'Une forêt sombre où les ombres prennent vie et les arbres murmurent des malédictions.',
        color: '#6c5ce7', unlocked: false, bossDefeated: false,
        routes: [
            { id:'r21', name:'Sentier des Ombres',   lv:'30-33', ids:[41,44,47,49],   unlocked:false },
            { id:'r22', name:'Clairière Putride',    lv:'32-35', ids:[41,44,49,50],   unlocked:false },
            { id:'r23', name:'Sous-bois Maudit',     lv:'34-37', ids:[42,45,47,50],   unlocked:false },
            { id:'r24', name:'Marécage Spectral',    lv:'36-39', ids:[43,42,45,48],   unlocked:false },
            { id:'r25', name:'Cœur des Ténèbres',   lv:'38-40', ids:[43,46,48,45],   unlocked:false }
        ],
        bosses: [{ name:'Nécroflore Primordiale', echoId:46, level:43 }]
    },
    {
        id: 'ciel_ethere', name: 'Ciel Éthéré', emoji: '☀️',
        desc: 'Des cieux lumineux où les anges et les esprits du vent règnent en maîtres.',
        color: '#ffeaa7', unlocked: false, bossDefeated: false,
        routes: [
            { id:'r26', name:'Nuages Célestes',     lv:'35-38', ids:[51,54,56,59],   unlocked:false },
            { id:'r27', name:'Courant Ascendant',   lv:'37-40', ids:[51,54,59,60],   unlocked:false },
            { id:'r28', name:'Tempête Lumineuse',   lv:'39-42', ids:[52,55,56,60],   unlocked:false },
            { id:'r29', name:'Aurore Sacrée',       lv:'41-44', ids:[53,57,52,55],   unlocked:false },
            { id:'r30', name:'Trône Céleste',       lv:'43-45', ids:[53,58,57,55],   unlocked:false }
        ],
        bosses: [{ name:'Solarius Éternel', echoId:58, level:48 }]
    },
    {
        id: 'dimension_arcane', name: 'Dimension Arcane', emoji: '✨',
        desc: 'Une dimension hors du temps où la magie pure cristallise en formes vivantes.',
        color: '#a855f7', unlocked: false, bossDefeated: false,
        routes: [
            { id:'r31', name:'Portail Arcanique',    lv:'40-43', ids:[61,64,66,65],   unlocked:false },
            { id:'r32', name:'Labyrinthe Runique',   lv:'42-45', ids:[61,64,66,65],   unlocked:false },
            { id:'r33', name:'Sanctuaire Cristallin',lv:'44-47', ids:[62,65,64,66],   unlocked:false },
            { id:'r34', name:'Nexus Magique',        lv:'46-49', ids:[63,62,65,66],   unlocked:false },
            { id:'r35', name:"Cœur du Multivers",    lv:'48-50', ids:[63,67,68,62],   unlocked:false }
        ],
        bosses: [{ name:'Arcanexus Absolu', echoId:68, level:53 }]
    }
];
