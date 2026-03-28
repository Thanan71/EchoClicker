// ============================================
// Tests unitaires - Constants helpers (js/data/constants.js)
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

// Charger echoesData pour avoir ECHOES_DB
const echoesCode = fs.readFileSync(path.join(__dirname, '../js/data/echoesData.js'), 'utf-8');
const echoesContext = { ECHOES_DB: undefined };
echoesContext.echoesContext = echoesContext; // self-reference for VM
const echoesCodeToEval = echoesCode.replace(/\bexport\b\s*/g, '').replace('const ECHOES_DB', 'echoesContext.ECHOES_DB');
vm.createContext(echoesContext);
vm.runInContext(echoesCodeToEval, echoesContext);
const ECHOES_DB = echoesContext.ECHOES_DB;

// Charger regionsData pour avoir REGIONS
const regionsCode = fs.readFileSync(path.join(__dirname, '../js/data/regions-data.js'), 'utf-8');
const regionsContext = { REGIONS: undefined };
regionsContext.regionsContext = regionsContext; // self-reference for VM
const regionsCodeToEval = regionsCode.replace(/\bexport\b\s*/g, '').replace('const REGIONS', 'regionsContext.REGIONS');
vm.createContext(regionsContext);
vm.runInContext(regionsCodeToEval, regionsContext);
const REGIONS = regionsContext.REGIONS;

// Charger constants
const constantsPath = path.join(__dirname, '../js/data/constants.js');
const constantsCode = fs
    .readFileSync(constantsPath, 'utf-8')
    .replace(/\bexport\b\s*/g, '')
    .replace(/^import \{ ECHOES_DB \} from '.*';$/m, '// ECHOES_DB from context')
    .replace(/^import \{ REGIONS \} from '.*';$/m, '// REGIONS from context');

// Créer un contexte avec ECHOES_DB et REGIONS
const constantsContext = { ECHOES_DB, REGIONS };
vm.createContext(constantsContext);
vm.runInContext(constantsCode, constantsContext);

const { getEchoById, getRegionById } = constantsContext;

describe('getEchoById', () => {
    test('is a function', () => {
        expect(typeof getEchoById).toBe('function');
    });

    test('returns echo data for valid id', () => {
        const firstEcho = ECHOES_DB[0];
        const result = getEchoById(firstEcho.id);
        expect(result).toBeDefined();
        expect(result.id).toBe(firstEcho.id);
    });

    test('returns undefined for invalid id', () => {
        const result = getEchoById('invalid_id_999999');
        expect(result).toBeUndefined();
    });

    test('returns undefined for null', () => {
        const result = getEchoById(null);
        expect(result).toBeUndefined();
    });

    test('returns undefined for undefined', () => {
        const result = getEchoById(undefined);
        expect(result).toBeUndefined();
    });

    test('returns the same object as direct array search', () => {
        const testId = ECHOES_DB[5].id;
        const directResult = ECHOES_DB.find((e) => e.id === testId);
        const helperResult = getEchoById(testId);
        expect(helperResult).toBe(directResult);
    });

    test('works for all echoes in database', () => {
        for (const echo of ECHOES_DB) {
            const result = getEchoById(echo.id);
            expect(result).toBeDefined();
            expect(result.id).toBe(echo.id);
        }
    });
});

describe('getRegionById', () => {
    test('is a function', () => {
        expect(typeof getRegionById).toBe('function');
    });

    test('returns region data for valid id', () => {
        const firstRegion = REGIONS[0];
        const result = getRegionById(firstRegion.id);
        expect(result).toBeDefined();
        expect(result.id).toBe(firstRegion.id);
    });

    test('returns undefined for invalid id', () => {
        const result = getRegionById('invalid_region_999999');
        expect(result).toBeUndefined();
    });

    test('returns undefined for null', () => {
        const result = getRegionById(null);
        expect(result).toBeUndefined();
    });

    test('returns undefined for undefined', () => {
        const result = getRegionById(undefined);
        expect(result).toBeUndefined();
    });

    test('returns the same object as direct array search', () => {
        const testId = REGIONS[2].id;
        const directResult = REGIONS.find((r) => r.id === testId);
        const helperResult = getRegionById(testId);
        expect(helperResult).toBe(directResult);
    });

    test('works for all regions in database', () => {
        for (const region of REGIONS) {
            const result = getRegionById(region.id);
            expect(result).toBeDefined();
            expect(result.id).toBe(region.id);
        }
    });
});
