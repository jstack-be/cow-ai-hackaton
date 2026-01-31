/**
 * Test script for sports rules query functionality
 * 
 * This script tests the expanded query capability that allows:
 * 1. Questions about articles in the knowledge base
 * 2. Technical questions about sports rules and game mechanics
 */

import dotenv from 'dotenv';
import VectorStore from './src/services/vector-store.js';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY not found in environment');
  process.exit(1);
}

async function testSportsRulesQueries() {
  console.log('🧪 Testing Sports Rules Query Functionality\n');
  console.log('=' .repeat(60));
  
  const vectorStore = new VectorStore(OPENAI_API_KEY);
  await vectorStore.load();

  // Test queries
  const testQueries = [
    {
      name: 'Technical Rules - Soccer Offside',
      query: 'What is the offside rule in soccer?',
      expectedType: 'technical'
    },
    {
      name: 'Technical Rules - GAA Scoring',
      query: 'How many points is a goal worth in GAA?',
      expectedType: 'technical'
    },
    {
      name: 'Technical Rules - Rugby Try',
      query: 'What is a try in rugby and how many points is it worth?',
      expectedType: 'technical'
    },
    {
      name: 'Technical Rules - Free Kick',
      query: 'What are the rules for a free kick in soccer?',
      expectedType: 'technical'
    },
    {
      name: 'Non-Technical - Match Result',
      query: 'Who won the match between Dublin and Kerry?',
      expectedType: 'article-based'
    },
    {
      name: 'Non-Technical - Team Opinion',
      query: 'Is Dublin GAA a good team?',
      expectedType: 'article-based'
    }
  ];

  for (const test of testQueries) {
    console.log(`\n📝 Test: ${test.name}`);
    console.log(`   Query: "${test.query}"`);
    console.log(`   Expected Type: ${test.expectedType}`);
    console.log('-'.repeat(60));

    try {
      const result = await vectorStore.answerQuestion(test.query, 3);
      
      if (result.isTechnicalRulesAnswer) {
        console.log('   ✅ Detected as: Technical Rules Question');
        console.log(`   📖 Answer: ${result.answer.substring(0, 150)}...`);
      } else {
        console.log('   ✅ Detected as: Article-Based Question');
        if (result.sources && result.sources.length > 0) {
          console.log(`   📚 Sources: ${result.sources.length} articles found`);
        } else {
          console.log('   📚 Sources: No articles in knowledge base');
        }
        console.log(`   📖 Answer: ${result.answer.substring(0, 150)}...`);
      }
      
      // Verify classification
      const isCorrect = (test.expectedType === 'technical' && result.isTechnicalRulesAnswer) ||
                       (test.expectedType === 'article-based' && !result.isTechnicalRulesAnswer);
      
      if (isCorrect) {
        console.log('   ✅ Classification: CORRECT');
      } else {
        console.log('   ❌ Classification: INCORRECT (expected ' + test.expectedType + ')');
      }
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Testing complete!\n');
  console.log('Summary:');
  console.log('- Technical rules questions are answered directly by GPT-4');
  console.log('- Article-based questions use semantic search + RAG');
  console.log('- The system intelligently routes queries to the appropriate mode');
}

// Run tests
testSportsRulesQueries().catch(console.error);
