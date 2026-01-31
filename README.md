# Sports Article Graph Analyzer

A Node.js REST API application that analyzes sports articles using OpenAI's ChatGPT API and builds a graph-based knowledge structure to determine article relevance based on graph distance.

## Features

- **AI-Powered Article Analysis**: Uses ChatGPT to extract structured metadata from sports articles
- **Structured Data Extraction**: Automatically identifies:
  - Sport clubs mentioned
  - Matches and their results
  - County/area information
  - Leagues and competitions
- **AI Podcast Generation**: Generate engaging 3-minute podcast scripts:
  - Create podcasts from all articles or filtered by interests
  - Conversational single-person host style
  - Natural language delivery ready for text-to-speech
  - Filter by sport, club, county, or league
- **Club Profile Pages**: Create and manage profiles for local sports clubs:
  - Store club information (name, county, league)
  - Add website and social media links
  - Automatically link articles to clubs when mentioned
  - View 5 most recent articles about each club
- **Graph-Based Relationships**: Builds a network of articles based on:
  - Same clubs mentioned
  - Geographic proximity (neighboring counties)
  - Clubs that have played each other
  - Same league competitions
- **Distance-Based Relevance**: Calculates relevance between articles using graph distance:
  - Direct distance (weighted by relationship strength)
  - Shortest path discovery
  - Relevance scoring
- **REST API**: Full-featured API for article analysis, club management, graph querying, and podcast generation

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **OpenAI API Key** (get one from [platform.openai.com](https://platform.openai.com))

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cow-ai-hackaton-datamodel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-...your-key-here...
   PORT=3000
   ```

## Starting the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start on `http://localhost:3000`

## Web Dashboard

Once the server is running, open your browser to **http://localhost:3000** to access the interactive dashboard.

### Dashboard Features

- **📤 Upload Articles**: Drag and drop or select `.txt` files to analyze
- **📊 System Overview**: View statistics (total articles, connections, counties, leagues)
- **📰 Articles List**: Browse all analyzed articles with their metadata
- **🔍 Graph Tools**:
  - **Distance**: Calculate shortest path between two articles
  - **Related**: Find articles related to a selected article within N hops
  - **Search**: Search articles by club, county, or league
- **⚙️ System Stats**: View detailed graph statistics including most connected articles

The dashboard provides a real-time view of your article graph and makes it easy to test all API functionality without needing curl or Postman.

## API Documentation

### Base URL
```
http://localhost:3000
```

### Health Check
```
GET /health
```

### Article Analysis

#### Analyze Single Article
```
POST /api/articles/analyze
Content-Type: multipart/form-data

Parameters:
  - file: Article text file (.txt)
  - title: Optional article title (defaults to filename)

Example:
curl -X POST http://localhost:3000/api/articles/analyze \
  -F "file=@article.txt" \
  -F "title=Dublin vs Kerry Championship"

Response:
{
  "success": true,
  "article": {
    "id": "uuid",
    "title": "Dublin vs Kerry Championship",
    "metadata": {
      "clubs": [
        { "name": "Dublin GAA", "county": "Dublin", "league": "All-Ireland Senior Championship" },
        { "name": "Kerry GAA", "county": "Kerry", "league": "All-Ireland Senior Championship" }
      ],
      "matches": [
        { "homeTeam": "Dublin GAA", "awayTeam": "Kerry GAA", "result": "2-15 to 1-12" }
      ],
      "primaryCounty": "Dublin",
      "leagues": ["All-Ireland Senior Championship"]
    },
    "relatedArticles": [
      { "id": "uuid", "title": "Kerry Training Session", "distance": 1, "relationships": ["SAME_CLUB: Kerry"] }
    ]
  }
}
```

#### Analyze Multiple Articles (Batch)
```
POST /api/articles/analyze-batch
Content-Type: multipart/form-data

Parameters:
  - files: Multiple article files (.txt)

Example:
curl -X POST http://localhost:3000/api/articles/analyze-batch \
  -F "files=@article1.txt" \
  -F "files=@article2.txt" \
  -F "files=@article3.txt"

Response:
{
  "success": true,
  "analyzed": 3,
  "failed": 0,
  "articles": [...]
}
```

#### Get Article Details
```
GET /api/articles/:id

Example:
curl http://localhost:3000/api/articles/550e8400-e29b-41d4-a716-446655440000

Response:
{
  "success": true,
  "article": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Dublin vs Kerry Championship",
    "metadata": {...},
    "connections": [
      {
        "targetId": "uuid",
        "targetTitle": "Kerry Training Session",
        "relationships": ["SAME_CLUB"],
        "weight": 1.0
      }
    ]
  }
}
```

#### Get All Articles
```
GET /api/articles

Example:
curl http://localhost:3000/api/articles

Response:
{
  "success": true,
  "articles": [...],
  "total": 5
}
```

#### Get Articles by Interests
```
POST /api/articles/by-interests
Content-Type: application/json

Body:
{
  "interests": [
    { "type": "sport|club|county|league", "value": "string", "weight": number }
  ]
}

Example:
curl -X POST http://localhost:3000/api/articles/by-interests \
  -H "Content-Type: application/json" \
  -d '{
    "interests": [
      { "type": "sport", "value": "GAA", "weight": 1.0 },
      { "type": "county", "value": "Dublin", "weight": 0.8 }
    ]
  }'

Response:
{
  "success": true,
  "articles": [...],
  "total": 3,
  "interests": [...]
}
```

See [docs/BY_INTERESTS_API.md](docs/BY_INTERESTS_API.md) for detailed documentation and more examples.

### Podcast Generation

#### Generate Podcast from All Articles
```
POST /api/podcast/generate
Content-Type: application/json

Body:
{
  "limit": 10  // Optional: max articles to use (default: 10)
}

Example:
curl -X POST http://localhost:3000/api/podcast/generate \
  -H "Content-Type: application/json" \
  -d '{"limit": 5}'

Response:
{
  "success": true,
  "podcast": {
    "title": "This Week in Irish Sports",
    "script": "Hey everyone! Welcome back...",
    "summary": "A roundup of recent GAA matches",
    "topics": ["Gaelic Football", "Hurling"],
    "duration": "3:15",
    "wordCount": 487,
    "articlesUsed": 5,
    "generatedAt": "2026-01-31T12:00:00Z"
  }
}
```

#### Generate Podcast by Interests
```
POST /api/podcast/by-interests
Content-Type: application/json

Body:
{
  "interests": [
    { "type": "sport|club|county|league", "value": "string", "weight": number }
  ],
  "limit": 10  // Optional: max articles to use (default: 10)
}

Example:
curl -X POST http://localhost:3000/api/podcast/by-interests \
  -H "Content-Type: application/json" \
  -d '{
    "interests": [
      { "type": "sport", "value": "Hurling", "weight": 1.0 },
      { "type": "county", "value": "Cork", "weight": 0.8 }
    ],
    "limit": 5
  }'

Response:
{
  "success": true,
  "podcast": {
    "title": "Cork Hurling Special",
    "script": "Welcome to today's special episode...",
    "summary": "Cork hurling highlights and analysis",
    "topics": ["Hurling", "Cork GAA"],
    "duration": "3:10",
    "wordCount": 475,
    "articlesUsed": 4,
    "generatedAt": "2026-01-31T12:00:00Z"
  },
  "interests": [...]
}
```

**Podcast Features:**
- 🎙️ Single-person podcast format (~3 minutes)
- 🎯 Conversational and engaging style
- 📝 AI-generated using GPT-4
- 🔊 Ready for text-to-speech conversion

See [docs/PODCAST_API.md](docs/PODCAST_API.md) for full documentation and [docs/PODCAST_QUICK_REF.md](docs/PODCAST_QUICK_REF.md) for quick reference.

### Graph Operations

#### Calculate Distance Between Articles
```
GET /api/graph/distance?from=id1&to=id2&weighted=true

Parameters:
  - from: Source article ID
  - to: Target article ID
  - weighted: Use weighted distance (true/false, default: true)

Example:
curl "http://localhost:3000/api/graph/distance?from=id1&to=id2&weighted=true"

Response:
{
  "success": true,
  "distance": 2,
  "relevanceScore": 0.333,
  "path": [
    {
      "id": "id1",
      "title": "Article 1"
    },
    {
      "id": "id-middle",
      "title": "Middle Article",
      "relationships": ["SAME_CLUB: Dublin"]
    },
    {
      "id": "id2",
      "title": "Article 2",
      "relationships": ["PROXIMITY: Dublin-Meath"]
    }
  ]
}
```

#### Find Related Articles
```
GET /api/graph/related/:id?maxDistance=2&limit=10

Parameters:
  - id: Source article ID
  - maxDistance: Maximum distance to search (default: 2)
  - limit: Maximum results per distance level (default: 10)

Example:
curl "http://localhost:3000/api/graph/related/article-123?maxDistance=2"

Response:
{
  "success": true,
  "sourceArticle": {
    "id": "article-123",
    "title": "Dublin vs Kerry"
  },
  "relatedArticles": {
    "1": [
      {
        "id": "article-456",
        "title": "Kerry Training Session",
        "distance": 1,
        "relationships": ["SAME_CLUB: Kerry"],
        "relevanceScore": 0.5
      }
    ],
    "2": [
      {
        "id": "article-789",
        "title": "Meath vs Kildare",
        "distance": 2,
        "relationships": ["PROXIMITY"],
        "relevanceScore": 0.333
      }
    ]
  }
}
```

#### Get Graph Statistics
```
GET /api/graph/stats

Example:
curl http://localhost:3000/api/graph/stats

Response:
{
  "success": true,
  "stats": {
    "totalArticles": 5,
    "totalConnections": 8,
    "avgConnectionsPerArticle": 1.6,
    "mostConnectedArticle": {
      "id": "uuid",
      "title": "Dublin vs Kerry",
      "connections": 4
    },
    "counties": ["Dublin", "Kerry", "Meath", "Kildare"],
    "leagues": ["All-Ireland Senior Championship", "League of Ireland"]
  }
}
```

#### Export Graph Data
```
GET /api/graph/export?format=json

Parameters:
  - format: Export format (only 'json' supported)

Example:
curl http://localhost:3000/api/graph/export

Response:
{
  "success": true,
  "nodes": [
    {
      "id": "uuid",
      "title": "Article 1",
      "metadata": {...}
    }
  ],
  "edges": [
    {
      "source": "uuid1",
      "target": "uuid2",
      "relationships": ["SAME_CLUB"],
      "weight": 1.0
    }
  ]
}
```

#### Search Articles
```
GET /api/graph/search?club=name | county=name | league=name

Parameters:
  - club: Search by club name
  - county: Search by county
  - league: Search by league

Examples:
curl "http://localhost:3000/api/graph/search?club=Dublin%20GAA"
curl "http://localhost:3000/api/graph/search?county=Dublin"
curl "http://localhost:3000/api/graph/search?league=All-Ireland%20Senior%20Championship"

Response:
{
  "success": true,
  "results": [
    {
      "id": "uuid",
      "title": "Article Title",
      "metadata": {...}
    }
  ],
  "total": 2
}
```

## Testing with Sample Articles

Sample articles are included in `data/sample-articles/`:
- `article1.txt` - Dublin vs Kerry championship match
- `article2.txt` - Kerry training facility news
- `article3.txt` - Shamrock Rovers vs Bohemians Dublin derby
- `article4.txt` - Cork rugby signing from Limerick
- `article5.txt` - Meath vs Kildare championship match

### Quick Start - Using the Web Dashboard

1. **Start the server**
   ```bash
   npm run dev
   ```

2. **Open the dashboard**
   - Open http://localhost:3000 in your browser
   - You'll see the interactive dashboard

3. **Upload sample articles**
   - Use the "Upload Article" section on the left
   - Select each sample article from `data/sample-articles/`
   - Watch as the graph builds in real-time

4. **Explore relationships**
   - Click on an article card to select it
   - Use the "Related" tab to find articles connected to it
   - Use the "Distance" tab to calculate paths between articles
   - Use the "Search" tab to find articles by club, county, or league

### Test Workflow - Using curl (CLI)

1. **Start the server**
   ```bash
   npm run dev
   ```

2. **Analyze sample articles**
   ```bash
   curl -X POST http://localhost:3000/api/articles/analyze \
     -F "file=@data/sample-articles/article1.txt" \
     -F "title=Dublin vs Kerry Championship"
   ```

   Note the returned article ID.

3. **Analyze more articles** to build relationships:
   ```bash
   curl -X POST http://localhost:3000/api/articles/analyze \
     -F "file=@data/sample-articles/article2.txt"
   ```

4. **Check graph statistics**
   ```bash
   curl http://localhost:3000/api/graph/stats
   ```

5. **Find related articles** (replace with actual IDs from step 2 and 3)
   ```bash
   curl "http://localhost:3000/api/graph/related/{article1-id}?maxDistance=2"
   ```

6. **Calculate distance** between articles
   ```bash
   curl "http://localhost:3000/api/graph/distance?from={id1}&to={id2}"
   ```

## Understanding Article Relationships

Articles are connected in the graph through multiple relationship types:

### 1. Same Club (Weight: 1.0)
Connected if articles mention the same club. Strongest connection.
```
Article A: "Dublin GAA defeats Kerry"
Article B: "Dublin GAA announces new facility"
→ Distance: 1 (directly connected via same club)
```

### 2. Match Played (Weight: 0.9)
Connected if clubs from articles have played each other.
```
Article A: "Dublin beats Kerry 2-15 to 1-12"
Article B: "Kerry vs Dublin training updates"
→ Distance: 1 (same teams played)
```

### 3. Proximity (Weight: 0.6)
Connected if clubs are from neighboring counties.
```
Article A: "Dublin vs Kerry" (Dublin county)
Article B: "Meath prepares for championship" (neighboring Dublin)
→ Distance: 2 (via proximity relationship)
```

### 4. Same League (Weight: 0.5)
Connected if articles mention clubs in the same league.
```
Article A: "Dublin in All-Ireland Championship"
Article B: "Kerry in All-Ireland Championship"
→ Additional connection strength
```

## Relevance Scoring

Relevance is calculated as an inverse function of distance:
- Distance 0 → Score 1.0 (identical article)
- Distance 1 → Score 0.5 (directly related)
- Distance 2 → Score 0.25 (2 degrees of separation)
- Distance 3+ → Score ≈ 0.1 (distant relationship)

## Architecture

```
┌─────────────────────────────────────────┐
│         Express.js REST API             │
│  (Routes: /articles, /graph)            │
└────────────────┬────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼────────┐  │  ┌─────────▼──────┐
│  OpenAI    │  │  │  Article Store │
│ Analyzer   │  │  │  (In-Memory)   │
└────────────┘  │  └────────────────┘
                │
         ┌──────▼───────┐
         │  Graph Service│
         │   Facade     │
         └──────┬───────┘
                │
    ┌───────────┼────────────┐
    │           │            │
┌───▼────────┐  │  ┌────────▼──────┐
│  Article   │  │  │   Distance    │
│   Graph    │  │  │  Calculator   │
│ (graphlib) │  │  │(Dijkstra)     │
└────────────┘  │  └───────────────┘
                │
         ┌──────▼──────────┐
         │ Relationship    │
         │ Builder         │
         │ (Detection)     │
         └─────────────────┘
```

## Configuration

### Environment Variables

```
# OpenAI API Configuration
OPENAI_API_KEY=sk-...  # Your OpenAI API key

# Server Configuration
PORT=3000              # Server port (default: 3000)
NODE_ENV=development   # Environment (development/production)
```

## Performance Notes

- **Article Analysis**: ~2-5 seconds per article (depends on OpenAI API)
- **Distance Calculation**: < 100ms for most queries (using Dijkstra's algorithm)
- **Relationship Detection**: O(n²) where n is number of articles
- **In-Memory Storage**: Suitable for up to 10,000 articles

## Limitations (MVP)

- In-memory storage only (data lost on restart)
- Single-threaded API
- No authentication/authorization
- No rate limiting
- No database persistence
- Limited to text file input

## Future Enhancements

1. **Persistence**: Add database support (PostgreSQL + Neo4j)
2. **Caching**: Implement response caching
3. **Authentication**: Add API key validation
4. **Batch Processing**: Queue system for large-scale analysis
5. **Visualization**: Web UI for graph visualization
6. **Similarity**: Add semantic similarity using embeddings
7. **Real-time**: Article scraping from sports websites
8. **Advanced Queries**: Complex graph queries and filtering

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK` - Successful request
- `400 Bad Request` - Invalid parameters or request format
- `404 Not Found` - Article or endpoint not found
- `429 Too Many Requests` - OpenAI API rate limit
- `500 Internal Server Error` - Server error

All error responses follow this format:
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## Development

### Project Structure

```
src/
├── api/                    # Express.js API
│   ├── routes/             # Route handlers
│   │   ├── articles.js     # Article endpoints
│   │   ├── clubs.js        # Club profile endpoints
│   │   └── graph.js        # Graph endpoints
│   ├── middleware/         # Express middleware
│   │   ├── error-handler.js
│   │   └── upload.js
│   └── server.js           # Express app setup
├── services/               # Business logic
│   ├── openai-analyzer.js  # ChatGPT integration
│   ├── article-store.js    # Storage
│   ├── club-store.js       # Club profile storage
│   └── graph-service.js    # Graph facade
├── graph/                  # Graph algorithms
│   ├── article-graph.js    # Graph structure
│   ├── relationship-builder.js
│   └── distance-calculator.js
├── utils/                  # Utilities
│   ├── validators.js       # Zod schemas
│   ├── prompts.js          # ChatGPT prompts
│   └── county-data.js      # County adjacency
└── index.js                # Entry point
```

## Additional Documentation

- **[Club Profiles Feature](docs/CLUB_PROFILES.md)** - Complete guide to club profile pages
- **[Club Quick Start](docs/CLUB_QUICK_START.md)** - Quick start guide for testing club profiles
- **[Features](docs/FEATURES.md)** - Detailed feature documentation
- **[Testing Guide](docs/TESTING_GUIDE.md)** - How to test the application

## License

MIT

## Support

For issues or questions:
1. Check the API documentation above
2. Review sample articles in `data/sample-articles/`
3. Check OpenAI API status and rate limits
4. Ensure `.env` file is properly configured
