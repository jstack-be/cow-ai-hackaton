/**
 * Test script for podcast API endpoints
 * Demonstrates both podcast generation endpoints:
 * 1. Generate from all articles
 * 2. Generate from articles filtered by interests
 */

const BASE_URL = 'http://localhost:3000';

async function testPodcastGenerate() {
  console.log('\n📻 Testing: POST /api/podcast/generate');
  console.log('Description: Generate a podcast from all available articles\n');

  try {
    const response = await fetch(`${BASE_URL}/api/podcast/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        limit: 5 // Use up to 5 most recent articles
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Success!');
      console.log('Title:', data.podcast.title);
      console.log('Duration:', data.podcast.duration);
      console.log('Word Count:', data.podcast.wordCount);
      console.log('Articles Used:', data.podcast.articlesUsed);
      console.log('Summary:', data.podcast.summary);
      console.log('Topics:', data.podcast.topics.join(', '));
      console.log('\n📝 Script Preview:');
      console.log(data.podcast.script.substring(0, 300) + '...\n');
    } else {
      console.log('❌ Failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testPodcastByInterests() {
  console.log('\n📻 Testing: POST /api/podcast/by-interests');
  console.log('Description: Generate a podcast from articles matching specific interests\n');

  const interests = [
    { type: 'sport', value: 'Gaelic Football', weight: 1.0 },
    { type: 'county', value: 'Donegal', weight: 0.8 }
  ];

  try {
    const response = await fetch(`${BASE_URL}/api/podcast/by-interests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        interests: interests,
        limit: 5
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Success!');
      console.log('Title:', data.podcast.title);
      console.log('Duration:', data.podcast.duration);
      console.log('Word Count:', data.podcast.wordCount);
      console.log('Articles Used:', data.podcast.articlesUsed);
      console.log('Summary:', data.podcast.summary);
      console.log('Topics:', data.podcast.topics.join(', '));
      console.log('Interests:', JSON.stringify(data.interests));
      console.log('\n📝 Script Preview:');
      console.log(data.podcast.script.substring(0, 300) + '...\n');
    } else {
      console.log('❌ Failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function checkArticlesAvailable() {
  console.log('🔍 Checking available articles...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/articles`);
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Found ${data.total} articles available for podcast generation\n`);
      
      if (data.total > 0) {
        console.log('Sample articles:');
        data.articles.slice(0, 3).forEach((article, i) => {
          console.log(`  ${i + 1}. ${article.title} (${article.metadata.sport || 'Unknown sport'})`);
        });
        console.log();
      }
      
      return data.total > 0;
    }
    return false;
  } catch (error) {
    console.error('❌ Error checking articles:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   Podcast API Test Suite                              ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  // Check if server is running and has articles
  const hasArticles = await checkArticlesAvailable();
  
  if (!hasArticles) {
    console.log('⚠️  No articles found! Please analyze some articles first:');
    console.log('   1. Visit http://localhost:3000');
    console.log('   2. Upload and analyze article files');
    console.log('   3. Run this test script again\n');
    return;
  }

  // Test 1: Generate from all articles
  await testPodcastGenerate();

  // Wait a bit between requests
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Generate by interests
  await testPodcastByInterests();

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   Tests Complete!                                      ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  console.log('💡 Usage Examples:');
  console.log('\n1. Generate podcast from all articles:');
  console.log('   curl -X POST http://localhost:3000/api/podcast/generate \\');
  console.log('        -H "Content-Type: application/json" \\');
  console.log('        -d \'{"limit": 10}\'');
  
  console.log('\n2. Generate podcast by interests:');
  console.log('   curl -X POST http://localhost:3000/api/podcast/by-interests \\');
  console.log('        -H "Content-Type: application/json" \\');
  console.log('        -d \'{');
  console.log('              "interests": [');
  console.log('                {"type": "sport", "value": "Hurling", "weight": 1.0},');
  console.log('                {"type": "county", "value": "Cork", "weight": 0.8}');
  console.log('              ],');
  console.log('              "limit": 5');
  console.log('            }\'');
  console.log();
}

// Run the tests
runTests().catch(console.error);
