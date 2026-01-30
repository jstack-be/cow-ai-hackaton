import dotenv from 'dotenv';
import OpenAIAnalyzer from './services/openai-analyzer.js';
import GraphService from './services/graph-service.js';
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
const graphService = new GraphService();

// Create and start server
const app = createServer(openaiAnalyzer, graphService);

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║   Sports Article Graph Analyzer                        ║
║   🌐 Dashboard: http://localhost:${PORT}                   ║
║   📚 API Docs:  http://localhost:${PORT}/api                ║
╚════════════════════════════════════════════════════════╝

✨ Quick Start:
  1. Open http://localhost:${PORT} in your browser
  2. Upload articles using the web interface
  3. Explore relationships and graph queries

API Endpoints:
  GET  /health                        - Health check
  GET  /api                           - API documentation
  GET  /api/articles                  - List all articles
  GET  /api/articles/:id              - Get article details
  POST /api/articles/analyze          - Analyze single article
  POST /api/articles/analyze-batch    - Analyze multiple articles

  GET  /api/graph/stats               - Graph statistics
  GET  /api/graph/distance            - Calculate distance between articles
  GET  /api/graph/related/:id         - Find related articles
  GET  /api/graph/export              - Export graph data
  GET  /api/graph/search              - Search articles

Press Ctrl+C to stop the server
  `);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nTerminating...');
  process.exit(0);
});

export { openaiAnalyzer, graphService, app };
