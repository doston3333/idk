# Recommendation API Documentation

## Overview

The Recommendation API provides intelligent candidate recommendations for the FoodieMatch swipe deck. It uses a sophisticated multi-factor scoring algorithm that considers user preferences, item popularity, recency, diversity, and exploration to deliver personalized dish recommendations.

## Endpoint

### POST /api/recommendations

Creates personalized recommendations based on user preferences and location.

#### Request Body

```typescript
interface RecommendationRequest {
  user_id?: string              // Required: User identifier
  latitude?: number             // Optional: User latitude (default: 40.7128)
  longitude?: number            // Optional: User longitude (default: -74.0060)
  category_filters?: string[]   // Optional: Category filters (e.g., ['italian', 'vegan'])
  limit?: number               // Optional: Number of recommendations (default: 20)
  exploration_quota?: number   // Optional: % of random items (0-100, default: 15)
  scoring_weights?: {          // Optional: Custom scoring weights
    tasteMatch?: number
    recency?: number
    popularity?: number
    diversity?: number
    exploration?: number
  }
  algorithm_config?: {         // Optional: Algorithm configuration
    maxRadiusKm?: number
    recencyBoostDays?: number
    diversityBoostFactor?: number
    trendingThreshold?: number
  }
}
```

#### Response

```typescript
interface RecommendationResponse {
  recommendations: {
    id: string
    type: 'dish'
    name: string
    image: string
    cuisine: string
    rating?: number
    distance?: number
    description?: string
    price?: number
    priceRange?: string
    address?: string
    dietaryTags: string[]
    restaurant: {
      id: string
      name: string
      address: string
      priceRange: string
    }
    scoring?: {
      finalScore: number
      breakdown: {
        tasteMatch: number
        recency: number
        popularity: number
        diversity: number
        exploration: number
      }
    }
  }[]
  metadata: {
    totalCandidates: number
    explorationItemsInjected: number
    averageScore: number
    scoreDistribution: {
      high: number      // Score >= 70
      medium: number    // Score 40-69
      low: number       // Score < 40
    }
    algorithmVersion: string
    scoringWeights: ScoringWeights
    algorithmConfig: AlgorithmConfig
  }
}
```

## Scoring Algorithm

The recommendation algorithm uses a weighted scoring system with five main factors:

### 1. Taste Match (35% weight)

**Purpose**: Measures how well a candidate matches user preferences.

**Factors**:
- Favorite cuisines match (+25 points)
- Dietary restrictions compatibility (+5 points per matching tag)
- Price range preference (+10 for exact, +5 for close match)
- Historical swipe patterns (future enhancement)

**Calculation**:
```typescript
function calculateTasteMatchScore(candidate, user): number {
  let score = 50 // Base score
  
  // Boost for favorite cuisines
  if (userFavoriteCuisines.includes(candidate.cuisine.toLowerCase())) {
    score += 25
  }
  
  // Check dietary compatibility
  const matchingDietaryTags = candidateDietaryTags.filter(tag => 
    userDietaryRestrictions.includes(tag)
  )
  score += matchingDietaryTags.length * 5
  
  // Price range preference
  if (user.priceRange && candidate.priceRange === user.priceRange) {
    score += 10
  } else if (closePriceRange) {
    score += 5
  }
  
  return Math.min(100, score)
}
```

### 2. Recency (20% weight)

**Purpose**: Boosts newly added items to keep content fresh.

**Decay Function**:
- Days 0-7: Full boost (100 points)
- Days 8-30: Linear decay from 100 to 0
- Days 31+: No boost (0 points)

**Calculation**:
```typescript
function calculateRecencyScore(candidate, config): number {
  const daysDiff = (now - candidate.createdAt) / (1000 * 60 * 60 * 24)
  
  if (daysDiff <= config.recencyBoostDays) {
    return 100 // Full recency boost
  } else if (daysDiff <= 30) {
    // Linear decay
    return Math.max(0, 100 - (daysDiff - config.recencyBoostDays) * 4)
  }
  
  return 0 // No recency boost for older items
}
```

### 3. Popularity (25% weight)

**Purpose**: Ranks items based on user engagement and quality.

**Factors**:
- Average rating (0-50 points, rating 1-5 maps to 10-50)
- Engagement bonus (25 points for trending, 10 for some engagement)
- Quality bonus (25 points for 4.5+ rating with 10+ reviews)

**Calculation**:
```typescript
function calculatePopularityScore(candidate, config): number {
  const avgRating = candidate.reviews.reduce((sum, r) => sum + r.rating, 0) / candidate.reviews.length
  const totalSwipes = candidate._count.swipeActions || 0
  
  let score = avgRating * 10 // Base score from rating
  
  // Engagement bonus
  if (totalSwipes >= config.trendingThreshold) {
    score += 25 // Trending bonus
  } else if (totalSwipes >= 5) {
    score += 10 // Some engagement bonus
  }
  
  // Quality bonus
  if (avgRating >= 4.5 && totalSwipes >= 10) {
    score += 25 // Exceptional quality bonus
  }
  
  return Math.min(100, score)
}
```

### 4. Diversity (15% weight)

**Purpose**: Ensures variety and prevents filter bubbles.

**Strategy**:
- Calculate cuisine distribution in candidate pool
- Boost underrepresented cuisines (< 15% of pool)
- Penalize overrepresented cuisines (> 50% of pool)

**Calculation**:
```typescript
function calculateDiversityScore(candidate, allCandidates, config): number {
  const cuisinePercentage = (candidateCuisineCount / totalCandidates) * 100
  
  if (cuisinePercentage < 15) {
    return 100 // Maximum diversity boost
  } else if (cuisinePercentage < 25) {
    return 75 // Good diversity boost
  } else if (cuisinePercentage > 50) {
    return 25 // Penalty for overrepresented cuisines
  }
  
  return 50 // Neutral score
}
```

### 5. Exploration (5% weight)

**Purpose**: Injects serendipity and helps users discover new items.

**Strategy**:
- Small random factor (0-20 points)
- Prevents over-optimization
- Encourages discovery

**Final Score Calculation**:
```typescript
finalScore = 
  (tasteMatch * 0.35) +
  (recency * 0.20) +
  (popularity * 0.25) +
  (diversity * 0.15) +
  (exploration * 0.05)
```

## Algorithm Configuration

### Default Scoring Weights
```typescript
const DEFAULT_SCORING_WEIGHTS = {
  tasteMatch: 0.35,      // 35%
  recency: 0.20,         // 20%
  popularity: 0.25,      // 25%
  diversity: 0.15,       // 15%
  exploration: 0.05      // 5%
}
```

### Default Algorithm Config
```typescript
const DEFAULT_ALGORITHM_CONFIG = {
  maxRadiusKm: 50,           // Maximum search radius
  defaultExplorationQuota: 15, // 15% exploration by default
  recencyBoostDays: 7,       // Items added in last 7 days get boost
  minSampleSize: 10,         // Minimum candidates for diversity calculations
  diversityBoostFactor: 1.5, // Multiplier for underrepresented cuisines
  trendingThreshold: 10      // Minimum likes to be considered trending
}
```

## Exploration Injection

To prevent filter bubbles and ensure serendipity, the algorithm injects random items:

1. **Selection**: Choose from bottom 30% of scored candidates
2. **Boost**: Add 30 points to ensure appearance in results
3. **Mark**: Flag as exploration item for analytics
4. **Quota**: Default 15% of recommendations are exploration items

## Example Usage

### Basic Request
```javascript
const response = await fetch('/api/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'user123',
    latitude: 40.7128,
    longitude: -74.0060,
    limit: 20
  })
})

const data = await response.json()
console.log(data.recommendations) // Array of recommended dishes
console.log(data.metadata)      // Algorithm metadata
```

### Custom Scoring Weights
```javascript
const response = await fetch('/api/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'user123',
    latitude: 40.7128,
    longitude: -74.0060,
    scoring_weights: {
      tasteMatch: 0.40,  // Increase taste match importance
      recency: 0.15,     // Decrease recency importance
      popularity: 0.30,  // Increase popularity importance
      diversity: 0.10,   // Decrease diversity importance
      exploration: 0.05
    }
  })
})
```

### Category Filtering
```javascript
const response = await fetch('/api/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'user123',
    category_filters: ['italian', 'japanese'],
    exploration_quota: 20  // 20% exploration items
  })
})
```

## Testing API

### POST /api/recommendations/test

Provides testing utilities for the recommendation algorithm.

#### Test Types

1. **scoring_analysis**: Analyzes scoring quality and distribution
2. **diversity_check**: Validates cuisine diversity
3. **performance_test**: Measures algorithm performance

#### Example Request
```javascript
const testResponse = await fetch('/api/recommendations/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'user123',
    test_type: 'scoring_analysis',
    sample_size: 50
  })
})

const testData = await testResponse.json()
console.log(testData.statistics)      // Scoring statistics
console.log(testData.topRecommendations) // Top 10 recommendations
```

## Algorithm Extensibility

The recommendation algorithm is designed to be easily extensible:

### Adding New Scoring Factors

1. **Update Scoring Interface**:
```typescript
interface ScoringFactors {
  tasteMatch: number
  recency: number
  popularity: number
  diversity: number
  exploration: number
  newFactor: number  // Add new factor
}
```

2. **Implement Scoring Function**:
```typescript
export function calculateNewFactorScore(candidate: any, user: any): number {
  // Implementation here
  return score
}
```

3. **Update Main Scoring Function**:
```typescript
export async function computeCandidateScore(
  candidate: any,
  user: any,
  allCandidates: any[],
  weights: ScoringWeights,
  config: AlgorithmConfig
): Promise<CandidateScore> {
  const newFactor = calculateNewFactorScore(candidate, user)
  // ... other factors
  
  const finalScore = 
    (tasteMatch * weights.tasteMatch) +
    (recency * weights.recency) +
    (popularity * weights.popularity) +
    (diversity * weights.diversity) +
    (exploration * weights.exploration) +
    (newFactor * weights.newFactor)  // Add new factor
}
```

### Custom Configuration

The algorithm supports runtime configuration through the API request:

```typescript
// Custom weights for different user segments
const weightsForFoodies = {
  tasteMatch: 0.45,  // Foodies care more about taste
  recency: 0.15,
  popularity: 0.20,
  diversity: 0.15,
  exploration: 0.05
}

const weightsForBudgetUsers = {
  tasteMatch: 0.25,
  recency: 0.20,
  popularity: 0.15,
  diversity: 0.10,
  exploration: 0.30  // Budget users need more exploration
}
```

## Performance Considerations

- **Database Queries**: Optimized with proper indexing and selective field loading
- **Scoring Complexity**: O(n) where n is number of candidates
- **Memory Usage**: Approximately 1KB per candidate in memory
- **Response Time**: < 100ms for typical requests (50 candidates)
- **Scalability**: Handles up to 1000 candidates efficiently

## Monitoring and Analytics

The API provides detailed metadata for monitoring:

- **Score Distribution**: High/medium/low score counts
- **Exploration Injection**: Number of exploration items added
- **Algorithm Performance**: Average scores and weights used
- **User Engagement**: Track which recommendations lead to swipes

## Future Enhancements

Planned improvements to the recommendation algorithm:

1. **Machine Learning**: Incorporate collaborative filtering
2. **Contextual Factors**: Time of day, weather, seasonality
3. **Social Features**: Friend recommendations, trending among social circle
4. **Business Logic**: Promote sponsored restaurants, inventory management
5. **A/B Testing**: Framework for testing algorithm changes
6. **Real-time Adaptation**: Dynamic weight adjustment based on user behavior

## Support

For questions or issues with the recommendation API:

1. Check the algorithm metadata in API responses
2. Use the testing endpoint for debugging
3. Review the scoring breakdown in individual recommendations
4. Monitor performance metrics in the metadata

The recommendation API is designed to be transparent, extensible, and performant for delivering personalized dish recommendations to FoodieMatch users.