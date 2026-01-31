/**
 * In-memory club profile storage service
 * Stores club profiles with metadata similar to articles
 */
export class ClubStore {
  constructor() {
    this.clubs = new Map();
  }

  /**
   * Store a club profile
   * @param {Object} club - Club object
   * @returns {Object} The stored club
   */
  store(club) {
    if (!club || !club.id) {
      throw new Error('Club must have an id');
    }
    
    const clubData = {
      ...club,
      updatedAt: new Date()
    };
    
    this.clubs.set(club.id, clubData);
    return clubData;
  }

  /**
   * Retrieve a club by ID
   * @param {string} id - Club ID
   * @returns {Object|null} Club or null if not found
   */
  get(id) {
    return this.clubs.get(id) || null;
  }

  /**
   * Get club by name (case-insensitive)
   * @param {string} name - Club name
   * @returns {Object|null} Club or null if not found
   */
  getByName(name) {
    const normalizedName = name.toLowerCase().trim();
    for (const club of this.clubs.values()) {
      if (club.name.toLowerCase().trim() === normalizedName) {
        return club;
      }
    }
    return null;
  }

  /**
   * Get all clubs
   * @returns {Array} Array of all clubs
   */
  getAll() {
    return Array.from(this.clubs.values());
  }

  /**
   * Check if club exists
   * @param {string} id - Club ID
   * @returns {boolean}
   */
  has(id) {
    return this.clubs.has(id);
  }

  /**
   * Check if club exists by name (case-insensitive)
   * @param {string} name - Club name
   * @returns {boolean}
   */
  hasByName(name) {
    return this.getByName(name) !== null;
  }

  /**
   * Update a club profile
   * @param {string} id - Club ID
   * @param {Object} updates - Fields to update
   * @returns {Object|null} Updated club or null if not found
   */
  update(id, updates) {
    const club = this.clubs.get(id);
    if (!club) return null;

    const updatedClub = {
      ...club,
      ...updates,
      id: club.id, // Prevent ID from being changed
      createdAt: club.createdAt, // Preserve creation date
      updatedAt: new Date()
    };

    this.clubs.set(id, updatedClub);
    return updatedClub;
  }

  /**
   * Delete a club
   * @param {string} id - Club ID
   * @returns {boolean} True if club was deleted, false if not found
   */
  delete(id) {
    return this.clubs.delete(id);
  }

  /**
   * Get clubs by county
   * @param {string} county - County name
   * @returns {Array} Clubs from this county
   */
  getByCounty(county) {
    const results = [];
    const normalizedCounty = county.toLowerCase().trim();

    for (const club of this.clubs.values()) {
      if (club.county && club.county.toLowerCase().trim() === normalizedCounty) {
        results.push(club);
      }
    }

    return results;
  }

  /**
   * Get clubs by league
   * @param {string} league - League name
   * @returns {Array} Clubs from this league
   */
  getByLeague(league) {
    const results = [];
    const normalizedLeague = league.toLowerCase().trim();

    for (const club of this.clubs.values()) {
      if (club.league && club.league.toLowerCase().trim() === normalizedLeague) {
        results.push(club);
      }
    }

    return results;
  }

  /**
   * Add an article reference to a club
   * @param {string} clubId - Club ID
   * @param {string} articleId - Article ID
   * @param {Date} articleDate - Article date
   * @returns {Object|null} Updated club or null if not found
   */
  addArticleReference(clubId, articleId, articleDate) {
    const club = this.clubs.get(clubId);
    if (!club) return null;

    if (!club.articleReferences) {
      club.articleReferences = [];
    }

    // Add reference if not already present
    if (!club.articleReferences.some(ref => ref.articleId === articleId)) {
      club.articleReferences.push({
        articleId,
        date: articleDate || new Date()
      });

      // Sort by date (most recent first)
      club.articleReferences.sort((a, b) => b.date - a.date);
    }

    this.clubs.set(clubId, club);
    return club;
  }

  /**
   * Get most recent articles for a club
   * @param {string} clubId - Club ID
   * @param {number} limit - Maximum number of articles to return (default: 5)
   * @returns {Array} Array of article IDs
   */
  getRecentArticles(clubId, limit = 5) {
    const club = this.clubs.get(clubId);
    if (!club || !club.articleReferences) return [];

    return club.articleReferences
      .slice(0, limit)
      .map(ref => ref.articleId);
  }

  /**
   * Search clubs
   * @param {Object} criteria - Search criteria
   * @returns {Array} Matching clubs
   */
  search(criteria) {
    const results = [];

    for (const club of this.clubs.values()) {
      let matches = true;

      if (criteria.name) {
        const searchName = criteria.name.toLowerCase().trim();
        if (!club.name.toLowerCase().includes(searchName)) {
          matches = false;
        }
      }

      if (criteria.county) {
        const searchCounty = criteria.county.toLowerCase().trim();
        if (!club.county || club.county.toLowerCase().trim() !== searchCounty) {
          matches = false;
        }
      }

      if (criteria.league) {
        const searchLeague = criteria.league.toLowerCase().trim();
        if (!club.league || club.league.toLowerCase().trim() !== searchLeague) {
          matches = false;
        }
      }

      if (matches) {
        results.push(club);
      }
    }

    return results;
  }
}

export default ClubStore;
