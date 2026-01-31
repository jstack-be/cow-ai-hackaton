import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Sample Loader Service
 * Loads and processes sample articles from data/sample-articles/ directory
 */
export class SampleLoader {
  constructor(openaiAnalyzer, graphService, vectorStore) {
    this.openaiAnalyzer = openaiAnalyzer;
    this.graphService = graphService;
    this.vectorStore = vectorStore;
  }

  /**
   * Get list of sample article files from data/sample-articles/
   * @returns {Array<string>} Array of file paths
   */
  getSampleFiles() {
    const sampleDir = path.join(__dirname, '../../data/sample-articles');

    // Check if directory exists
    if (!fs.existsSync(sampleDir)) {
      console.warn(`⚠️  Sample articles directory not found at ${sampleDir}`);
      return [];
    }

    try {
      const files = fs.readdirSync(sampleDir);
      const txtFiles = files
        .filter(file => file.endsWith('.txt'))
        .map(file => path.join(sampleDir, file))
        .sort();

      return txtFiles;
    } catch (error) {
      console.error(`❌ Error reading sample articles directory: ${error.message}`);
      return [];
    }
  }

  /**
   * Check if article already exists by checking title and content hash
   * @param {string} title - Article title
   * @param {string} content - Article content
   * @returns {boolean} True if duplicate found
   */
  isDuplicate(title, content) {
    // Check by title match
    const existingByTitle = this.graphService.getArticleStore().findByTitle(title);
    if (existingByTitle) {
      return true;
    }

    // Check by content hash (first 100 chars)
    const hasContentHash = this.graphService.getArticleStore().hasContentHash(content);
    if (hasContentHash) {
      return true;
    }

    return false;
  }

  /**
   * Process a single sample article through the full pipeline
   * @param {string} filePath - Path to article file
   * @param {string} fileName - File name for logging
   * @returns {Promise<Object>} Result object { status, id, error }
   */
  async processSingleArticle(filePath, fileName) {
    try {
      console.log(`🔄 Processing sample article: ${fileName}`);

      // Read file content
      const content = fs.readFileSync(filePath, 'utf-8');
      if (!content || content.trim().length === 0) {
        return { status: 'failed', error: 'Empty file' };
      }

      // Extract title from filename
      const title = fileName.replace(/\.txt$/, '');

      // Check for duplicates
      if (this.isDuplicate(title, content)) {
        console.log(`⏭️  Skipped: ${title} (already exists)`);
        return { status: 'skipped', reason: 'duplicate' };
      }

      // Analyze article (extract metadata)
      const metadata = await this.openaiAnalyzer.analyzeArticle(content);

      // Create article object
      const article = {
        id: uuidv4(),
        title,
        content,
        metadata,
        analyzedAt: new Date()
      };

      // Add to graph service
      const result = this.graphService.addAnalyzedArticle(article);

      // Add to vector store for semantic search
      await this.vectorStore.addDocument({
        id: result.id,
        title: result.title,
        content: result.content,
        metadata: {
          ...result.metadata
        }
      });

      console.log(`✅ Processed: ${title}`);
      return { status: 'loaded', id: article.id };
    } catch (error) {
      // Log error but don't crash
      console.error(`❌ Failed to process ${fileName}: ${error.message}`);
      return { status: 'failed', error: error.message };
    }
  }

  /**
   * Load and process all sample articles
   * @param {Object} options - Loading options (skipDuplicates: boolean)
   * @returns {Promise<Object>} Summary { loaded, failed, skipped, total, errors }
   */
  async loadSamples(options = {}) {
    const { skipDuplicates = true } = options;

    const sampleFiles = this.getSampleFiles();
    if (sampleFiles.length === 0) {
      return { loaded: 0, failed: 0, skipped: 0, total: 0, errors: [] };
    }

    console.log(`📂 Found ${sampleFiles.length} sample articles to process...`);

    const results = {
      loaded: 0,
      failed: 0,
      skipped: 0,
      total: sampleFiles.length,
      errors: []
    };

    // Process each file sequentially
    for (let i = 0; i < sampleFiles.length; i++) {
      const filePath = sampleFiles[i];
      const fileName = path.basename(filePath);

      const result = await this.processSingleArticle(filePath, fileName);

      if (result.status === 'loaded') {
        results.loaded++;
      } else if (result.status === 'failed') {
        results.failed++;
        results.errors.push({ file: fileName, error: result.error });
      } else if (result.status === 'skipped') {
        results.skipped++;
      }
    }

    return results;
  }
}

export default SampleLoader;
