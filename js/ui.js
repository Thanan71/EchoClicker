// ============================================
// UI - Combinateur de modules UI
// Fusionne les sous-modules en un objet UI global
// ============================================

import { UIAchievements } from './ui/ui-achievements.js';
import { UICapture } from './ui/ui-capture.js';
import { UICombat } from './ui/ui-combat.js';
import { UICore } from './ui/ui-core.js';
import { UIParty } from './ui/ui-party.js';
import { UIPokedex } from './ui/ui-pokedex.js';
import { UIQuests } from './ui/ui-quests.js';
import { UIRoutes } from './ui/ui-routes.js';
import { UIShop } from './ui/ui-shop.js';

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
  UIAchievements,
);
