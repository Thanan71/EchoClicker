// ============================================
// Tests de validation - echoesData.js
// ============================================

const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadScript(filePath) {
    const code = fs.readFileSync(filePath, 'utf-8');
    const context = {};
    vm.createContext(context);
    vm.runInContext(code, context);
    return context;
}

// Charger types.js pour avoir TYPES et RARITY_COLORS
const typesCode = fs.readFileSync(path.join(__dirname, '../js/data/types.js'), 'utf-8');
const typesContext = { TYPES: undefined, RARITY_COLORS: undefined, TYPE_CHART: undefined };
typesContext.typesContext = typesContext; // self-reference for VM
const typesCodeToEval = typesCode
    .replace(/\bexport\b\s*/g, '')
    .replace('const TYPES', 'typesContext.TYPES')
    .replace('const TYPE_CHART', 'typesContext.TYPE_CHART')
    .replace('const RARITY_COLORS', 'typesContext.RARITY_COLORS');
vm.createContext(typesContext);
vm.runInContext(typesCodeToEval, typesContext);
const TYPES = typesContext.TYPES;
const RARITY_COLORS = typesContext.RARITY_COLORS;

// Charger le fichier et extraire ECHOES_DB
const echoesCode = fs.readFileSync(path.join(__dirname, '../js/data/echoesData.js'), 'utf-8');
const echoesContext = { ECHOES_DB: undefined };
echoesContext.echoesContext = echoesContext; // self-reference for VM
const echoesCodeToEval = echoesCode.replace(/\bexport\b\s*/g, '').replace('const ECHOES_DB', 'echoesContext.ECHOES_DB');
vm.createContext(echoesContext);
vm.runInContext(echoesCodeToEval, echoesContext);
const ECHOES_DB = echoesContext.ECHOES_DB;

describe('echoesData.js - Structure des Echos', () => {
    test('ECHOES_DB est un tableau non vide', () => {
        expect(Array.isArray(ECHOES_DB)).toBe(true);
        expect(ECHOES_DB.length).toBeGreaterThan(0);
    });

    test('IDs uniques', () => {
        const ids = ECHOES_DB.map((e) => e.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    test('noms uniques', () => {
        const names = ECHOES_DB.map((e) => e.name);
        expect(new Set(names).size).toBe(names.length);
    });

    test.each(ECHOES_DB.map((e) => [e.id, e.name, e]))(
        'Echo #%s "%s" a id, name, type valide, rarity valide, stats > 0, captureRate',
        (_, __, echo) => {
            // id
            expect(typeof echo.id).toBe('number');
            expect(echo.id).toBeGreaterThan(0);

            // name
            expect(typeof echo.name).toBe('string');
            expect(echo.name.length).toBeGreaterThan(0);

            // type
            expect(typeof echo.type).toBe('string');
            expect(Object.keys(TYPES)).toContain(echo.type);

            // rarity
            expect(Object.keys(RARITY_COLORS)).toContain(echo.rarity);

            // stats
            expect(typeof echo.baseHp).toBe('number');
            expect(echo.baseHp).toBeGreaterThan(0);
            expect(typeof echo.baseAtk).toBe('number');
            expect(echo.baseAtk).toBeGreaterThan(0);
            expect(typeof echo.baseDef).toBe('number');
            expect(echo.baseDef).toBeGreaterThan(0);
            expect(typeof echo.baseSpd).toBe('number');
            expect(echo.baseSpd).toBeGreaterThan(0);

            // captureRate
            expect(typeof echo.captureRate).toBe('number');
            expect(echo.captureRate).toBeGreaterThan(0);
            expect(echo.captureRate).toBeLessThanOrEqual(100);
        },
    );

    describe('Chaines d evolution valides', () => {
        test('si evo.to existe, il pointe vers un Echo existant', () => {
            const allIds = new Set(ECHOES_DB.map((e) => e.id));
            for (const echo of ECHOES_DB) {
                if (echo.evo && echo.evo.to) {
                    expect(allIds).toContain(echo.evo.to);
                }
            }
        });

        test('si evo.lv existe, c est un nombre positif', () => {
            for (const echo of ECHOES_DB) {
                if (echo.evo && echo.evo.lv) {
                    expect(typeof echo.evo.lv).toBe('number');
                    expect(echo.evo.lv).toBeGreaterThan(0);
                }
            }
        });

        test('evolution pointe vers un Echo d id superieur', () => {
            for (const echo of ECHOES_DB) {
                if (echo.evo && echo.evo.to) {
                    expect(echo.evo.to).toBeGreaterThan(echo.id);
                }
            }
        });
    });
});
