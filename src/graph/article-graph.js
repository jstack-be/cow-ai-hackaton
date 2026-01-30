import Graph from 'graphlib';
import { findRelationships, calculateEdgeWeight } from './relationship-builder.js';

export class ArticleGraph {
  constructor() {
    // Create an undirected, weighted graph
    this.graph = new Graph.Graph({
      directed: false,
      multigraph: false,
      compound: false
    });

    // Store articles by ID for quick access
    this.articles = new Map();
  }

  /**
   * Add an article to the graph
   * @param {Object} article - Article object with metadata
   */
  addArticle(article) {
    if (!article || !article.id) {
      throw new Error('Article must have an id');
    }

    // Add node to graph with article data
    this.graph.setNode(article.id, {
      id: article.id,
      title: article.title,
      metadata: article.metadata
    });

    // Store article in map for quick access
    this.articles.set(article.id, article);

    // Update relationships with existing articles
    this.updateRelationships(article);
  }

  /**
   * Update relationships between the new article and all existing articles
   * @param {Object} newArticle - The newly added article
   */
  updateRelationships(newArticle) {
    for (const [existingId, existingArticle] of this.articles) {
      if (existingId === newArticle.id) continue;

      const relationships = findRelationships(newArticle, existingArticle);

      if (relationships.length > 0) {
        const weight = calculateEdgeWeight(relationships);

        // Set edge between articles
        this.graph.setEdge(newArticle.id, existingId, {
          relationships,
          weight,
          createdAt: new Date()
        });
      }
    }
  }

  /**
   * Get an article by ID
   * @param {string} id - Article ID
   * @returns {Object|null} Article object or null
   */
  getArticle(id) {
    return this.articles.get(id) || null;
  }

  /**
   * Get all articles
   * @returns {Array} Array of all articles
   */
  getAllArticles() {
    return Array.from(this.articles.values());
  }

  /**
   * Get articles connected to a given article
   * @param {string} articleId - Article ID
   * @returns {Array} Array of connected articles with relationship info
   */
  getConnections(articleId) {
    const neighbors = this.graph.neighbors(articleId);
    if (!neighbors) return [];

    return neighbors.map(neighborId => {
      const article = this.articles.get(neighborId);
      const edgeData = this.graph.edge(articleId, neighborId);

      return {
        id: neighborId,
        title: article?.title,
        relationships: edgeData?.relationships || [],
        weight: edgeData?.weight || 0
      };
    });
  }

  /**
   * Get node count
   * @returns {number} Number of articles in graph
   */
  getNodeCount() {
    return this.graph.nodeCount();
  }

  /**
   * Get edge count
   * @returns {number} Number of connections in graph
   */
  getEdgeCount() {
    return this.graph.edgeCount();
  }

  /**
   * Check if article exists
   * @param {string} id - Article ID
   * @returns {boolean}
   */
  hasArticle(id) {
    return this.articles.has(id);
  }

  /**
   * Remove an article from the graph
   * @param {string} id - Article ID
   */
  removeArticle(id) {
    this.graph.removeNode(id);
    this.articles.delete(id);
  }

  /**
   * Get all nodes and edges for export
   * @returns {Object} { nodes: Array, edges: Array }
   */
  export() {
    const nodes = this.graph.nodes().map(nodeId => {
      const nodeData = this.graph.node(nodeId);
      const article = this.articles.get(nodeId);
      return {
        id: nodeId,
        title: article?.title,
        metadata: article?.metadata
      };
    });

    const edges = this.graph.edges().map(edge => {
      const edgeData = this.graph.edge(edge.v, edge.w);
      return {
        source: edge.v,
        target: edge.w,
        relationships: edgeData?.relationships || [],
        weight: edgeData?.weight || 0
      };
    });

    return { nodes, edges };
  }

  /**
   * Get graph statistics
   * @returns {Object} Statistics about the graph
   */
  getStats() {
    const nodes = this.graph.nodes();
    const edges = this.graph.edges();

    let maxConnections = 0;
    let mostConnectedNodeId = null;

    for (const nodeId of nodes) {
      const neighbors = this.graph.neighbors(nodeId) || [];
      if (neighbors.length > maxConnections) {
        maxConnections = neighbors.length;
        mostConnectedNodeId = nodeId;
      }
    }

    // Collect all counties and leagues
    const counties = new Set();
    const leagues = new Set();

    for (const article of this.articles.values()) {
      if (article.metadata) {
        if (article.metadata.primaryCounty) {
          counties.add(article.metadata.primaryCounty);
        }
        if (article.metadata.leagues) {
          article.metadata.leagues.forEach(l => leagues.add(l));
        }
      }
    }

    return {
      totalArticles: nodes.length,
      totalConnections: edges.length,
      avgConnectionsPerArticle: nodes.length > 0 ? edges.length / nodes.length : 0,
      mostConnectedArticle: mostConnectedNodeId ? {
        id: mostConnectedNodeId,
        title: this.articles.get(mostConnectedNodeId)?.title,
        connections: maxConnections
      } : null,
      counties: Array.from(counties).sort(),
      leagues: Array.from(leagues).sort()
    };
  }
}

export default ArticleGraph;
