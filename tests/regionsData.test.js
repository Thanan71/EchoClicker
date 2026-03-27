// ============================================
// Tests de validation - regions-data.js
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

// Charger le fichier et extraire ECHOES_DB
const echoesCode = fs.readFileSync(path.join(__dirname, '../js/data/echoesData.js'), 'utf-8');
const echoesContext = { ECHOES_DB: undefined };
echoesContext.echoesContext = echoesContext; // self-reference for VM
const echoesCodeToEval = echoesCode.replace('const ECHOES_DB', 'echoesContext.ECHOES_DB');
vm.createContext(echoesContext);
vm.runInContext(echoesCodeToEval, echoesContext);
const ECHOES_DB = echoesContext.ECHOES_DB;

// Charger regionsData pour avoir REGIONS
const regionsCode = fs.readFileSync(path.join(__dirname, '../js/data/regions-data.js'), 'utf-8');
const regionsContext = { REGIONS: undefined };
regionsContext.regionsContext = regionsContext; // self-reference for VM
const regionsCodeToEval = regionsCode.replace('const REGIONS', 'regionsContext.REGIONS');
vm.createContext(regionsContext);
vm.runInContext(regionsCodeToEval, regionsContext);
const REGIONS = regionsContext.REGIONS;

const VALID_ECHO_IDS = new Set(ECHOES_DB.map(e => e.id));

describe('regions-data.js - Regions', () => {
    test('REGIONS est un tableau non vide', () => {
        expect(Array.isArray(REGIONS)).toBe(true);
        expect(REGIONS.length).toBeGreaterThan(0);
    });

    test('IDs de regions uniques', () => {
        const ids = REGIONS.map(r => r.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    test('IDs de routes uniques globalement', () => {
        const routeIds = REGIONS.flatMap(r => r.routes.map(rt => rt.id));
        expect(new Set(routeIds).size).toBe(routeIds.length);
    });

    describe.each(REGIONS.map(r => [r.id, r]))(
        'region "%s"',
        (_, region) => {
            test('a id, name, desc, color hex, routes[], bosses[]', () => {
                expect(typeof region.id).toBe('string');
                expect(region.id.length).toBeGreaterThan(0);
                expect(typeof region.name).toBe('string');
                expect(region.name.length).toBeGreaterThan(0);
                expect(typeof region.desc).toBe('string');
                expect(region.desc.length).toBeGreaterThan(0);
                expect(region.color).toMatch(/^#[0-9a-fA-F]{6}$/);
                expect(Array.isArray(region.routes)).toBe(true);
                expect(region.routes.length).toBeGreaterThan(0);
                expect(Array.isArray(region.bosses)).toBe(true);
                expect(region.bosses.length).toBeGreaterThan(0);
            });

            test('routes ont id, name, lv (X-Y), ids avec Echos valides', () => {
                for (const route of region.routes) {
                    expect(typeof route.id).toBe('string');
                    expect(typeof route.name).toBe('string');
                    expect(route.name.length).toBeGreaterThan(0);
                    expect(route.lv).toMatch(/^\d+-\d+$/);
                    const [min, max] = route.lv.split('-').map(Number);
                    expect(max).toBeGreaterThanOrEqual(min);
                    expect(Array.isArray(route.ids)).toBe(true);
                    expect(route.ids.length).toBeGreaterThan(0);
                    for (const eid of route.ids) {
                        expect(VALID_ECHO_IDS).toContain(eid);
                    }
                }
            });

            test('bosses ont name, echoId valide, level > 0', () => {
                for (const boss of region.bosses) {
                    expect(typeof boss.name).toBe('string');
                    expect(boss.name.length).toBeGreaterThan(0);
                    expect(typeof boss.echoId).toBe('number');
                    expect(VALID_ECHO_IDS).toContain(boss.echoId);
                    expect(typeof boss.level).toBe('number');
                    expect(boss.level).toBeGreaterThan(0);
                }
            });
        }
    );
});