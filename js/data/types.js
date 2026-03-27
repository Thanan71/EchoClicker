// ============================================
// ÉchoClicker - Types élémentaires & Table de type
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
