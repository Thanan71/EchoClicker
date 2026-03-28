// ============================================
// RegionRegistry — Open/Closed Principle
// Chaque région s'enregistre via register().
// Ajouter une région = créer un fichier, sans modifier map.js.
// ============================================

export const RegionRegistry = {
  _renderers: {},

  register(regionId, renderFn) {
    if (this._renderers[regionId]) {
    }
    this._renderers[regionId] = renderFn;
  },

  render(regionId, map) {
    const renderer = this._renderers[regionId];
    if (renderer) {
      renderer(map);
    } else if (typeof DEBUG !== 'undefined' && DEBUG) {
    }
  },

  has(regionId) {
    return regionId in this._renderers;
  },

  getRegisteredIds() {
    return Object.keys(this._renderers);
  },
};
