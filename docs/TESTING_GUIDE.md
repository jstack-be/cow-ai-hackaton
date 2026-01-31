# Testing the Integration

## Prerequisites
- Node.js installed
- OpenAI API key in `.env` file

## Step 1: Start the Server
```bash
npm start
```

You should see:
```
🔄 Loading vector store...
📚 Loaded 0 documents from vector store
╔════════════════════════════════════════════════════════╗
║   Sports Article Graph Analyzer                        ║
║   🌐 Dashboard: http://localhost:3000                  ║
║   📚 API Docs:  http://localhost:3000/api              ║
║   📊 Knowledge Base: 0 articles indexed                ║
╚════════════════════════════════════════════════════════╝
```

## Step 2: Test Article Upload with Generation

### Using curl:
```bash
curl -X POST http://localhost:3000/api/articles/analyze \
  -F "file=@data/sample-articles/article1.txt" \
  -F "title=Test Article" \
  -F "generateContent=true"
```

### Using the Web Interface:
1. Open http://localhost:3000 in your browser
2. Click "Choose File" and select an article
3. Check "Generate enhanced article with AI"
4. Click "Analyze Article"
5. Wait for the processing to complete
6. You'll see a success message with the generated headline

## Step 3: Test Natural Language Query

### Using curl:
```bash
curl -X POST http://localhost:3000/api/articles/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What teams are mentioned in the articles?", "topK": 3}'
```

### Using the Web Interface:
1. Scroll down to the "Ask Questions" section
2. Type a question like:
   - "Which teams reached the semi-finals?"
   - "What happened in the championship?"
   - "Tell me about the matches"
3. Click "Ask Question"
4. View the AI-generated answer with source articles

## Step 4: Test Without Generation

Upload an article without checking the "Generate enhanced article with AI" checkbox to use the original text.

## Expected Results

### With Content Generation:
- System generates a professional headline
- Article content is enhanced and structured
- Everything is indexed in the vector store
- Article appears in the graph

### Query Results:
- Answer synthesizes information from multiple articles
- Sources are listed with relevance scores
- Answers include logical inferences
- Response is in natural language

## Verification

Check that `vectors.json` is created in the project root with embedded articles:
```bash
ls -la vectors.json
```

View the file to see the stored embeddings (will be large):
```bash
head -n 20 vectors.json
```

## API Endpoints to Test

1. **Upload Single Article**
   - POST /api/articles/analyze
   - With `generateContent=true` parameter

2. **Query Articles**
   - POST /api/articles/query
   - Body: `{"query": "your question", "topK": 3}`

3. **Get All Articles**
   - GET /api/articles
   - Should show articles with generated titles

4. **Get Graph Stats**
   - GET /api/graph/stats
   - Shows number of articles and connections

## Troubleshooting

### "OPENAI_API_KEY not found"
- Create a `.env` file with: `OPENAI_API_KEY=your_key_here`

### "No articles in knowledge base"
- Upload at least one article first
- Wait for processing to complete

### Slow responses
- AI generation takes time (10-30 seconds per article)
- Embedding creation requires API calls
- This is normal for the first upload

### Vector store not persisting
- Check file permissions in project directory
- Ensure graceful shutdown (Ctrl+C) to save data

## Sample Questions to Try

Once you have articles uploaded:
- "Which teams are mentioned in the articles?"
- "What competitions are discussed?"
- "Tell me about the championship results"
- "Which counties are represented?"
- "What happened in the finals?"
- "Who won the matches?"
- "Are there any derby matches mentioned?"

## Success Indicators

✅ Articles upload successfully with or without generation
✅ Generated headlines appear in the article list
✅ Questions receive contextual answers
✅ Source articles are cited with relevance scores
✅ Vector store persists across restarts
✅ All functionality works from the web interface
✅ No need for command-line operations
