import OpenAI from 'openai';

/**
 * Article Generator Service
 * Generates headlines and articles from source text using GPT
 */
export class ArticleGenerator {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Generate a headline for source text
   * @param {string} sourceText - Source text to generate headline from
   * @returns {Promise<string>} Generated headline
   */
  async generateHeadline(sourceText) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert news headline writer. Create compelling, accurate headlines that capture the essence of the story.'
        },
        {
          role: 'user',
          content: `Create a headline for this news content:\n\n${sourceText}`
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    });

    return response.choices[0].message.content.trim();
  }

  /**
   * Generate an article from source text
   * @param {string} sourceText - Source text to generate article from
   * @returns {Promise<string>} Generated article
   */
  async generateArticle(sourceText) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional news writer. Create concise, well-structured mini articles (2-3 paragraphs) that cover the key facts clearly and engagingly.'
        },
        {
          role: 'user',
          content: `Write a mini news article based on this source content:\n\n${sourceText}`
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return response.choices[0].message.content.trim();
  }

  /**
   * Generate both headline and article from source text
   * @param {string} sourceText - Source text
   * @returns {Promise<Object>} Object with headline and article
   */
  async generateContent(sourceText) {
    if (!sourceText || !sourceText.trim()) {
      throw new Error('Source text cannot be empty');
    }

    console.log('📰 Generating headline...');
    const headline = await this.generateHeadline(sourceText);

    console.log('✍️  Generating article...');
    const article = await this.generateArticle(sourceText);

    return { headline, article };
  }
}

export default ArticleGenerator;
