/**
 * ai/routing/RouteIntelligence.js
 *
 * AI-assisted route recommendation — placeholder.
 *
 * PURPOSE (future):
 *   Use historical route performance data + live conditions + AI reasoning
 *   to recommend the optimal settlement rail for a given transaction.
 *
 * Until AI integration is ready, the route optimizer in server/services
 * will use a deterministic scoring algorithm instead.
 *
 * STATUS: Not yet implemented.
 */

export class RouteIntelligence {
  /**
   * @param {object} transactionContext
   * @param {object[]} availableRoutes
   * @returns {Promise<{ recommendedRail: string, confidence: number, reasoning: string }>}
   */
  async recommend(_transactionContext, _availableRoutes) {
    // TODO: Implement in Phase — AI Enhancement
    throw new Error('RouteIntelligence: not yet implemented');
  }
}
