// Test script to verify the calculateRoute fix
import { calculateRoute } from './src/api/api-spec.js'

async function testCalculateRoute() {
  console.log('🧪 Testing calculateRoute with string inputs...')
  
  try {
    // Test with string addresses (what the frontend was sending before)
    const result = await calculateRoute(
      'Boston, MA',  // String origin
      'Blue Hills Reservation, Milton, MA',  // String destination
      'hiking',
      { difficulty: 'moderate' }
    )
    
    console.log('✅ calculateRoute test passed!')
    console.log('Result:', result)
    
  } catch (error) {
    console.error('❌ calculateRoute test failed:', error.message)
    console.error('Full error:', error)
  }
}

// Run the test
testCalculateRoute()
