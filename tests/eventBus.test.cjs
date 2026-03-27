// ============================================
// Test de validation - EventBus Mock
// ============================================
// Ce test vérifie que le setup fonctionne correctement.

const { EventBus, GAME_EVENTS } = require('./__mocks__/eventBus.cjs');

describe('EventBus Mock', () => {
    beforeEach(() => {
        EventBus.reset();
    });

    test('should register and emit events', () => {
        const handler = jest.fn();
        EventBus.on('test:event', handler);
        EventBus.emit('test:event', { data: 42 });

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith({ data: 42 });
    });

    test('should unsubscribe with returned function', () => {
        const handler = jest.fn();
        const unsub = EventBus.on('test:event', handler);

        unsub();
        EventBus.emit('test:event', {});

        expect(handler).not.toHaveBeenCalled();
    });

    test('should support once listeners', () => {
        const handler = jest.fn();
        EventBus.once('test:event', handler);

        EventBus.emit('test:event', 'first');
        EventBus.emit('test:event', 'second');

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith('first');
    });

    test('should provide GAME_EVENTS constants', () => {
        expect(GAME_EVENTS.CLICK).toBe('click');
        expect(GAME_EVENTS.ECHO_CAPTURED).toBe('echo_captured');
        expect(GAME_EVENTS.TICK).toBe('tick');
    });

    test('reset should clear all listeners', () => {
        EventBus.on('a', () => {});
        EventBus.on('b', () => {});
        expect(EventBus.getEventNames()).toEqual(['a', 'b']);

        EventBus.reset();
        expect(EventBus.getEventNames()).toEqual([]);
    });

    test('hasListeners and getListeners work correctly', () => {
        expect(EventBus.hasListeners('test')).toBe(false);
        expect(EventBus.getListeners('test')).toEqual([]);

        const handler = () => {};
        EventBus.on('test', handler);

        expect(EventBus.hasListeners('test')).toBe(true);
        expect(EventBus.getListeners('test')).toEqual([handler]);
    });

    test('should handle errors in callbacks gracefully', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const handler = () => { throw new Error('boom'); };

        EventBus.on('test', handler);

        // Should not throw
        expect(() => EventBus.emit('test', {})).not.toThrow();
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });
});
