import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import errorHandler from './middleware/error-handler.js';
import createArticlesRouter from './routes/articles.js';
import createGraphRouter from './routes/graph.js';
import createClubsRouter from './routes/clubs.js';
import createPodcastRouter from './routes/podcast.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create and configure the Express server
 * @param {OpenAIAnalyzer} openaiAnalyzer
 * @param {GraphService} graphService
 * @param {VectorStore} vectorStore
 * @param {ArticleGenerator} articleGenerator
 * @param {ClubStore} clubStore
 * @param {PodcastService} podcastService
 * @returns {express.Application}
 */
export function createServer(openaiAnalyzer, graphService, vectorStore, articleGenerator, clubStore, podcastService) {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Serve static files from public directory
  app.use(express.static(path.join(__dirname, '../../public')));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'Sports Article Graph Analyzer is running',
      timestamp: new Date()
    });
  });

  // API routes
  app.use('/api/articles', createArticlesRouter(openaiAnalyzer, graphService, vectorStore, articleGenerator));
  app.use('/api/graph', createGraphRouter(graphService));
  app.use('/api/clubs', createClubsRouter(clubStore, graphService.store));
  app.use('/api/podcast', createPodcastRouter(graphService, podcastService));

  // Root endpoint - serve dashboard
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
  });

  // API info endpoint
  app.get('/api', (req, res) => {
    res.json({
      name: 'Sports Article Graph Analyzer',
      version: '1.0.0',
      description: 'Analyze sports articles using ChatGPT and build a graph of article relationships',
      ui: 'Open http://localhost:3000 in your browser',
      endpoints: {
        health: 'GET /health',
        articles: {
          analyze: 'POST /api/articles/analyze',
          analyzeBatch: 'POST /api/articles/analyze-batch',
          query: 'POST /api/articles/query',
          byInterests: 'POST /api/articles/by-interests',
          getArticle: 'GET /api/articles/:id',
          getAllArticles: 'GET /api/articles'
        },
        graph: {
          distance: 'GET /api/graph/distance?from=id1&to=id2&weighted=true',
          related: 'GET /api/graph/related/:id?maxDistance=2',
          stats: 'GET /api/graph/stats',
          export: 'GET /api/graph/export?format=json',
          search: 'GET /api/graph/search?club=name | county=name | league=name'
        },
        clubs: {
          createClub: 'POST /api/clubs',
          getAllClubs: 'GET /api/clubs',
          searchClubs: 'GET /api/clubs?name=name&county=county&league=league',
          getClub: 'GET /api/clubs/:id?includeArticles=true',
          getClubArticles: 'GET /api/clubs/:id/articles?limit=5',
          updateClub: 'PUT /api/clubs/:id',
          deleteClub: 'DELETE /api/clubs/:id',
          getByCounty: 'GET /api/clubs/by-county/:county',
          getByLeague: 'GET /api/clubs/by-league/:league'
        },
        podcast: {
          generate: 'POST /api/podcast/generate',
          byInterests: 'POST /api/podcast/by-interests'
        }
      }
    });
  });

  // 404 handler
  app.use((req, res) => {
    // Return JSON for API calls, HTML for others
    if (req.path.startsWith('/api')) {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found: ' + req.path
      });
    } else {
      res.sendFile(path.join(__dirname, '../../public/index.html'));
    }
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}

export default createServer;
