// ============================================
// GameRoutes - Routes and regions management
// Responsibility: select route/region, unlock routes, defeat boss
// ============================================

import { EventBus, GAME_EVENTS } from '../core/eventBus.js';

export const GameRoutes = {
    // === Routes & Régions ===
    selectRoute(routeId) {
        const region = this.state.regions.find(r => r.id === this.state.currentRegion);
        if (!region) return;
        const route = region.routes.find(r => r.id === routeId);
        if (!route || !route.unlocked) {
            UI.toast(i18n.t('capture.routeLocked'), 'warning');
            return;
        }
        this.state.currentRoute = route;
        Combat.startCombat(route);
        // Plus besoin de changer d'onglet, le combat est sur la même page
        UI.renderRoutes();
        UI.updateCombat();
    },

    selectRegion(regionId) {
        const region = this.state.regions.find(r => r.id === regionId);
        if (!region || !region.unlocked) {
            UI.toast(i18n.t('capture.regionLocked'), 'warning');
            return;
        }
        this.state.currentRegion = regionId;
        this.state.currentRoute = null;
        Combat.endCombat();
        UI.renderRoutes();
    },

    unlockNextRoute() {
        const region = this.state.regions.find(r => r.id === this.state.currentRegion);
        if (!region) return;
        const idx = region.routes.findIndex(r => r.id === this.state.currentRoute?.id);
        if (idx < region.routes.length - 1) {
            const nextRoute = region.routes[idx + 1];
            if (!nextRoute.unlocked) {
                nextRoute.unlocked = true;
                EventBus.emit(GAME_EVENTS.ROUTE_UNLOCKED, { route: nextRoute });
                UI.toast(i18n.t('capture.newRoute', { name: nextRoute.name }), 'success');
            }
        }
    },

    defeatBoss() {
        const region = this.state.regions.find(r => r.id === this.state.currentRegion);
        if (!region) return;
        region.bossDefeated = true;
        this.state.bossesDefeated++;
        EventBus.emit(GAME_EVENTS.BOSS_DEFEATED, { region });

        // Émettre l'événement pour les quêtes
        EventBus.emit('boss:defeated', { id: this.state.currentRegion });

        const idx = this.state.regions.findIndex(r => r.id === this.state.currentRegion);
        if (idx < this.state.regions.length - 1) {
            const next = this.state.regions[idx + 1];
            next.unlocked = true;
            next.routes[0].unlocked = true;
            this.state.regionsUnlocked++;
            EventBus.emit(GAME_EVENTS.REGION_UNLOCKED, { region: next });
            UI.toast(i18n.t('capture.newRegion', { name: next.name }), 'success');
        } else {
            UI.toast(i18n.t('notifications.success'), 'success');
        }
    }
};
