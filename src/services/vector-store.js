import OpenAI from 'openai';

/**
 * Vector Store Service
 * Manages document embeddings and semantic search
 * Embeddings are stored in memory only (no file persistence)
 */
export class VectorStore {
  constructor(apiKey) {
    this.openai = new OpenAI({ apiKey });
    this.documents = [];
  }

  /**
   * Initialize the vector store (in-memory only)
   */
  async load() {
    console.log('📚 Vector store initialized (in-memory storage)');
    this.documents = [];
  }

  /**
   * Create an embedding for text
   * @param {string} text - Text to embed
   * @returns {Promise<Array<number>>} Embedding vector
   */
  async createEmbedding(text) {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text
    });
    return response.data[0].embedding;
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param {Array<number>} vecA 
   * @param {Array<number>} vecB 
   * @returns {number} Similarity score (0-1)
   */
  cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Add a document to the vector store
   * @param {Object} options - Document options
   * @param {string} options.id - Document ID
   * @param {string} options.title - Document title
   * @param {string} options.content - Document content
   * @param {Object} options.metadata - Additional metadata
   * @returns {Promise<Object>} Indexed document
   */
  async addDocument({ id, title, content, metadata = {} }) {
    console.log(`🔄 Creating embeddings for document: ${id}`);

    // Create combined text for better semantic search
    const combinedText = `${title}\n\n${content}`;
    const embedding = await this.createEmbedding(combinedText);

    const document = {
      id,
      title,
      content,
      embedding,
      metadata: {
        ...metadata,
        indexedAt: new Date().toISOString()
      }
    };

    this.documents.push(document);

    console.log(`✅ Document indexed: "${title.substring(0, 50)}..." (stored in memory)`);
    return document;
  }

  /**
   * Search for documents by query
   * @param {string} query - Search query
   * @param {number} topK - Number of results to return
   * @returns {Promise<Array>} Top matching documents with similarity scores
   */
  async search(query, topK = 3) {
    if (this.documents.length === 0) {
      return [];
    }

    console.log(`🔍 Searching for: "${query}"`);
    const queryEmbedding = await this.createEmbedding(query);

    const results = this.documents.map(doc => ({
      ...doc,
      similarity: this.cosineSimilarity(queryEmbedding, doc.embedding)
    }));

    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, topK);
  }

  /**
   * Answer a question using RAG (Retrieval Augmented Generation)
   * @param {string} query - User's question
   * @param {number} topK - Number of documents to retrieve
   * @returns {Promise<Object>} Answer and sources
   */
  async answerQuestion(query, topK = 3) {
    // Check if this is a technical sports rules question
    const isTechnicalRulesQuestion = await this.isTechnicalSportsRulesQuestion(query);

    // If it's a technical rules question, answer directly without requiring articles
    if (isTechnicalRulesQuestion) {
      console.log(`⚖️ Detected technical sports rules question`);
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a knowledgeable sports expert who answers technical questions about sports rules, regulations, and game mechanics. Your answers should be:\n1. Accurate and based on official rules\n2. Clear and concise\n3. Technical in nature (about rules, scoring, regulations, game mechanics)\n4. Limited to factual information about how sports work\n\nYou should answer questions about:\n- Official rules and regulations of sports\n- Scoring systems and point calculations\n- Game mechanics and procedures\n- Technical aspects of how sports are played\n- Referee decisions and rule interpretations\n\nDo NOT answer questions about:\n- Specific teams, players, or match results (unless it\'s about a rules example)\n- Predictions or opinions\n- Commercial products or betting\n- Non-sports related topics\n\nIf the question is not about technical sports rules, politely decline and explain that you only answer technical sports rules questions.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 600,
        temperature: 0.2
      });

      return {
        answer: response.choices[0].message.content.trim(),
        sources: [],
        isTechnicalRulesAnswer: true
      };
    }

    // Otherwise, use article-based RAG
    const relevantDocs = await this.search(query, topK);

    if (relevantDocs.length === 0) {
      return {
        answer: "I don't have any articles in my knowledge base yet. Please add some articles first.",
        sources: []
      };
    }

    // Build context from relevant documents
    const context = relevantDocs.map((doc, i) => 
      `Article ${i + 1} (Similarity: ${(doc.similarity * 100).toFixed(1)}%):\nTitle: ${doc.title}\n\n${doc.content}`
    ).join('\n\n---\n\n');

    console.log(`📖 Found ${relevantDocs.length} relevant articles`);

    // Use GPT to answer based on context
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that answers questions based on provided sports articles. Your task is to:\n1. Carefully read and analyze all provided articles\n2. Make logical inferences from the information (e.g., if teams play in a final, they must have been in the semi-finals)\n3. Combine information across multiple articles to give complete answers\n4. Think step-by-step about what the articles tell you directly and what can be reasonably inferred\n5. List all relevant teams, people, or facts that answer the question\n6. If the articles don\'t contain enough information to answer, say so clearly\n\nBe thorough and use reasoning to extract all relevant information.'
        },
        {
          role: 'user',
          content: `Based on these articles:\n\n${context}\n\nQuestion: ${query}\n\nPlease analyze all the articles carefully and make logical inferences where appropriate. Provide a complete answer.`
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    });

    return {
      answer: response.choices[0].message.content.trim(),
      sources: relevantDocs.map(doc => ({
        id: doc.id,
        title: doc.title,
        similarity: doc.similarity
      }))
    };
  }

  /**
   * Determine if a query is about technical sports rules
   * @param {string} query - User's question
   * @returns {Promise<boolean>} True if it's a technical rules question
   */
  async isTechnicalSportsRulesQuestion(query) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a classifier that determines if a question is about technical sports rules. Return ONLY 'true' or 'false'.\n\nA question is about technical sports rules if it asks about:\n- Official rules and regulations of a sport\n- Scoring systems, point calculations, or game mechanics\n- How a sport is played (procedures, positions, gameplay)\n- Referee decisions and rule interpretations\n- Technical aspects of sports (offside rules, fouls, penalties, etc.)\n\nA question is NOT about technical sports rules if it asks about:\n- Specific teams, players, matches, or results\n- Predictions or opinions\n- Commercial products, merchandise, or betting\n- Fan activities or community events\n- Historical facts about teams or leagues (unless asking about rule changes)\n\nExamples:\n- "What is the offside rule in soccer?" -> true\n- "How many points is a try worth in rugby?" -> true\n- "What are the rules for a free kick in GAA?" -> true\n- "Who won the match between Dublin and Kerry?" -> false\n- "What teams are in the Premier League?" -> false\n- "Is Dublin GAA a good team?" -> false\n\nRespond with ONLY 'true' or 'false'.`
        },
        {
          role: 'user',
          content: query
        }
      ],
      max_tokens: 10,
      temperature: 0.0
    });

    const result = response.choices[0].message.content.trim().toLowerCase();
    return result === 'true';
  }

  /**
   * Get statistics about the vector store
   * @returns {Object} Store statistics
   */
  getStats() {
    return {
      totalDocuments: this.documents.length,
      storageType: 'in-memory'
    };
  }

  /**
   * Check if document exists in store
   * @param {string} id - Document ID
   * @returns {boolean}
   */
  hasDocument(id) {
    return this.documents.some(doc => doc.id === id);
  }

  /**
   * Remove a document from the store
   * @param {string} id - Document ID
   * @returns {Promise<boolean>} True if removed
   */
  async removeDocument(id) {
    const initialLength = this.documents.length;
    this.documents = this.documents.filter(doc => doc.id !== id);
    return this.documents.length < initialLength;
  }
}

export default VectorStore;
