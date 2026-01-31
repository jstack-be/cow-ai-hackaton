/**
 * Simple example demonstrating podcast generation
 * 
 * This script shows basic usage of the podcast API endpoints
 */

const BASE_URL = 'http://localhost:3000';

// Example 1: Generate a podcast from all available articles
async function example1_generateFromAll() {
  console.log('Example 1: Generate podcast from all articles\n');
  
  const response = await fetch(`${BASE_URL}/api/podcast/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      limit: 5  // Use up to 5 most recent articles
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('✅ Podcast Generated Successfully!\n');
    console.log(`Title: ${data.podcast.title}`);
    console.log(`Duration: ${data.podcast.duration}`);
    console.log(`Word Count: ${data.podcast.wordCount}`);
    console.log(`Articles Used: ${data.podcast.articlesUsed}`);
    console.log(`\nScript:\n${data.podcast.script}\n`);
  } else {
    console.log('❌ Error:', data.error);
  }
}

// Example 2: Generate a podcast for specific interests
async function example2_generateByInterests() {
  console.log('Example 2: Generate podcast for Gaelic Football fans\n');
  
  const response = await fetch(`${BASE_URL}/api/podcast/by-interests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      interests: [
        { type: 'sport', value: 'Gaelic Football', weight: 1.0 }
      ],
      limit: 5
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('✅ Podcast Generated Successfully!\n');
    console.log(`Title: ${data.podcast.title}`);
    console.log(`Duration: ${data.podcast.duration}`);
    console.log(`Topics: ${data.podcast.topics.join(', ')}`);
    console.log(`\nScript:\n${data.podcast.script}\n`);
  } else {
    console.log('❌ Error:', data.error);
  }
}

// Example 3: Generate a county-specific podcast
async function example3_countyPodcast() {
  console.log('Example 3: Generate podcast for Dublin sports\n');
  
  const response = await fetch(`${BASE_URL}/api/podcast/by-interests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      interests: [
        { type: 'county', value: 'Dublin', weight: 1.0 },
        { type: 'sport', value: 'Gaelic Football', weight: 0.8 }
      ],
      limit: 5
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('✅ Podcast Generated Successfully!\n');
    console.log(`Title: ${data.podcast.title}`);
    console.log(`Summary: ${data.podcast.summary}`);
    console.log(`\nFirst 200 characters:\n${data.podcast.script.substring(0, 200)}...\n`);
  } else {
    console.log('❌ Error:', data.error);
  }
}

// Example 4: Save podcast to file
async function example4_savePodcastToFile() {
  console.log('Example 4: Generate and save podcast to file\n');
  
  const response = await fetch(`${BASE_URL}/api/podcast/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit: 5 })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // In Node.js, you can save to a file
    const fs = await import('fs');
    const filename = `podcast-${new Date().toISOString().split('T')[0]}.txt`;
    
    const content = `${data.podcast.title}\n${'='.repeat(data.podcast.title.length)}\n\n${data.podcast.script}`;
    
    fs.writeFileSync(filename, content);
    console.log(`✅ Podcast saved to: ${filename}\n`);
  } else {
    console.log('❌ Error:', data.error);
  }
}

// Run examples
async function runExamples() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   Podcast API Examples                                 ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  // Uncomment the example you want to run:
  
  // await example1_generateFromAll();
  // await example2_generateByInterests();
  // await example3_countyPodcast();
  await example4_savePodcastToFile();
  
  console.log('Done! 🎉');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples().catch(console.error);
}

export { 
  example1_generateFromAll, 
  example2_generateByInterests, 
  example3_countyPodcast,
  example4_savePodcastToFile 
};
