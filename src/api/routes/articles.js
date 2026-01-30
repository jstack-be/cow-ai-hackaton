import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { upload, handleFileUpload, handleBatchFileUpload } from '../middleware/upload.js';

export function createArticlesRouter(openaiAnalyzer, graphService) {
  const router = express.Router();

  /**
   * POST /api/articles/analyze
   * Analyze a single article from a text file
   */
  router.post('/analyze', upload.single('file'), handleFileUpload, async (req, res, next) => {
    try {
      const { fileContent, fileName } = req;
      const title = req.body.title || fileName.replace(/\.txt$/, '');

      // Analyze the article using OpenAI
      const metadata = await openaiAnalyzer.analyzeArticle(fileContent);

      // Create article object
      const article = {
        id: uuidv4(),
        title,
        content: fileContent,
        metadata,
        url: req.body.url,
        analyzedAt: new Date()
      };

      // Add to graph service
      const result = graphService.addAnalyzedArticle(article);

      res.json({
        success: true,
        article: {
          id: result.id,
          title: result.title,
          metadata: result.metadata,
          relatedArticles: result.relatedArticles[1] || []
        }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * POST /api/articles/analyze-batch
   * Analyze multiple articles from text files
   */
  router.post('/analyze-batch', upload.array('files', 20), handleBatchFileUpload, async (req, res, next) => {
    try {
      const { filesContent } = req;

      const results = {
        analyzed: [],
        failed: []
      };

      for (let i = 0; i < filesContent.length; i++) {
        try {
          const { content, name } = filesContent[i];
          const title = req.body[`title_${i}`] || name.replace(/\.txt$/, '');

          // Analyze article
          const metadata = await openaiAnalyzer.analyzeArticle(content);

          // Create article
          const article = {
            id: uuidv4(),
            title,
            content,
            metadata,
            analyzedAt: new Date()
          };

          // Add to graph
          const result = graphService.addAnalyzedArticle(article);

          results.analyzed.push({
            id: result.id,
            title: result.title,
            metadata: result.metadata
          });
        } catch (error) {
          results.failed.push({
            file: filesContent[i].name,
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        analyzed: results.analyzed.length,
        failed: results.failed.length,
        articles: results.analyzed,
        errors: results.failed.length > 0 ? results.failed : undefined
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/articles/:id
   * Get article details with connections
   */
  router.get('/:id', (req, res, next) => {
    try {
      const { id } = req.params;
      const article = graphService.getArticle(id);

      if (!article) {
        return res.status(404).json({
          success: false,
          error: `Article ${id} not found`
        });
      }

      res.json({
        success: true,
        article: {
          id: article.id,
          title: article.title,
          metadata: article.metadata,
          connections: article.connections
        }
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/articles
   * Get all articles
   */
  router.get('/', (req, res, next) => {
    try {
      const articles = graphService.getAllArticles();

      res.json({
        success: true,
        articles: articles.map(article => ({
          id: article.id,
          title: article.title,
          metadata: article.metadata
        })),
        total: articles.length
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export default createArticlesRouter;
