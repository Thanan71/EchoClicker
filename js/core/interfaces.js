// ============================================
// ÉchoClicker - Interfaces d'abstraction (DIP)
// ============================================
// Ce fichier définit les contrats (interfaces) via JSDoc que doivent
// respecter les implémentations concrètes. Il sert de documentation
// et de guide pour l'injection de dépendances.
//
// Pattern: Dependency Injection via init(gameRef, uiRef, eventBusRef)
// Chaque système stocke ses dépendances comme propriétés privées (_game, _ui, _eventBus)
// au lieu d'accéder directement aux globales Game, UI, EventBus.
// ============================================

/**
 * @interface IGameStateProvider
 * @description Fournit un accès en lecture/écriture à l'état du jeu.
 * Implémenté par l'objet Game.
 *
 * @property {Object} state - L'objet d'état du jeu
 * @method {function} findEcho(uid) - Trouve un Écho par son UID
 * @method {function} addToParty(echo) - Ajoute un Écho à l'équipe
 * @method {function} captureEcho(wildEcho, options) - Capture centralisée
 * @method {function} attemptCapture(wildEcho) - Tentative de capture
 * @method {function} defeatBoss() - Marque un boss comme vaincu
 * @method {function} unlockNextRoute() - Débloque la route suivante
 * @method {function} selectRoute(routeId) - Sélectionne une route
 * @method {function} getCPS() - Obtient les clics par seconde
 */

/**
 * @interface IUIRenderer
 * @description Fournit les méthodes de rendu et de notification UI.
 * Implémenté par l'objet UI.
 *
 * @method {function} toast(message, type) - Affiche une notification
 * @method {function} addLog(type, message) - Ajoute une entrée au journal
 * @method {function} updateCombat() - Met à jour l'affichage du combat
 * @method {function} spawnDamageParticle(dmg) - Particule de dégât
 * @method {function} showModal(title, bodyHtml, footerHtml) - Affiche une modale
 * @method {function} closeModal() - Ferme la modale
 * @method {function} renderParty() - Met à jour l'affichage de l'équipe
 * @method {function} renderRoutes() - Met à jour l'affichage des routes
 * @method {function} spawnParticle(event, text) - Affiche une particule de clic
 */

/**
 * @interface IEventBus
 * @description Système de publication/souscription pour la communication
 * découplée entre modules. Implémenté par l'objet EventBus.
 *
 * @method {function} on(event, callback) - S'abonner à un événement
 * @method {function} off(event, callback) - Se désabonner
 * @method {function} emit(event, data) - Publier un événement
 * @method {function} once(event, callback) - S'abonner une seule fois
 */

/**
 * Injecte les dépendances dans un système.
 * Appelé par Game.init() pour chaque système.
 *
 * @param {Object} system - Le système à initialiser
 * @param {IGameStateProvider} gameRef - Référence au provider d'état de jeu
 * @param {IUIRenderer} uiRef - Référence au renderer UI
 * @param {IEventBus} eventBusRef - Référence au bus d'événements
 */
export function injectDependencies(system, gameRef, uiRef, eventBusRef) {
  system._game = gameRef;
  system._ui = uiRef;
  system._eventBus = eventBusRef;
}
