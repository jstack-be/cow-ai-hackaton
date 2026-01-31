import OpenAI from 'openai';

/**
 * Service for generating AI podcast scripts
 * Creates engaging single-person podcast scripts roughly 3 minutes long (approximately 450-500 words)
 */
export class PodcastService {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.client = new OpenAI({ apiKey });
  }

  /**
   * Generate a podcast script from articles
   * @param {Array} articles - Array of article objects to base the podcast on
   * @param {Object} options - Optional parameters
   * @param {string} options.interests - Description of user interests (optional)
   * @returns {Promise<Object>} Generated podcast script and metadata
   */
  async generatePodcast(articles, options = {}) {
    if (!articles || articles.length === 0) {
      throw new Error('At least one article is required to generate a podcast');
    }

    // Prepare article summaries for the prompt
    const articleSummaries = articles.map((article, index) => {
      const clubs = article.metadata?.clubs?.map(c => c.name).join(', ') || 'Unknown';
      const sport = article.metadata?.sport || 'Unknown';
      const county = article.metadata?.primaryCounty || 'Unknown';
      const leagues = article.metadata?.leagues?.join(', ') || 'Unknown';
      
      return `
Article ${index + 1}:
Title: ${article.title}
Sport: ${sport}
Clubs: ${clubs}
County: ${county}
Leagues: ${leagues}
Summary: ${article.content.substring(0, 500)}...
`;
    }).join('\n---\n');

    const interestContext = options.interests 
      ? `\nThe listener is particularly interested in: ${JSON.stringify(options.interests)}`
      : '';

    const systemPrompt = `You are an enthusiastic sports podcast host creating a single-person podcast episode. 
Your style is:
- Engaging and conversational, as if talking to a friend
- Knowledgeable but accessible
- Energetic but not over-the-top
- You use natural transitions between topics
- You occasionally use phrases like "Let me tell you about...", "Now here's something interesting...", "What really caught my attention..."
- You create a narrative flow that connects the stories

The podcast should be approximately 450-500 words to fill roughly 3 minutes of speaking time.`;

    const userPrompt = `Create a podcast episode script based on the following sports articles. 

${articleSummaries}
${interestContext}

Instructions:
1. Start with a brief, catchy introduction (2-3 sentences)
2. Discuss the key stories from the articles, weaving them together naturally
3. Add your commentary and insights
4. Highlight interesting details, rivalries, or storylines
5. End with a brief closing (1-2 sentences)
6. Keep it to approximately 450-500 words total
7. Make it sound natural and conversational, not like you're reading news bulletins
8. Do NOT include stage directions like [pause] or [emphasis] - just write the spoken words

Return a JSON object with:
{
  "title": "Catchy podcast episode title",
  "script": "The full podcast script as one continuous text",
  "summary": "A one-sentence summary of the episode",
  "topics": ["topic1", "topic2", "topic3"],
  "duration": "Estimated duration in format MM:SS",
  "wordCount": number
}`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8, // Higher temperature for creative, varied output
        max_tokens: 1500
      });

      const responseText = response.choices[0].message.content;
      
      let podcastData;
      try {
        podcastData = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Failed to parse podcast response as JSON: ${parseError.message}`);
      }

      // Validate required fields
      if (!podcastData.script || !podcastData.title) {
        throw new Error('Generated podcast missing required fields (script, title)');
      }

      return {
        title: podcastData.title,
        script: podcastData.script,
        summary: podcastData.summary || 'Sports news and analysis',
        topics: podcastData.topics || [],
        duration: podcastData.duration || '3:00',
        wordCount: podcastData.wordCount || podcastData.script.split(/\s+/).length,
        articlesUsed: articles.length,
        generatedAt: new Date().toISOString()
      };
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
   * Generate a podcast from all available articles
   * @param {Array} allArticles - All available articles
   * @param {number} limit - Maximum number of articles to use (default: 10)
   * @returns {Promise<Object>} Generated podcast
   */
  async generateFromAllArticles(allArticles, limit = 10) {
    if (!allArticles || allArticles.length === 0) {
      throw new Error('No articles available to generate podcast');
    }

    // Take the most recent articles up to the limit
    const articlesToUse = allArticles
      .sort((a, b) => new Date(b.analyzedAt) - new Date(a.analyzedAt))
      .slice(0, limit);

    return this.generatePodcast(articlesToUse);
  }

  /**
   * Generate a podcast from articles filtered by interests
   * @param {Array} allArticles - All available articles
   * @param {Array} interests - User interests array
   * @param {number} limit - Maximum number of articles to use (default: 10)
   * @returns {Promise<Object>} Generated podcast
   */
  async generateFromInterests(allArticles, interests, limit = 10) {
    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      throw new Error('interests must be a non-empty array');
    }

    // Filter articles based on interests
    const matchingArticles = [];

    for (const article of allArticles) {
      let matches = false;

      for (const interest of interests) {
        const interestValue = interest.value.toLowerCase().trim();

        switch (interest.type) {
          case 'sport':
            if (article.metadata?.sport?.toLowerCase().trim() === interestValue) {
              matches = true;
            }
            break;

          case 'club':
            if (article.metadata?.clubs?.some(club => 
              club.name.toLowerCase().trim().includes(interestValue)
            )) {
              matches = true;
            }
            break;

          case 'county':
            if (article.metadata?.primaryCounty?.toLowerCase().trim() === interestValue) {
              matches = true;
            }
            break;

          case 'league':
            if (article.metadata?.leagues?.some(league => 
              league.toLowerCase().trim().includes(interestValue)
            )) {
              matches = true;
            }
            break;
        }

        if (matches) break;
      }

      if (matches) {
        matchingArticles.push(article);
      }
    }

    if (matchingArticles.length === 0) {
      throw new Error('No articles found matching the provided interests');
    }

    // Take the most recent matching articles up to the limit
    const articlesToUse = matchingArticles
      .sort((a, b) => new Date(b.analyzedAt) - new Date(a.analyzedAt))
      .slice(0, limit);

    return this.generatePodcast(articlesToUse, { interests });
  }
}

export default PodcastService;
