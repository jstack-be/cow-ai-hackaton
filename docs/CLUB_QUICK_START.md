# Club Profile Feature - Quick Start Guide

## Quick Test

Here's a quick way to test the club profile feature:

### 1. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000` (or `http://localhost:3001` if port 3000 is in use).

### 2. Create a Test Club Profile

Using PowerShell:

```powershell
$clubData = @{
    name = "Dublin GAA"
    county = "Dublin"
    league = "All-Ireland Senior Championship"
    description = "Dublin's senior Gaelic football team"
    website = "https://www.dublingaa.ie"
    socials = @{
        twitter = "@DubGAAOfficial"
        facebook = "DublinGAA"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/clubs" `
    -Method POST `
    -ContentType "application/json" `
    -Body $clubData
```

Using curl (Git Bash or WSL):

```bash
curl -X POST http://localhost:3000/api/clubs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dublin GAA",
    "county": "Dublin",
    "league": "All-Ireland Senior Championship",
    "description": "Dublin senior Gaelic football team",
    "website": "https://www.dublingaa.ie",
    "socials": {
      "twitter": "@DubGAAOfficial",
      "facebook": "DublinGAA"
    }
  }'
```

Save the returned `id` for the next steps!

### 3. Analyze an Article that Mentions the Club

You can use one of the sample articles in `data/sample-articles/` or create your own.

Using PowerShell:

```powershell
$form = @{
    file = Get-Item "data\sample-articles\article1.txt"
    title = "Dublin GAA Championship Match"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/articles/analyze" `
    -Method POST `
    -Form $form
```

Using curl:

```bash
curl -X POST http://localhost:3000/api/articles/analyze \
  -F "file=@data/sample-articles/article1.txt" \
  -F "title=Dublin GAA Championship Match"
```

### 4. View the Club Profile with Recent Articles

Replace `{CLUB_ID}` with the ID from step 2.

Using PowerShell:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/clubs/{CLUB_ID}?includeArticles=true"
```

Using curl:

```bash
curl "http://localhost:3000/api/clubs/{CLUB_ID}?includeArticles=true"
```

You should see the club profile with the article you just analyzed linked to it!

### 5. Get All Clubs

Using PowerShell:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/clubs"
```

Using curl:

```bash
curl "http://localhost:3000/api/clubs"
```

### 6. Search Clubs by County

Using PowerShell:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/clubs?county=Dublin"
```

Using curl:

```bash
curl "http://localhost:3000/api/clubs?county=Dublin"
```

### 7. Update Club Socials

Using PowerShell:

```powershell
$updateData = @{
    socials = @{
        twitter = "@DubGAAOfficial"
        facebook = "DublinGAA"
        instagram = "@dublangaa"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/clubs/{CLUB_ID}" `
    -Method PUT `
    -ContentType "application/json" `
    -Body $updateData
```

Using curl:

```bash
curl -X PUT http://localhost:3000/api/clubs/{CLUB_ID} \
  -H "Content-Type: application/json" \
  -d '{
    "socials": {
      "twitter": "@DubGAAOfficial",
      "facebook": "DublinGAA",
      "instagram": "@dublangaa"
    }
  }'
```

## Expected Workflow

1. **Create club profiles** for all the local sports clubs you want to track
2. **Analyze articles** as you normally would
3. **Articles are automatically linked** to club profiles when clubs are mentioned
4. **View club profiles** to see the 5 most recent articles about each club
5. **Update club information** (website, socials) as needed

## Testing the Automatic Linking

To verify automatic linking works:

1. Create a club profile with name "Dublin GAA"
2. Analyze an article that mentions "Dublin GAA" in the content
3. Check the club profile - the article should appear in `articleReferences`
4. Use `GET /api/clubs/{id}?includeArticles=true` to see the full article details

The system matches club names case-insensitively, so "Dublin GAA", "dublin gaa", and "DUBLIN GAA" will all match the same club profile.

## Common Use Cases

### Use Case 1: Local Sports News Website

Create profiles for all local clubs, then analyze news articles. Visitors can:
- Browse all clubs in their county
- View a club's profile page with recent news
- See which clubs are most active (most articles)

### Use Case 2: Club Management

Create a profile for your own club:
- Store official website and social media links
- Track all news articles mentioning the club
- Share the profile page with members

### Use Case 3: Sports Analytics

Analyze articles to:
- Track which clubs get the most media coverage
- See relationships between clubs (via shared articles)
- Identify trending clubs in specific leagues or counties
