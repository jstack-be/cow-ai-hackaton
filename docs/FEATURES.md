# New Features Added - AI Content Generation & Semantic Search

## 🎯 Overview

The Sports Article Graph Analyzer has been enhanced with powerful AI-driven features:
1. **Automatic Article Generation** - Transform raw source text into polished articles with headlines
2. **Semantic Search** - Find articles using natural language instead of keywords
3. **AI-Powered Q&A** - Ask questions about your articles and get intelligent answers

## 🆕 New Features

### 1. AI Article Generation

Generate professional sports articles from brief source text using GPT-4.

**How it works:**
- Upload a text file with basic information
- Check "Generate enhanced article with AI"
- System creates a compelling headline and full article
- Original source text is preserved

**Example:**
```
Input: "Cork beat Kerry in championship final 2-15 to 1-12"

Generated Headline: "Cork Triumph Over Kerry in Thrilling Championship Final"

Generated Article: "In a dramatic championship final, Cork emerged victorious 
against their arch-rivals Kerry with a final score of 2-15 to 1-12. The match 
showcased exceptional skill and determination from both teams..."
```

### 2. Vector-Based Semantic Search

Articles are automatically indexed with AI embeddings for intelligent search.

**Features:**
- Automatic indexing when articles are uploaded
- Persistent storage across restarts
- Fast semantic similarity search
- No manual indexing required

**Technology:**
- Uses OpenAI's `text-embedding-ada-002` model
- Creates 1536-dimensional embeddings
- Cosine similarity for relevance scoring

### 3. Natural Language Q&A

Ask questions about your articles in plain English and get AI-generated answers.

**Examples:**
- "Which teams reached the semi-finals?"
- "What happened in the championship?"
- "Tell me about the Kerry vs Cork matches"
- "Which counties are most represented?"

**How it works:**
1. Your question is embedded as a vector
2. Most relevant articles are retrieved by semantic similarity
3. GPT-4 analyzes the articles and generates a contextual answer
4. Sources are cited with relevance scores

**Features:**
- Multi-article synthesis
- Logical inference (e.g., finalists must have been in semifinals)
- Source attribution
- Context-aware responses

## 📋 Usage

### Web Interface

#### Upload with Content Generation
1. Open http://localhost:3000
2. Select an article file
3. ✅ Check "Generate enhanced article with AI"
4. Click "Analyze Article"
5. Wait for processing (10-30 seconds)
6. View generated headline in success message

#### Ask Questions
1. Scroll to "Ask Questions" section
2. Type your question in the textarea
3. Click "Ask Question" or press Ctrl+Enter
4. View AI-generated answer with sources

### API Endpoints

#### Analyze Article with Generation
```bash
POST /api/articles/analyze
Content-Type: multipart/form-data

file: article.txt
title: Optional Title
generateContent: true  # Enable AI generation
```

**Response:**
```json
{
  "success": true,
  "article": {
    "id": "abc-123-def-456",
    "title": "Generated Headline Here",
    "metadata": { ... },
    "relatedArticles": [ ... ],
    "generatedHeadline": "Generated Headline Here"
  }
}
```

#### Query Articles with Natural Language
```bash
POST /api/articles/query
Content-Type: application/json

{
  "query": "Which teams won their matches?",
  "topK": 3
}
```

**Response:**
```json
{
  "success": true,
  "query": "Which teams won their matches?",
  "answer": "Based on the articles, the following teams won...",
  "sources": [
    {
      "id": "abc-123",
      "title": "Cork Defeats Kerry",
      "similarity": 0.87
    }
  ],
  "documentsSearched": 3
}
```

## 🏗️ Architecture

### New Services

#### VectorStore Service
**Location:** `src/services/vector-store.js`

**Responsibilities:**
- Manage document embeddings
- Perform semantic search
- Answer questions using RAG (Retrieval Augmented Generation)
- Persist embeddings to disk

**Key Methods:**
```javascript
vectorStore.addDocument({ id, title, content, metadata })
vectorStore.search(query, topK)
vectorStore.answerQuestion(query, topK)
```

#### ArticleGenerator Service
**Location:** `src/services/article-generator.js`

**Responsibilities:**
- Generate headlines from source text
- Create full article content
- Use GPT-4 for high-quality output

**Key Methods:**
```javascript
articleGenerator.generateHeadline(sourceText)
articleGenerator.generateArticle(sourceText)
articleGenerator.generateContent(sourceText)
```

### Integration Points

#### Article Upload Flow
```
User Upload
    ↓
Optional: Generate Content (ArticleGenerator)
    ↓
Extract Metadata (OpenAIAnalyzer)
    ↓
Add to Graph (GraphService)
    ↓
Index Embeddings (VectorStore)
    ↓
Success Response
```

#### Query Flow
```
User Question
    ↓
Create Query Embedding (VectorStore)
    ↓
Semantic Search → Top K Articles
    ↓
Build Context from Articles
    ↓
GPT-4 Answer Generation
    ↓
Return Answer + Sources
```

## 💾 Data Storage

### Vector Store
**File:** `vectors.json` (auto-created)

**Contents:**
- Document IDs and titles
- Full article content
- 1536-dimensional embeddings
- Metadata (timestamp, source info)

**Size:** ~1-2KB per article (mostly embedding data)

### Persistence
- Loaded on server startup
- Auto-saved when articles are added
- Saved on graceful shutdown (Ctrl+C)

## ⚡ Performance

### Generation Speed
- Headline: ~2-5 seconds
- Full article: ~5-10 seconds
- Total with indexing: ~10-30 seconds per article

### Query Speed
- Embedding creation: ~1-2 seconds
- Semantic search: <100ms (in-memory)
- GPT-4 answer: ~3-8 seconds
- Total query time: ~5-12 seconds

### Optimization Tips
- Limit `topK` to 3-5 for faster queries
- Batch upload multiple articles together
- Vector store operates entirely in memory (fast)

## 🔒 Privacy & Data

### What's Sent to OpenAI
- Article text (for embedding and generation)
- User questions (for embedding and answering)
- Retrieved article context (for answer generation)

### What's Stored Locally
- Full article text
- Generated content
- Vector embeddings
- All metadata

### API Keys
- Stored in `.env` file (never committed)
- Used for OpenAI API calls only
- Required for all AI features

## 🐛 Troubleshooting

### "Vector store failed to load"
- **Cause:** Corrupted `vectors.json`
- **Fix:** Delete `vectors.json` and re-upload articles

### Slow generation
- **Normal:** First request may be slower (cold start)
- **Check:** OpenAI API status at status.openai.com
- **Limit:** Free tier has rate limits

### Query returns generic answers
- **Cause:** No relevant articles found
- **Fix:** Upload more articles on the topic
- **Check:** Try different phrasing of the question

### Generated content quality issues
- **Model:** Uses GPT-4 (high quality)
- **Temperature:** Set to 0.7 (balanced creativity)
- **Fix:** Source text should be clear and informative

## 📚 Examples

### Sample Questions to Try

**Match Results:**
- "Which teams won their matches?"
- "What was the final score in the championship?"
- "Who beat who in the semi-finals?"

**Team Information:**
- "Which teams are from Cork?"
- "Tell me about the top performing clubs"
- "Which teams played against each other?"

**Competition Info:**
- "What leagues are mentioned?"
- "Which counties are most represented?"
- "Describe the championship structure"

**Analysis:**
- "What patterns do you see in the results?"
- "Which teams seem strongest?"
- "Are there any notable rivalries?"

## 🔄 Migration from Old System

If you were using the standalone CLI tools:

### Old Way (Deprecated)
```bash
node index.js input.txt output.txt
node index.js query "question"
```

### New Way
Use the web interface at http://localhost:3000 or the API endpoints.

**Files to Remove:**
- ❌ `index.js` (root level) - now in `src/services/article-generator.js`
- ❌ `vectorstore.js` (root level) - now in `src/services/vector-store.js`

See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for details.

## 📖 Additional Documentation

- [INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md) - Technical integration details
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - How to test the features
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Migrating from old CLI system

## 🎉 What's Next

Possible future enhancements:
- [ ] Streaming responses for real-time answers
- [ ] Multiple vector store backends (Pinecone, Weaviate)
- [ ] Fine-tuned models for sports domain
- [ ] Batch query processing
- [ ] Export Q&A history
- [ ] Custom prompts for different sports

## 🤝 Contributing

When adding features:
1. Keep services decoupled
2. Add proper error handling
3. Update API documentation
4. Test with sample articles
5. Update relevant docs

## 📄 License

MIT
