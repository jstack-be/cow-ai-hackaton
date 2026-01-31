import express from 'express';
import { v4 as uuidv4 } from 'uuid';

export function createClubsRouter(clubStore, articleStore) {
  const router = express.Router();

  /**
   * POST /api/clubs
   * Create a new club profile
   */
  router.post('/', async (req, res, next) => {
    try {
      const { name, county, league, description, website, socials } = req.body;

      // Validate required fields
      if (!name || !county) {
        return res.status(400).json({
          success: false,
          error: 'Name and county are required'
        });
      }

      // Check if club already exists
      const existingClub = clubStore.getByName(name);
      if (existingClub) {
        return res.status(409).json({
          success: false,
          error: 'Club with this name already exists',
          club: existingClub
        });
      }

      // Create club object
      const club = {
        id: uuidv4(),
        name: name.trim(),
        county: county.trim(),
        league: league ? league.trim() : null,
        description: description || null,
        website: website || null,
        socials: socials || {},
        articleReferences: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store the club
      const storedClub = clubStore.store(club);

      res.status(201).json({
        success: true,
        club: storedClub
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/clubs
   * Get all clubs or search clubs
   */
  router.get('/', async (req, res, next) => {
    try {
      const { name, county, league } = req.query;

      let clubs;
      if (name || county || league) {
        // Search with criteria
        clubs = clubStore.search({ name, county, league });
      } else {
        // Get all clubs
        clubs = clubStore.getAll();
      }

      res.json({
        success: true,
        count: clubs.length,
        clubs
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/clubs/:id
   * Get a specific club by ID with recent articles
   */
  router.get('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const { includeArticles } = req.query;

      const club = clubStore.get(id);
      if (!club) {
        return res.status(404).json({
          success: false,
          error: 'Club not found'
        });
      }

      // Get recent articles if requested
      let recentArticles = [];
      if (includeArticles === 'true') {
        const articleIds = clubStore.getRecentArticles(id, 5);
        recentArticles = articleIds
          .map(articleId => articleStore.get(articleId))
          .filter(article => article !== null);
      }

      res.json({
        success: true,
        club,
        recentArticles: includeArticles === 'true' ? recentArticles : undefined
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/clubs/:id/articles
   * Get all articles mentioning a specific club
   */
  router.get('/:id/articles', async (req, res, next) => {
    try {
      const { id } = req.params;
      const { limit } = req.query;

      const club = clubStore.get(id);
      if (!club) {
        return res.status(404).json({
          success: false,
          error: 'Club not found'
        });
      }

      // Get article IDs
      const maxLimit = limit ? parseInt(limit, 10) : 5;
      const articleIds = clubStore.getRecentArticles(id, maxLimit);
      
      // Get full article objects
      const articles = articleIds
        .map(articleId => articleStore.get(articleId))
        .filter(article => article !== null);

      res.json({
        success: true,
        club: {
          id: club.id,
          name: club.name,
          county: club.county,
          league: club.league
        },
        count: articles.length,
        articles
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * PUT /api/clubs/:id
   * Update a club profile
   */
  router.put('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, county, league, description, website, socials } = req.body;

      const club = clubStore.get(id);
      if (!club) {
        return res.status(404).json({
          success: false,
          error: 'Club not found'
        });
      }

      // Check if new name conflicts with existing club
      if (name && name.trim() !== club.name) {
        const existingClub = clubStore.getByName(name);
        if (existingClub && existingClub.id !== id) {
          return res.status(409).json({
            success: false,
            error: 'Another club with this name already exists'
          });
        }
      }

      // Update fields
      const updates = {};
      if (name) updates.name = name.trim();
      if (county) updates.county = county.trim();
      if (league !== undefined) updates.league = league ? league.trim() : null;
      if (description !== undefined) updates.description = description;
      if (website !== undefined) updates.website = website;
      if (socials !== undefined) updates.socials = socials;

      const updatedClub = clubStore.update(id, updates);

      res.json({
        success: true,
        club: updatedClub
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * DELETE /api/clubs/:id
   * Delete a club profile
   */
  router.delete('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;

      const club = clubStore.get(id);
      if (!club) {
        return res.status(404).json({
          success: false,
          error: 'Club not found'
        });
      }

      const deleted = clubStore.delete(id);

      res.json({
        success: true,
        message: 'Club deleted successfully',
        deletedClub: club
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/clubs/by-county/:county
   * Get all clubs in a specific county
   */
  router.get('/by-county/:county', async (req, res, next) => {
    try {
      const { county } = req.params;

      const clubs = clubStore.getByCounty(county);

      res.json({
        success: true,
        county,
        count: clubs.length,
        clubs
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/clubs/by-league/:league
   * Get all clubs in a specific league
   */
  router.get('/by-league/:league', async (req, res, next) => {
    try {
      const { league } = req.params;

      const clubs = clubStore.getByLeague(league);

      res.json({
        success: true,
        league,
        count: clubs.length,
        clubs
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export default createClubsRouter;
