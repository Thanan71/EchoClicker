// ============================================
// ÉchoClicker - Boucle de jeu (RAF + Delta Time)
// ============================================

const GameLoop = {
    _running: false,
    _lastTime: 0,
    _accumulator: 0,
    _rafId: null,
    _tickRate: GAME_CONFIG.TICK_RATE, // ms entre chaque update logique
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
        if (this._rafId) cancelAnimationFrame(this._rafId);
    },

    _loop(timestamp) {
        if (!this._running) return;
        this._rafId = requestAnimationFrame(t => this._loop(t));

        const delta = timestamp - this._lastTime;
        this._lastTime = timestamp;

        // Clamp delta pour éviter les spirales de la mort
        const clampedDelta = Math.min(delta, 200);
        this._accumulator += clampedDelta;

        // Update logique à intervalle fixe
        while (this._accumulator >= this._tickRate) {
            if (this._callbacks.update) {
                this._callbacks.update(this._tickRate / 1000); // delta en secondes
            }
            this._accumulator -= this._tickRate;
        }

        // Render à chaque frame (interpolation possible)
        const alpha = this._accumulator / this._tickRate;
        if (this._callbacks.render) {
            this._callbacks.render(alpha);
        }
    },

    isRunning() {
        return this._running;
    }
};