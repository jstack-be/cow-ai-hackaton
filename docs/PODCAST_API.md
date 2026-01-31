# Podcast API Documentation

## Overview

The Podcast API provides AI-generated single-person podcast scripts based on analyzed sports articles. The podcasts are approximately 3 minutes long (450-500 words) and present article content in an engaging, conversational format.

## Features

- 🎙️ **AI-Generated Scripts**: Natural, conversational podcast scripts
- ⏱️ **3-Minute Format**: Optimized for quick listening (~450-500 words)
- 🎯 **Interest-Based Filtering**: Generate podcasts tailored to specific sports, clubs, counties, or leagues
- 📊 **Flexible Source**: Use all articles or filter by user interests
- 🎨 **Engaging Style**: Enthusiastic host persona with natural transitions

## Endpoints

### 1. Generate Podcast from All Articles

Generate a podcast using the most recent analyzed articles.

**Endpoint:** `POST /api/podcast/generate`

**Request Body:**
```json
{
  "limit": 10  // Optional: Maximum number of articles to use (default: 10)
}
```

**Response:**
```json
{
  "success": true,
  "podcast": {
    "title": "This Week in Irish Sports: Championship Battles and County Showdowns",
    "script": "Hey everyone! Welcome back to the show...",
    "summary": "A roundup of recent GAA matches and upcoming championship events",
    "topics": ["Gaelic Football", "Hurling", "Championship"],
    "duration": "3:15",
    "wordCount": 487,
    "articlesUsed": 5,
    "generatedAt": "2026-01-31T12:00:00.000Z"
  }
}
```

**Example Usage:**
```bash
curl -X POST http://localhost:3000/api/podcast/generate \
  -H "Content-Type: application/json" \
  -d '{"limit": 10}'
```

**JavaScript Example:**
```javascript
const response = await fetch('http://localhost:3000/api/podcast/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ limit: 10 })
});

const data = await response.json();
console.log(data.podcast.script);
```

---

### 2. Generate Podcast by Interests

Generate a podcast from articles filtered by specific user interests.

**Endpoint:** `POST /api/podcast/by-interests`

**Request Body:**
```json
{
  "interests": [
    {
      "type": "sport",     // 'sport' | 'club' | 'county' | 'league'
      "value": "Hurling",  // The value to match
      "weight": 1.0        // Optional: Weight for ranking (0.0-1.0)
    },
    {
      "type": "county",
      "value": "Cork",
      "weight": 0.8
    }
  ],
  "limit": 10  // Optional: Maximum number of articles to use (default: 10)
}
```

**Interest Types:**
- `sport`: Filter by sport (e.g., "Gaelic Football", "Hurling", "Camogie")
- `club`: Filter by club name (e.g., "St. Patrick's", "Ballymun Kickhams")
- `county`: Filter by county (e.g., "Dublin", "Kerry", "Cork")
- `league`: Filter by league (e.g., "Senior Championship", "Division 1")

**Response:**
```json
{
  "success": true,
  "podcast": {
    "title": "Cork Hurling Special: Recent Victories and Road to Glory",
    "script": "Welcome to today's special episode all about Cork hurling...",
    "summary": "Cork hurling highlights and championship analysis",
    "topics": ["Hurling", "Cork GAA", "Munster Championship"],
    "duration": "3:10",
    "wordCount": 475,
    "articlesUsed": 4,
    "generatedAt": "2026-01-31T12:00:00.000Z"
  },
  "interests": [
    { "type": "sport", "value": "Hurling", "weight": 1.0 },
    { "type": "county", "value": "Cork", "weight": 0.8 }
  ]
}
```

**Example Usage:**
```bash
curl -X POST http://localhost:3000/api/podcast/by-interests \
  -H "Content-Type: application/json" \
  -d '{
    "interests": [
      {"type": "sport", "value": "Gaelic Football", "weight": 1.0},
      {"type": "county", "value": "Donegal", "weight": 0.8}
    ],
    "limit": 5
  }'
```

**JavaScript Example:**
```javascript
const response = await fetch('http://localhost:3000/api/podcast/by-interests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    interests: [
      { type: 'sport', value: 'Gaelic Football', weight: 1.0 },
      { type: 'club', value: 'Kilcar', weight: 0.9 }
    ],
    limit: 5
  })
});

const data = await response.json();
console.log(data.podcast.title);
console.log(data.podcast.script);
```

---

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Catchy episode title |
| `script` | string | Full podcast script (ready to read/synthesize) |
| `summary` | string | One-sentence episode summary |
| `topics` | array | List of main topics covered |
| `duration` | string | Estimated duration (MM:SS format) |
| `wordCount` | number | Total word count of script |
| `articlesUsed` | number | Number of articles used to generate podcast |
| `generatedAt` | string | ISO timestamp of generation |

---

## Error Responses

### No Articles Available
```json
{
  "success": false,
  "error": "No articles available to generate podcast. Please analyze some articles first."
}
```

### Invalid Interests Format
```json
{
  "success": false,
  "error": "interests must be a non-empty array"
}
```

### No Matching Articles
```json
{
  "success": false,
  "error": "No articles found matching the provided interests"
}
```

### Invalid Interest Type
```json
{
  "success": false,
  "error": "Interest type must be one of: sport, club, county, league"
}
```

---

## Podcast Style

The generated podcasts feature:

- **Conversational Tone**: Natural, friendly speaking style
- **Engaging Transitions**: Smooth flow between topics
- **Commentary**: Host insights and analysis
- **Storytelling**: Narrative elements connecting the articles
- **Enthusiasm**: Energetic but professional delivery

**Example Script Style:**
```
Hey everyone, welcome back! I've got some really exciting GAA news to share 
with you today. Let me tell you about what's been happening in the championship...

Now here's something that really caught my attention - the match between...

What really makes this interesting is...

And that brings us to our final story of the day...
```

---

## Best Practices

1. **Article Limit**: Use 5-10 articles for best results
   - Too few: Script may be thin or repetitive
   - Too many: May exceed token limits or lose focus

2. **Interest Filtering**: Be specific with interests
   - Use exact club/county names as they appear in articles
   - Combine multiple interest types for better targeting

3. **Error Handling**: Always check for articles before generating
   ```javascript
   // Check articles first
   const articlesResponse = await fetch('/api/articles');
   const { total } = await articlesResponse.json();
   
   if (total === 0) {
     console.log('Please analyze articles first');
     return;
   }
   
   // Then generate podcast
   const podcastResponse = await fetch('/api/podcast/generate', ...);
   ```

4. **Rate Limiting**: Be mindful of OpenAI API costs
   - Each podcast generation uses GPT-4 tokens
   - Consider caching generated podcasts
   - Implement rate limiting for production use

---

## Integration Examples

### React Component
```jsx
function PodcastGenerator() {
  const [podcast, setPodcast] = useState(null);
  const [loading, setLoading] = useState(false);

  const generatePodcast = async (interests) => {
    setLoading(true);
    try {
      const response = await fetch('/api/podcast/by-interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests, limit: 5 })
      });
      
      const data = await response.json();
      if (data.success) {
        setPodcast(data.podcast);
      }
    } catch (error) {
      console.error('Failed to generate podcast:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <p>Generating podcast...</p>}
      {podcast && (
        <div>
          <h2>{podcast.title}</h2>
          <p>Duration: {podcast.duration} | Words: {podcast.wordCount}</p>
          <p>{podcast.script}</p>
        </div>
      )}
    </div>
  );
}
```

### Node.js Script
```javascript
import fetch from 'node-fetch';

async function generateDailyPodcast() {
  const response = await fetch('http://localhost:3000/api/podcast/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit: 8 })
  });
  
  const { podcast } = await response.json();
  
  // Save to file
  const fs = require('fs');
  const filename = `podcast-${new Date().toISOString().split('T')[0]}.txt`;
  fs.writeFileSync(filename, podcast.script);
  
  console.log(`Podcast saved to ${filename}`);
}

generateDailyPodcast();
```

---

## Testing

Run the test suite to verify the podcast API:

```bash
node test-podcast.js
```

This will:
1. Check if articles are available
2. Test podcast generation from all articles
3. Test podcast generation by interests
4. Display sample output and usage examples

---

## Related Documentation

- [Articles API](../docs/BY_INTERESTS_API.md) - Article filtering and retrieval
- [Integration Guide](../docs/INTEGRATION_SUMMARY.md) - Full API integration guide
- [Testing Guide](../docs/TESTING_GUIDE.md) - Testing procedures
