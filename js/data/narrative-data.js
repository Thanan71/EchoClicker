// ============================================
// EchoClicker - Donnees de narration et lore
// ============================================

export const NARRATIVE_DATA = {
  // PNJ Guide : Le Tisseur Ancien
  guide: {
    name: 'Le Tisseur Ancien',
    avatar: '🧶',
    dialogues: {
      introduction: [
        {
          id: 'intro_1',
          text: 'Bienvenue, jeune Tisseur... Je suis le Tisseur Ancien, gardien des fils du destin.',
          trigger: 'game_start',
        },
        {
          id: 'intro_2',
          text: "Ce monde est tissé d'Echoes, des creatures nées des vibrations de l'univers.",
          trigger: 'game_start',
        },
        {
          id: 'intro_3',
          text: 'Toi aussi, tu peux tisser ces fils... Capturer ces Echoes et forger ton propre destin.',
          trigger: 'game_start',
        },
      ],
      tips: [
        {
          id: 'tip_capture',
          text: "Astuce : Baisse la vie d'un Echo avant d'essayer de le capturer. Plus il est affaibli, plus tes chances sont grandes !",
          trigger: 'first_combat',
        },
        {
          id: 'tip_party',
          text: "Astuce : Tu peux avoir jusqu'a 6 Echoes dans ton equipe. Choisis-les avec sagesse !",
          trigger: 'party_full',
        },
        {
          id: 'tip_evolution',
          text: 'Astuce : Les Echoes peuvent evoluer quand ils atteignent un certain niveau. Garde un oeil sur tes compagnons !',
          trigger: 'first_evolution',
        },
        {
          id: 'tip_boss',
          text: 'Astuce : Les Boss sont puissants, mais chaque faiblesse peut etre exploitee. Etudie leur type !',
          trigger: 'first_boss',
        },
      ],
      events: [
        {
          id: 'event_shiny',
          text: "Incredible ! Tu as trouve un Echo Primordial ! Ces creatures rares brillent d'une lumiere speciale...",
          trigger: 'shiny_captured',
        },
        {
          id: 'event_region',
          text: 'Tu as debloque une nouvelle region ! Chaque region cache ses propres secrets et Echoes...',
          trigger: 'region_unlocked',
        },
        {
          id: 'event_boss_defeat',
          text: "Tu as vaincu le Boss de cette region ! Le chemin vers de nouvelles contrees s'ouvre a toi...",
          trigger: 'boss_defeated',
        },
      ],
    },
  },

  // Dialogues des Boss
  bosses: {
    foret: {
      name: 'Gardien de la Foret',
      before: [
        'Tu oses entrer dans mon domaine ?',
        'Les arbres murmurent ton destin...',
        'Prepare-toi a etre englouti par la nature !',
      ],
      after: [
        'La foret... reconnaît ta force...',
        'Tu merites de passer...',
        'Que les arbres veillent sur toi...',
      ],
    },
    ocean: {
      name: 'Leviathan des Profondeurs',
      before: [
        "Les murs de l'ocean se referment sur toi...",
        'Nul ne resiste a la maree...',
        "Tu vas sombrer dans l'abime !",
      ],
      after: [
        "Les courants... s'apaisent...",
        'Tu as dompte la tempete...',
        "L'ocean t'accepte...",
      ],
    },
    montagnes: {
      name: 'Colosse de Pierre',
      before: [
        'Tu gravis mon sommet ? Inutile...',
        'Je suis eternel comme la montagne...',
        "Rien ne peut m'ecrouler !",
      ],
      after: ['La montagne... tremble...', 'Tu as brise ma roche...', 'Le sommet est a toi...'],
    },
    volcan: {
      name: 'Seigneur de la Lave',
      before: [
        'Tu viens te bruler, petit insecte ?',
        'La lave coule dans mes veines...',
        'Je vais te reduire en cendres !',
      ],
      after: [
        "Le feu... s'eteint...",
        'Tu as resiste a mes flammes...',
        "Les cendres de ma defaite... s'envolent...",
      ],
    },
    foret_maudite: {
      name: "L'Ombre Maudite",
      before: [
        "Les tenebres t'attendent...",
        'Nul ne revient de cette foret...',
        'Ton ame sera mienne...',
      ],
      after: [
        'Les tenebres... reculent...',
        'Tu as chasse mes ombres...',
        'La lumiere... me brule...',
      ],
    },
    dimension_arcane: {
      name: "L'Arcaniste Fou",
      before: [
        "Tu ne comprends pas la puissance de l'arcane !",
        'La realite se plie a ma volonte...',
        'Tu vas disparaitre dans le neant !',
      ],
      after: [
        "L'arcane... m'echappe...",
        "Tu maitrises l'incomprehensible...",
        "La dimension... t'appartient...",
      ],
    },
    ciel_ethere: {
      name: 'Le Celeste',
      before: [
        'Tu defies les cieux eux-memes ?',
        "Je suis le vent, la foudre, l'etoile...",
        "Aucun mortel ne peut m'atteindre !",
      ],
      after: [
        "Le ciel... s'incline...",
        "Tu as touche l'etoile...",
        'Les cieux... te reconnaissent...',
      ],
    },
  },

  // Lore débloquable
  lore: {
    world: [
      {
        id: 'world_origin',
        title: "L'Origine du Monde",
        text: "Au commencement, il n'y avait que le Vide. Puis vint la Premiere Vibration, qui donna naissance aux fils du destin. De ces fils naquirent les Echoes, creatures de pure energie, et le monde tel que nous le connaissons.",
        unlockCondition: { type: 'start' },
      },
      {
        id: 'world_tisserands',
        title: 'Les Tisserands',
        text: 'Les Tisserands sont ceux qui peuvent voir et manipuler les fils du destin. Ils captent les vibrations des Echoes et peuvent les lier a eux. Chaque Tisseur a un destin unique, tisse par ses propres choix.',
        unlockCondition: { type: 'captures', value: 5 },
      },
      {
        id: 'world_echoes',
        title: 'La Nature des Echoes',
        text: "Les Echoes ne sont pas de simples creatures. Ce sont des manifestations de l'energie primordiale, des reflets des emotions et des pensees du monde. Chaque Echo a une personnalite unique, un reflet de son essence.",
        unlockCondition: { type: 'unique_captures', value: 10 },
      },
    ],
    regions: {
      foret: [
        {
          id: 'lore_foret_1',
          title: 'La Foret Ancienne',
          text: 'La Foret Ancienne est le berceau de nombreux Echoes de type Nature. Les arbres millenaires y murmurent des secrets oublies, et les rayons de soleil filtrent a travers un feuillage epais.',
          unlockCondition: { type: 'region', value: 'foret' },
        },
        {
          id: 'lore_foret_2',
          title: 'Le Gardien',
          text: "Le Gardien de la Foret est un Echo ancestral qui protege ce domaine depuis des siecles. On dit qu'il peut communiquer avec chaque arbre et chaque creature de la foret.",
          unlockCondition: { type: 'boss_defeated', value: 'foret' },
        },
      ],
      ocean: [
        {
          id: 'lore_ocean_1',
          title: "L'Ocean Infini",
          text: "L'Ocean Infini cache des profondeurs insondables. Les Echoes aquatiques y nagent librement, et des ruines d'une civilisation ancienne gisent sous les vagues.",
          unlockCondition: { type: 'region', value: 'ocean' },
        },
      ],
      montagnes: [
        {
          id: 'lore_montagnes_1',
          title: 'Les Pics Eternels',
          text: 'Les Pics Eternels touchent les nuages. Le vent y souffle sans cesse, portant les cris des Echoes de type Roche et Glace. Les plus braves y graviennent pour defier le Colosse.',
          unlockCondition: { type: 'region', value: 'montagnes' },
        },
      ],
      volcan: [
        {
          id: 'lore_volcan_1',
          title: 'Le Brasier',
          text: 'Le Brasier est un volcan actif ou la lave coule en permanence. Les Echoes de type Feu y prospèrent, se nourrissant de la chaleur intense du cœur de la terre.',
          unlockCondition: { type: 'region', value: 'volcan' },
        },
      ],
      foret_maudite: [
        {
          id: 'lore_foret_maudite_1',
          title: 'La Foret Maudite',
          text: "La Foret Maudite est un lieu ou la lumiere ne penetre jamais. Les arbres y sont tordus et les ombres prennent vie. Les Echoes de type Spectre rôdent dans l'obscurite.",
          unlockCondition: { type: 'region', value: 'foret_maudite' },
        },
      ],
      dimension_arcane: [
        {
          id: 'lore_dimension_arcane_1',
          title: 'La Dimension Arcane',
          text: "La Dimension Arcane existe en dehors de l'espace et du temps. Les lois de la physique n'y ont pas cours, et les Echoes de type Psy y manipulent la realite elle-meme.",
          unlockCondition: { type: 'region', value: 'dimension_arcane' },
        },
      ],
      ciel_ethere: [
        {
          id: 'lore_ciel_ethere_1',
          title: 'Le Ciel Ethere',
          text: "Le Ciel Ethere est le domaine des Echoes celestiales. Les nuages y sont faits de cristal pur, et les etoiles brillent en plein jour. C'est le sommet du monde des Tisserands.",
          unlockCondition: { type: 'region', value: 'ciel_ethere' },
        },
      ],
    },
    echoes: [
      {
        id: 'lore_primordial',
        title: 'Les Echoes Primordiales',
        text: "Les Echoes Primordiales sont les plus rares de toutes. Elles brillent d'une lumiere iridescente et possedent une puissance inegalee. On dit qu'elles sont les premieres Echoes creees par la Premiere Vibration.",
        unlockCondition: { type: 'primordial_captured' },
      },
    ],
  },

  // Cinematiques textuelles
  cinematics: {
    game_start: {
      title: 'Le Debut du Voyage',
      scenes: [
        {
          text: "Dans un monde ou les vibrations de l'univers prennent forme, les Echoes errent librement...",
          duration: 3000,
        },
        {
          text: 'Toi, jeune Tisseur, tu as le pouvoir de voir ces creatures invisibles aux yeux du commun...',
          duration: 3000,
        },
        {
          text: "Le Tisseur Ancien t'attend au seuil de ton destin. Il est temps de commencer ton voyage...",
          duration: 3000,
        },
      ],
    },
    first_boss: {
      title: 'La Premiere Epreuve',
      scenes: [
        {
          text: "Tu as atteint le cœur de la foret. Un souffle ancien emplit l'air...",
          duration: 3000,
        },
        {
          text: "Le Gardien de la Foret se dresse devant toi, ses yeux brillant d'une lumiere millenaire...",
          duration: 3000,
        },
        {
          text: 'Montre ta valeur, jeune Tisseur. Defie le Gardien et prouve ta force !',
          duration: 3000,
        },
      ],
    },
    final_region: {
      title: 'Le Sommet du Monde',
      scenes: [
        {
          text: 'Tu as parcouru un long chemin, traversant des terres oubliees et defiant des creatures legendaires...',
          duration: 3000,
        },
        {
          text: "Le Ciel Ethere s'ouvre enfin devant toi. Les etoiles brillent comme jamais auparavant...",
          duration: 3000,
        },
        {
          text: "Le Celeste t'attend. C'est l'heure de la confrontation finale, Tisseur...",
          duration: 3000,
        },
      ],
    },
  },
};
