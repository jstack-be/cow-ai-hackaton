/**
 * In-memory article storage service
 * Stores articles in a Map for fast access by ID
 */
export class ArticleStore {
  constructor() {
    this.articles = new Map();
  }

  /**
   * Store an article
   * @param {Object} article - Article object
   */
  store(article) {
    if (!article || !article.id) {
      throw new Error('Article must have an id');
    }
    this.articles.set(article.id, article);
  }

  /**
   * Retrieve an article by ID
   * @param {string} id - Article ID
   * @returns {Object|null} Article or null if not found
   */
  get(id) {
    return this.articles.get(id) || null;
  }

  /**
   * Get all articles
   * @returns {Array} Array of all articles
   */
  getAll() {
    return Array.from(this.articles.values());
  }

  /**
   * Check if article exists
   * @param {string} id - Article ID
   * @returns {boolean}
   */
  has(id) {
    return this.articles.has(id);
  }

  /**
   * Find article by title (case-insensitive)
   * @param {string} title - Article title to search for
   * @returns {Object|null} Article or null if not found
   */
  findByTitle(title) {
    const normalizedTitle = title.toLowerCase().trim();
    for (const article of this.articles.values()) {
      if (article.title.toLowerCase().trim() === normalizedTitle) {
        return article;
      }
    }
    return null;
  }

  /**
   * Check if article with similar content exists
   * Uses first 100 chars as content signature for duplicate detection
   * @param {string} content - Article content
   * @returns {boolean}
   */
  hasContentHash(content) {
    const contentSignature = content.substring(0, 100).toLowerCase().trim();
    for (const article of this.articles.values()) {
      const existingSignature = article.content.substring(0, 100).toLowerCase().trim();
      if (existingSignature === contentSignature) {
        return true;
      }
    }
    return false;
  }

  /**
   * Delete an article
   * @param {string} id - Article ID
   * @returns {boolean} True if article was deleted, false if not found
   */
  delete(id) {
    return this.articles.delete(id);
  }

  /**
   * Get articles by club name
   * @param {string} clubName - Club name
   * @returns {Array} Articles mentioning this club
   */
  getByClub(clubName) {
    const results = [];
    const normalizedName = clubName.toLowerCase().trim();

    for (const article of this.articles.values()) {
      if (article.metadata?.clubs) {
        const found = article.metadata.clubs.some(
          club => club.name.toLowerCase().trim() === normalizedName
        );
        if (found) results.push(article);
      }
    }

    return results;
  }

  /**
   * Get articles by county
   * @param {string} county - County name
   * @returns {Array} Articles from this county
   */
  getByCounty(county) {
    const results = [];
    const normalizedCounty = county.toLowerCase().trim();

    for (const article of this.articles.values()) {
      if (article.metadata?.primaryCounty) {
        if (article.metadata.primaryCounty.toLowerCase().trim() === normalizedCounty) {
          results.push(article);
        }
      }
    }

    return results;
  }

  /**
   * Get articles by league
   * @param {string} league - League name
   * @returns {Array} Articles from this league
   */
  getByLeague(league) {
    const results = [];
    const normalizedLeague = league.toLowerCase().trim();

    for (const article of this.articles.values()) {
      if (article.metadata?.leagues) {
        const found = article.metadata.leagues.some(
          l => l.toLowerCase().trim() === normalizedLeague
        );
        if (found) results.push(article);
      }
    }

    return results;
  }

  /**
   * Get total number of articles
   * @returns {number}
   */
  count() {
    return this.articles.size;
  }

  /**
   * Clear all articles
   */
  clear() {
    this.articles.clear();
  }
}

export default ArticleStore;
