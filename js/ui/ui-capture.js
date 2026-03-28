// ============================================
// UICapture - Zone de capture
// ============================================

import { generateWildEcho } from '../core/echo.js';
import { Utils } from '../data/utils.js';
import { Game } from '../game.js';
import { createEchoImageHTML } from './ui-core.js';

export const UICapture = {
  renderCaptureZone() {
    if (!this.captureWildEcho) {
      this.generateCaptureEcho();
    }
    this.updateCaptureDisplay();
  },

  generateCaptureEcho() {
    const region = Game.state.regions.find((r) => r.id === Game.state.currentRegion);
    if (!region) {
      return;
    }
    const unlocked = region.routes.filter((r) => r.unlocked);
    if (!unlocked.length) {
      return;
    }
    const route = unlocked[unlocked.length - 1];
    this.captureWildEcho = generateWildEcho(route.ids, route.lv);
    if (this.captureWildEcho) {
      Game.state.seenEchoes.add(this.captureWildEcho.id);
    }
  },

  updateCaptureDisplay() {
    const e = this.captureWildEcho;
    if (!e) {
      return;
    }
    const set = (id, v) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = v;
      }
    };
    const setHTML = (id, v) => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML = v;
      }
    };
    const setStyle = (id, prop, v) => {
      const el = document.getElementById(id);
      if (el) {
        el.style.setProperty(prop, v);
      }
    };

    const primordialBadge = e.isPrimordial ? '<span class="shiny-badge">\u2B50</span>' : '';
    const imgHTML = createEchoImageHTML(e, 96);
    setHTML(
      'wild-echo',
      `<div style="position:relative;display:inline-block">${primordialBadge}${imgHTML}</div>`,
    );
    set('wild-echo-name', e.name + (e.isPrimordial ? ' (Primordial)' : ''));
    setStyle('wild-hp-bar', '--hp-percent', `${e.getHpPercent()}%`);
    set('wild-hp-text', `${Math.floor(e.hp)}/${Math.floor(e.maxHp)}`);
    const rate = Utils.calculateCaptureRate(e.captureRate || 30, e.hp, e.maxHp);
    set('capture-rate', `${rate.toFixed(1)}%`);
    set('total-captures', Game.state.totalCaptures);
    set('unique-captures', Game.state.uniqueCaptures);
    set('primordial-count', Game.state.primordialCount);
    document.getElementById('btn-capture').disabled = Game.state.links < 1;
    const cr = document.getElementById('capture-result');
    if (cr) {
      cr.textContent = '';
      cr.className = 'capture-result';
    }
  },

  captureClick() {
    if (!this.captureWildEcho) {
      return;
    }
    if (Game.state.links < 1) {
      this.toast('Pas assez de Liens !', 'error');
      return;
    }

    const dmg = Math.max(1, Math.floor(this.captureWildEcho.maxHp * 0.15));
    this.captureWildEcho.takeDamage(dmg);

    const success = Game.attemptCapture(this.captureWildEcho);
    const cr = document.getElementById('capture-result');
    if (cr) {
      cr.textContent = success
        ? i18n.t('capture.captureSuccessDisplay')
        : i18n.t('capture.captureFailedDisplay');
      cr.className = `capture-result ${success ? 'success' : 'fail'}`;
    }
    if (success) {
      setTimeout(() => this.generateCaptureEcho(), 1000);
    }
    this.updateCaptureDisplay();
  },
};
