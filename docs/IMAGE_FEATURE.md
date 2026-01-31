# Image Feature Documentation

## Overview
Articles now automatically include sport-related images when retrieved from the API. Images are fetched from Unsplash based on the sport type detected in the article.

## API Changes

### GET /api/articles
Returns all articles with sport-related images.

**Response Format:**
```json
{
  "success": true,
  "articles": [
    {
      "id": "article-uuid",
      "title": "Article Title",
      "metadata": {
        "sport": "korfball",
        "clubs": [...],
        "matches": [...],
        "primaryCounty": "Dublin",
        "leagues": [...]
      },
      "imageUrl": "https://source.unsplash.com/800x600/?korfball,sports",
      "sport": "korfball"
    }
  ],
  "total": 1
}
```

### GET /api/articles/:id
Returns a single article with sport-related image.

**Response Format:**
```json
{
  "success": true,
  "article": {
    "id": "article-uuid",
    "title": "Article Title",
    "metadata": {
      "sport": "korfball",
      "clubs": [...],
      "matches": [...],
      "primaryCounty": "Dublin",
      "leagues": [...]
    },
    "connections": [...],
    "imageUrl": "https://source.unsplash.com/800x600/?korfball,sports",
    "sport": "korfball"
  }
}
```

## How It Works

### 1. Sport Detection
The system detects the sport in multiple ways:

1. **Explicit Sport Field**: If the article metadata includes a `sport` field, it uses that directly
2. **League Inference**: Analyzes league names to infer the sport:
   - GAA-related leagues → "GAA" or "hurling" or "gaelic football"
   - Soccer leagues → "soccer"
   - Rugby leagues → "rugby"
   - Korfball leagues → "korfball"
   - Basketball leagues → "basketball"
   - Tennis leagues → "tennis"
   - Cricket leagues → "cricket"
3. **Club Name Inference**: Examines club names for sport-specific keywords
4. **Default**: Falls back to generic "sports" if no sport can be determined

### 2. Image Service
The `ImageService` class provides the following features:

- **Sport-based Image Retrieval**: Fetches images from Unsplash based on sport type
- **Caching**: Caches image URLs to avoid repeated API calls for the same sport
- **Fallback**: Provides a default sports image if sport detection fails
- **Free API**: Uses Unsplash Source API (no authentication required)

### 3. Updated Metadata Schema
The article metadata schema now includes an optional `sport` field:

```javascript
{
  sport: "korfball",  // NEW: Specific sport type
  clubs: [...],
  matches: [...],
  primaryCounty: "Dublin",
  leagues: [...]
}
```

## Image Source
Images are provided by **Unsplash** (https://unsplash.com), a free high-quality image service.

**Image URL Format:**
```
https://source.unsplash.com/800x600/?{sport},sports
```

Example for korfball:
```
https://source.unsplash.com/800x600/?korfball,sports
```

## Performance Considerations

1. **Caching**: The `ImageService` caches image URLs per sport to minimize external API calls
2. **Parallel Processing**: When fetching multiple articles, images are retrieved in parallel using `Promise.all()`
3. **Async Operations**: Image fetching is asynchronous and won't block article retrieval

## Customization

### Using a Different Image Service
To use a different image service, modify the `ImageService` class in `src/services/image-service.js`:

```javascript
async getImageForSport(sport) {
  // Replace with your preferred image service API
  const imageUrl = `https://your-image-service.com/api?q=${encodeURIComponent(sport)}`;
  return imageUrl;
}
```

### Adjusting Sport Detection Logic
To customize how sports are detected from metadata, modify the `inferSportFromMetadata` method in `src/services/image-service.js`.

### Adding New Sports
Add new sport detection rules in the `inferSportFromMetadata` method:

```javascript
if (league.includes('hockey')) {
  return 'hockey';
}
```

## Example Usage

### Fetching Articles with Images
```bash
# Get all articles
curl http://localhost:3000/api/articles

# Get specific article
curl http://localhost:3000/api/articles/{article-id}
```

### Displaying Images in Frontend
```javascript
// React example
articles.map(article => (
  <div key={article.id}>
    <img src={article.imageUrl} alt={article.sport} />
    <h2>{article.title}</h2>
  </div>
))
```

## Troubleshooting

### Images Not Loading
1. Check network connectivity to Unsplash
2. Verify the sport is being correctly detected (check the `sport` field in response)
3. Check browser console for CORS issues

### Wrong Images
1. The image service returns random images matching the search term
2. To get more consistent results, consider using Unsplash's official API with specific photo IDs
3. You can enhance sport detection by improving the `inferSportFromMetadata` logic

## Future Enhancements

Possible improvements:
1. Use Unsplash's official API for better image selection
2. Add image caching to a database for consistency
3. Allow users to upload custom images for articles
4. Support multiple images per article
5. Add image size variants (thumbnail, medium, large)
