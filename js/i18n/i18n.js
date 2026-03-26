/**
 * i18n.js - Système de gestion des traductions pour EchoClicker
 * Traductions embarquées pour compatibilité avec file://
 * Fallback vers le français si une traduction est manquante
 */

// Traductions embarquées directement
const TRANSLATIONS = {
  "fr": {
    "game": {
      "title": "ÉchoClicker",
      "subtitle": "Liens Éternels",
      "welcome": "Bienvenue dans ÉchoClicker : Liens Éternels !",
      "welcomeCombat": "Bienvenue, Tisseur de Liens ! Choisis une route sur la carte pour commencer l'aventure."
    },
    "currencies": {
      "energy": "Énergie Aether",
      "links": "Liens d'Aether",
      "crystals": "Cristaux Purs",
      "shards": "Éclats d'Aether"
    },
    "nav": {
      "adventure": "🗺️ Aventure",
      "party": "👥 Équipe",
      "capture": "🔮 Capture",
      "pokedex": "📖 Logbook",
      "hatchery": "🥚 Élevage",
      "mine": "⛏️ Mine",
      "shop": "🏪 Marché",
      "achievements": "🏆 Succès"
    },
    "buttons": {
      "save": "Sauvegarder",
      "settings": "Paramètres",
      "attack": "⚔️ Attaquer",
      "capture": "🔮 Capturer",
      "flee": "🏃 Fuir",
      "heal": "💊 Soigner",
      "buy": "Acheter",
      "sell": "Vendre",
      "confirm": "Confirmer",
      "cancel": "Annuler",
      "close": "Fermer",
      "back": "Retour",
      "next": "Suivant",
      "previous": "Précédent"
    },
    "combat": {
      "enemySide": "Ennemi",
      "playerSide": "Ton Écho",
      "victory": "Victoire !",
      "defeat": "Défaite...",
      "captureSuccess": "{name} capturé !",
      "captureFailed": "Capture échouée !",
      "autoCaptureSuccess": "🔮 Auto: {name} capturé !",
      "autoCaptureFailed": "🔮 Auto-capture échouée: {name}",
      "fled": "Vous avez fui le combat !",
      "enemyFled": "L'ennemi a fui !",
      "criticalHit": "Coup critique !",
      "superEffective": "C'est super efficace !",
      "notVeryEffective": "Ce n'est pas très efficace...",
      "noEchoAvailable": "Aucun Écho disponible !",
      "partyFull": "Équipe pleine ! (max 6)",
      "optimalTeamCreated": "⚡ Équipe optimale créée !",
      "newTeam": "Nouvelle équipe: {names}"
    },
    "capture": {
      "notEnoughLinks": "Pas assez de Liens d'Aether !",
      "autoNotEnoughLinks": "Auto-capture: {name} (pas assez de Liens)",
      "routeLocked": "Route non débloquée !",
      "regionLocked": "Contrée non débloquée !",
      "newRoute": "Nouvelle route : {name} !",
      "newRegion": "Nouvelle contrée débloquée : {name} !"
    },
    "map": {
      "title": "Carte du Monde",
      "regions": "Contrées",
      "routes": "Routes",
      "locked": "Verrouillé",
      "unlocked": "Débloqué",
      "level": "Niveau {level}"
    },
    "party": {
      "title": "Ton Équipe",
      "empty": "Aucun Écho dans l'équipe",
      "leader": "Leader",
      "slot": "Slot {number}",
      "hp": "PV",
      "atk": "ATK",
      "def": "DEF",
      "spd": "VIT",
      "level": "Nv. {level}",
      "addToParty": "Ajouter à l'équipe",
      "removeFromParty": "Retirer de l'équipe"
    },
    "pokedex": {
      "title": "Logbook des Échos",
      "discovered": "Découverts",
      "captured": "Capturés",
      "total": "Total",
      "noEntry": "Aucune entrée",
      "unknown": "Inconnu"
    },
    "hatchery": {
      "title": "Élevage",
      "incubator": "Incubateur",
      "empty": "Aucun œuf en incubation",
      "hatch": "Éclore !",
      "hatching": "Éclosion en cours...",
      "ready": "Prêt à éclore !",
      "noEggs": "Aucun œuf disponible",
      "createEgg": "🥚 Créer un œuf"
    },
    "mine": {
      "title": "Mine Souterraine",
      "desc": "Creuse pour trouver des Cristaux Purs et des trésors !",
      "energy": "Énergie",
      "maxEnergy": "Énergie max",
      "regenIn": "Régén dans {time}",
      "dig": "Creuser",
      "reveal": "Révéler",
      "found": "Trouvé : {item}",
      "empty": "Rien ici...",
      "bomb": "💣 Bombe !",
      "pickaxe": "Pioche",
      "radar": "Radar",
      "remainingEnergy": "Énergie restante",
      "crystalsFound": "Cristaux trouvés",
      "energyRegen": "+1 énergie toutes les 30 secondes"
    },
    "shop": {
      "title": "Marché des Esprits",
      "buy": "Acheter",
      "sell": "Vendre",
      "price": "Prix",
      "owned": "Possédé",
      "notEnoughCrystals": "Pas assez de Cristaux Purs !",
      "purchaseSuccess": "Achat réussi !",
      "sellSuccess": "Vente réussie !",
      "links": "Liens",
      "boosts": "Boosts",
      "items": "Objets",
      "cosmetics": "Cosmétiques"
    },
    "achievements": {
      "title": "Succès",
      "unlocked": "Débloqué !",
      "locked": "Verrouillé",
      "progress": "Progression",
      "reward": "Récompense"
    },
    "settings": {
      "title": "Paramètres",
      "language": "Langue",
      "sound": "Son",
      "music": "Musique",
      "notifications": "Notifications",
      "autoSave": "Sauvegarde auto",
      "reset": "Réinitialiser",
      "export": "Exporter",
      "import": "Importer"
    },
    "echoes": {
      "1": { "name": "Boulette", "desc": "Une petite boule de mousse qui roule sans but." },
      "2": { "name": "Feuillame", "desc": "Une pousse magique qui pulse de lumière verte." },
      "3": { "name": "Sylvegard", "desc": "Un arbre vivant dont les racines chantent." },
      "4": { "name": "Luciolette", "desc": "Une luciole magique qui éclaire les sentiers." },
      "5": { "name": "Luminara", "desc": "Une fée de lumière qui danse entre les rayons." },
      "6": { "name": "Mouchrel", "desc": "Une feuille vivante qui vole au gré du vent." },
      "7": { "name": "Tourbillame", "desc": "Un tourbillon conscient qui aspire tout." },
      "8": { "name": "Champignou", "desc": "Un champignon qui libère des spores endormantes." },
      "9": { "name": "Toxishroom", "desc": "Un champignon géant dont les spores sont toxiques." },
      "10": { "name": "Rossignuit", "desc": "Un oiseau dont le chant apaise les blessures." },
      "11": { "name": "OmbretteMini", "desc": "Une mini-ombre qui imite les mouvements des autres." },
      "12": { "name": "Gouttette", "desc": "Une goutte d'eau magique qui ne s'évapore jamais." },
      "13": { "name": "Gelurette", "desc": "Un flocon de neige qui ne fond jamais." },
      "14": { "name": "Gelacine", "desc": "Un bloc de glace vivant qui gèle tout contact." },
      "15": { "name": "Glacius", "desc": "Un dragon de glace qui crée des blizzards." },
      "16": { "name": "Cristaline", "desc": "Un petit cristal qui chante quand on le touche." },
      "17": { "name": "Cristalame", "desc": "Une entité de cristaux purs qui réfracte la lumière." },
      "18": { "name": "Diamantor", "desc": "Un golem de diamant quasi indestructible." },
      "19": { "name": "Etincelle", "desc": "Une étincelle consciente qui court sur les cristaux." },
      "20": { "name": "Foudrex", "desc": "Un fauve de foudre qui frappe comme la foudre." },
      "21": { "name": "Rochette", "desc": "Un rocher animé qui dévale les pentes." },
      "22": { "name": "Montagnor", "desc": "Une montagne vivante dont les pas font trembler la terre." },
      "23": { "name": "Vaguelette", "desc": "Une petite vague consciente qui joue dans les courants." },
      "24": { "name": "Tsunamis", "desc": "Une vague titanesque qui dévore tout." },
      "25": { "name": "Medusoir", "desc": "Une méduse lumineuse qui électrise ses proies." },
      "26": { "name": "Krakos", "desc": "Un kraken ancien qui règne sur les abysses." },
      "27": { "name": "Corailame", "desc": "Un corail vivant qui crée des récifs protecteurs." },
      "28": { "name": "Sirenette", "desc": "Une sirène espiègle qui attire les marins." },
      "29": { "name": "Arcanette", "desc": "Une étincelle arcanique qui apparaît lors des rituels." },
      "30": { "name": "ChaotineMini", "desc": "Un mini vortex de chaos qui déforme l'air." }
    },
    "types": {
      "FLORE": "Flore",
      "LUMIERE": "Lumière",
      "VENT": "Vent",
      "OMBRE": "Ombre",
      "OCEAN": "Océan",
      "GLACE": "Glace",
      "CRISTAL": "Cristal",
      "FOUDRE": "Foudre",
      "TERRE": "Terre",
      "ARCANE": "Arcane",
      "CHAOS": "Chaos"
    },
    "rarity": {
      "common": "Commun",
      "uncommon": "Peu commun",
      "rare": "Rare",
      "epic": "Épique",
      "legendary": "Légendaire"
    },
    "notifications": {
      "saved": "Partie sauvegardée !",
      "loaded": "Partie chargée !",
      "reset": "Partie réinitialisée !",
      "error": "Erreur !",
      "success": "Succès !"
    }
  },
  "en": {
    "game": {
      "title": "EchoClicker",
      "subtitle": "Eternal Links",
      "welcome": "Welcome to EchoClicker: Eternal Links!",
      "welcomeCombat": "Welcome, Link Weaver! Choose a route on the map to start your adventure."
    },
    "currencies": {
      "energy": "Aether Energy",
      "links": "Aether Links",
      "crystals": "Pure Crystals",
      "shards": "Aether Shards"
    },
    "nav": {
      "adventure": "🗺️ Adventure",
      "party": "👥 Party",
      "capture": "🔮 Capture",
      "pokedex": "📖 Logbook",
      "hatchery": "🥚 Hatchery",
      "mine": "⛏️ Mine",
      "shop": "🏪 Shop",
      "achievements": "🏆 Achievements"
    },
    "buttons": {
      "save": "Save",
      "settings": "Settings",
      "attack": "⚔️ Attack",
      "capture": "🔮 Capture",
      "flee": "🏃 Flee",
      "heal": "💊 Heal",
      "buy": "Buy",
      "sell": "Sell",
      "confirm": "Confirm",
      "cancel": "Cancel",
      "close": "Close",
      "back": "Back",
      "next": "Next",
      "previous": "Previous"
    },
    "combat": {
      "enemySide": "Enemy",
      "playerSide": "Your Echo",
      "victory": "Victory!",
      "defeat": "Defeat...",
      "captureSuccess": "{name} captured!",
      "captureFailed": "Capture failed!",
      "autoCaptureSuccess": "🔮 Auto: {name} captured!",
      "autoCaptureFailed": "🔮 Auto-capture failed: {name}",
      "fled": "You fled the battle!",
      "enemyFled": "The enemy fled!",
      "criticalHit": "Critical hit!",
      "superEffective": "It's super effective!",
      "notVeryEffective": "It's not very effective...",
      "noEchoAvailable": "No Echo available!",
      "partyFull": "Party full! (max 6)",
      "optimalTeamCreated": "⚡ Optimal team created!",
      "newTeam": "New team: {names}"
    },
    "capture": {
      "notEnoughLinks": "Not enough Aether Links!",
      "autoNotEnoughLinks": "Auto-capture: {name} (not enough Links)",
      "routeLocked": "Route not unlocked!",
      "regionLocked": "Region not unlocked!",
      "newRoute": "New route: {name}!",
      "newRegion": "New region unlocked: {name}!"
    },
    "map": {
      "title": "World Map",
      "regions": "Regions",
      "routes": "Routes",
      "locked": "Locked",
      "unlocked": "Unlocked",
      "level": "Level {level}"
    },
    "party": {
      "title": "Your Party",
      "empty": "No Echo in party",
      "leader": "Leader",
      "slot": "Slot {number}",
      "hp": "HP",
      "atk": "ATK",
      "def": "DEF",
      "spd": "SPD",
      "level": "Lv. {level}",
      "addToParty": "Add to party",
      "removeFromParty": "Remove from party"
    },
    "pokedex": {
      "title": "Echo Logbook",
      "discovered": "Discovered",
      "captured": "Captured",
      "total": "Total",
      "noEntry": "No entry",
      "unknown": "Unknown"
    },
    "hatchery": {
      "title": "Hatchery",
      "incubator": "Incubator",
      "empty": "No egg in incubation",
      "hatch": "Hatch!",
      "hatching": "Hatching...",
      "ready": "Ready to hatch!",
      "noEggs": "No eggs available",
      "createEgg": "🥚 Create an egg"
    },
    "mine": {
      "title": "Underground Mine",
      "desc": "Dig to find Pure Crystals and treasures!",
      "energy": "Energy",
      "maxEnergy": "Max energy",
      "regenIn": "Regen in {time}",
      "dig": "Dig",
      "reveal": "Reveal",
      "found": "Found: {item}",
      "empty": "Nothing here...",
      "bomb": "💣 Bomb!",
      "pickaxe": "Pickaxe",
      "radar": "Radar",
      "remainingEnergy": "Remaining energy",
      "crystalsFound": "Crystals found",
      "energyRegen": "+1 energy every 30 seconds"
    },
    "shop": {
      "title": "Spirit Market",
      "buy": "Buy",
      "sell": "Sell",
      "price": "Price",
      "owned": "Owned",
      "notEnoughCrystals": "Not enough Pure Crystals!",
      "purchaseSuccess": "Purchase successful!",
      "sellSuccess": "Sale successful!",
      "links": "Links",
      "boosts": "Boosts",
      "items": "Items",
      "cosmetics": "Cosmetics"
    },
    "achievements": {
      "title": "Achievements",
      "unlocked": "Unlocked!",
      "locked": "Locked",
      "progress": "Progress",
      "reward": "Reward"
    },
    "settings": {
      "title": "Settings",
      "language": "Language",
      "sound": "Sound",
      "music": "Music",
      "notifications": "Notifications",
      "autoSave": "Auto-save",
      "reset": "Reset",
      "export": "Export",
      "import": "Import"
    },
    "echoes": {
      "1": { "name": "Mossling", "desc": "A small ball of moss that rolls aimlessly." },
      "2": { "name": "Leafrix", "desc": "A magical sprout that pulses with green light." },
      "3": { "name": "Sylvaguard", "desc": "A living tree whose roots sing." },
      "4": { "name": "Glimmerfly", "desc": "A magical firefly that lights up the paths." },
      "5": { "name": "Luminara", "desc": "A light fairy that dances between rays." },
      "6": { "name": "Leafwind", "desc": "A living leaf that flies with the wind." },
      "7": { "name": "Cyclorath", "desc": "A conscious whirlwind that sucks everything in." },
      "8": { "name": "Shroomlet", "desc": "A mushroom that releases sleep-inducing spores." },
      "9": { "name": "Toxishroom", "desc": "A giant mushroom whose spores are toxic." },
      "10": { "name": "Songbird", "desc": "A bird whose song heals wounds." },
      "11": { "name": "Shadelet", "desc": "A mini shadow that mimics others' movements." },
      "12": { "name": "Droplet", "desc": "A magical drop of water that never evaporates." },
      "13": { "name": "Frostlet", "desc": "A snowflake that never melts." },
      "14": { "name": "Glaceling", "desc": "A living block of ice that freezes everything it touches." },
      "15": { "name": "Glacius", "desc": "An ice dragon that creates blizzards." },
      "16": { "name": "Crystaline", "desc": "A small crystal that sings when touched." },
      "17": { "name": "Crystalame", "desc": "A pure crystal entity that refracts light." },
      "18": { "name": "Diamantor", "desc": "A nearly indestructible diamond golem." },
      "19": { "name": "Sparklet", "desc": "A conscious spark that runs on crystals." },
      "20": { "name": "Thunderex", "desc": "A lightning beast that strikes like thunder." },
      "21": { "name": "Rocklett", "desc": "An animated rock that rolls down slopes." },
      "22": { "name": "Mountagnor", "desc": "A living mountain whose steps shake the earth." },
      "23": { "name": "Wavelet", "desc": "A small conscious wave that plays in currents." },
      "24": { "name": "Tsunamis", "desc": "A titanic wave that devours everything." },
      "25": { "name": "Jellyshock", "desc": "A luminous jellyfish that electrocutes its prey." },
      "26": { "name": "Krakos", "desc": "An ancient kraken that rules the abyss." },
      "27": { "name": "Coralblade", "desc": "A living coral that creates protective reefs." },
      "28": { "name": "Sirenlet", "desc": "A playful siren that attracts sailors." },
      "29": { "name": "Arcanette", "desc": "An arcane spark that appears during rituals." },
      "30": { "name": "Chaoslet", "desc": "A mini chaos vortex that distorts the air." }
    },
    "types": {
      "FLORE": "Flora",
      "LUMIERE": "Light",
      "VENT": "Wind",
      "OMBRE": "Shadow",
      "OCEAN": "Ocean",
      "GLACE": "Ice",
      "CRISTAL": "Crystal",
      "FOUDRE": "Thunder",
      "TERRE": "Earth",
      "ARCANE": "Arcane",
      "CHAOS": "Chaos"
    },
    "rarity": {
      "common": "Common",
      "uncommon": "Uncommon",
      "rare": "Rare",
      "epic": "Epic",
      "legendary": "Legendary"
    },
    "notifications": {
      "saved": "Game saved!",
      "loaded": "Game loaded!",
      "reset": "Game reset!",
      "error": "Error!",
      "success": "Success!"
    }
  },
  "es": {
    "game": {
      "title": "EchoClicker",
      "subtitle": "Enlaces Eternos",
      "welcome": "¡Bienvenido a EchoClicker: Enlaces Eternos!",
      "welcomeCombat": "¡Bienvenido, Tejedor de Enlaces! Elige una ruta en el mapa para comenzar la aventura."
    },
    "currencies": {
      "energy": "Energía Aether",
      "links": "Enlaces Aether",
      "crystals": "Cristales Puros",
      "shards": "Fragmentos Aether"
    },
    "nav": {
      "adventure": "🗺️ Aventura",
      "party": "👥 Equipo",
      "capture": "🔮 Captura",
      "pokedex": "📖 Registro",
      "hatchery": "🥚 Incubadora",
      "mine": "⛏️ Mina",
      "shop": "🏪 Tienda",
      "achievements": "🏆 Logros"
    },
    "buttons": {
      "save": "Guardar",
      "settings": "Ajustes",
      "attack": "⚔️ Atacar",
      "capture": "🔮 Capturar",
      "flee": "🏃 Huir",
      "heal": "💊 Curar",
      "buy": "Comprar",
      "sell": "Vender",
      "confirm": "Confirmar",
      "cancel": "Cancelar",
      "close": "Cerrar",
      "back": "Atrás",
      "next": "Siguiente",
      "previous": "Anterior"
    },
    "combat": {
      "enemySide": "Enemigo",
      "playerSide": "Tu Echo",
      "victory": "¡Victoria!",
      "defeat": "Derrota...",
      "captureSuccess": "¡{name} capturado!",
      "captureFailed": "¡Captura fallida!",
      "autoCaptureSuccess": "🔮 Auto: ¡{name} capturado!",
      "autoCaptureFailed": "🔮 Auto-captura fallida: {name}",
      "fled": "¡Has huido del combate!",
      "enemyFled": "¡El enemigo ha huido!",
      "criticalHit": "¡Golpe crítico!",
      "superEffective": "¡Es súper efectivo!",
      "notVeryEffective": "No es muy efectivo...",
      "noEchoAvailable": "¡No hay Echo disponible!",
      "partyFull": "¡Equipo completo! (máx 6)",
      "optimalTeamCreated": "¡⚡ Equipo óptimo creado!",
      "newTeam": "Nuevo equipo: {names}"
    },
    "capture": {
      "notEnoughLinks": "¡No hay suficientes Enlaces Aether!",
      "autoNotEnoughLinks": "Auto-captura: {name} (no hay suficientes Enlaces)",
      "routeLocked": "¡Ruta no desbloqueada!",
      "regionLocked": "¡Región no desbloqueada!",
      "newRoute": "¡Nueva ruta: {name}!",
      "newRegion": "¡Nueva región desbloqueada: {name}!"
    },
    "map": {
      "title": "Mapa del Mundo",
      "regions": "Regiones",
      "routes": "Rutas",
      "locked": "Bloqueado",
      "unlocked": "Desbloqueado",
      "level": "Nivel {level}"
    },
    "party": {
      "title": "Tu Equipo",
      "empty": "No hay Echo en el equipo",
      "leader": "Líder",
      "slot": "Espacio {number}",
      "hp": "PS",
      "atk": "ATQ",
      "def": "DEF",
      "spd": "VEL",
      "level": "Nv. {level}",
      "addToParty": "Añadir al equipo",
      "removeFromParty": "Quitar del equipo"
    },
    "pokedex": {
      "title": "Registro de Ecos",
      "discovered": "Descubiertos",
      "captured": "Capturados",
      "total": "Total",
      "noEntry": "Sin entrada",
      "unknown": "Desconocido"
    },
    "hatchery": {
      "title": "Incubadora",
      "incubator": "Incubadora",
      "empty": "No hay huevo en incubación",
      "hatch": "¡Eclosionar!",
      "hatching": "Eclosionando...",
      "ready": "¡Listo para eclosionar!",
      "noEggs": "No hay huevos disponibles",
      "createEgg": "🥚 Crear un huevo"
    },
    "mine": {
      "title": "Mina Subterránea",
      "desc": "¡Cava para encontrar Cristales Puros y tesoros!",
      "energy": "Energía",
      "maxEnergy": "Energía máx",
      "regenIn": "Regen en {time}",
      "dig": "Cavar",
      "reveal": "Revelar",
      "found": "Encontrado: {item}",
      "empty": "Nada aquí...",
      "bomb": "¡💣 Bomba!",
      "pickaxe": "Pico",
      "radar": "Radar",
      "remainingEnergy": "Energía restante",
      "crystalsFound": "Cristales encontrados",
      "energyRegen": "+1 energía cada 30 segundos"
    },
    "shop": {
      "title": "Mercado de Espíritus",
      "buy": "Comprar",
      "sell": "Vender",
      "price": "Precio",
      "owned": "Poseído",
      "notEnoughCrystals": "¡No hay suficientes Cristales Puros!",
      "purchaseSuccess": "¡Compra exitosa!",
      "sellSuccess": "¡Venta exitosa!",
      "links": "Enlaces",
      "boosts": "Potenciadores",
      "items": "Objetos",
      "cosmetics": "Cosméticos"
    },
    "achievements": {
      "title": "Logros",
      "unlocked": "¡Desbloqueado!",
      "locked": "Bloqueado",
      "progress": "Progreso",
      "reward": "Recompensa"
    },
    "settings": {
      "title": "Ajustes",
      "language": "Idioma",
      "sound": "Sonido",
      "music": "Música",
      "notifications": "Notificaciones",
      "autoSave": "Guardado auto",
      "reset": "Reiniciar",
      "export": "Exportar",
      "import": "Importar"
    },
    "echoes": {
      "1": { "name": "Bolita", "desc": "Una pequeña bola de musgo que rueda sin rumbo." },
      "2": { "name": "Hojarina", "desc": "Un brote mágico que pulsa con luz verde." },
      "3": { "name": "Silvaguardia", "desc": "Un árbol viviente cuyas raíces cantan." },
      "4": { "name": "Luciérnaga", "desc": "Una luciérnaga mágica que ilumina los caminos." },
      "5": { "name": "Luminara", "desc": "Un hada de luz que danza entre los rayos." },
      "6": { "name": "HojaViento", "desc": "Una hoja viviente que vuela con el viento." },
      "7": { "name": "Torbellino", "desc": "Un torbellino consciente que lo absorbe todo." },
      "8": { "name": "Champiñito", "desc": "Un champiñón que libera esporas somníferas." },
      "9": { "name": "Toxichampi", "desc": "Un champiñón gigante cuyas esporas son tóxicas." },
      "10": { "name": "Ruiseñor", "desc": "Un pájaro cuyo canto cura las heridas." },
      "11": { "name": "Sombrilla", "desc": "Una mini sombra que imita los movimientos de otros." },
      "12": { "name": "Gotita", "desc": "Una gota de agua mágica que nunca se evapora." },
      "13": { "name": "Copito", "desc": "Un copo de nieve que nunca se derrite." },
      "14": { "name": "Heladito", "desc": "Un bloque de hielo viviente que congela todo contacto." },
      "15": { "name": "Glacius", "desc": "Un dragón de hielo que crea ventiscas." },
      "16": { "name": "Cristalina", "desc": "Un pequeño cristal que canta al tocarlo." },
      "17": { "name": "Cristalama", "desc": "Una entidad de cristal puro que refracta la luz." },
      "18": { "name": "Diamantor", "desc": "Un golem de diamante casi indestructible." },
      "19": { "name": "Chispita", "desc": "Una chispa consciente que corre sobre los cristales." },
      "20": { "name": "Truenex", "desc": "Una bestia de rayo que golpea como el trueno." },
      "21": { "name": "Rocita", "desc": "Una roca animada que desciende por las pendientes." },
      "22": { "name": "Montañor", "desc": "Una montaña viviente cuyos pasos hacen temblar la tierra." },
      "23": { "name": "Olejita", "desc": "Una pequeña ola consciente que juega en las corrientes." },
      "24": { "name": "Tsunamis", "desc": "Una ola titánica que lo devora todo." },
      "25": { "name": "Meduseléctrica", "desc": "Una medusa luminosa que electrocuta a sus presas." },
      "26": { "name": "Krakos", "desc": "Un kraken antiguo que gobierna el abismo." },
      "27": { "name": "Coralvivo", "desc": "Un coral viviente que crea arrecifes protectores." },
      "28": { "name": "Sirenita", "desc": "Una sirena juguetona que atrae a los marineros." },
      "29": { "name": "Arcaneta", "desc": "Una chispa arcanica que aparece durante los rituales." },
      "30": { "name": "Caosito", "desc": "Un mini vórtice de caos que distorsiona el aire." }
    },
    "types": {
      "FLORE": "Flora",
      "LUMIERE": "Luz",
      "VENT": "Viento",
      "OMBRE": "Sombra",
      "OCEAN": "Océano",
      "GLACE": "Hielo",
      "CRISTAL": "Cristal",
      "FOUDRE": "Rayo",
      "TERRE": "Tierra",
      "ARCANE": "Arcano",
      "CHAOS": "Caos"
    },
    "rarity": {
      "common": "Común",
      "uncommon": "Poco común",
      "rare": "Raro",
      "epic": "Épico",
      "legendary": "Legendario"
    },
    "notifications": {
      "saved": "¡Partida guardada!",
      "loaded": "¡Partida cargada!",
      "reset": "¡Partida reiniciada!",
      "error": "¡Error!",
      "success": "¡Éxito!"
    }
  },
  "de": {
    "game": {
      "title": "EchoClicker",
      "subtitle": "Ewige Verbindungen",
      "welcome": "Willkommen bei EchoClicker: Ewige Verbindungen!",
      "welcomeCombat": "Willkommen, Verbindungsflechter! Wähle eine Route auf der Karte, um das Abenteuer zu beginnen."
    },
    "currencies": {
      "energy": "Aether-Energie",
      "links": "Aether-Verbindungen",
      "crystals": "Reine Kristalle",
      "shards": "Aether-Splitter"
    },
    "nav": {
      "adventure": "🗺️ Abenteuer",
      "party": "👥 Team",
      "capture": "🔮 Fangen",
      "pokedex": "📖 Logbuch",
      "hatchery": "🥚 Zucht",
      "mine": "⛏️ Mine",
      "shop": "🏪 Laden",
      "achievements": "🏆 Erfolge"
    },
    "buttons": {
      "save": "Speichern",
      "settings": "Einstellungen",
      "attack": "⚔️ Angreifen",
      "capture": "🔮 Fangen",
      "flee": "🏃 Fliehen",
      "heal": "💊 Heilen",
      "buy": "Kaufen",
      "sell": "Verkaufen",
      "confirm": "Bestätigen",
      "cancel": "Abbrechen",
      "close": "Schließen",
      "back": "Zurück",
      "next": "Weiter",
      "previous": "Zurück"
    },
    "combat": {
      "enemySide": "Gegner",
      "playerSide": "Dein Echo",
      "victory": "Sieg!",
      "defeat": "Niederlage...",
      "captureSuccess": "{name} gefangen!",
      "captureFailed": "Fang fehlgeschlagen!",
      "autoCaptureSuccess": "🔮 Auto: {name} gefangen!",
      "autoCaptureFailed": "🔮 Auto-Fang fehlgeschlagen: {name}",
      "fled": "Du bist aus dem Kampf geflohen!",
      "enemyFled": "Der Gegner ist geflohen!",
      "criticalHit": "Volltreffer!",
      "superEffective": "Es ist sehr effektiv!",
      "notVeryEffective": "Es ist nicht sehr effektiv...",
      "noEchoAvailable": "Kein Echo verfügbar!",
      "partyFull": "Team voll! (max 6)",
      "optimalTeamCreated": "⚡ Optimales Team erstellt!",
      "newTeam": "Neues Team: {names}"
    },
    "capture": {
      "notEnoughLinks": "Nicht genug Aether-Verbindungen!",
      "autoNotEnoughLinks": "Auto-Fang: {name} (nicht genug Verbindungen)",
      "routeLocked": "Route nicht freigeschaltet!",
      "regionLocked": "Region nicht freigeschaltet!",
      "newRoute": "Neue Route: {name}!",
      "newRegion": "Neue Region freigeschaltet: {name}!"
    },
    "map": {
      "title": "Weltkarte",
      "regions": "Regionen",
      "routes": "Routen",
      "locked": "Gesperrt",
      "unlocked": "Freigeschaltet",
      "level": "Stufe {level}"
    },
    "party": {
      "title": "Dein Team",
      "empty": "Kein Echo im Team",
      "leader": "Anführer",
      "slot": "Platz {number}",
      "hp": "KP",
      "atk": "ATK",
      "def": "DEF",
      "spd": "GES",
      "level": "St. {level}",
      "addToParty": "Zum Team hinzufügen",
      "removeFromParty": "Aus dem Team entfernen"
    },
    "pokedex": {
      "title": "Echo-Logbuch",
      "discovered": "Entdeckt",
      "captured": "Gefangen",
      "total": "Gesamt",
      "noEntry": "Kein Eintrag",
      "unknown": "Unbekannt"
    },
    "hatchery": {
      "title": "Zucht",
      "incubator": "Inkubator",
      "empty": "Kein Ei in Inkubation",
      "hatch": "Schlüpfen!",
      "hatching": "Schlüpft...",
      "ready": "Bereit zum Schlüpfen!",
      "noEggs": "Keine Eier verfügbar",
      "createEgg": "🥚 Ei erstellen"
    },
    "mine": {
      "title": "Untergrundmine",
      "desc": "Grabe, um reine Kristalle und Schätze zu finden!",
      "energy": "Energie",
      "maxEnergy": "Max Energie",
      "regenIn": "Regen in {time}",
      "dig": "Graben",
      "reveal": "Aufdecken",
      "found": "Gefunden: {item}",
      "empty": "Nichts hier...",
      "bomb": "💣 Bombe!",
      "pickaxe": "Spitzhacke",
      "radar": "Radar",
      "remainingEnergy": "Verbleibende Energie",
      "crystalsFound": "Kristalle gefunden",
      "energyRegen": "+1 Energie alle 30 Sekunden"
    },
    "shop": {
      "title": "Geistermarkt",
      "buy": "Kaufen",
      "sell": "Verkaufen",
      "price": "Preis",
      "owned": "Besessen",
      "notEnoughCrystals": "Nicht genug reine Kristalle!",
      "purchaseSuccess": "Kauf erfolgreich!",
      "sellSuccess": "Verkauf erfolgreich!",
      "links": "Verbindungen",
      "boosts": "Verstärkungen",
      "items": "Gegenstände",
      "cosmetics": "Kosmetik"
    },
    "achievements": {
      "title": "Erfolge",
      "unlocked": "Freigeschaltet!",
      "locked": "Gesperrt",
      "progress": "Fortschritt",
      "reward": "Belohnung"
    },
    "settings": {
      "title": "Einstellungen",
      "language": "Sprache",
      "sound": "Sound",
      "music": "Musik",
      "notifications": "Benachrichtigungen",
      "autoSave": "Auto-Speichern",
      "reset": "Zurücksetzen",
      "export": "Exportieren",
      "import": "Importieren"
    },
    "echoes": {
      "1": { "name": "Moosling", "desc": "Eine kleine Mooskugel, die ziellos rollt." },
      "2": { "name": "Blattflamme", "desc": "Ein magischer Spross, der mit grünem Licht pulsiert." },
      "3": { "name": "Waldwächter", "desc": "Ein lebender Baum, dessen Wurzeln singen." },
      "4": { "name": "Glühwürmchen", "desc": "Ein magisches Glühwürmchen, das die Wege beleuchtet." },
      "5": { "name": "Luminara", "desc": "Eine Lichtfee, die zwischen den Strahlen tanzt." },
      "6": { "name": "Blätterwind", "desc": "Ein lebendes Blatt, das im Wind fliegt." },
      "7": { "name": "Wirbelsturm", "desc": "Ein bewusster Wirbelsturm, der alles einsaugt." },
      "8": { "name": "Pilzling", "desc": "Ein Pilz, der einschlafende Sporen freisetzt." },
      "9": { "name": "Toxipilz", "desc": "Ein riesiger Pilz, dessen Sporen giftig sind." },
      "10": { "name": "Nachtigall", "desc": "Ein Vogel, dessen Gesang Wunden heilt." },
      "11": { "name": "Schattling", "desc": "Ein Mini-Schatten, der die Bewegungen anderer nachahmt." },
      "12": { "name": "Tropfeling", "desc": "Ein magischer Wassertropfen, der nie verdunstet." },
      "13": { "name": "Flockling", "desc": "Eine Schneeflocke, die nie schmilzt." },
      "14": { "name": "Frostling", "desc": "Ein lebender Eisblock, der jeden Kontakt einfriert." },
      "15": { "name": "Glacius", "desc": "Ein Eisdrache, der Schneestürme erzeugt." },
      "16": { "name": "Kristalline", "desc": "Ein kleiner Kristall, der beim Berühren singt." },
      "17": { "name": "Kristallklinge", "desc": "Ein reines Kristallwesen, das Licht bricht." },
      "18": { "name": "Diamantor", "desc": "Ein nahezu unzerstörbarer Diamantgolem." },
      "19": { "name": "Fünkchen", "desc": "Ein bewusster Funke, der auf Kristallen läuft." },
      "20": { "name": "Donnerex", "desc": "Ein Blitzwesen, das wie der Donner zuschlägt." },
      "21": { "name": "Steinling", "desc": "Ein animierter Fels, der Hänge hinunterrollt." },
      "22": { "name": "Bergnor", "desc": "Ein lebender Berg, dessen Schritte die Erde erbeben lassen." },
      "23": { "name": "Wellchen", "desc": "Eine kleine bewusste Welle, die in Strömungen spielt." },
      "24": { "name": "Tsunamis", "desc": "Eine titanische Welle, die alles verschlingt." },
      "25": { "name": "Quallenschock", "desc": "Eine leuchtende Qualle, die ihre Beute elektrokiert." },
      "26": { "name": "Krakos", "desc": "Ein alter Krake, der über den Abgrund herrscht." },
      "27": { "name": "Korallenklinge", "desc": "Eine lebende Koralle, die schützende Riffe bildet." },
      "28": { "name": "Sirenette", "desc": "Eine verspielte Sirene, die Seeleute anlockt." },
      "29": { "name": "Arkanette", "desc": "Ein arkaner Funke, der während Ritualen erscheint." },
      "30": { "name": "Chaosling", "desc": "Ein Mini-Chaoswirbel, der die Luft verzerrt." }
    },
    "types": {
      "FLORE": "Flora",
      "LUMIERE": "Licht",
      "VENT": "Wind",
      "OMBRE": "Schatten",
      "OCEAN": "Ozean",
      "GLACE": "Eis",
      "CRISTAL": "Kristall",
      "FOUDRE": "Donner",
      "TERRE": "Erde",
      "ARCANE": "Arkan",
      "CHAOS": "Chaos"
    },
    "rarity": {
      "common": "Gewöhnlich",
      "uncommon": "Ungewöhnlich",
      "rare": "Selten",
      "epic": "Episch",
      "legendary": "Legendär"
    },
    "notifications": {
      "saved": "Spiel gespeichert!",
      "loaded": "Spiel geladen!",
      "reset": "Spiel zurückgesetzt!",
      "error": "Fehler!",
      "success": "Erfolg!"
    }
  },
  "ja": {
    "game": {
      "title": "エコークリッカー",
      "subtitle": "永遠の絆",
      "welcome": "エコークリッカー：永遠の絆へようこそ！",
      "welcomeCombat": "ようこそ、絆の紡ぎ手よ！マップからルートを選んで冒険を始めよう。"
    },
    "currencies": {
      "energy": "エナジーエーテル",
      "links": "エーテルの絆",
      "crystals": "純クリスタル",
      "shards": "エーテルの欠片"
    },
    "nav": {
      "adventure": "🗺️ 冒険",
      "party": "👥 パーティ",
      "capture": "🔮 キャプチャ",
      "pokedex": "📖 ログブック",
      "hatchery": "🥚 孵化",
      "mine": "⛏️ 鉱山",
      "shop": "🏪 ショップ",
      "achievements": "🏆 実績"
    },
    "buttons": {
      "save": "セーブ",
      "settings": "設定",
      "attack": "⚔️ 攻撃",
      "capture": "🔮 キャプチャ",
      "flee": "🏃 逃走",
      "heal": "💊 回復",
      "buy": "購入",
      "sell": "売却",
      "confirm": "確認",
      "cancel": "キャンセル",
      "close": "閉じる",
      "back": "戻る",
      "next": "次へ",
      "previous": "前へ"
    },
    "combat": {
      "enemySide": "敵",
      "playerSide": "あなたのエコー",
      "victory": "勝利！",
      "defeat": "敗北...",
      "captureSuccess": "{name}をキャプチャした！",
      "captureFailed": "キャプチャ失敗！",
      "autoCaptureSuccess": "🔮 オート：{name}をキャプチャした！",
      "autoCaptureFailed": "🔮 オートキャプチャ失敗：{name}",
      "fled": "戦闘から逃走した！",
      "enemyFled": "敵が逃走した！",
      "criticalHit": "クリティカルヒット！",
      "superEffective": "効果は抜群だ！",
      "notVeryEffective": "効果は今ひとつだ...",
      "noEchoAvailable": "エコーがいない！",
      "partyFull": "パーティがいっぱい！（最大6体）",
      "optimalTeamCreated": "⚡ 最適なチームを作成した！",
      "newTeam": "新しいチーム：{names}"
    },
    "capture": {
      "notEnoughLinks": "エーテルの絆が足りない！",
      "autoNotEnoughLinks": "オートキャプチャ：{name}（絆が不足）",
      "routeLocked": "ルートが未解放！",
      "regionLocked": "地域が未解放！",
      "newRoute": "新しいルート：{name}！",
      "newRegion": "新しい地域を解放：{name}！"
    },
    "map": {
      "title": "ワールドマップ",
      "regions": "地域",
      "routes": "ルート",
      "locked": "ロック中",
      "unlocked": "解放済み",
      "level": "レベル{level}"
    },
    "party": {
      "title": "あなたのパーティ",
      "empty": "パーティにエコーがいない",
      "leader": "リーダー",
      "slot": "スロット{number}",
      "hp": "HP",
      "atk": "ATK",
      "def": "DEF",
      "spd": "SPD",
      "level": "Lv.{level}",
      "addToParty": "パーティに追加",
      "removeFromParty": "パーティから外す"
    },
    "pokedex": {
      "title": "エコーログブック",
      "discovered": "発見",
      "captured": "キャプチャ",
      "total": "合計",
      "noEntry": "エントリーなし",
      "unknown": "不明"
    },
    "hatchery": {
      "title": "孵化施設",
      "incubator": "インキュベーター",
      "empty": "孵化中の卵がない",
      "hatch": "孵化！",
      "hatching": "孵化中...",
      "ready": "孵化準備完了！",
      "noEggs": "卵がない",
      "createEgg": "🥚 卵を作成"
    },
    "mine": {
      "title": "地下鉱山",
      "desc": "掘って純クリスタルと宝物を見つけよう！",
      "energy": "エネルギー",
      "maxEnergy": "最大エネルギー",
      "regenIn": "回復まで{time}",
      "dig": "掘る",
      "reveal": "発見",
      "found": "発見：{item}",
      "empty": "何もなし...",
      "bomb": "💣 爆弾！",
      "pickaxe": "つるはし",
      "radar": "レーダー",
      "remainingEnergy": "残りエネルギー",
      "crystalsFound": "クリスタル発見数",
      "energyRegen": "30秒ごとにエネルギー+1"
    },
    "shop": {
      "title": "スピリットマーケット",
      "buy": "購入",
      "sell": "売却",
      "price": "価格",
      "owned": "所持",
      "notEnoughCrystals": "純クリスタルが足りない！",
      "purchaseSuccess": "購入成功！",
      "sellSuccess": "売却成功！",
      "links": "リンク",
      "boosts": "ブースト",
      "items": "アイテム",
      "cosmetics": "コスメティック"
    },
    "achievements": {
      "title": "実績",
      "unlocked": "解放！",
      "locked": "ロック中",
      "progress": "進捗",
      "reward": "報酬"
    },
    "settings": {
      "title": "設定",
      "language": "言語",
      "sound": "効果音",
      "music": "音楽",
      "notifications": "通知",
      "autoSave": "オートセーブ",
      "reset": "リセット",
      "export": "エクスポート",
      "import": "インポート"
    },
    "echoes": {
      "1": { "name": "モスリング", "desc": "目的もなく転がる小さな苔の玉。" },
      "2": { "name": "リーフレイム", "desc": "緑の光で脈動する魔法の芽。" },
      "3": { "name": "シルバガード", "desc": "根が歌う生きている木。" },
      "4": { "name": "グリマーフライ", "desc": "道を照らす魔法の蛍。" },
      "5": { "name": "ルミナラ", "desc": "光線の間で踊る光の妖精。" },
      "6": { "name": "リーフウィンド", "desc": "風で飛ぶ生きている葉。" },
      "7": { "name": "サイクロラス", "desc": "全てを吸い込む意識のある竜巻。" },
      "8": { "name": "シュルームレット", "desc": "眠気を催す胞子を放出するキノコ。" },
      "9": { "name": "トキシシュルーム", "desc": "胞子が有毒な巨大なキノコ。" },
      "10": { "name": "ソングバード", "desc": "歌で傷を癒す鳥。" },
      "11": { "name": "シェードレット", "desc": "他の動きを真似するミニ影。" },
      "12": { "name": "ドロプレット", "desc": "蒸発しない魔法の水滴。" },
      "13": { "name": "フロストレット", "desc": "溶けない雪の結晶。" },
      "14": { "name": "グレイスリング", "desc": "接触したものを全て凍らせる生きている氷の塊。" },
      "15": { "name": "グラシウス", "desc": "吹雪を生み出す氷のドラゴン。" },
      "16": { "name": "クリスタライン", "desc": "触れると歌う小さなクリスタル。" },
      "17": { "name": "クリスタルレイム", "desc": "光を屈折させる純粋なクリスタルの存在。" },
      "18": { "name": "ダイヤマントル", "desc": "ほぼ破壊不可能なダイヤモンドゴーレム。" },
      "19": { "name": "スパークレット", "desc": "クリスタルの上を走る意識のある火花。" },
      "20": { "name": "サンダレックス", "desc": "雷のように攻撃する雷の獣。" },
      "21": { "name": "ロックレット", "desc": "斜面を転がり落ちるアニメーションされた岩。" },
      "22": { "name": "マウンテンノール", "desc": "足跡が大地を揺らす生きている山。" },
      "23": { "name": "ウェーブレット", "desc": "流れの中で遊ぶ小さな意識のある波。" },
      "24": { "name": "ツナミス", "desc": "全てを飲み込む巨大な波。" },
      "25": { "name": "ジェリーショック", "desc": "獲物を感電させる発光するクラゲ。" },
      "26": { "name": "クラコス", "desc": "深淵を支配する古代のクラーケン。" },
      "27": { "name": "コーラルブレイド", "desc": "守護的なサンゴ礁を作る生きているサンゴ。" },
      "28": { "name": "シレネット", "desc": "船員を引きつけるいたずら好きなセイレーン。" },
      "29": { "name": "アーカネット", "desc": "儀式中に現れるアルケインの火花。" },
      "30": { "name": "カオスレット", "desc": "空気を歪めるミニカオス渦。" }
    },
    "types": {
      "FLORE": "植物",
      "LUMIERE": "光",
      "VENT": "風",
      "OMBRE": "影",
      "OCEAN": "海",
      "GLACE": "氷",
      "CRISTAL": "クリスタル",
      "FOUDRE": "雷",
      "TERRE": "土",
      "ARCANE": "秘術",
      "CHAOS": "混沌"
    },
    "rarity": {
      "common": "コモン",
      "uncommon": "アンコモン",
      "rare": "レア",
      "epic": "エピック",
      "legendary": "レジェンダリー"
    },
    "notifications": {
      "saved": "セーブしました！",
      "loaded": "ロードしました！",
      "reset": "リセットしました！",
      "error": "エラー！",
      "success": "成功！"
    }
  }
};

class I18n {
    constructor() {
        this.currentLang = 'fr';
        this.translations = TRANSLATIONS;
        this.fallbackLang = 'fr';
        this.loaded = false;
        this.listeners = [];
    }

    init() {
        const savedLang = localStorage.getItem('echoclicker_lang') || 'fr';
        this.setLanguage(savedLang);
        this.loaded = true;
        console.log(`[i18n] Système initialisé avec la langue: ${this.currentLang}`);
    }

    setLanguage(lang) {
        try {
            if (!this.translations[lang]) {
                console.warn(`[i18n] Langue ${lang} non disponible, utilisation du français`);
                lang = this.fallbackLang;
            }
            this.currentLang = lang;
            localStorage.setItem('echoclicker_lang', lang);
            this.notifyListeners();
            console.log(`[i18n] Langue changée vers: ${lang}`);
            return true;
        } catch (error) {
            console.error(`[i18n] Erreur lors du changement de langue:`, error);
            return false;
        }
    }

    t(key, params = {}) {
        let text = this.getNestedValue(this.translations[this.currentLang], key);
        if (text === undefined && this.currentLang !== this.fallbackLang) {
            text = this.getNestedValue(this.translations[this.fallbackLang], key);
        }
        if (text === undefined) {
            console.warn(`[i18n] Clé non trouvée: ${key}`);
            return key;
        }
        if (typeof text === 'string' && Object.keys(params).length > 0) {
            return text.replace(/\{(\w+)\}/g, (match, paramName) => {
                return params[paramName] !== undefined ? params[paramName] : match;
            });
        }
        return text;
    }

    getNestedValue(obj, path) {
        if (!obj) return undefined;
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    getCurrentLang() {
        return this.currentLang;
    }

    getSupportedLanguages() {
        return ['fr', 'en', 'es', 'de', 'ja'];
    }

    getLanguageName(lang) {
        const names = {
            'fr': 'Français',
            'en': 'English',
            'es': 'Español',
            'de': 'Deutsch',
            'ja': '日本語'
        };
        return names[lang] || lang;
    }

    getLanguageFlag(lang) {
        const flags = {
            'fr': '🇫🇷',
            'en': '🇬🇧',
            'es': '🇪🇸',
            'de': '🇩🇪',
            'ja': '🇯🇵'
        };
        return flags[lang] || '🏳️';
    }

    onLanguageChange(callback) {
        this.listeners.push(callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.currentLang);
            } catch (error) {
                console.error('[i18n] Erreur dans un listener:', error);
            }
        });
    }

    translateDOM() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });
    }
}

const i18n = new I18n();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = i18n;
}