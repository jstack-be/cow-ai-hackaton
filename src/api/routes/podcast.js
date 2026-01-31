import express from 'express';

/**
 * Create podcast router with endpoints for generating AI podcast scripts
 * @param {GraphService} graphService - Service for accessing articles
 * @param {PodcastService} podcastService - Service for generating podcasts
 * @returns {express.Router}
 */
export function createPodcastRouter(graphService, podcastService) {
  const router = express.Router();

  /**
   * POST /api/podcast/generate
   * Generate a podcast from all available articles
   * Body (optional): {
   *   limit: number (default: 10) - Maximum number of articles to use
   * }
   */
  router.post('/generate', async (req, res, next) => {
    try {
      const limit = req.body.limit || 10;

      // Get all articles
      const allArticles = graphService.getAllArticles();

      if (allArticles.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No articles available to generate podcast. Please analyze some articles first.'
        });
      }

      console.log(`🎙️ Generating podcast from ${allArticles.length} articles (limit: ${limit})...`);

      // Generate podcast
      const podcast = await podcastService.generateFromAllArticles(allArticles, limit);

      res.json({
        success: true,
        podcast: podcast
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * POST /api/podcast/by-interests
   * Generate a podcast from articles filtered by user interests
   * Body: {
   *   interests: [
   *     { type: 'sport'|'club'|'county'|'league', value: string, weight: number },
   *     ...
   *   ],
   *   limit: number (default: 10) - Maximum number of articles to use
   * }
   */
  router.post('/by-interests', async (req, res, next) => {
    try {
      const { interests, limit = 10 } = req.body;

      if (!interests || !Array.isArray(interests) || interests.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'interests must be a non-empty array'
        });
      }

      // Validate interest structure
      const validTypes = ['sport', 'club', 'county', 'league'];
      for (const interest of interests) {
        if (!interest.type || !interest.value) {
          return res.status(400).json({
            success: false,
            error: 'Each interest must have a type and value'
          });
        }
        
        if (!validTypes.includes(interest.type)) {
          return res.status(400).json({
            success: false,
            error: `Interest type must be one of: ${validTypes.join(', ')}`
          });
        }
      }

      // Get all articles
      const allArticles = graphService.getAllArticles();

      if (allArticles.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No articles available to generate podcast. Please analyze some articles first.'
        });
      }

      console.log(`🎙️ Generating podcast from interests: ${JSON.stringify(interests)} (limit: ${limit})...`);

      // Generate podcast based on interests
      const podcast = await podcastService.generateFromInterests(allArticles, interests, limit);

      res.json({
        success: true,
        podcast: podcast,
        interests: interests
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export default createPodcastRouter;
