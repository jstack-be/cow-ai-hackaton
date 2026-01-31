/**
 * Test script for the by-interests API endpoint
 * Run with: node test-by-interests.js
 */

const API_URL = 'http://localhost:3000/api/articles/by-interests';

async function testByInterests() {
  console.log('🧪 Testing /api/articles/by-interests endpoint\n');

  const testCases = [
    {
      name: 'Test 1: Filter by Sport (GAA)',
      body: {
        interests: [
          { type: 'sport', value: 'GAA', weight: 1.0 }
        ]
      }
    },
    {
      name: 'Test 2: Multiple Interests (GAA + Dublin)',
      body: {
        interests: [
          { type: 'sport', value: 'GAA', weight: 1.0 },
          { type: 'county', value: 'Dublin', weight: 0.8 }
        ]
      }
    },
    {
      name: 'Test 3: Club Filter',
      body: {
        interests: [
          { type: 'club', value: 'Rovers', weight: 1.0 }
        ]
      }
    },
    {
      name: 'Test 4: League Filter',
      body: {
        interests: [
          { type: 'league', value: 'All-Ireland', weight: 1.0 }
        ]
      }
    },
    {
      name: 'Test 5: Multiple Sports',
      body: {
        interests: [
          { type: 'sport', value: 'soccer', weight: 1.0 },
          { type: 'sport', value: 'rugby', weight: 0.9 }
        ]
      }
    }
  ];

  for (const test of testCases) {
    console.log(`\n📋 ${test.name}`);
    console.log('Request:', JSON.stringify(test.body, null, 2));

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(test.body)
      });

      const data = await response.json();

      if (data.success) {
        console.log(`✅ Success! Found ${data.total} articles`);
        if (data.total > 0) {
          console.log('Articles:');
          data.articles.forEach((article, i) => {
            console.log(`  ${i + 1}. ${article.title}`);
            console.log(`     Sport: ${article.sport}`);
            console.log(`     County: ${article.metadata?.primaryCounty || 'N/A'}`);
          });
        }
      } else {
        console.log(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }
  }

  console.log('\n\n🎉 Testing complete!');
}

// Run the tests
testByInterests().catch(console.error);
