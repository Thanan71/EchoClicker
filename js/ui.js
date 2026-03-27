// ============================================
// UI - Combinateur de modules UI
// Fusionne les sous-modules en un objet UI global
// ============================================

const UI = Object.assign(
    {},
    UICore,
    UIRoutes,
    UICombat,
    UIParty,
    UICapture,
    UIPokedex,
    UIShop,
    UIQuests,
    UIAchievements
);
