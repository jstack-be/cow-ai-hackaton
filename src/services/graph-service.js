import { ArticleGraph } from '../graph/article-graph.js';
import { calculateDistance, findArticlesWithinDistance } from '../graph/distance-calculator.js';
import { ArticleStore } from './article-store.js';

/**
 * Graph Service Facade
 * Combines ArticleGraph and ArticleStore for unified graph operations
 */
export class GraphService {
  constructor(clubStore = null) {
    this.graph = new ArticleGraph();
    this.store = new ArticleStore();
    this.clubStore = clubStore;
  }

  /**
   * Add an analyzed article to the system
   * @param {Object} article - Article with metadata
   * @returns {Object} Article with relationship info
   */
  addAnalyzedArticle(article) {
    // Add to storage
    this.store.store(article);

    // Add to graph
    this.graph.addArticle(article);

    // Link article to club profiles if clubStore is available
    if (this.clubStore && article.metadata?.clubs) {
      for (const clubMention of article.metadata.clubs) {
        const existingClub = this.clubStore.getByName(clubMention.name);
        if (existingClub) {
          // Add article reference to the club
          this.clubStore.addArticleReference(
            existingClub.id,
            article.id,
            article.analyzedAt || new Date()
          );
        }
      }
    }

    // Return article with related articles
    return {
      ...article,
      relatedArticles: this.getRelatedArticles(article.id, { maxDistance: 1 })
    };
  }

  /**
   * Get article by ID with connection info
   * @param {string} articleId
   * @returns {Object|null} Article with connections
   */
  getArticle(articleId) {
    const article = this.store.get(articleId);
    if (!article) return null;

    const connections = this.graph.getConnections(articleId);

    return {
      ...article,
      connections
    };
  }

  /**
   * Get all articles
   * @returns {Array}
   */
  getAllArticles() {
    return this.store.getAll();
  }

  /**
   * Get related articles to a given article
   * @param {string} sourceId - Source article ID
   * @param {Object} options
   * @param {number} options.maxDistance - Maximum distance (default: 2)
   * @param {boolean} options.weighted - Use weighted distance (default: true)
   * @returns {Object} Related articles grouped by distance
   */
  getRelatedArticles(sourceId, options = {}) {
    const { maxDistance = 2, weighted = true } = options;

    if (!this.store.has(sourceId)) {
      throw new Error(`Article ${sourceId} not found`);
    }

    const relatedByDistance = findArticlesWithinDistance(
      this.graph,
      sourceId,
      maxDistance,
      { weighted }
    );

    // Convert to grouped format
    const result = {};
    for (let distance = 1; distance <= maxDistance; distance++) {
      result[distance] = relatedByDistance[distance] || [];
    }

    return result;
  }

  /**
   * Calculate distance and path between two articles
   * @param {string} fromId - Source article ID
   * @param {string} toId - Target article ID
   * @param {Object} options
   * @param {boolean} options.weighted - Use weighted distance (default: true)
   * @returns {Object} Distance and path information
   */
  calculateDistance(fromId, toId, options = {}) {
    const { weighted = true } = options;

    if (!this.store.has(fromId)) {
      throw new Error(`Source article ${fromId} not found`);
    }
    if (!this.store.has(toId)) {
      throw new Error(`Target article ${toId} not found`);
    }

    const result = calculateDistance(this.graph, fromId, toId, { weighted });

    return {
      distance: result.distance,
      path: result.path.map(article => ({
        id: article.id,
        title: article.title,
        relationships: article.relationships
      }))
    };
  }

  /**
   * Get relevance score based on graph distance
   * Lower distance = higher relevance
   * @param {string} sourceId
   * @param {string} targetId
   * @returns {number} Relevance score (0-1, where 1 is most relevant)
   */
  getRelevanceScore(sourceId, targetId) {
    try {
      const result = calculateDistance(this.graph, sourceId, targetId, { weighted: true });

      if (result.distance === Infinity) {
        return 0;
      }

      // Convert distance to relevance score (inverse function)
      // Distance 0 -> score 1.0 (most relevant)
      // Distance 1 -> score 0.5
      // Distance 2 -> score 0.25
      // Distance 3+ -> score ~0.1
      return 1 / (1 + result.distance);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get graph statistics
   * @returns {Object}
   */
  getGraphStats() {
    return this.graph.getStats();
  }

  /**
   * Export graph data
   * @returns {Object} { nodes, edges }
   */
  exportGraph() {
    return this.graph.export();
  }

  /**
   * Get articles by club
   * @param {string} clubName
   * @returns {Array}
   */
  getArticlesByClub(clubName) {
    return this.store.getByClub(clubName);
  }

  /**
   * Get articles by county
   * @param {string} county
   * @returns {Array}
   */
  getArticlesByCounty(county) {
    return this.store.getByCounty(county);
  }

  /**
   * Get articles by league
   * @param {string} league
   * @returns {Array}
   */
  getArticlesByLeague(league) {
    return this.store.getByLeague(league);
  }

  /**
   * Remove an article
   * @param {string} articleId
   */
  removeArticle(articleId) {
    this.store.delete(articleId);
    this.graph.removeArticle(articleId);
  }

  /**
   * Get total article count
   * @returns {number}
   */
  getTotalArticleCount() {
    return this.store.count();
  }

  /**
   * Clear all data
   */
  clear() {
    this.store.clear();
    // Create new graph instance
    this.graph = new ArticleGraph();
  }
}

export default GraphService;
