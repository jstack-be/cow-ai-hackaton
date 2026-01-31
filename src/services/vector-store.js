import OpenAI from 'openai';
import fs from 'fs/promises';

/**
 * Vector Store Service
 * Manages document embeddings and semantic search
 */
export class VectorStore {
  constructor(apiKey, storePath = 'vectors.json') {
    this.openai = new OpenAI({ apiKey });
    this.storePath = storePath;
    this.documents = [];
  }

  /**
   * Load documents from storage
   */
  async load() {
    try {
      const data = await fs.readFile(this.storePath, 'utf-8');
      this.documents = JSON.parse(data);
      console.log(`📚 Loaded ${this.documents.length} documents from vector store`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('📚 No existing vector store found, starting fresh');
        this.documents = [];
      } else {
        throw error;
      }
    }
  }

  /**
   * Save documents to storage
   */
  async save() {
    await fs.writeFile(this.storePath, JSON.stringify(this.documents, null, 2), 'utf-8');
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
    await this.save();
    
    console.log(`✅ Document indexed: "${title.substring(0, 50)}..."`);
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
   * Get statistics about the vector store
   * @returns {Object} Store statistics
   */
  getStats() {
    return {
      totalDocuments: this.documents.length,
      storePath: this.storePath
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
    
    if (this.documents.length < initialLength) {
      await this.save();
      return true;
    }
    
    return false;
  }
}

export default VectorStore;
