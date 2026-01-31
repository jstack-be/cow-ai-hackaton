/**
 * Image service for fetching sport-related images
 * Uses Unsplash API for high-quality free images
 */
export class ImageService {
  constructor() {
    // Cache to avoid repeated API calls for the same sport
    this.imageCache = new Map();
  }

  /**
   * Get an image URL for a specific sport
   * @param {string} sport - Sport name (e.g., "korfball", "football", "GAA")
   * @returns {Promise<string>} Image URL
   */
  async getImageForSport(sport) {
    if (!sport) {
      return this.getDefaultImage();
    }

    // Check cache first
    const normalizedSport = sport.toLowerCase().trim();
    if (this.imageCache.has(normalizedSport)) {
      return this.imageCache.get(normalizedSport);
    }

    try {
      // Use Unsplash's source API (no authentication required for basic use)
      // Format: https://source.unsplash.com/800x600/?{query}
      const imageUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(normalizedSport)},sports`;
      
      // Cache the result
      this.imageCache.set(normalizedSport, imageUrl);
      
      return imageUrl;
    } catch (error) {
      console.error(`Failed to get image for sport "${sport}":`, error.message);
      return this.getDefaultImage();
    }
  }

  /**
   * Get images for multiple sports
   * @param {Array<string>} sports - Array of sport names
   * @returns {Promise<Object>} Object mapping sport names to image URLs
   */
  async getImagesForSports(sports) {
    if (!sports || sports.length === 0) {
      return {};
    }

    const imageMap = {};
    for (const sport of sports) {
      imageMap[sport] = await this.getImageForSport(sport);
    }
    
    return imageMap;
  }

  /**
   * Infer sport from article metadata
   * @param {Object} metadata - Article metadata
   * @returns {string} Inferred sport name
   */
  inferSportFromMetadata(metadata) {
    if (!metadata) {
      return 'sports';
    }

    // Check if sport is explicitly mentioned in metadata
    if (metadata.sport) {
      return metadata.sport;
    }

    // Try to infer from leagues
    if (metadata.leagues && metadata.leagues.length > 0) {
      const league = metadata.leagues[0].toLowerCase();
      
      // GAA-related
      if (league.includes('gaa') || league.includes('gaelic') || league.includes('all-ireland')) {
        if (league.includes('hurling')) return 'hurling';
        if (league.includes('football')) return 'gaelic football';
        return 'GAA';
      }
      
      // Soccer
      if (league.includes('soccer') || league.includes('premier') || league.includes('champions')) {
        return 'soccer';
      }
      
      // Rugby
      if (league.includes('rugby')) {
        return 'rugby';
      }
      
      // Basketball
      if (league.includes('basketball') || league.includes('nba')) {
        return 'basketball';
      }
      
      // Tennis
      if (league.includes('tennis') || league.includes('atp') || league.includes('wta')) {
        return 'tennis';
      }
      
      // Cricket
      if (league.includes('cricket')) {
        return 'cricket';
      }
      
      // Korfball
      if (league.includes('korfball')) {
        return 'korfball';
      }
    }

    // Try to infer from club names
    if (metadata.clubs && metadata.clubs.length > 0) {
      const firstClubName = metadata.clubs[0].name.toLowerCase();
      
      if (firstClubName.includes('gaa')) return 'GAA';
      if (firstClubName.includes('fc') || firstClubName.includes('united') || firstClubName.includes('rovers')) {
        return 'soccer';
      }
      if (firstClubName.includes('rugby')) return 'rugby';
      if (firstClubName.includes('korfball')) return 'korfball';
    }

    // Default to generic sports
    return 'sports';
  }

  /**
   * Get default sports image
   * @returns {string} Default image URL
   */
  getDefaultImage() {
    return 'https://source.unsplash.com/800x600/?sports,stadium';
  }

  /**
   * Clear the image cache
   */
  clearCache() {
    this.imageCache.clear();
  }
}

export default ImageService;
