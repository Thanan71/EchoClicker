// ============================================
// Tests unitaires - EventBus (js/core/eventBus.js)
// ============================================
// Couvre: on, off, emit, once, unsubscribe,
// gestion d'erreurs dans callbacks, edge cases,
// et constantes GAME_EVENTS.

const { EventBus, GAME_EVENTS } = require('./__mocks__/eventBus.cjs');

describe('EventBus', () => {
    beforeEach(() => {
        EventBus._listeners = {};
    });

    // ─────────────────────────────────────
    // on() - Enregistrement de listeners
    // ─────────────────────────────────────
    describe('on()', () => {
        test('enregistre un listener et retourne une fonction unsubscribe', () => {
            const handler = jest.fn();
            const unsub = EventBus.on('test', handler);

            expect(typeof unsub).toBe('function');
            EventBus.emit('test', 'data');
            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith('data');
        });

        test('permet plusieurs listeners sur le même événement', () => {
            const h1 = jest.fn();
            const h2 = jest.fn();
            const h3 = jest.fn();

            EventBus.on('evt', h1);
            EventBus.on('evt', h2);
            EventBus.on('evt', h3);

            EventBus.emit('evt', 42);

            expect(h1).toHaveBeenCalledWith(42);
            expect(h2).toHaveBeenCalledWith(42);
            expect(h3).toHaveBeenCalledWith(42);
        });

        test("les listeners sont appelés dans l'ordre d'inscription", () => {
            const order = [];
            EventBus.on('evt', () => order.push('first'));
            EventBus.on('evt', () => order.push('second'));
            EventBus.on('evt', () => order.push('third'));

            EventBus.emit('evt');
            expect(order).toEqual(['first', 'second', 'third']);
        });

        test('listeners sur des événements différents sont indépendants', () => {
            const hA = jest.fn();
            const hB = jest.fn();

            EventBus.on('a', hA);
            EventBus.on('b', hB);

            EventBus.emit('a', 'only-a');

            expect(hA).toHaveBeenCalledWith('only-a');
            expect(hB).not.toHaveBeenCalled();
        });
    });

    // ─────────────────────────────────────
    // off() - Désinscription de listeners
    // ─────────────────────────────────────
    describe('off()', () => {
        test('retire un listener spécifique', () => {
            const handler = jest.fn();
            EventBus.on('evt', handler);

            EventBus.off('evt', handler);
            EventBus.emit('evt');

            expect(handler).not.toHaveBeenCalled();
        });

        test('ne retire que le handler ciblé, pas les autres', () => {
            const keep = jest.fn();
            const remove = jest.fn();

            EventBus.on('evt', keep);
            EventBus.on('evt', remove);

            EventBus.off('evt', remove);
            EventBus.emit('evt');

            expect(keep).toHaveBeenCalledTimes(1);
            expect(remove).not.toHaveBeenCalled();
        });

        test("silencieux si l'événement n'existe pas", () => {
            expect(() => EventBus.off('inexistant', () => {})).not.toThrow();
        });

        test("silencieux si le callback n'est pas dans la liste", () => {
            EventBus.on('evt', () => {});
            const otherHandler = () => {};

            expect(() => EventBus.off('evt', otherHandler)).not.toThrow();
        });

        test('retire correctement par référence, pas par valeur', () => {
            const h1 = () => 'handler1';
            const h2 = () => 'handler1';

            EventBus.on('evt', h1);
            EventBus.off('evt', h2);

            EventBus.emit('evt');
            // h1 reste car h2 est une référence différente
            expect(EventBus._listeners['evt'].length).toBe(1);
        });
    });

    // ─────────────────────────────────────
    // emit() - Émission d'événements
    // ─────────────────────────────────────
    describe('emit()', () => {
        test('passe les données au callback', () => {
            const handler = jest.fn();
            EventBus.on('evt', handler);

            const payload = { value: 123, nested: { key: 'val' } };
            EventBus.emit('evt', payload);

            expect(handler).toHaveBeenCalledWith(payload);
            expect(handler.mock.calls[0][0]).toBe(payload);
        });

        test('silencieux si aucun listener enregistré', () => {
            expect(() => EventBus.emit('no-listener', 'data')).not.toThrow();
        });

        test("supporte l'émission sans données (undefined)", () => {
            const handler = jest.fn();
            EventBus.on('evt', handler);

            EventBus.emit('evt');

            expect(handler).toHaveBeenCalledWith(undefined);
        });

        test('tous les listeners reçoivent le même objet de données', () => {
            const received = [];
            const data = { x: 1 };

            EventBus.on('evt', (d) => received.push(d));
            EventBus.on('evt', (d) => received.push(d));

            EventBus.emit('evt', data);

            expect(received[0]).toBe(data);
            expect(received[1]).toBe(data);
        });
    });

    // ─────────────────────────────────────
    // once() - Listener unique
    // ─────────────────────────────────────
    describe('once()', () => {
        test("le callback n'est appelé qu'une seule fois", () => {
            const handler = jest.fn();
            EventBus.once('evt', handler);

            EventBus.emit('evt', 'first');
            EventBus.emit('evt', 'second');
            EventBus.emit('evt', 'third');

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith('first');
        });

        test('retourne une fonction unsubscribe fonctionnelle', () => {
            const handler = jest.fn();
            const unsub = EventBus.once('evt', handler);

            unsub();
            EventBus.emit('evt');

            expect(handler).not.toHaveBeenCalled();
        });

        test('plusieurs once indépendants fonctionnent correctement', () => {
            const h1 = jest.fn();
            const h2 = jest.fn();

            EventBus.once('evt', h1);
            EventBus.once('evt', h2);

            EventBus.emit('evt', 'data');

            expect(h1).toHaveBeenCalledTimes(1);
            expect(h2).toHaveBeenCalledTimes(1);

            EventBus.emit('evt', 'data2');
            expect(h1).toHaveBeenCalledTimes(1);
            expect(h2).toHaveBeenCalledTimes(1);
        });

        test('once et on coexistent sans interférence', () => {
            const onceHandler = jest.fn();
            const onHandler = jest.fn();

            EventBus.once('evt', onceHandler);
            EventBus.on('evt', onHandler);

            EventBus.emit('evt', 'first');
            EventBus.emit('evt', 'second');

            expect(onceHandler).toHaveBeenCalledTimes(1);
            expect(onHandler).toHaveBeenCalledTimes(2);
        });
    });

    // ─────────────────────────────────────
    // Gestion d'erreurs dans les callbacks
    // ─────────────────────────────────────
    describe("Gestion d'erreurs dans les callbacks", () => {
        let consoleSpy;

        beforeEach(() => {
            consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        });

        afterEach(() => {
            consoleSpy.mockRestore();
        });

        test('une erreur dans un callback ne bloque pas les autres listeners', () => {
            const errorHandler = jest.fn(() => {
                throw new Error('boom');
            });
            const safeHandler = jest.fn();

            EventBus.on('evt', errorHandler);
            EventBus.on('evt', safeHandler);

            expect(() => EventBus.emit('evt', 'data')).not.toThrow();

            expect(errorHandler).toHaveBeenCalledTimes(1);
            expect(safeHandler).toHaveBeenCalledTimes(1);
            expect(safeHandler).toHaveBeenCalledWith('data');
        });

        test('les erreurs sont logguées via console.error', () => {
            EventBus.on('evt', () => {
                throw new Error('test error');
            });

            EventBus.emit('evt', {});

            expect(consoleSpy).toHaveBeenCalledTimes(1);
            expect(consoleSpy.mock.calls[0][0]).toMatch(/EventBus error \[evt\]/);
        });
    });

    // Unsubscribe
    describe('Fonction unsubscribe', () => {
        test('on() retourne une fonction qui desinscrit le listener', () => {
            const handler = jest.fn();
            const unsub = EventBus.on('evt', handler);
            EventBus.emit('evt', 'before');
            expect(handler).toHaveBeenCalledTimes(1);
            unsub();
            EventBus.emit('evt', 'after');
            expect(handler).toHaveBeenCalledTimes(1);
        });

        test('appeler unsubscribe plusieurs fois est sans effet', () => {
            const handler = jest.fn();
            const unsub = EventBus.on('evt', handler);
            unsub();
            unsub();
            unsub();
            EventBus.emit('evt');
            expect(handler).not.toHaveBeenCalled();
        });

        test('unsubscribe ne perturbe pas les autres', () => {
            const h1 = jest.fn();
            const h2 = jest.fn();
            const h3 = jest.fn();
            EventBus.on('evt', h1);
            const unsub2 = EventBus.on('evt', h2);
            EventBus.on('evt', h3);
            unsub2();
            EventBus.emit('evt', 'data');
            expect(h1).toHaveBeenCalledTimes(1);
            expect(h2).not.toHaveBeenCalled();
            expect(h3).toHaveBeenCalledTimes(1);
        });

        test('once() unsubscribe avant emission supprime le listener', () => {
            const handler = jest.fn();
            const unsub = EventBus.once('evt', handler);
            unsub();
            EventBus.emit('evt');
            expect(handler).not.toHaveBeenCalled();
        });
    });

    // Edge cases
    describe('Edge cases', () => {
        test('emettre puis retirer tous les listeners', () => {
            const h1 = jest.fn();
            const h2 = jest.fn();
            const unsub1 = EventBus.on('evt', h1);
            const unsub2 = EventBus.on('evt', h2);
            EventBus.emit('evt');
            expect(h1).toHaveBeenCalledTimes(1);
            expect(h2).toHaveBeenCalledTimes(1);
            unsub1();
            unsub2();
            EventBus.emit('evt');
            expect(h1).toHaveBeenCalledTimes(1);
            expect(h2).toHaveBeenCalledTimes(1);
            expect(EventBus._listeners['evt'].length).toBe(0);
        });

        test('listener auto-desinscrivant pendant emit', () => {
            const results = [];
            let unsub;
            EventBus.on('evt', () => results.push('A'));
            unsub = EventBus.on('evt', () => {
                results.push('B');
                unsub();
            });
            EventBus.on('evt', () => results.push('C'));
            EventBus.emit('evt');
            expect(results).toContain('A');
            expect(results).toContain('B');
            expect(results).toContain('C');
        });

        test('noms d evenements avec caracteres speciaux', () => {
            const handler = jest.fn();
            EventBus.on('namespace:event:sub', handler);
            EventBus.emit('namespace:event:sub', 'ok');
            expect(handler).toHaveBeenCalledWith('ok');
        });

        test('string vide comme nom d evenement', () => {
            const handler = jest.fn();
            EventBus.on('', handler);
            EventBus.emit('', 'data');
            expect(handler).toHaveBeenCalledWith('data');
        });

        test('donnees null transmises correctement', () => {
            const handler = jest.fn();
            EventBus.on('evt', handler);
            EventBus.emit('evt', null);
            expect(handler).toHaveBeenCalledWith(null);
        });

        test('donnees false transmises correctement', () => {
            const handler = jest.fn();
            EventBus.on('evt', handler);
            EventBus.emit('evt', false);
            expect(handler).toHaveBeenCalledWith(false);
        });

        test('donnees 0 transmises correctement', () => {
            const handler = jest.fn();
            EventBus.on('evt', handler);
            EventBus.emit('evt', 0);
            expect(handler).toHaveBeenCalledWith(0);
        });

        test('haute volumetrie de listeners', () => {
            const handlers = [];
            for (let i = 0; i < 500; i++) {
                const h = jest.fn();
                handlers.push(h);
                EventBus.on('bulk', h);
            }
            EventBus.emit('bulk', 'data');
            handlers.forEach((h) => {
                expect(h).toHaveBeenCalledTimes(1);
                expect(h).toHaveBeenCalledWith('data');
            });
        });
    });

    // GAME_EVENTS - Constantes
    describe('GAME_EVENTS', () => {
        test('contient toutes les constantes attendues', () => {
            const expectedKeys = [
                'ENERGY_CHANGED',
                'LINKS_CHANGED',
                'CLICK',
                'COMBAT_START',
                'COMBAT_END',
                'ENEMY_DEFEATED',
                'ECHO_CAPTURED',
                'ECHO_LEVELED_UP',
                'ECHO_EVOLVED',
                'ECHO_FAINTED',
                'BOSS_DEFEATED',
                'ROUTE_UNLOCKED',
                'REGION_UNLOCKED',
                'ACHIEVEMENT_UNLOCKED',
                'ITEM_PURCHASED',
                'SAVE_COMPLETE',
                'TICK',
            ];
            expectedKeys.forEach((key) => {
                expect(GAME_EVENTS).toHaveProperty(key);
                expect(typeof GAME_EVENTS[key]).toBe('string');
            });
        });

        test('les valeurs sont des strings non vides', () => {
            Object.entries(GAME_EVENTS).forEach(([key, value]) => {
                expect(value.length).toBeGreaterThan(0);
                expect(typeof value).toBe('string');
            });
        });

        test('les valeurs sont uniques', () => {
            const values = Object.values(GAME_EVENTS);
            const uniqueValues = [...new Set(values)];
            expect(values.length).toBe(uniqueValues.length);
        });

        test('cles et valeurs specifiques', () => {
            expect(GAME_EVENTS.CLICK).toBe('click');
            expect(GAME_EVENTS.TICK).toBe('tick');
            expect(GAME_EVENTS.ECHO_CAPTURED).toBe('echo_captured');
            expect(GAME_EVENTS.COMBAT_START).toBe('combat_start');
            expect(GAME_EVENTS.ACHIEVEMENT_UNLOCKED).toBe('achievement_unlocked');
        });
    });
});
