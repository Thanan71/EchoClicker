// ============================================
// Mock UI - Simule l'objet UI pour les tests
// ============================================

const UI = {
    toast: jest.fn(),
    addLog: jest.fn(),
    updateCombat: jest.fn(),
    spawnDamageParticle: jest.fn(),
    showModal: jest.fn(),
    closeModal: jest.fn(),
    renderParty: jest.fn(),
    renderPokedex: jest.fn(),
    renderRoutes: jest.fn(),
    renderQuests: jest.fn(),
    spawnParticle: jest.fn(),
    switchTab: jest.fn(),
    showSettings: jest.fn(),
    captureClick: jest.fn(),
    updateCombat: jest.fn(),
    toast: jest.fn(),

    /** Reset de tous les mocks */
    reset() {
        Object.keys(this).forEach(key => {
            if (typeof this[key] === 'function' && this[key].mockClear) {
                this[key].mockClear();
            }
        });
    }
};

module.exports = { UI };
