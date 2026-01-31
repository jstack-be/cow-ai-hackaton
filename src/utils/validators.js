import { z } from 'zod';

// Schema for a sport club
const ClubSchema = z.object({
  name: z.string().min(1, 'Club name is required').describe('Full name of the club'),
  county: z.string().nullable().transform(val => val || 'Unknown').describe('County where the club is located'),
  league: z.string().nullable().optional().describe('League the club plays in')
});

// Schema for a match
const MatchSchema = z.object({
  homeTeam: z.string().min(1, 'Home team is required'),
  awayTeam: z.string().min(1, 'Away team is required'),
  result: z.string().optional().describe('Match result (e.g., "2-15 to 1-12")')
});

// Schema for article metadata
const ArticleMetadataSchema = z.object({
  clubs: z.array(ClubSchema).min(1, 'At least one club must be mentioned'),
  matches: z.array(MatchSchema).default([]),
  primaryCounty: z.string().nullable().transform(val => val || 'Unknown').describe('Primary county'),
  leagues: z.array(z.string()).default([])
});

// Schema for full article
const ArticleSchema = z.object({
  id: z.string().uuid().describe('Unique article identifier'),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  metadata: ArticleMetadataSchema,
  url: z.string().url().optional(),
  publishedDate: z.date().optional(),
  analyzedAt: z.date().optional()
});

// Function to validate extracted metadata
export function validateMetadata(data) {
  try {
    const validated = ArticleMetadataSchema.parse(data);
    return {
      success: true,
      data: validated
    };
  } catch (error) {
    return {
      success: false,
      error: error.errors || error.message
    };
  }
}

// Function to validate full article
export function validateArticle(data) {
  try {
    const validated = ArticleSchema.parse(data);
    return {
      success: true,
      data: validated
    };
  } catch (error) {
    return {
      success: false,
      error: error.errors || error.message
    };
  }
}

// Function to normalize metadata (trim, capitalize county names, etc)
export function normalizeMetadata(metadata) {
  return {
    clubs: metadata.clubs.map(club => ({
      name: club.name.trim(),
      county: capitalizeCounty(club.county.trim()),
      league: club.league ? club.league.trim() : undefined
    })),
    matches: metadata.matches.map(match => ({
      homeTeam: match.homeTeam.trim(),
      awayTeam: match.awayTeam.trim(),
      result: match.result ? match.result.trim() : undefined
    })),
    primaryCounty: capitalizeCounty(metadata.primaryCounty.trim()),
    leagues: metadata.leagues.map(l => l.trim())
  };
}

// Helper to capitalize county names properly
function capitalizeCounty(county) {
  // List of Irish counties with proper capitalization
  const counties = {
    'dublin': 'Dublin',
    'cork': 'Cork',
    'kerry': 'Kerry',
    'galway': 'Galway',
    'mayo': 'Mayo',
    'meath': 'Meath',
    'wicklow': 'Wicklow',
    'kildare': 'Kildare',
    'wexford': 'Wexford',
    'waterford': 'Waterford',
    'tipperary': 'Tipperary',
    'limerick': 'Limerick',
    'clare': 'Clare',
    'roscommon': 'Roscommon',
    'offaly': 'Offaly',
    'laois': 'Laois',
    'carlow': 'Carlow',
    'kilkenny': 'Kilkenny',
    'longford': 'Longford',
    'westmeath': 'Westmeath',
    'leitrim': 'Leitrim',
    'sligo': 'Sligo',
    'donegal': 'Donegal',
    'derry': 'Derry',
    'tyrone': 'Tyrone',
    'armagh': 'Armagh',
    'down': 'Down',
    'antrim': 'Antrim',
    'fermanagh': 'Fermanagh',
    'monaghan': 'Monaghan',
    'cavan': 'Cavan'
  };

  const normalized = county.toLowerCase();
  return counties[normalized] || county;
}

export { ArticleSchema, ArticleMetadataSchema, ClubSchema, MatchSchema };
