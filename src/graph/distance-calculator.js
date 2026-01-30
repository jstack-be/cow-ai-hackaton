import Graph from 'graphlib';

/**
 * Calculate distance between two articles using Dijkstra's algorithm
 * @param {ArticleGraph} articleGraph - The article graph instance
 * @param {string} fromId - Source article ID
 * @param {string} toId - Target article ID
 * @param {Object} options - Options for distance calculation
 * @param {boolean} options.weighted - Use weighted distance (default: true)
 * @returns {Object} { distance: number, path: Array }
 */
export function calculateDistance(articleGraph, fromId, toId, options = {}) {
  const { weighted = true } = options;

  const graph = articleGraph.graph;

  if (!graph.hasNode(fromId)) {
    throw new Error(`Source article ${fromId} not found`);
  }
  if (!graph.hasNode(toId)) {
    throw new Error(`Target article ${toId} not found`);
  }

  if (fromId === toId) {
    return {
      distance: 0,
      path: [articleGraph.getArticle(fromId)]
    };
  }

  if (weighted) {
    return calculateWeightedDistance(articleGraph, fromId, toId);
  } else {
    return calculateUnweightedDistance(articleGraph, fromId, toId);
  }
}

/**
 * Calculate weighted distance using Dijkstra's algorithm
 * Stronger connections (higher weight) = shorter distance
 * @param {ArticleGraph} articleGraph
 * @param {string} fromId
 * @param {string} toId
 * @returns {Object}
 */
function calculateWeightedDistance(articleGraph, fromId, toId) {
  const graph = articleGraph.graph;

  // Use graphlib's dijkstra with inverse weight (lower = closer)
  const dijkstra = Graph.alg.dijkstra(graph, fromId, edgeUid => {
    const edgeData = graph.edge(edgeUid);
    // Inverse weight: strong connections (weight 1.0) become distance 1
    // weak connections (weight 0.5) become distance 2
    return 1 / (edgeData?.weight || 0.1);
  });

  const target = dijkstra[toId];

  if (target.distance === Infinity) {
    return {
      distance: Infinity,
      path: []
    };
  }

  const path = reconstructPath(articleGraph, fromId, toId, dijkstra);

  return {
    distance: target.distance,
    path: path
  };
}

/**
 * Calculate unweighted distance (simple hop count)
 * @param {ArticleGraph} articleGraph
 * @param {string} fromId
 * @param {string} toId
 * @returns {Object}
 */
function calculateUnweightedDistance(articleGraph, fromId, toId) {
  const graph = articleGraph.graph;

  // BFS to find shortest unweighted path
  const visited = new Set();
  const queue = [[fromId, [fromId]]];
  visited.add(fromId);

  while (queue.length > 0) {
    const [currentId, path] = queue.shift();

    if (currentId === toId) {
      const pathObjects = path.map(id => articleGraph.getArticle(id));
      return {
        distance: path.length - 1,
        path: pathObjects
      };
    }

    const neighbors = graph.neighbors(currentId) || [];

    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push([neighborId, [...path, neighborId]]);
      }
    }
  }

  return {
    distance: Infinity,
    path: []
  };
}

/**
 * Reconstruct path from dijkstra result
 * @param {ArticleGraph} articleGraph
 * @param {string} fromId
 * @param {string} toId
 * @param {Object} dijkstra - Dijkstra result object
 * @returns {Array} Path of article objects with relationship info
 */
function reconstructPath(articleGraph, fromId, toId, dijkstra) {
  const path = [];
  let currentId = toId;
  const graph = articleGraph.graph;

  // Build path backwards from target to source
  while (currentId) {
    path.unshift(currentId);
    currentId = dijkstra[currentId].predecessor;
  }

  // Convert IDs to article objects with relationship info
  const pathObjects = path.map((id, idx) => {
    const article = articleGraph.getArticle(id);
    const pathItem = {
      id: id,
      title: article?.title,
      metadata: article?.metadata
    };

    // Add relationship info to edges (except last article)
    if (idx < path.length - 1) {
      const nextId = path[idx + 1];
      const edgeData = graph.edge(id, nextId);
      if (edgeData) {
        pathItem.relationships = edgeData.relationships;
        pathItem.edgeWeight = edgeData.weight;
      }
    }

    return pathItem;
  });

  return pathObjects;
}

/**
 * Find all articles within a certain distance
 * @param {ArticleGraph} articleGraph
 * @param {string} sourceId
 * @param {number} maxDistance
 * @param {Object} options
 * @param {boolean} options.weighted - Use weighted distance (default: true)
 * @returns {Object} { distance: number, articles: Array }
 */
export function findArticlesWithinDistance(articleGraph, sourceId, maxDistance, options = {}) {
  const { weighted = true } = options;

  if (!articleGraph.hasArticle(sourceId)) {
    throw new Error(`Source article ${sourceId} not found`);
  }

  const results = {};
  const allArticles = articleGraph.getAllArticles();

  for (const article of allArticles) {
    if (article.id === sourceId) continue;

    const distanceResult = calculateDistance(articleGraph, sourceId, article.id, { weighted });

    if (distanceResult.distance <= maxDistance && distanceResult.distance !== Infinity) {
      if (!results[distanceResult.distance]) {
        results[distanceResult.distance] = [];
      }

      const edgeData = articleGraph.graph.edge(sourceId, article.id);

      results[distanceResult.distance].push({
        id: article.id,
        title: article.title,
        distance: distanceResult.distance,
        relationships: edgeData?.relationships || [],
        weight: edgeData?.weight || 0
      });
    }
  }

  return results;
}

export default {
  calculateDistance,
  findArticlesWithinDistance,
  calculateWeightedDistance,
  calculateUnweightedDistance
};
