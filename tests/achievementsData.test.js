// ============================================
// Tests de validation - achievements-data.js
// ============================================

const fs = require('fs');
const path = require('path');

// Charger le fichier et extraire ACHIEVEMENTS
const achCode = fs.readFileSync(path.join(__dirname, '../js/data/achievements-data.js'), 'utf-8');

// Créer un contexte pour capturer ACHIEVEMENTS
const context = {};
const codeToEval = achCode
    .replace(/\bexport\b\s*/g, '')
    .replace('const ACHIEVEMENTS', 'context.ACHIEVEMENTS');
eval(codeToEval);
const ACHIEVEMENTS = context.ACHIEVEMENTS;

describe('achievements-data.js - Succès', () => {
    test('ACHIEVEMENTS est un tableau non vide', () => {
        expect(Array.isArray(ACHIEVEMENTS)).toBe(true);
        expect(ACHIEVEMENTS.length).toBeGreaterThan(0);
    });

    test('IDs uniques', () => {
        const ids = ACHIEVEMENTS.map(a => a.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    test.each(ACHIEVEMENTS.map(a => [a.id, a]))(
        'succès "%s" a id, name, desc, icon, cond fonctionnelle',
        (_, ach) => {
            expect(typeof ach.id).toBe('string');
            expect(ach.id.length).toBeGreaterThan(0);
            expect(typeof ach.name).toBe('string');
            expect(ach.name.length).toBeGreaterThan(0);
            expect(typeof ach.desc).toBe('string');
            expect(ach.desc.length).toBeGreaterThan(0);
            expect(typeof ach.icon).toBe('string');
            expect(ach.icon.length).toBeGreaterThan(0);
            expect(typeof ach.cond).toBe('function');
        }
    );

    test('cond fonctionne avec un état vide (retourne un booléen)', () => {
        const mockState = {
            totalClicks: 0,
            totalCaptures: 0,
            uniqueCaptures: 0,
            primordialCount: 0,
            totalWins: 0,
            totalEnergy: 0,
            maxLevel: 0,
            bossesDefeated: 0,
            regionsUnlocked: 0,
            playTime: 0
        };
        for (const ach of ACHIEVEMENTS) {
            const result = ach.cond(mockState);
            expect(typeof result).toBe('boolean');
        }
    });

    test('cond retourne true quand le seuil est atteint', () => {
        const highState = {
            totalClicks: 999999,
            totalCaptures: 999999,
            uniqueCaptures: 999999,
            primordialCount: 999999,
            totalWins: 999999,
            totalEnergy: 999999,
            maxLevel: 999999,
            bossesDefeated: 999999,
            regionsUnlocked: 999999,
            playTime: 999999
        };
        for (const ach of ACHIEVEMENTS) {
            expect(ach.cond(highState)).toBe(true);
        }
    });
});