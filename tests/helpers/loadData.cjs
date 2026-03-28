// ============================================
// Helper pour charger les fichiers de donnees
// ============================================

const fs = require('fs');
const path = require('path');
const vm = require('vm');

/** Charge un fichier JS de donnees et retourne les variables exportees */
function loadDataFile(filePath) {
    const code = fs.readFileSync(filePath, 'utf-8');
    // Remplacer const/let par var pour que vm.runInNewContext capture les variables
    // Supprimer les export statements pour compatibilité CommonJS
    const patched = code
        .replace(/\bexport\b\s*/g, '')
        .replace(/\bconst\b/g, 'var')
        .replace(/\blet\b/g, 'var');
    const context = {};
    vm.createContext(context);
    vm.runInNewContext(patched, context);
    return context;
}

module.exports = { loadDataFile };
