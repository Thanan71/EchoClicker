import { CombatAuto } from './combat/CombatAuto.js';
import { CombatCapture } from './combat/CombatCapture.js';
// ============================================
// Combat - Facade orchestrant les sous-modules de combat
// ============================================
// Sous-modules:
//   CombatEngine  - spawn, damage, rewards, flow
//   CombatCapture - capture logic, auto-capture
//   CombatAuto    - auto-combat timer
//   CombatParty   - heal, active echo selection
// ============================================
import { CombatEngine } from './combat/CombatEngine.js';
import { CombatParty } from './combat/CombatParty.js';
import { GAME_CONFIG } from './data/game-config.js';

export const Combat = {
  inCombat: false,
  enemy: null,
  activeEcho: null,
  autoTimer: 0,
  routeKills: 0,
  isBoss: false,
  autoCaptureEnabled: false,

  // Dependances injectees (DIP)
  _game: null,
  _ui: null,
  _eventBus: null,

  // Sous-modules
  _engine: CombatEngine,
  _capture: CombatCapture,
  _auto: CombatAuto,
  _party: CombatParty,

  /**
   * Initialise les dependances et les sous-modules.
   * @param {IGameStateProvider} gameRef
   * @param {IUIRenderer} uiRef
   * @param {IEventBus} eventBusRef
   */
  init(gameRef, uiRef, eventBusRef) {
    this._game = gameRef;
    this._ui = uiRef;
    this._eventBus = eventBusRef;

    this._engine.init({
      state: this,
      game: gameRef,
      ui: uiRef,
      eventBus: eventBusRef,
      onEnemyDefeated: () => this._handleEnemyDefeated(),
    });

    this._capture.init({
      state: this,
      game: gameRef,
      ui: uiRef,
    });

    this._auto.init({ state: this });

    this._party.init({
      state: this,
      game: gameRef,
    });
  },

  // === Delegation publique (API existante preservee) ===

  startCombat(route) {
    this._engine.startCombat(route);
  },
  spawnEnemy(route) {
    this._engine.spawnEnemy(route);
  },
  playerClick() {
    this._engine.playerClick();
  },
  attemptCapture() {
    this._capture.attemptCapture();
  },
  healParty() {
    this._party.healParty();
  },
  endCombat() {
    this._engine.endCombat();
  },

  /** Appelle a chaque tick de jeu */
  update(dt) {
    this._auto.update(dt);
  },

  // === Logique interne de la facade ===

  _handleEnemyDefeated() {
    const route = this._game.state.currentRoute;
    if (this.isBoss) {
      this._game.defeatBoss();
      this.isBoss = false;
      this._engine.endCombat();
      return;
    }

    if (this.routeKills >= GAME_CONFIG.KILLS_FOR_ROUTE) {
      this._game.unlockNextRoute();
    }

    if (route) {
      setTimeout(() => this._engine.spawnEnemy(route), 500);
    }
  },
};
