# 🎯 By-Interests API - Quick Reference

## Endpoint
```
POST /api/articles/by-interests
```

## Quick Examples

### Filter by Sport
```bash
curl -X POST http://localhost:3000/api/articles/by-interests \
  -H "Content-Type: application/json" \
  -d '{"interests":[{"type":"sport","value":"GAA","weight":1.0}]}'
```

### Filter by Club
```bash
curl -X POST http://localhost:3000/api/articles/by-interests \
  -H "Content-Type: application/json" \
  -d '{"interests":[{"type":"club","value":"Shamrock Rovers","weight":1.0}]}'
```

### Filter by County
```bash
curl -X POST http://localhost:3000/api/articles/by-interests \
  -H "Content-Type: application/json" \
  -d '{"interests":[{"type":"county","value":"Dublin","weight":1.0}]}'
```

### Filter by League
```bash
curl -X POST http://localhost:3000/api/articles/by-interests \
  -H "Content-Type: application/json" \
  -d '{"interests":[{"type":"league","value":"All-Ireland","weight":1.0}]}'
```

### Multiple Interests (OR logic)
```bash
curl -X POST http://localhost:3000/api/articles/by-interests \
  -H "Content-Type: application/json" \
  -d '{
    "interests": [
      {"type":"sport","value":"GAA","weight":1.0},
      {"type":"county","value":"Dublin","weight":0.8}
    ]
  }'
```

## PowerShell
```powershell
$body = @{
    interests = @(
        @{ type = "sport"; value = "GAA"; weight = 1.0 }
    )
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:3000/api/articles/by-interests" `
  -Method Post -Body $body -ContentType "application/json"
```

## JavaScript/Node.js
```javascript
const response = await fetch('http://localhost:3000/api/articles/by-interests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    interests: [
      { type: 'sport', value: 'GAA', weight: 1.0 }
    ]
  })
});
const data = await response.json();
```

## Interest Types

| Type | Matching | Examples |
|------|----------|----------|
| `sport` | Exact | "GAA", "soccer", "rugby", "korfball" |
| `club` | Partial | "Rovers", "Dublin GAA", "Cork" |
| `county` | Exact | "Dublin", "Cork", "Kerry" |
| `league` | Partial | "All-Ireland", "Premier Division" |

## Response Structure
```json
{
  "success": true,
  "articles": [{
    "id": "...",
    "title": "...",
    "metadata": {...},
    "imageUrl": "...",
    "sport": "..."
  }],
  "total": 3,
  "interests": [...]
}
```

## Common Use Cases

1. **User Preferences**: Filter feed based on user's favorite teams/sports
2. **Club Pages**: Show articles about specific clubs
3. **County News**: Display local news for a specific county
4. **Sport-Specific Views**: Create sport-specific news sections
5. **Multi-Interest Feed**: Combine multiple interests for personalized content

## Notes

- Uses **OR logic**: article matches if ANY interest matches
- **Case-insensitive** matching
- **Weights** accepted but not currently used in filtering
- **Deduplicates** results automatically
- Returns articles with **images**

## Full Documentation

See [docs/BY_INTERESTS_API.md](BY_INTERESTS_API.md) for complete documentation.
