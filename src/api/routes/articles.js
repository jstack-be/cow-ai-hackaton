import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { upload, handleFileUpload, handleBatchFileUpload } from '../middleware/upload.js';
import ImageService from '../../services/image-service.js';

export function createArticlesRouter(openaiAnalyzer, graphService, vectorStore, articleGenerator) {
  const router = express.Router();
  const imageService = new ImageService();

  /**
   * POST /api/articles/analyze
   * Analyze a single article from a text file
   */
  router.post('/analyze', upload.single('file'), handleFileUpload, async (req, res, next) => {
    try {
      const { fileContent, fileName } = req;
      const title = req.body.title || fileName.replace(/\.txt$/, '');

      // Generate enhanced content if requested
      let enhancedContent = fileContent;
      let generatedHeadline = null;
      
      if (req.body.generateContent === 'true') {
        console.log('🎨 Generating enhanced article content...');
        const generated = await articleGenerator.generateContent(fileContent);
        generatedHeadline = generated.headline;
        enhancedContent = generated.article;
      }

      // Analyze the article using OpenAI
      const metadata = await openaiAnalyzer.analyzeArticle(enhancedContent);

      // Create article object
      const article = {
        id: uuidv4(),
        title: generatedHeadline || title,
        content: enhancedContent,
        sourceText: fileContent !== enhancedContent ? fileContent : undefined,
        metadata,
        url: req.body.url,
        analyzedAt: new Date()
      };

      // Add to graph service
      const result = graphService.addAnalyzedArticle(article);

      // Add to vector store for semantic search
      await vectorStore.addDocument({
        id: result.id,
        title: result.title,
        content: result.content,
        metadata: {
          ...result.metadata,
          sourceText: article.sourceText
        }
      });

      res.json({
        success: true,
        article: {
          id: result.id,
          title: result.title,
          metadata: result.metadata,
          relatedArticles: result.relatedArticles[1] || [],
          generatedHeadline: generatedHeadline
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

          // Generate enhanced content if requested
          let enhancedContent = content;
          let generatedHeadline = null;
          
          if (req.body.generateContent === 'true') {
            console.log(`🎨 Generating enhanced content for article ${i + 1}...`);
            const generated = await articleGenerator.generateContent(content);
            generatedHeadline = generated.headline;
            enhancedContent = generated.article;
          }

          // Analyze article
          const metadata = await openaiAnalyzer.analyzeArticle(enhancedContent);

          // Create article
          const article = {
            id: uuidv4(),
            title: generatedHeadline || title,
            content: enhancedContent,
            sourceText: content !== enhancedContent ? content : undefined,
            metadata,
            analyzedAt: new Date()
          };

          // Add to graph
          const result = graphService.addAnalyzedArticle(article);

          // Add to vector store
          await vectorStore.addDocument({
            id: result.id,
            title: result.title,
            content: result.content,
            metadata: {
              ...result.metadata,
              sourceText: article.sourceText
            }
          });

          results.analyzed.push({
            id: result.id,
            title: result.title,
            metadata: result.metadata,
            generatedHeadline: generatedHeadline
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
   * POST /api/articles/query
   * Query articles using natural language (semantic search + LLM)
   */
  router.post('/query', async (req, res, next) => {
    try {
      const { query, topK = 3 } = req.body;

      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Query is required and must be a non-empty string'
        });
      }

      // Use vector store to answer the question
      const result = await vectorStore.answerQuestion(query, topK);

      res.json({
        success: true,
        query: query,
        answer: result.answer,
        sources: result.sources,
        documentsSearched: topK
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/articles/:id
   * Get article details with connections
   */
  router.get('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const article = graphService.getArticle(id);

      if (!article) {
        return res.status(404).json({
          success: false,
          error: `Article ${id} not found`
        });
      }

      // Get sport-related image
      const sport = imageService.inferSportFromMetadata(article.metadata);
      const imageUrl = await imageService.getImageForSport(sport);

      res.json({
        success: true,
        article: {
          id: article.id,
          title: article.title,
          metadata: article.metadata,
          connections: article.connections,
          imageUrl,
          sport
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
  router.get('/', async (req, res, next) => {
    try {
      const articles = graphService.getAllArticles();

      // Add images to all articles
      const articlesWithImages = await Promise.all(
        articles.map(async (article) => {
          const sport = imageService.inferSportFromMetadata(article.metadata);
          const imageUrl = await imageService.getImageForSport(sport);
          
          return {
            id: article.id,
            title: article.title,
            metadata: article.metadata,
            imageUrl,
            sport
          };
        })
      );

      res.json({
        success: true,
        articles: articlesWithImages,
        total: articles.length
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export default createArticlesRouter;
