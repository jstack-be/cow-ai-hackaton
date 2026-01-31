# Podcast API - Quick Reference

## Endpoints

### 1️⃣ Generate from All Articles
```
POST /api/podcast/generate
```

**Request:**
```json
{
  "limit": 10  // Optional, default: 10
}
```

**Response:**
```json
{
  "success": true,
  "podcast": {
    "title": "Episode title",
    "script": "Full podcast script...",
    "summary": "Brief summary",
    "topics": ["topic1", "topic2"],
    "duration": "3:15",
    "wordCount": 487,
    "articlesUsed": 5,
    "generatedAt": "2026-01-31T12:00:00.000Z"
  }
}
```

---

### 2️⃣ Generate by Interests
```
POST /api/podcast/by-interests
```

**Request:**
```json
{
  "interests": [
    { "type": "sport", "value": "Gaelic Football", "weight": 1.0 },
    { "type": "county", "value": "Dublin", "weight": 0.8 }
  ],
  "limit": 10  // Optional, default: 10
}
```

**Interest Types:**
- `sport` - Filter by sport name
- `club` - Filter by club name  
- `county` - Filter by county
- `league` - Filter by league

**Response:**
```json
{
  "success": true,
  "podcast": { /* same as above */ },
  "interests": [ /* echoes request interests */ ]
}
```

---

## Quick Examples

### cURL - All Articles
```bash
curl -X POST http://localhost:3000/api/podcast/generate \
  -H "Content-Type: application/json" \
  -d '{"limit": 5}'
```

### cURL - By Interests
```bash
curl -X POST http://localhost:3000/api/podcast/by-interests \
  -H "Content-Type: application/json" \
  -d '{
    "interests": [
      {"type": "sport", "value": "Hurling"},
      {"type": "county", "value": "Cork"}
    ],
    "limit": 5
  }'
```

### JavaScript - Fetch API
```javascript
// All articles
const response = await fetch('/api/podcast/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ limit: 10 })
});

// By interests
const response = await fetch('/api/podcast/by-interests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    interests: [
      { type: 'sport', value: 'Gaelic Football' },
      { type: 'club', value: 'Kilcar' }
    ],
    limit: 5
  })
});

const { podcast } = await response.json();
console.log(podcast.script);
```

---

## Testing

Run the test script:
```bash
node test-podcast.js
```

---

## Podcast Characteristics

- **Length**: ~3 minutes (450-500 words)
- **Style**: Conversational, single-person host
- **Tone**: Engaging, enthusiastic, knowledgeable
- **Format**: Introduction → Stories/Analysis → Closing
- **Quality**: AI-generated using GPT-4

---

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| No articles available | No articles in system | Analyze articles first |
| Invalid interests | Wrong format | Use array with type/value objects |
| No matching articles | Interests don't match | Try broader interests |

---

## Tips

✅ **Recommended article limit**: 5-10  
✅ **Best for**: News roundups, topic summaries  
✅ **Cache**: Consider caching generated podcasts  
✅ **Costs**: Each generation uses GPT-4 API tokens  

---

## Full Documentation

See [PODCAST_API.md](./PODCAST_API.md) for complete documentation.
