// ============================================
// UIRoutes - Rendu carte et routes
// ============================================

const UIRoutes = {
    renderRoutes() {
        const region = Game.state.regions.find(r => r.id === Game.state.currentRegion);
        if (!region) return;

        // Mettre a jour le panneau d'info de la region
        const regionNameEl = document.getElementById('region-name');
        const regionDescEl = document.getElementById('region-desc');
        if (regionNameEl) regionNameEl.textContent = `${region.emoji} ${region.name}`;
        if (regionDescEl) regionDescEl.textContent = region.desc;

        // Mettre a jour les boutons de navigation de la carte
        if (MapSystem.createNavigationButtons) {
            MapSystem.createNavigationButtons();
        }
    },
};
