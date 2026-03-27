// ============================================
// UIShop - Rendu boutique
// ============================================

const UIShop = {
    renderShop() {
        const container = document.getElementById('shop-items');
        if (!container) return;
        const activeCat = document.querySelector('.shop-cat.active')?.dataset.cat || 'links';
        const items = SHOP[activeCat] || [];

        let html = '';
        items.forEach(item => {
            const canBuy = item.currency === 'energy' ? Game.state.energy >= item.price : Game.state.shards >= item.price;
            html += `<div class="shop-item">
                <div class="shop-item-icon">${item.icon}</div>
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-price">${item.currency==='shards'?'\u2728':'\u{1F48E}'} ${item.price}</div>
                <button class="btn-buy" ${canBuy?'':'disabled'} onclick='Game.buyItem(${JSON.stringify(item)})'>Acheter</button>
            </div>`;
        });
        container.innerHTML = html;

        document.querySelectorAll('.shop-cat').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.shop-cat').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderShop();
            };
        });
    },
};
