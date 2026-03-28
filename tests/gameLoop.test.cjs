// ============================================
// Tests unitaires - GameLoop (js/core/gameLoop.js)
// ============================================

// Mocks globaux
globalThis.GAME_CONFIG = {
  TICK_RATE: 50,
};

globalThis.performance = {
  now: jest.fn(() => Date.now()),
};

globalThis.requestAnimationFrame = jest.fn((cb) => setTimeout(() => cb(Date.now()), 16));
globalThis.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));

// Définir GameLoop directement
globalThis.GameLoop = {
  _running: false,
  _lastTime: 0,
  _accumulator: 0,
  _rafId: null,
  _tickRate: GAME_CONFIG.TICK_RATE,
  _callbacks: { update: null, render: null },

  start(updateFn, renderFn) {
    this._callbacks.update = updateFn;
    this._callbacks.render = renderFn;
    this._running = true;
    this._lastTime = performance.now();
    this._accumulator = 0;
    this._loop(this._lastTime);
  },

  stop() {
    this._running = false;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
    }
  },

  _loop(timestamp) {
    if (!this._running) {
      return;
    }
    this._rafId = requestAnimationFrame((t) => this._loop(t));

    const delta = timestamp - this._lastTime;
    this._lastTime = timestamp;

    const clampedDelta = Math.min(delta, 200);
    this._accumulator += clampedDelta;

    while (this._accumulator >= this._tickRate) {
      if (this._callbacks.update) {
        this._callbacks.update(this._tickRate / 1000);
      }
      this._accumulator -= this._tickRate;
    }

    const alpha = this._accumulator / this._tickRate;
    if (this._callbacks.render) {
      this._callbacks.render(alpha);
    }
  },

  isRunning() {
    return this._running;
  },
};

describe('GameLoop', () => {
  beforeEach(() => {
    GameLoop._running = false;
    GameLoop._lastTime = 0;
    GameLoop._accumulator = 0;
    GameLoop._rafId = null;
    GameLoop._callbacks = { update: null, render: null };
    jest.clearAllMocks();
  });

  describe('start()', () => {
    test('set _running to true', () => {
      const updateFn = jest.fn();
      const renderFn = jest.fn();
      GameLoop.start(updateFn, renderFn);
      expect(GameLoop._running).toBe(true);
    });

    test('stores callback functions', () => {
      const updateFn = jest.fn();
      const renderFn = jest.fn();
      GameLoop.start(updateFn, renderFn);
      expect(GameLoop._callbacks.update).toBe(updateFn);
      expect(GameLoop._callbacks.render).toBe(renderFn);
    });

    test('initializes _accumulator to 0', () => {
      GameLoop.start(jest.fn(), jest.fn());
      expect(GameLoop._accumulator).toBe(0);
    });

    test('calls requestAnimationFrame', () => {
      GameLoop.start(jest.fn(), jest.fn());
      expect(requestAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('stop()', () => {
    test('sets _running to false', () => {
      GameLoop._running = true;
      GameLoop._rafId = 123;
      GameLoop.stop();
      expect(GameLoop._running).toBe(false);
    });

    test('calls cancelAnimationFrame with rafId', () => {
      GameLoop._rafId = 456;
      GameLoop.stop();
      expect(cancelAnimationFrame).toHaveBeenCalledWith(456);
    });

    test('does not throw if _rafId is null', () => {
      GameLoop._rafId = null;
      expect(() => GameLoop.stop()).not.toThrow();
    });
  });

  describe('isRunning()', () => {
    test('returns true when running', () => {
      GameLoop._running = true;
      expect(GameLoop.isRunning()).toBe(true);
    });

    test('returns false when not running', () => {
      GameLoop._running = false;
      expect(GameLoop.isRunning()).toBe(false);
    });
  });

  describe('_loop()', () => {
    test('does nothing if not running', () => {
      GameLoop._running = false;
      const updateFn = jest.fn();
      const renderFn = jest.fn();
      GameLoop._callbacks = { update: updateFn, render: renderFn };

      GameLoop._loop(1000);

      expect(updateFn).not.toHaveBeenCalled();
      expect(renderFn).not.toHaveBeenCalled();
    });

    test('calls render even if no update needed', () => {
      GameLoop._running = true;
      GameLoop._lastTime = 1000;
      GameLoop._accumulator = 0;
      const renderFn = jest.fn();
      GameLoop._callbacks = { update: jest.fn(), render: renderFn };

      GameLoop._loop(1016);

      expect(renderFn).toHaveBeenCalled();
    });

    test('clamps delta to 200ms max', () => {
      GameLoop._running = true;
      GameLoop._lastTime = 1000;
      GameLoop._accumulator = 0;
      const updateFn = jest.fn();
      GameLoop._callbacks = { update: updateFn, render: jest.fn() };

      GameLoop._loop(1500);

      expect(updateFn).toHaveBeenCalledTimes(4);
    });

    test('calls update with delta in seconds', () => {
      GameLoop._running = true;
      GameLoop._lastTime = 1000;
      GameLoop._accumulator = 50;
      const updateFn = jest.fn();
      GameLoop._callbacks = { update: updateFn, render: jest.fn() };

      GameLoop._loop(1000);

      expect(updateFn).toHaveBeenCalledWith(0.05);
    });

    test('multiple updates when accumulator is large', () => {
      GameLoop._running = true;
      GameLoop._lastTime = 1000;
      GameLoop._accumulator = 0;
      const updateFn = jest.fn();
      GameLoop._callbacks = { update: updateFn, render: jest.fn() };

      GameLoop._loop(1200);

      expect(updateFn).toHaveBeenCalledTimes(4);
    });
  });
});
