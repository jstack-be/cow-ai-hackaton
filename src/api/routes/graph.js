import express from 'express';

export function createGraphRouter(graphService) {
  const router = express.Router();

  /**
   * GET /api/graph/distance
   * Calculate distance between two articles
   * Query params: from=id1&to=id2&weighted=true
   */
  router.get('/distance', (req, res, next) => {
    try {
      const { from, to, weighted = 'true' } = req.query;

      if (!from || !to) {
        return res.status(400).json({
          success: false,
          error: 'Both "from" and "to" article IDs are required'
        });
      }

      const isWeighted = weighted === 'true';
      const result = graphService.calculateDistance(from, to, { weighted: isWeighted });

      res.json({
        success: true,
        distance: result.distance,
        path: result.path,
        relevanceScore: graphService.getRelevanceScore(from, to)
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/graph/related/:id
   * Find related articles within a certain distance
   * Query params: maxDistance=2&limit=10
   */
  router.get('/related/:id', (req, res, next) => {
    try {
      const { id } = req.params;
      const { maxDistance = '2', limit = '10' } = req.query;

      const relatedByDistance = graphService.getRelatedArticles(id, {
        maxDistance: parseInt(maxDistance),
        weighted: true
      });

      // Format response
      const relatedArticles = {};
      for (const [distance, articles] of Object.entries(relatedByDistance)) {
        relatedArticles[distance] = articles
          .slice(0, parseInt(limit))
          .map(article => ({
            id: article.id,
            title: article.title,
            distance: article.distance,
            relationships: article.relationships,
            relevanceScore: graphService.getRelevanceScore(id, article.id)
          }));
      }

      const sourceArticle = graphService.getArticle(id);
      if (!sourceArticle) {
        return res.status(404).json({
          success: false,
          error: `Article ${id} not found`
        });
      }

      res.json({
        success: true,
        sourceArticle: {
          id: sourceArticle.id,
          title: sourceArticle.title
        },
        relatedArticles
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/graph/stats
   * Get graph statistics
   */
  router.get('/stats', (req, res, next) => {
    try {
      const stats = graphService.getGraphStats();

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/graph/export
   * Export graph data
   * Query params: format=json
   */
  router.get('/export', (req, res, next) => {
    try {
      const { format = 'json' } = req.query;

      if (format !== 'json') {
        return res.status(400).json({
          success: false,
          error: 'Only JSON format is supported'
        });
      }

      const graphData = graphService.exportGraph();

      res.json({
        success: true,
        nodes: graphData.nodes,
        edges: graphData.edges
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/graph/search
   * Search for articles by various criteria
   * Query params: club=name | county=name | league=name
   */
  router.get('/search', (req, res, next) => {
    try {
      const { club, county, league } = req.query;

      let results = [];

      if (club) {
        results = graphService.getArticlesByClub(club);
      } else if (county) {
        results = graphService.getArticlesByCounty(county);
      } else if (league) {
        results = graphService.getArticlesByLeague(league);
      } else {
        return res.status(400).json({
          success: false,
          error: 'Provide at least one search criteria: club, county, or league'
        });
      }

      res.json({
        success: true,
        results: results.map(article => ({
          id: article.id,
          title: article.title,
          metadata: article.metadata
        })),
        total: results.length
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export default createGraphRouter;
