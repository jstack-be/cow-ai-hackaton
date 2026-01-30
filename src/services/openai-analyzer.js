import OpenAI from 'openai';
import { validateMetadata, normalizeMetadata } from '../utils/validators.js';
import { SYSTEM_PROMPT, buildExtractionPrompt } from '../utils/prompts.js';

export class OpenAIAnalyzer {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.client = new OpenAI({ apiKey });
  }

  /**
   * Analyze an article and extract structured metadata
   * @param {string} articleContent - The full article text
   * @returns {Promise<Object>} Extracted metadata object
   * @throws {Error} If extraction fails
   */
  async analyzeArticle(articleContent) {
    if (!articleContent || articleContent.trim().length === 0) {
      throw new Error('Article content cannot be empty');
    }

    const prompt = buildExtractionPrompt(articleContent.substring(0, 8000)); // Limit content to avoid token overflow

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2, // Low temperature for consistent extraction
        max_tokens: 2000
      });

      const responseText = response.choices[0].message.content;

      // Parse the JSON response
      let extractedData;
      try {
        extractedData = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Failed to parse ChatGPT response as JSON: ${parseError.message}`);
      }

      // Validate the extracted data
      const validation = validateMetadata(extractedData);
      if (!validation.success) {
        throw new Error(`Validation failed: ${JSON.stringify(validation.error)}`);
      }

      // Normalize the metadata
      const normalizedMetadata = normalizeMetadata(validation.data);

      return normalizedMetadata;
    } catch (error) {
      if (error.status === 401) {
        throw new Error('Invalid OpenAI API key');
      } else if (error.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please try again later.');
      } else if (error.status === 500) {
        throw new Error('OpenAI API server error. Please try again later.');
      }
      throw error;
    }
  }

  /**
   * Batch analyze multiple articles
   * @param {Array<string>} articles - Array of article contents
   * @returns {Promise<Array>} Array of extracted metadata
   */
  async analyzeArticlesBatch(articles) {
    const results = [];
    const errors = [];

    for (let i = 0; i < articles.length; i++) {
      try {
        const metadata = await this.analyzeArticle(articles[i]);
        results.push({
          success: true,
          metadata
        });
      } catch (error) {
        errors.push({
          index: i,
          error: error.message
        });
        results.push({
          success: false,
          error: error.message
        });
      }
    }

    return { results, errors };
  }
}

export default OpenAIAnalyzer;
