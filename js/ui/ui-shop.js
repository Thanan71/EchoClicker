// ============================================
// UIShop - Rendu boutique
// ============================================

import { SHOP } from '../data/game-config.js';
import { Game } from '../game.js';

export const UIShop = {
    renderShop() {
        const container = document.getElementById('shop-items');
        if (!container) return;
        const activeCat = document.querySelector('.shop-cat.active')?.dataset.cat || 'links';
        const items = SHOP[activeCat] || [];

        let html = '';
        items.forEach((item, index) => {
            const canBuy =
                item.currency === 'energy' ? Game.state.energy >= item.price : Game.state.shards >= item.price;
            html += `<div class="shop-item">
                <div class="shop-item-icon">${item.icon}</div>
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-price">${item.currency === 'shards' ? '\u2728' : '\u{1F48E}'} ${item.price}</div>
                <button class="btn-buy" ${canBuy ? '' : 'disabled'} data-item-index="${index}">Acheter</button>
            </div>`;
        });
        container.innerHTML = html;

        // Add event listeners to buy buttons
        document.querySelectorAll('.btn-buy[data-item-index]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.itemIndex);
                const item = items[index];
                if (item) {
                    Game.buyItem(item);
                }
            });
        });

        document.querySelectorAll('.shop-cat').forEach((btn) => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.shop-cat').forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderShop();
            });
        });
    },
};
