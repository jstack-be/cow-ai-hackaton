# Query API Quick Reference

## Endpoint
```
POST /api/articles/query
```

## Request
```json
{
  "query": "Your question here",
  "topK": 3  // optional
}
```

## Two Query Modes

### 📚 Knowledge Base Mode
Answers questions about your uploaded articles

**Examples:**
- "Which teams played in the final?"
- "What was the score?"
- "Which articles mention Dublin GAA?"

### ⚖️ Technical Rules Mode
Answers sports rules questions without articles

**Examples:**
- "What is the offside rule in soccer?"
- "How many points is a goal in GAA?"
- "What are the rules for a free kick?"

## Quick Examples

### Ask about articles (curl)
```bash
curl -X POST http://localhost:3000/api/articles/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Which teams played in the championship?"}'
```

### Ask about rules (curl)
```bash
curl -X POST http://localhost:3000/api/articles/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the offside rule?"}'
```

### JavaScript
```javascript
const response = await fetch('http://localhost:3000/api/articles/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'How many points is a try in rugby?' })
});
const data = await response.json();
console.log(data.answer);
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Whether the query succeeded |
| `query` | string | The original question |
| `answer` | string | AI-generated answer |
| `sources` | array | Articles used (empty for rules mode) |
| `isTechnicalRulesAnswer` | boolean | True if answered using rules mode |
| `documentsSearched` | number | Number of articles searched |

## Supported Sports Rules

✅ **GAA** - Goals, points, fouls, free kicks  
✅ **Soccer** - Offside, penalties, cards, VAR  
✅ **Rugby** - Tries, conversions, scrums, tackles  
✅ **Basketball** - Scoring, fouls, violations  
✅ **Tennis** - Scoring system, let, fault  
✅ **Cricket** - Runs, wickets, overs  

## Not Supported

❌ Match predictions or betting  
❌ Opinions about teams/players  
❌ Commercial products  
❌ Non-sports topics  

## Test It

```bash
npm run test:rules
```

## Tips

💡 **For article queries:**  
- Be specific with team/club names
- Mention counties or leagues if relevant
- Increase `topK` for more context

💡 **For rules queries:**  
- Specify the sport if ambiguous
- Use proper technical terms
- Ask about "how" not "who"

## See Full Documentation
[docs/QUERY_API.md](QUERY_API.md)
