// ============================================
// ÉchoClicker - Types élémentaires & Table de type
// ============================================

export const TYPES = {
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
// Règle: si A est strong contre B, alors B est weak contre A
export const TYPE_CHART = {
    FEU: {
        strong: ['FLORE', 'GLACE'],
        weak:   ['OCEAN', 'TERRE', 'CRISTAL']
    },
    GLACE: {
        strong: ['FLORE', 'TERRE', 'OCEAN', 'VENT'],
        weak:   ['FEU', 'FOUDRE', 'ARCANE']
    },
    VENT: {
        strong: ['FLORE', 'ARCANE'],
        weak:   ['FOUDRE', 'CRISTAL', 'GLACE', 'TERRE']
    },
    OMBRE: {
        strong: ['LUMIERE'],                    // ← Ombre bat Lumière (thématique Dark > Light)
        weak:   ['FOUDRE', 'CHAOS', 'ARCANE']
    },
    LUMIERE: {
        strong: ['CHAOS'],
        weak:   ['CRISTAL', 'OCEAN', 'TERRE', 'OMBRE']
    },
    FLORE: {
        strong: ['OCEAN', 'CHAOS', 'ARCANE'],
        weak:   ['FEU', 'GLACE', 'VENT', 'CRISTAL', 'TERRE']
    },
    FOUDRE: {
        strong: ['OCEAN', 'VENT', 'GLACE', 'OMBRE'],
        weak:   ['TERRE', 'CRISTAL', 'CHAOS']
    },
    CRISTAL: {
        strong: ['VENT', 'LUMIERE', 'FOUDRE', 'FEU', 'FLORE', 'ARCANE'],
        weak:   ['TERRE', 'CHAOS', 'OCEAN']
    },
    CHAOS: {
        strong: ['OMBRE', 'ARCANE', 'FOUDRE', 'CRISTAL'],
        weak:   ['FLORE', 'OCEAN', 'TERRE', 'LUMIERE']
    },
    OCEAN: {
        strong: ['FEU', 'CRISTAL', 'LUMIERE', 'CHAOS', 'TERRE'],
        weak:   ['FLORE', 'FOUDRE', 'GLACE']
    },
    TERRE: {
        strong: ['FEU', 'FOUDRE', 'VENT', 'LUMIERE', 'FLORE', 'CRISTAL', 'CHAOS'],
        weak:   ['OCEAN', 'GLACE']
    },
    ARCANE: {
        strong: ['GLACE', 'OMBRE'],
        weak:   ['CHAOS', 'FLORE', 'VENT', 'CRISTAL']
    }
};

// Couleurs de rareté
export const RARITY_COLORS = {
    common:    '#a0a0c0',
    uncommon:  '#55a630',
    rare:      '#3b82f6',
    epic:      '#a855f7',
    legendary: '#f59e0b',
    mythical:  '#ec4899'

};

