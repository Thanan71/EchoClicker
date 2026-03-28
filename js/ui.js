// ============================================
// UI - Combinateur de modules UI
// Fusionne les sous-modules en un objet UI global
// ============================================

import { UICore } from './ui/ui-core.js';
import { UIRoutes } from './ui/ui-routes.js';
import { UICombat } from './ui/ui-combat.js';
import { UIParty } from './ui/ui-party.js';
import { UICapture } from './ui/ui-capture.js';
import { UIPokedex } from './ui/ui-pokedex.js';
import { UIShop } from './ui/ui-shop.js';
import { UIQuests } from './ui/ui-quests.js';
import { UIAchievements } from './ui/ui-achievements.js';

export const UI = Object.assign(
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
