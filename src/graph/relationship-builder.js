import { areCountiesClose } from '../utils/county-data.js';

/**
 * Find all relationships between two articles
 * @param {Object} article1 - First article with metadata
 * @param {Object} article2 - Second article with metadata
 * @returns {Array} Array of relationship objects
 */
export function findRelationships(article1, article2) {
  const relationships = [];

  // Check for same club relationships
  const sameClub = findSameClubRelationship(article1, article2);
  if (sameClub) relationships.push(sameClub);

  // Check for proximity relationships
  const proximity = findProximityRelationship(article1, article2);
  if (proximity) relationships.push(proximity);

  // Check for match played relationships
  const matchPlayed = findMatchPlayedRelationship(article1, article2);
  if (matchPlayed) relationships.push(matchPlayed);

  // Check for same league relationships
  const sameLeague = findSameLeagueRelationship(article1, article2);
  if (sameLeague) relationships.push(sameLeague);

  return relationships;
}

/**
 * Find if articles mention the same club
 * @param {Object} article1
 * @param {Object} article2
 * @returns {Object|null} Relationship object or null
 */
export function findSameClubRelationship(article1, article2) {
  if (!article1.metadata?.clubs || !article2.metadata?.clubs) {
    return null;
  }

  const clubs1 = article1.metadata.clubs.map(c => c.name.toLowerCase().trim());
  const clubs2 = article2.metadata.clubs.map(c => c.name.toLowerCase().trim());

  const sharedClubs = clubs1.filter(c => clubs2.includes(c));

  if (sharedClubs.length > 0) {
    return {
      type: 'SAME_CLUB',
      weight: 1.0,
      sharedElements: sharedClubs.map(club => {
        // Find the original cased name
        const original1 = article1.metadata.clubs.find(c => c.name.toLowerCase().trim() === club);
        return original1?.name || club;
      })
    };
  }

  return null;
}

/**
 * Find if articles are from proximate counties
 * @param {Object} article1
 * @param {Object} article2
 * @returns {Object|null} Relationship object or null
 */
export function findProximityRelationship(article1, article2) {
  if (!article1.metadata?.primaryCounty || !article2.metadata?.primaryCounty) {
    return null;
  }

  const county1 = article1.metadata.primaryCounty;
  const county2 = article2.metadata.primaryCounty;

  const { close, weight } = areCountiesClose(county1, county2);

  if (close && county1 !== county2) {
    // Only create proximity relationship if counties are different
    // (same county would be detected by SAME_CLUB or other means)
    return {
      type: 'PROXIMITY',
      weight,
      sharedElements: [`${county1}`, `${county2}`]
    };
  }

  return null;
}

/**
 * Find if clubs from the articles have played against each other
 * @param {Object} article1
 * @param {Object} article2
 * @returns {Object|null} Relationship object or null
 */
export function findMatchPlayedRelationship(article1, article2) {
  if (!article1.metadata?.matches || !article2.metadata?.matches) {
    return null;
  }

  const matches1 = article1.metadata.matches;
  const matches2 = article2.metadata.matches;

  const sharedMatches = [];

  for (const match1 of matches1) {
    const teams1 = new Set([
      match1.homeTeam?.toLowerCase().trim(),
      match1.awayTeam?.toLowerCase().trim()
    ].filter(Boolean));

    for (const match2 of matches2) {
      const teams2 = new Set([
        match2.homeTeam?.toLowerCase().trim(),
        match2.awayTeam?.toLowerCase().trim()
      ].filter(Boolean));

      // Check if there's any overlap in teams (same match or teams playing each other)
      const intersection = new Set([...teams1].filter(x => teams2.has(x)));

      if (intersection.size > 0 || setsOverlap(teams1, teams2)) {
        sharedMatches.push({
          teams: Array.from(teams1).concat(Array.from(teams2.values())).filter((v, i, a) => a.indexOf(v) === i)
        });
      }
    }
  }

  if (sharedMatches.length > 0) {
    return {
      type: 'MATCH_PLAYED',
      weight: 0.9,
      sharedElements: sharedMatches
        .map(m => m.teams.join(' vs '))
        .filter((v, i, a) => a.indexOf(v) === i)
    };
  }

  return null;
}

/**
 * Find if articles mention the same league
 * @param {Object} article1
 * @param {Object} article2
 * @returns {Object|null} Relationship object or null
 */
export function findSameLeagueRelationship(article1, article2) {
  if (!article1.metadata?.leagues || !article2.metadata?.leagues) {
    return null;
  }

  const leagues1 = article1.metadata.leagues.map(l => l.toLowerCase().trim());
  const leagues2 = article2.metadata.leagues.map(l => l.toLowerCase().trim());

  const sharedLeagues = leagues1.filter(l => leagues2.includes(l));

  if (sharedLeagues.length > 0) {
    return {
      type: 'SAME_LEAGUE',
      weight: 0.5,
      sharedElements: sharedLeagues.map(league => {
        // Find the original cased name
        const original1 = article1.metadata.leagues.find(l => l.toLowerCase().trim() === league);
        return original1 || league;
      })
    };
  }

  return null;
}

/**
 * Helper function to check if two sets have any overlap
 * @param {Set} set1
 * @param {Set} set2
 * @returns {boolean}
 */
function setsOverlap(set1, set2) {
  for (const item of set1) {
    if (set2.has(item)) {
      return true;
    }
  }
  return false;
}

/**
 * Calculate combined edge weight from multiple relationships
 * @param {Array} relationships - Array of relationship objects
 * @returns {number} Combined weight (0-1)
 */
export function calculateEdgeWeight(relationships) {
  if (!relationships || relationships.length === 0) {
    return 0;
  }

  // Use the maximum weight among all relationships
  // This ensures strong connections have high weight
  return Math.max(...relationships.map(r => r.weight));
}

export default {
  findRelationships,
  findSameClubRelationship,
  findProximityRelationship,
  findMatchPlayedRelationship,
  findSameLeagueRelationship,
  calculateEdgeWeight
};
