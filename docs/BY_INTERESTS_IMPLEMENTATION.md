# By-Interests API Implementation Summary

## Overview

A new API endpoint has been implemented that allows filtering articles based on a list of interests. Each interest has a type, value, and optional weight.

## What Was Implemented

### 1. New API Endpoint

**Endpoint**: `POST /api/articles/by-interests`

**Location**: [src/api/routes/articles.js](../src/api/routes/articles.js#L256-L361)

### 2. Features

- ✅ Accepts a list of interests with type, value, and weight
- ✅ Supports four interest types:
  - `sport` - Filters by sport (e.g., "GAA", "soccer", "rugby")
  - `club` - Filters by club name (partial matching)
  - `county` - Filters by primary county (exact matching)
  - `league` - Filters by league/competition (partial matching)
- ✅ Uses OR logic (article matches if ANY interest matches)
- ✅ Case-insensitive matching
- ✅ Returns articles with images
- ✅ Comprehensive input validation
- ✅ Deduplicates results (each article appears only once)

### 3. Request Format

```json
{
  "interests": [
    { "type": "sport", "value": "GAA", "weight": 1.0 },
    { "type": "county", "value": "Dublin", "weight": 0.8 }
  ]
}
```

### 4. Response Format

```json
{
  "success": true,
  "articles": [
    {
      "id": "article-uuid",
      "title": "Article Title",
      "metadata": { ... },
      "imageUrl": "https://...",
      "sport": "GAA"
    }
  ],
  "total": 3,
  "interests": [ ... ]
}
```

## Files Modified

### 1. Routes File
**File**: [src/api/routes/articles.js](../src/api/routes/articles.js)
- Added new `POST /api/articles/by-interests` endpoint
- Implements filtering logic for all four interest types
- Includes comprehensive validation

### 2. Server Documentation
**File**: [src/api/server.js](../src/api/server.js)
- Updated API documentation endpoint to include new route

### 3. Main Index File
**File**: [src/index.js](../src/index.js)
- Updated startup message to show new endpoint

### 4. README
**File**: [README.md](../README.md)
- Added documentation for the new endpoint
- Included example usage

## Files Created

### 1. Detailed API Documentation
**File**: [docs/BY_INTERESTS_API.md](../docs/BY_INTERESTS_API.md)
- Comprehensive documentation with examples
- Multiple use cases (curl, PowerShell, Node.js)
- Error handling documentation
- Matching logic explanation

### 2. Test Script
**File**: [test-by-interests.js](../test-by-interests.js)
- Automated test script with 5 test cases
- Demonstrates various filtering scenarios
- Can be run with: `node test-by-interests.js`

## Implementation Details

### Filtering Logic

The endpoint filters articles based on metadata:

1. **Sport Matching** (exact):
   ```javascript
   article.metadata?.sport?.toLowerCase().trim() === interestValue
   ```

2. **Club Matching** (partial):
   ```javascript
   article.metadata?.clubs?.some(club => 
     club.name.toLowerCase().trim().includes(interestValue)
   )
   ```

3. **County Matching** (exact):
   ```javascript
   article.metadata?.primaryCounty?.toLowerCase().trim() === interestValue
   ```

4. **League Matching** (partial):
   ```javascript
   article.metadata?.leagues?.some(league => 
     league.toLowerCase().trim().includes(interestValue)
   )
   ```

### Validation

The endpoint validates:
- ✅ Interests array exists and is not empty
- ✅ Each interest has required `type` and `value` fields
- ✅ Interest type is one of: sport, club, county, league

## Weight Parameter

The `weight` parameter is currently **accepted but not used** in filtering. This is by design, as requested. Future enhancements could use weights to:
- Order results by relevance
- Calculate weighted scores
- Prioritize certain interests over others

## Usage Examples

### Example 1: Filter by Sport
```bash
curl -X POST http://localhost:3000/api/articles/by-interests \
  -H "Content-Type: application/json" \
  -d '{"interests":[{"type":"sport","value":"GAA","weight":1.0}]}'
```

### Example 2: Multiple Interests
```bash
curl -X POST http://localhost:3000/api/articles/by-interests \
  -H "Content-Type: application/json" \
  -d '{
    "interests": [
      {"type":"sport","value":"GAA","weight":1.0},
      {"type":"county","value":"Dublin","weight":0.8}
    ]
  }'
```

## Testing

To test the implementation:

1. Start the server:
   ```bash
   npm start
   ```

2. Run the test script:
   ```bash
   node test-by-interests.js
   ```

3. Or use curl/Postman with the examples in the documentation

## Error Handling

The endpoint returns appropriate error responses:

- **400 Bad Request**: Missing or invalid interests
- **400 Bad Request**: Invalid interest structure
- **400 Bad Request**: Invalid interest type
- **500 Internal Server Error**: Server-side errors

## Integration with Existing System

The new endpoint:
- ✅ Uses existing `graphService.getAllArticles()` method
- ✅ Uses existing `imageService` for article images
- ✅ Returns same article format as other endpoints
- ✅ Follows existing error handling patterns
- ✅ Integrates seamlessly with the current architecture

## Future Enhancements

Potential improvements:
1. Use weight values to calculate relevance scores
2. Support pagination for large result sets
3. Add sorting options (by date, title, relevance)
4. Support AND logic in addition to OR
5. Add caching for frequently used interest combinations
6. Support regex patterns in values
