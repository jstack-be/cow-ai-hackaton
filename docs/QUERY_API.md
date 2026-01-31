# Query API with Sports Rules Support

## Overview

The Query API provides an intelligent question-answering system that supports two modes:

1. **Knowledge Base Mode**: Answers questions about your uploaded articles using semantic search and RAG (Retrieval Augmented Generation)
2. **Technical Rules Mode**: Answers general technical questions about sports rules, scoring, and game mechanics without requiring articles

The system automatically detects which mode to use based on your question.

## Endpoint

```
POST /api/articles/query
```

## Request Body

```json
{
  "query": "string",    // Your question (required)
  "topK": 3            // Number of articles to search (optional, default: 3)
}
```

## Response

```json
{
  "success": true,
  "query": "Your question",
  "answer": "AI-generated answer",
  "sources": [          // Array of source articles (empty for technical rules)
    {
      "id": "uuid",
      "title": "Article title",
      "similarity": 0.89
    }
  ],
  "isTechnicalRulesAnswer": true,  // Optional: present when using rules mode
  "documentsSearched": 3
}
```

## Query Modes

### 1. Knowledge Base Mode

Used for questions about your uploaded articles, such as:
- "Which teams played in the championship?"
- "What was the score in the Dublin vs Kerry match?"
- "Which articles mention Shamrock Rovers?"
- "Who won the match between Cork and Limerick?"

**Example:**
```bash
curl -X POST http://localhost:3000/api/articles/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Which teams played in the final?",
    "topK": 3
  }'
```

**Response:**
```json
{
  "success": true,
  "query": "Which teams played in the final?",
  "answer": "Dublin GAA and Kerry GAA played in the All-Ireland Senior Championship final. Dublin won with a score of 2-15 to 1-12.",
  "sources": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Dublin vs Kerry Championship Final",
      "similarity": 0.92
    }
  ],
  "documentsSearched": 3
}
```

### 2. Technical Rules Mode

Used for general questions about sports rules and mechanics, such as:
- "What is the offside rule in soccer?"
- "How many points is a goal worth in GAA?"
- "What are the rules for a free kick?"
- "How is a try scored in rugby?"

**Example:**
```bash
curl -X POST http://localhost:3000/api/articles/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the offside rule in soccer?"
  }'
```

**Response:**
```json
{
  "success": true,
  "query": "What is the offside rule in soccer?",
  "answer": "The offside rule in soccer states that a player is in an offside position if they are in the opposing team's half of the field and closer to the opponent's goal line than both the ball and the second-to-last opponent (usually the last defender) at the moment the ball is played to them. However, being in an offside position is not an offense in itself. A player is only penalized for offside if they are actively involved in play by interfering with play, interfering with an opponent, or gaining an advantage from being in that position when the ball is played by a teammate.",
  "sources": [],
  "isTechnicalRulesAnswer": true,
  "documentsSearched": 3
}
```

## Supported Technical Rules Questions

The system can answer questions about:

### GAA (Gaelic Athletic Association)
- Scoring systems (goals, points)
- Game rules (fouls, free kicks, penalties)
- Field dimensions and positions
- Match duration and structure

### Soccer/Football
- Offside rules
- Free kicks and penalties
- Yellow/red cards
- Corner kicks and throw-ins
- VAR (Video Assistant Referee) decisions

### Rugby
- Try scoring and conversions
- Scrums and lineouts
- Offside rules
- Penalty kicks
- Tackle rules

### Other Sports
- Basketball scoring and fouls
- Tennis scoring system
- Cricket rules and scoring
- American Football downs and scoring

## What is NOT Supported

The technical rules mode will **NOT** answer:
- Predictions or betting advice
- Opinions about teams or players
- Commercial products or merchandise
- Non-sports related topics
- Specific match results (unless as an example of a rule)

## How It Works

### Classification Process

1. **Query Analysis**: When you submit a query, the system first analyzes it to determine if it's a technical rules question
2. **Routing**: Based on the classification:
   - **Technical Rules**: Answered directly by GPT-4 using its knowledge of sports rules
   - **Article-Based**: Uses semantic search to find relevant articles, then GPT-4 analyzes them to answer your question

### Classification Examples

| Question | Classification | Reason |
|----------|----------------|--------|
| "What is the offside rule?" | Technical Rules | Asks about a game rule |
| "How many points is a goal?" | Technical Rules | Asks about scoring system |
| "Who won the match?" | Article-Based | Asks about specific event |
| "What teams are in the league?" | Article-Based | Asks about specific data |
| "Is Dublin GAA good?" | Article-Based | Asks for opinion/analysis |

## Integration Examples

### JavaScript/Node.js

```javascript
import fetch from 'node-fetch';

async function queryArticles(question) {
  const response = await fetch('http://localhost:3000/api/articles/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: question,
      topK: 5
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('Answer:', data.answer);
    
    if (data.isTechnicalRulesAnswer) {
      console.log('(Answered using technical rules knowledge)');
    } else {
      console.log('Sources:', data.sources.length, 'articles');
    }
  }
}

// Ask about articles
await queryArticles('Which teams played in the championship?');

// Ask about rules
await queryArticles('What is the offside rule in soccer?');
```

### Python

```python
import requests

def query_articles(question, top_k=3):
    response = requests.post(
        'http://localhost:3000/api/articles/query',
        json={
            'query': question,
            'topK': top_k
        }
    )
    
    data = response.json()
    
    if data['success']:
        print(f"Answer: {data['answer']}")
        
        if data.get('isTechnicalRulesAnswer'):
            print("(Answered using technical rules knowledge)")
        else:
            print(f"Sources: {len(data['sources'])} articles")
    
    return data

# Ask about articles
query_articles('Which teams played in the championship?')

# Ask about rules
query_articles('What is the offside rule in soccer?')
```

### curl

```bash
# Knowledge base query
curl -X POST http://localhost:3000/api/articles/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Which teams played in the final?"}'

# Technical rules query
curl -X POST http://localhost:3000/api/articles/query \
  -H "Content-Type: application/json" \
  -d '{"query": "How many points is a try worth in rugby?"}'
```

## Best Practices

### For Knowledge Base Queries
1. **Be specific**: "Which teams played in the Dublin county final?" is better than "Which teams played?"
2. **Use context**: If your articles mention specific leagues or counties, include them in your query
3. **Adjust topK**: If you're not getting enough context, increase `topK` to search more articles

### For Technical Rules Queries
1. **Be clear**: Specify the sport if there might be ambiguity
2. **Focus on rules**: Ask about "how" things work, not "who" did what
3. **Technical terms**: Use proper sports terminology when possible

## Error Handling

### No Articles Found
```json
{
  "success": true,
  "query": "Which teams played?",
  "answer": "I don't have any articles in my knowledge base yet. Please add some articles first.",
  "sources": []
}
```

### Invalid Request
```json
{
  "success": false,
  "error": "Query is required and must be a non-empty string"
}
```

### API Error
```json
{
  "success": false,
  "error": "OpenAI API error: [error message]"
}
```

## Performance Considerations

- **Classification**: Each query requires a quick classification call (~100ms)
- **Technical Rules**: Answers in ~1-2 seconds
- **Knowledge Base**: Depends on number of articles and topK value (~2-4 seconds)
- **Caching**: Consider caching common technical rules questions at the application level

## Testing

Run the test suite to verify functionality:

```bash
npm run test:rules
```

This will test:
- Technical rules detection
- Knowledge base queries
- Classification accuracy
- Error handling

## See Also

- [Main API Documentation](../README.md)
- [By Interests API](BY_INTERESTS_API.md)
- [Podcast API](PODCAST_API.md)
- [Testing Guide](TESTING_GUIDE.md)
