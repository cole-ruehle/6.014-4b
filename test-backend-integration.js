// Test script to verify backend integration
// Run this with: node test-backend-integration.js

const API_BASE_URL = 'http://localhost:8000/api/HikingApp'

async function testBackendIntegration() {
  console.log('🧪 Testing Backend Integration...')
  console.log('📍 Backend URL:', API_BASE_URL)
  
  const tests = [
    {
      name: 'Search Suggestions',
      endpoint: '/getSearchSuggestions',
      method: 'POST',
      body: { query: 'Yosemite', limit: 5 }
    },
    {
      name: 'Search Locations',
      endpoint: '/searchLocations',
      method: 'POST',
      body: { 
        query: 'Yosemite',
        options: {
          types: ['trailhead', 'trail'],
          limit: 10
        }
      }
    },
    {
      name: 'Calculate Route',
      endpoint: '/calculateRoute',
      method: 'POST',
      body: {
        origin: { lat: 37.7749, lon: -122.4194, address: 'San Francisco, CA' },
        destination: { lat: 37.7489, lon: -119.5890, address: 'Yosemite Valley, CA' },
        mode: 'hiking',
        preferences: { difficulty: 'moderate' }
      }
    },
    {
      name: 'Recent Searches',
      endpoint: '/getRecentSearches',
      method: 'POST',
      body: { limit: 10 }
    }
  ]
  
  for (const test of tests) {
    try {
      console.log(`\n🔍 Testing ${test.name}...`)
      
      const response = await fetch(`${API_BASE_URL}${test.endpoint}`, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(test.body)
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ ${test.name}: SUCCESS`)
        console.log(`   Response:`, JSON.stringify(data, null, 2).substring(0, 200) + '...')
      } else {
        console.log(`❌ ${test.name}: FAILED`)
        console.log(`   Status: ${response.status} ${response.statusText}`)
        const errorText = await response.text()
        console.log(`   Error:`, errorText.substring(0, 200))
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR`)
      console.log(`   Error:`, error.message)
    }
  }
  
  console.log('\n🏁 Backend integration test completed!')
}

// Run the test
testBackendIntegration().catch(console.error)
