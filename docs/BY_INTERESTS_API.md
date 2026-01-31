# Articles by Interests API

## Overview

The `/api/articles/by-interests` endpoint allows you to retrieve articles filtered by specific interests. Each interest can be weighted (though weights are not currently used in filtering, they're accepted for future enhancements).

## Endpoint

**POST** `/api/articles/by-interests`

## Request Format

### Headers
```
Content-Type: application/json
```

### Body Structure

```json
{
  "interests": [
    {
      "type": "sport|club|county|league",
      "value": "string",
      "weight": number (optional)
    }
  ]
}
```

### Interest Types

| Type | Description | Example Values |
|------|-------------|----------------|
| `sport` | The sport being discussed | "GAA", "soccer", "rugby", "korfball", "hurling" |
| `club` | A sports club name | "Dublin GAA", "Shamrock Rovers", "Cork Rugby Club" |
| `county` | An Irish county | "Dublin", "Cork", "Kerry", "Galway" |
| `league` | A league or competition | "All-Ireland Senior Championship", "League of Ireland Premier Division" |

## Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "articles": [
    {
      "id": "article-uuid",
      "title": "Article Title",
      "metadata": {
        "sport": "GAA",
        "clubs": [
          {
            "name": "Dublin GAA",
            "county": "Dublin",
            "league": "All-Ireland Senior Championship"
          }
        ],
        "matches": [...],
        "primaryCounty": "Dublin",
        "leagues": ["All-Ireland Senior Championship"]
      },
      "imageUrl": "https://example.com/image.jpg",
      "sport": "GAA"
    }
  ],
  "total": 5,
  "interests": [
    {
      "type": "sport",
      "value": "GAA",
      "weight": 1.0
    }
  ]
}
```

### Error Responses

#### 400 Bad Request - Missing or Invalid Interests
```json
{
  "success": false,
  "error": "interests must be a non-empty array"
}
```

#### 400 Bad Request - Invalid Interest Structure
```json
{
  "success": false,
  "error": "Each interest must have a type and value"
}
```

#### 400 Bad Request - Invalid Interest Type
```json
{
  "success": false,
  "error": "Interest type must be one of: sport, club, county, league"
}
```

## Examples

### Example 1: Filter by Sport Only

Get all GAA articles:

```bash
curl -X POST http://localhost:3000/api/articles/by-interests \
  -H "Content-Type: application/json" \
  -d '{
    "interests": [
      {
        "type": "sport",
        "value": "GAA",
        "weight": 1.0
      }
    ]
  }'
```

### Example 2: Multiple Interests (OR logic)

Get articles about GAA OR Dublin county:

```bash
curl -X POST http://localhost:3000/api/articles/by-interests \
  -H "Content-Type: application/json" \
  -d '{
    "interests": [
      {
        "type": "sport",
        "value": "GAA",
        "weight": 1.0
      },
      {
        "type": "county",
        "value": "Dublin",
        "weight": 0.8
      }
    ]
  }'
```

### Example 3: Specific Club

Get articles mentioning Shamrock Rovers:

```bash
curl -X POST http://localhost:3000/api/articles/by-interests \
  -H "Content-Type: application/json" \
  -d '{
    "interests": [
      {
        "type": "club",
        "value": "Shamrock Rovers",
        "weight": 1.0
      }
    ]
  }'
```

### Example 4: Multiple Sports

Get articles about soccer or rugby:

```bash
curl -X POST http://localhost:3000/api/articles/by-interests \
  -H "Content-Type: application/json" \
  -d '{
    "interests": [
      {
        "type": "sport",
        "value": "soccer",
        "weight": 1.0
      },
      {
        "type": "sport",
        "value": "rugby",
        "weight": 1.0
      }
    ]
  }'
```

### Example 5: League-Based Filtering

Get articles about the All-Ireland Senior Championship:

```bash
curl -X POST http://localhost:3000/api/articles/by-interests \
  -H "Content-Type: application/json" \
  -d '{
    "interests": [
      {
        "type": "league",
        "value": "All-Ireland Senior Championship",
        "weight": 1.0
      }
    ]
  }'
```

### Example 6: PowerShell Example

```powershell
$body = @{
    interests = @(
        @{ type = "sport"; value = "GAA"; weight = 1.0 },
        @{ type = "county"; value = "Dublin"; weight = 0.8 }
    )
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:3000/api/articles/by-interests" `
  -Method Post `
  -Body $body `
  -ContentType "application/json"
```

### Example 7: JavaScript/Node.js Example

```javascript
const axios = require('axios');

async function getArticlesByInterests() {
  try {
    const response = await axios.post('http://localhost:3000/api/articles/by-interests', {
      interests: [
        { type: 'sport', value: 'GAA', weight: 1.0 },
        { type: 'county', value: 'Dublin', weight: 0.8 }
      ]
    });
    
    console.log(`Found ${response.data.total} articles`);
    console.log(response.data.articles);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

getArticlesByInterests();
```

## Filtering Logic

The endpoint uses **OR logic** for matching:
- An article is included if it matches **any** of the provided interests
- Matching is case-insensitive
- For clubs and leagues, partial matching is used (e.g., "Rovers" will match "Shamrock Rovers")
- For sports and counties, exact matching is used (after trimming and lowercasing)

### Matching Rules by Type

| Type | Matching Logic | Example |
|------|----------------|---------|
| sport | Exact match (case-insensitive) | "gaa" matches "GAA" |
| club | Partial match (case-insensitive) | "rovers" matches "Shamrock Rovers" |
| county | Exact match (case-insensitive) | "dublin" matches "Dublin" |
| league | Partial match (case-insensitive) | "premier" matches "League of Ireland Premier Division" |

## Notes

- The `weight` parameter is currently accepted but not used in filtering
- Future enhancements will use weights to:
  - Prioritize certain interests in results ordering
  - Calculate relevance scores
  - Support weighted graph traversal
- Articles are deduplicated (if an article matches multiple interests, it appears only once)
- All returned articles include images based on their sport type

## Related Endpoints

- **GET** `/api/articles` - Get all articles without filtering
- **GET** `/api/articles/:id` - Get a specific article by ID
- **POST** `/api/articles/query` - Query articles with natural language
- **GET** `/api/graph/search` - Search articles using the graph
