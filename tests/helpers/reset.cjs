// ============================================
// Reset beforeEach - appelé avant chaque test
// ============================================

const { EventBus } = require('../__mocks__/eventBus');
const { Game } = require('../__mocks__/game');
const { UI } = require('../__mocks__/ui');

beforeEach(() => {
    EventBus.reset();
    Game.reset();
    UI.reset();
});
