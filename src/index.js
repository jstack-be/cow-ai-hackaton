import dotenv from 'dotenv';
import OpenAIAnalyzer from './services/openai-analyzer.js';
import GraphService from './services/graph-service.js';
import VectorStore from './services/vector-store.js';
import ArticleGenerator from './services/article-generator.js';
import ClubStore from './services/club-store.js';
import PodcastService from './services/podcast-service.js';
import createServer from './api/server.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is not set');
  console.error('Please create a .env file with your OpenAI API key:');
  console.error('  cp .env.example .env');
  console.error('  # Edit .env and add your API key');
  process.exit(1);
}

// Initialize services
const openaiAnalyzer = new OpenAIAnalyzer(OPENAI_API_KEY);
const clubStore = new ClubStore();
const graphService = new GraphService(clubStore);
const vectorStore = new VectorStore(OPENAI_API_KEY);
const articleGenerator = new ArticleGenerator(OPENAI_API_KEY);
const podcastService = new PodcastService(OPENAI_API_KEY);

// Load vector store data
console.log('🔄 Loading vector store...');
await vectorStore.load();

// Create and start server
const app = createServer(openaiAnalyzer, graphService, vectorStore, articleGenerator, clubStore, podcastService);

app.listen(PORT, () => {
  const stats = vectorStore.getStats();
  console.log(`
╔════════════════════════════════════════════════════════╗
║   Sports Article Graph Analyzer                        ║
║   🌐 Dashboard: http://localhost:${PORT}                   ║
║   📚 API Docs:  http://localhost:${PORT}/api                ║
║   📊 Knowledge Base: ${stats.totalDocuments} articles indexed            ║
╚════════════════════════════════════════════════════════╝

✨ Quick Start:
  1. Open http://localhost:${PORT} in your browser
  2. Upload articles using the web interface
  3. Explore relationships and graph queries
  4. Query articles with natural language
  5. Ask technical sports rules questions

API Endpoints:
  GET  /health                        - Health check
  GET  /api                           - API documentation
  GET  /api/articles                  - List all articles
  GET  /api/articles/:id              - Get article details
  POST /api/articles/analyze          - Analyze single article
  POST /api/articles/analyze-batch    - Analyze multiple articles
  POST /api/articles/query            - Query articles (semantic search + sports rules)
  POST /api/articles/by-interests     - Filter articles by interests

  GET  /api/graph/stats               - Graph statistics
  GET  /api/graph/distance            - Calculate distance between articles
  GET  /api/graph/related/:id         - Find related articles
  GET  /api/graph/export              - Export graph data
  GET  /api/graph/search              - Search articles

  POST /api/clubs                     - Create a new club profile
  GET  /api/clubs                     - List all clubs
  GET  /api/clubs/:id                 - Get club profile with articles
  PUT  /api/clubs/:id                 - Update club profile
  GET  /api/clubs/:id/articles        - Get articles about a club

  POST /api/podcast/generate          - Generate podcast from all articles
  POST /api/podcast/by-interests      - Generate podcast from interests

Press Ctrl+C to stop the server
  `);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Shutting down gracefully...');
  console.log('📝 Note: Embeddings are stored in memory only and will not persist');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Terminating...');
  console.log('📝 Note: Embeddings are stored in memory only and will not persist');
  process.exit(0);
});

export { openaiAnalyzer, graphService, vectorStore, articleGenerator, podcastService, app };
