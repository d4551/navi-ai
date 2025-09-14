# Gaming Studio Data Sources Research

## Available APIs and Data Sources

### 1. Steam API
- **Steam Web API**: Provides game and developer information
- **Endpoint**: `https://api.steampowered.com/`
- **Key endpoints**:
  - `/ISteamApps/GetAppList/v0002/` - Get all Steam apps
  - `/ISteamUser/GetPlayerSummaries/v0002/` - Player profiles
  - **Store API**: `https://store.steampowered.com/api/appdetails?appids={id}`
- **Data available**: Game details, publisher/developer info, release dates, genres, tags
- **Rate limits**: 100,000 requests per day per API key
- **Authentication**: Steam Web API key required

### 2. IGDB API (Internet Game Database)
- **Endpoint**: `https://api.igdb.com/v4/`
- **Data**: Comprehensive game database with company information
- **Authentication**: Twitch Client ID + Bearer token
- **Rate limits**: 4 requests per second
- **Coverage**: 200,000+ games, company profiles

### 3. Giant Bomb API
- **Endpoint**: `https://www.giantbomb.com/api/`
- **Data**: Game reviews, company profiles, franchise information
- **Authentication**: API key
- **Rate limits**: 1 request per second
- **Coverage**: Detailed editorial content

### 4. MobyGames API
- **Endpoint**: `https://api.mobygames.com/v1/`
- **Data**: Historical game database, company information
- **Authentication**: API key
- **Coverage**: Retro and modern games, detailed company histories

### 5. Epic Games Store API
- **Limited public API for game listings**
- **GraphQL endpoint**: `https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions`
- **Data**: Free games, basic store information

### 6. Scraping Sources (with respect to robots.txt)
- **Crunchbase**: Company information, funding data
- **LinkedIn**: Company profiles, employee counts
- **Glassdoor**: Company reviews and salary information
- **AngelList**: Startup information and funding

## Data Fields Available

### Steam Store API Response Structure
```json
{
  "success": true,
  "data": {
    "name": "Game Name",
    "developers": ["Studio Name"],
    "publishers": ["Publisher Name"],
    "release_date": {"date": "2023-01-01"},
    "genres": [{"description": "Action"}],
    "categories": [{"description": "Single-player"}],
    "short_description": "Game description"
  }
}
```

### IGDB Company Data
```json
{
  "id": 123,
  "name": "Company Name",
  "description": "Company description",
  "country": 123,
  "start_date": 946684800,
  "websites": [{"url": "https://example.com"}],
  "logo": {"url": "logo.jpg"}
}
```

## Recommended Implementation Strategy

1. **Primary Sources**: Steam API + IGDB API for comprehensive coverage
2. **Secondary Sources**: MobyGames for historical data, Giant Bomb for editorial content
3. **Enrichment**: Crunchbase/LinkedIn scraping for business data
4. **Update Frequency**: Daily for new games, weekly for company updates
5. **Conflict Resolution**: Source priority system with manual review queue

## Rate Limiting Strategy
- Steam: 100k/day = ~1.16 requests/second sustained
- IGDB: 4 requests/second with burst handling
- Implement exponential backoff and request queuing
- Cache responses for 24 hours minimum

## Data Quality Considerations
- Name normalization (Inc., LLC, Studios vs Studio)
- Address standardization
- Duplicate detection across sources
- Confidence scoring for merged data