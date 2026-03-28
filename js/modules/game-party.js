// ============================================
// GameParty - Party management
// Responsibility: add, remove, move, build team, find echoes
// ============================================

import { GAME_CONFIG } from '../data/game-config.js';
import { UI } from '../ui.js';

export const GameParty = {
    addToParty(echo) {
        if (this.state.party.length >= GAME_CONFIG.MAX_PARTY) return false;
        this.state.party.push(echo);
        return true;
    },

    buildOptimalTeam() {
        const allEchoes = this.getAllEchoes();
        if (allEchoes.length === 0) {
            UI.toast(i18n.t('combat.noEchoAvailable'), 'warning');
            return;
        }

        // Calculer le score de chaque écho
        const scoredEchoes = allEchoes.map((echo) => {
            let score = 0;

            // Stats totales
            score += echo.maxHp * 0.3;
            score += echo.atk * 0.4;
            score += echo.def * 0.2;
            score += echo.spd * 0.1;

            // Bonus niveau
            score += echo.level * 5;

            // Bonus rareté
            const rarityBonus = {
                common: 0,
                uncommon: 20,
                rare: 50,
                epic: 100,
                legendary: 200,
                mythical: 300,
            };
            score += rarityBonus[echo.rarity] || 0;

            // Bonus primordial
            if (echo.isPrimordial) score += 50;

            // Bonus vivant
            if (echo.isAlive()) score += 100;

            return { echo, score };
        });

        // Trier par score décroissant
        scoredEchoes.sort((a, b) => b.score - a.score);

        // Vider l'équipe actuelle (mettre en réserve)
        const oldParty = [...this.state.party];
        this.state.party = [];

        // Construire la nouvelle équipe optimale
        const newParty = [];
        const usedIds = new Set();

        for (const { echo } of scoredEchoes) {
            if (newParty.length >= GAME_CONFIG.MAX_PARTY) break;

            // Éviter les doublons d'espèces (optionnel)
            if (!usedIds.has(echo.id) || allEchoes.length <= GAME_CONFIG.MAX_PARTY) {
                newParty.push(echo);
                usedIds.add(echo.id);
            }
        }

        // Mettre à jour l'équipe
        this.state.party = newParty;

        // Remettre les autres en réserve
        const partyUids = new Set(newParty.map((e) => e.uid));
        const newReserves = allEchoes.filter((e) => !partyUids.has(e.uid));
        this.state.reserves = newReserves;

        // Soigner la nouvelle équipe
        this.state.party.forEach((e) => e.fullHeal());

        UI.renderParty();
        UI.toast(i18n.t('combat.optimalTeamCreated'), 'success');
        UI.addLog('info', i18n.t('combat.newTeam', { names: newParty.map((e) => e.name).join(', ') }));
    },

    removeFromParty(uid) {
        const idx = this.state.party.findIndex((e) => e.uid === uid);
        if (idx === -1) return false;
        const echo = this.state.party.splice(idx, 1)[0];
        this.state.reserves.push(echo);
        return true;
    },

    moveToParty(uid) {
        if (this.state.party.length >= GAME_CONFIG.MAX_PARTY) {
            UI.toast(i18n.t('combat.partyFull'), 'warning');
            return false;
        }
        const idx = this.state.reserves.findIndex((e) => e.uid === uid);
        if (idx === -1) return false;
        const echo = this.state.reserves.splice(idx, 1)[0];
        this.state.party.push(echo);
        return true;
    },

    getAllEchoes() {
        return [...this.state.party, ...this.state.reserves];
    },

    findEcho(uid) {
        return this.getAllEchoes().find((e) => e.uid === uid);
    },
};
