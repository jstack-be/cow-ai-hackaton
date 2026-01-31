# Sports Club Profile Feature

This document explains how to use the new club profile feature that was added to the Sports Article Graph Analyzer.

## Overview

The club profile feature allows you to:
- Create profiles for local sports clubs
- Store club information (name, county, league, website, social media links)
- Automatically link articles to club profiles when clubs are mentioned
- View the 5 most recent articles about any club

## API Endpoints

### Create a Club Profile

**POST** `/api/clubs`

Create a new sports club profile.

**Request Body:**
```json
{
  "name": "Dublin GAA",
  "county": "Dublin",
  "league": "All-Ireland Senior Championship",
  "description": "Dublin's senior Gaelic football team",
  "website": "https://www.dublingaa.ie",
  "socials": {
    "twitter": "@DubGAAOfficial",
    "facebook": "DublinGAA",
    "instagram": "@dublangaa"
  }
}
```

**Response:**
```json
{
  "success": true,
  "club": {
    "id": "uuid-here",
    "name": "Dublin GAA",
    "county": "Dublin",
    "league": "All-Ireland Senior Championship",
    "description": "Dublin's senior Gaelic football team",
    "website": "https://www.dublingaa.ie",
    "socials": {
      "twitter": "@DubGAAOfficial",
      "facebook": "DublinGAA",
      "instagram": "@dublangaa"
    },
    "articleReferences": [],
    "createdAt": "2026-01-31T...",
    "updatedAt": "2026-01-31T..."
  }
}
```

### Get All Clubs

**GET** `/api/clubs`

Get all club profiles or search clubs by criteria.

**Query Parameters:**
- `name` (optional): Search by club name (partial match)
- `county` (optional): Filter by county (exact match)
- `league` (optional): Filter by league (exact match)

**Example:**
```
GET /api/clubs?county=Dublin
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "clubs": [...]
}
```

### Get Club Profile with Recent Articles

**GET** `/api/clubs/:id`

Get a specific club's profile with optional recent articles.

**Query Parameters:**
- `includeArticles=true` (optional): Include the 5 most recent articles about the club

**Example:**
```
GET /api/clubs/123e4567-e89b-12d3-a456-426614174000?includeArticles=true
```

**Response:**
```json
{
  "success": true,
  "club": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Dublin GAA",
    "county": "Dublin",
    "league": "All-Ireland Senior Championship",
    "website": "https://www.dublingaa.ie",
    "socials": {...},
    "articleReferences": [
      {
        "articleId": "article-uuid-1",
        "date": "2026-01-31T..."
      }
    ]
  },
  "recentArticles": [
    {
      "id": "article-uuid-1",
      "title": "Dublin defeats Kerry in Championship final",
      "content": "...",
      "metadata": {...}
    }
  ]
}
```

### Get Club Articles

**GET** `/api/clubs/:id/articles`

Get all articles mentioning a specific club.

**Query Parameters:**
- `limit` (optional): Maximum number of articles to return (default: 5)

**Example:**
```
GET /api/clubs/123e4567-e89b-12d3-a456-426614174000/articles?limit=10
```

**Response:**
```json
{
  "success": true,
  "club": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Dublin GAA",
    "county": "Dublin",
    "league": "All-Ireland Senior Championship"
  },
  "count": 3,
  "articles": [...]
}
```

### Update Club Profile

**PUT** `/api/clubs/:id`

Update a club's profile information.

**Request Body** (all fields optional):
```json
{
  "description": "Updated description",
  "website": "https://new-website.com",
  "socials": {
    "twitter": "@NewHandle",
    "instagram": "@newhandle"
  }
}
```

**Response:**
```json
{
  "success": true,
  "club": {
    "id": "...",
    "name": "Dublin GAA",
    ...
  }
}
```

### Delete Club Profile

**DELETE** `/api/clubs/:id`

Delete a club profile.

**Response:**
```json
{
  "success": true,
  "message": "Club deleted successfully",
  "deletedClub": {...}
}
```

### Get Clubs by County

**GET** `/api/clubs/by-county/:county`

Get all clubs in a specific county.

**Example:**
```
GET /api/clubs/by-county/Dublin
```

### Get Clubs by League

**GET** `/api/clubs/by-league/:league`

Get all clubs in a specific league.

**Example:**
```
GET /api/clubs/by-league/All-Ireland%20Senior%20Championship
```

## Automatic Article Linking

When you analyze an article using the existing article endpoints (`POST /api/articles/analyze` or `POST /api/articles/analyze-batch`), the system will automatically:

1. Extract club names from the article using ChatGPT
2. Check if any of those clubs have existing profiles in the club store
3. Automatically link the article to those club profiles
4. Add the article reference to the club's `articleReferences` array

This means you don't need to manually link articles to clubs - it happens automatically when articles are analyzed!

## Data Model

### Club Profile Structure

```javascript
{
  id: string,              // UUID
  name: string,            // Required: Full club name
  county: string,          // Required: County name
  league: string | null,   // Optional: League name
  description: string | null,  // Optional: Club description
  website: string | null,  // Optional: Club website URL
  socials: {               // Optional: Social media handles
    twitter?: string,
    facebook?: string,
    instagram?: string,
    // ... any other social platforms
  },
  articleReferences: [     // Auto-populated by system
    {
      articleId: string,   // Article UUID
      date: Date          // Article date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### Article References

The `articleReferences` array is automatically managed by the system and stores references to articles that mention this club. The array is sorted by date (most recent first) to make it easy to get the latest articles about a club.

## Usage Examples

### Example 1: Create a Club and Analyze Related Articles

```bash
# 1. Create a club profile
curl -X POST http://localhost:3000/api/clubs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Shamrock Rovers",
    "county": "Dublin",
    "league": "League of Ireland Premier Division",
    "website": "https://www.shamrockrovers.ie",
    "socials": {
      "twitter": "@ShamrockRovers"
    }
  }'

# 2. Analyze an article that mentions Shamrock Rovers
# The article will automatically be linked to the club profile
curl -X POST http://localhost:3000/api/articles/analyze \
  -F "file=@article-about-rovers.txt" \
  -F "title=Rovers Win League Title"

# 3. Get the club profile with recent articles
curl "http://localhost:3000/api/clubs/{club-id}?includeArticles=true"
```

### Example 2: Search for Clubs

```bash
# Get all clubs in Dublin
curl "http://localhost:3000/api/clubs?county=Dublin"

# Search for clubs by name
curl "http://localhost:3000/api/clubs?name=Shamrock"

# Get clubs in a specific league
curl "http://localhost:3000/api/clubs?league=League%20of%20Ireland%20Premier%20Division"
```

### Example 3: Update Social Media Links

```bash
curl -X PUT http://localhost:3000/api/clubs/{club-id} \
  -H "Content-Type: application/json" \
  -d '{
    "socials": {
      "twitter": "@NewHandle",
      "instagram": "@newinstagram",
      "tiktok": "@newtiktok"
    }
  }'
```

## Implementation Details

The club profile feature integrates seamlessly with the existing article analysis workflow:

1. **ClubStore Service**: Manages in-memory storage of club profiles
2. **GraphService Integration**: Automatically links articles to clubs when clubs are mentioned
3. **Article Analysis**: When an article is analyzed, the system checks for matching club names and creates references
4. **API Routes**: RESTful endpoints for CRUD operations on club profiles

## Benefits

- **Organized Content**: Keep track of which clubs are featured in your articles
- **Easy Navigation**: Quickly find all articles about a specific club
- **Automatic Linking**: No manual work needed - articles are linked to clubs automatically
- **Rich Profiles**: Store additional information like websites and social media handles
- **Search & Filter**: Find clubs by county, league, or name
