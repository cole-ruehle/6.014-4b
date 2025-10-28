<template>
  <div class="route-search">
    <div class="search-form">
      <!-- Basic Search Section -->
      <div class="search-section">
        <div class="section-header">
          <h3>Plan Your Hike</h3>
          <p class="section-description">Enter your starting location and preferred duration</p>
        </div>
        
        <div class="input-row">
          <div class="input-group">
            <label for="start-location">Starting Location</label>
            <div class="location-input-container">
              <input
                id="start-location"
                v-model="searchParams.startLocation"
                type="text"
                placeholder="Enter starting location"
                class="location-input"
                @input="handleLocationInput"
                @focus="showSuggestions = true"
                @blur="hideSuggestions"
              />
              <span class="location-icon">📍</span>
              
              <!-- Search Suggestions Dropdown -->
              <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-dropdown">
                <div 
                  v-for="(suggestion, index) in suggestions" 
                  :key="index"
                  class="suggestion-item"
                  @click="selectSuggestion(suggestion)"
                >
                  <span class="suggestion-icon">{{ getSuggestionIcon(suggestion.type) }}</span>
                  <span class="suggestion-text">{{ suggestion.text }}</span>
                  <span class="suggestion-type">{{ suggestion.type }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="input-group">
            <label for="duration">Duration</label>
            <select
              id="duration"
              v-model="searchParams.duration"
              class="duration-select"
            >
              <option value="1">1hr</option>
              <option value="2">2hr</option>
              <option value="3">3hr</option>
              <option value="4">4hr</option>
              <option value="5">5hr</option>
              <option value="6">6hr</option>
            </select>
          </div>
        </div>
        
        <div class="input-group full-width">
          <label for="hiking-trail">(Optional) Specific Trail</label>
          <input
            id="hiking-trail"
            v-model="searchParams.hikingTrail"
            type="text"
            placeholder="Enter specific trail name"
            class="trail-input"
          />
        </div>
      </div>
      
      <!-- Advanced Options Toggle -->
      <div class="advanced-toggle">
        <button 
          @click="toggleAdvanced" 
          class="advanced-toggle-btn"
          :class="{ active: showAdvanced }"
        >
          <span class="toggle-icon">{{ showAdvanced ? '−' : '+' }}</span>
          {{ showAdvanced ? 'Hide' : 'Show' }} Advanced Options
        </button>
      </div>
      
      <!-- Advanced Route Planning Options -->
      <div v-if="showAdvanced" class="advanced-options">
        <div class="advanced-header">
          <h4>Advanced Route Planning</h4>
          <p class="advanced-description">Customize your route with detailed preferences and options</p>
        </div>
        
        <!-- Destination Input -->
        <div class="input-group full-width">
          <label for="destination">Destination (Optional - will find nearest hiking location)</label>
          <div class="location-input-container">
            <input
              id="destination"
              v-model="advancedParams.destination"
              type="text"
              placeholder="Enter destination or leave blank to find nearest hiking location"
              class="location-input"
              @input="handleDestinationInput"
              @focus="showDestinationSuggestions = true"
              @blur="hideDestinationSuggestions"
            />
            <span class="location-icon">🏁</span>
            
            <div v-if="showDestinationSuggestions && destinationSuggestions.length > 0" class="suggestions-dropdown">
              <div 
                v-for="(suggestion, index) in destinationSuggestions" 
                :key="index"
                class="suggestion-item"
                @click="selectDestinationSuggestion(suggestion)"
              >
                <span class="suggestion-icon">{{ getSuggestionIcon(suggestion.type) }}</span>
                <span class="suggestion-text">{{ suggestion.text }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Route Preferences -->
        <div class="preferences-section">
          <h5>Route Preferences</h5>
          <div class="preferences-grid">
            <div class="preference-group">
              <label for="difficulty">Difficulty Level</label>
              <select id="difficulty" v-model="advancedParams.preferences.difficulty" class="preference-select">
                <option value="">Any</option>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div class="preference-group">
              <label for="preferTrails">Prefer Trails</label>
              <input 
                id="preferTrails" 
                type="checkbox" 
                v-model="advancedParams.preferences.preferTrails"
                class="preference-checkbox"
              />
            </div>
            
            <div class="preference-group">
              <label for="avoidRoads">Avoid Roads</label>
              <input 
                id="avoidRoads" 
                type="checkbox" 
                v-model="advancedParams.preferences.avoidRoads"
                class="preference-checkbox"
              />
            </div>
            
            <div class="preference-group">
              <label for="maxDistance">Max Distance (km)</label>
              <input 
                id="maxDistance" 
                type="number" 
                v-model="advancedParams.preferences.maxDistance"
                min="1"
                max="50"
                class="preference-input"
              />
            </div>
          </div>
        </div>
        
        <!-- Route Type -->
        <div class="route-options">
          <h5>Route Type</h5>
          <div class="options-grid">
            <div class="option-group">
              <label>
                <input 
                  type="radio" 
                  v-model="advancedParams.routeType" 
                  value="hiking"
                  class="option-radio"
                />
                Hiking Route
              </label>
            </div>
            
            <div class="option-group">
              <label>
                <input 
                  type="radio" 
                  v-model="advancedParams.routeType" 
                  value="multimodal"
                  class="option-radio"
                />
                Multi-Modal (Transit + Hiking)
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="action-buttons">
        <button 
          @click="handleSearch" 
          class="search-button"
          :disabled="loading"
        >
          {{ loading ? 'Searching...' : 'Find Routes' }}
        </button>
        
        <button 
          v-if="showAdvanced && canCalculateAdvanced" 
          @click="calculateAdvancedRoute" 
          class="calculate-btn"
          :disabled="calculating"
        >
          {{ calculating ? 'Calculating...' : 'Calculate Route' }}
        </button>
        
        <button 
          v-if="showAdvanced && canCalculateAdvanced" 
          @click="getAlternatives" 
          class="alternatives-btn"
          :disabled="calculating"
        >
          Find Alternatives
        </button>
      </div>
      
      <!-- Route Results -->
      <div v-if="routeResults.length > 0" class="route-results">
        <h4>Route Options</h4>
        <div class="results-list">
          <div 
            v-for="(route, index) in routeResults" 
            :key="index"
            class="route-option"
            :class="{ selected: selectedRouteIndex === index }"
            @click="selectRoute(index)"
          >
            <div class="route-summary">
              <div class="route-distance">{{ formatDistance(route.totalDistance) }}</div>
              <div class="route-duration">{{ formatDuration(route.totalDuration) }}</div>
              <div class="route-difficulty">{{ formatDifficulty(route.difficulty) }}</div>
            </div>
            <div class="route-details">
              <div class="route-segments">
                <span v-for="(segment, segIndex) in route.segments" :key="segIndex" class="segment">
                  {{ segment.mode }} ({{ formatDistance(segment.distance) }})
                </span>
              </div>
            </div>
            <button 
              @click.stop="useRoute(route)"
              class="use-route-btn"
            >
              Use This Route
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Error Display -->
    <div v-if="error" class="error-message">
      <div class="error-icon">⚠️</div>
      <span>{{ error }}</span>
      <button @click="error = null" class="error-close">×</button>
    </div>
    
    <!-- Search History -->
    <SearchHistory 
      ref="searchHistoryRef"
      @search-selected="(query) => { searchParams.startLocation = query; handleSearch() }"
    />
    
    <div class="saved-routes" v-if="savedRoutes.length > 0">
      <h3>Saved Routes</h3>
      <div class="saved-routes-list">
        <div 
          v-for="route in savedRoutes" 
          :key="route.id"
          class="saved-route-item"
          @click="selectSavedRoute(route)"
        >
          <div class="route-path">🛤️</div>
          <span class="route-duration">{{ route.duration }}hr</span>
          <span class="route-name">{{ route.name }}</span>
          <span class="star-icon">⭐</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouteStore } from '../stores/routeStore.js'
import {
  getSearchSuggestions,
  reverseGeocode,
  calculateRoute,
  getAlternativeRoutes,
  getNearbyLocations
} from '../api/api-spec.js'
import { formatDistance, formatDuration, formatDifficulty } from '../utils/formatters.js'
import { ErrorHandler } from '../utils/errorHandler.js'
import SearchHistory from './SearchHistory.vue'

const emit = defineEmits(['search', 'location-selected', 'route-calculated', 'route-selected'])

const routeStore = useRouteStore()

const searchParams = ref({
  startLocation: '',
  duration: 1,
  hikingTrail: ''
})

// Advanced route planning parameters
const advancedParams = ref({
  destination: '',
  routeType: 'hiking',
  preferences: {
    difficulty: '',
    preferTrails: true,
    avoidRoads: false,
    maxDistance: 10
  }
})

const loading = computed(() => routeStore.loading)
const savedRoutes = computed(() => routeStore.savedRoutes)

// New reactive data for enhanced search
const suggestions = ref([])
const showSuggestions = ref(false)
const searchTimeout = ref(null)
const isGeocoding = ref(false)
const error = ref(null)
const searchHistoryRef = ref(null)

// Advanced options state
const showAdvanced = ref(false)
const destinationSuggestions = ref([])
const showDestinationSuggestions = ref(false)
const calculating = ref(false)
const routeResults = ref([])
const selectedRouteIndex = ref(-1)

// Computed properties
const canCalculateAdvanced = computed(() => {
  return searchParams.value.startLocation.trim() && (advancedParams.value.destination.trim() || true) // Allow without destination
})

const handleSearch = async () => {
  if (!searchParams.value.startLocation.trim()) {
    error.value = 'Please enter a starting location'
    return
  }
  
  try {
    error.value = null
    console.log('🔍 Basic search triggered with params:', searchParams.value)
    
    // Add to search history
    if (searchHistoryRef.value) {
      searchHistoryRef.value.addToHistory(searchParams.value.startLocation, 'search')
    }
    
    // Call the route store's search function directly
    await routeStore.searchForRoutes({ ...searchParams.value })
    console.log('✅ Basic search completed, routes found:', routeStore.routes.length)
    
    // If no routes found, try to find nearby hiking locations
    if (routeStore.routes.length === 0) {
      console.log('🔍 No routes found, searching for nearby hiking locations...')
      
      // Geocode the start location to get coordinates
      const startCoords = await reverseGeocode(0, 0) // This would need actual coordinates
      if (startCoords && startCoords.location) {
        const startLocation = startCoords.location
        
        // Find nearby trails
        const nearbyTrails = await getNearbyLocations(startLocation, { 
          radius: 20000, 
          types: ['trail', 'trailhead'], 
          limit: 20 
        })
        console.log('🥾 Found nearby trails:', nearbyTrails)
        
        if (nearbyTrails && nearbyTrails.length > 0) {
          // Use the first trail as a destination and search again
          const nearestTrail = nearbyTrails[0]
          console.log('🎯 Using nearest hiking location for basic search:', nearestTrail.name)
          
          // Update the hiking trail field
          searchParams.value.hikingTrail = nearestTrail.name
          
          // Search again with the trail name
          await routeStore.searchForRoutes({ ...searchParams.value })
          console.log('✅ Basic search with nearest trail completed, routes found:', routeStore.routes.length)
        }
      }
    }
    
    // Emit the search event for the parent component
    emit('search', { ...searchParams.value })
  } catch (err) {
    console.error('❌ Basic search failed:', err)
    error.value = ErrorHandler.handleApiError(err, 'Search')
  }
}

const selectSavedRoute = (route) => {
  emit('search', {
    startLocation: route.startLocation,
    duration: route.duration,
    hikingTrail: route.name
  })
}

// Enhanced search functionality
const handleLocationInput = async () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  if (searchParams.value.startLocation.length < 2) {
    suggestions.value = []
    return
  }
  
  searchTimeout.value = setTimeout(async () => {
    try {
      error.value = null
      const response = await getSearchSuggestions(
        searchParams.value.startLocation,
        { limit: 5 }
      )
      suggestions.value = response.suggestions || []
    } catch (err) {
      console.error('Error fetching suggestions:', err)
      error.value = ErrorHandler.handleApiError(err, 'Search Suggestions')
      suggestions.value = []
    }
  }, 300)
}

const selectSuggestion = async (suggestion) => {
  searchParams.value.startLocation = suggestion.text
  showSuggestions.value = false
  suggestions.value = []
  
  try {
    error.value = null
    
    // Use the selected suggestion location
    if (suggestion.location) {
      emit('location-selected', suggestion.location)
    } else {
      isGeocoding.value = true
      // In a real implementation, you'd geocode the suggestion text
      // For now, we'll use a default location
      emit('location-selected', { lat: 42.3601, lon: -71.0589 })
    }
  } catch (err) {
    console.error('Error geocoding address:', err)
    error.value = ErrorHandler.handleApiError(err, 'Geocoding')
  } finally {
    isGeocoding.value = false
  }
}

const hideSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

const getSuggestionIcon = (type) => {
  const icons = {
    place: '📍',
    trail: '🥾',
    address: '🏠',
    poi: '⭐',
    park: '🌲',
    landmark: '🏛️',
    trailhead: '🚶',
    viewpoint: '👁️',
    campground: '⛺',
    restaurant: '🍽️',
    gas_station: '⛽',
    hotel: '🏨',
    city: '🏙️',
    state: '🗺️',
    country: '🌍'
  }
  return icons[type] || '📍'
}

// Advanced functionality methods
const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value
}

const handleDestinationInput = async () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  if (advancedParams.value.destination.length < 2) {
    destinationSuggestions.value = []
    return
  }
  
  searchTimeout.value = setTimeout(async () => {
    try {
      error.value = null
      // Focus on hiking-related suggestions for destination
      const response = await getSearchSuggestions(
        advancedParams.value.destination,
        { limit: 8 }
      )
      destinationSuggestions.value = response.suggestions || []
    } catch (err) {
      console.error('Error fetching destination suggestions:', err)
      error.value = ErrorHandler.handleApiError(err, 'Destination Suggestions')
      destinationSuggestions.value = []
    }
  }, 300)
}

const selectDestinationSuggestion = async (suggestion) => {
  advancedParams.value.destination = suggestion.text
  showDestinationSuggestions.value = false
  destinationSuggestions.value = []
  
  try {
    error.value = null
    if (suggestion.location) {
      // Use provided coordinates
    } else {
      const response = await geocodeAddress(suggestion.text)
      if (response.coordinates && response.coordinates.length > 0) {
        // Store coordinates for later use
      }
    }
  } catch (err) {
    console.error('Error geocoding destination:', err)
    error.value = ErrorHandler.handleApiError(err, 'Destination Geocoding')
  }
}

const hideDestinationSuggestions = () => {
  setTimeout(() => {
    showDestinationSuggestions.value = false
  }, 200)
}

const calculateAdvancedRoute = async () => {
  if (!canCalculateAdvanced.value) return
  
  calculating.value = true
  routeResults.value = []
  
  try {
    let response
    let destination = advancedParams.value.destination
    
    // If no destination provided, find the nearest hiking location
    if (!destination.trim()) {
      console.log('🔍 No destination provided, finding nearest hiking location...')
      
      // First, geocode the start location to get coordinates
      const startCoords = await reverseGeocode(0, 0) // This would need actual coordinates
      if (!startCoords || !startCoords.location) {
        throw new Error('Could not find coordinates for starting location')
      }
      
      const startLocation = startCoords.location
      console.log('📍 Start location coordinates:', startLocation)
      
      // Find nearby trails/POIs
      const nearbyTrails = await getNearbyLocations(startLocation, { 
        radius: 20000, 
        types: ['trail', 'trailhead'], 
        limit: 20 
      })
      console.log('🥾 Found nearby trails:', nearbyTrails)
      
      if (nearbyTrails && nearbyTrails.length > 0) {
        // Use the closest trail as destination
        const closestTrail = nearbyTrails[0]
        destination = closestTrail.name
        console.log('🎯 Using nearest hiking location:', destination)
        
        // Update the destination field in the UI
        advancedParams.value.destination = destination
      } else {
        // Fallback: use a default hiking location near Boston
        destination = 'Blue Hills Reservation, Milton, MA'
        advancedParams.value.destination = destination
        console.log('🎯 Using fallback hiking location:', destination)
      }
    }
    
    if (advancedParams.value.routeType === 'hiking') {
      response = await calculateRoute(
        searchParams.value.startLocation,
        destination,
        'hiking',
        advancedParams.value.preferences
      )
    } else {
      response = await calculateRoute(
        searchParams.value.startLocation,
        destination,
        'multimodal',
        advancedParams.value.preferences
      )
    }
    
    // Generate instructions helper function
    const generateInstructions = (segments) => {
      if (!segments || segments.length === 0) return []
      
      const instructions = []
      let stepNumber = 1
      
      segments.forEach((segment, index) => {
        if (segment.waypoints && segment.waypoints.length > 1) {
          if (index === 0) {
            instructions.push(`${stepNumber}. Start at ${segment.waypoints[0].name || 'starting point'}`)
            stepNumber++
          }
          
          if (segment.mode === 'walking') {
            instructions.push(`${stepNumber}. Walk ${formatDistance(segment.distance)} (${formatDuration(segment.duration)})`)
          } else if (segment.mode === 'transit') {
            instructions.push(`${stepNumber}. Take transit ${formatDistance(segment.distance)} (${formatDuration(segment.duration)})`)
          } else if (segment.mode === 'driving') {
            instructions.push(`${stepNumber}. Drive ${formatDistance(segment.distance)} (${formatDuration(segment.duration)})`)
          }
          stepNumber++
          
          for (let i = 1; i < segment.waypoints.length - 1; i++) {
            const waypoint = segment.waypoints[i]
            if (waypoint.name) {
              instructions.push(`${stepNumber}. Pass by ${waypoint.name}`)
              stepNumber++
            }
          }
          
          if (index === segments.length - 1) {
            const lastWaypoint = segment.waypoints[segment.waypoints.length - 1]
            instructions.push(`${stepNumber}. Arrive at ${lastWaypoint.name || 'destination'}`)
          }
        }
      })
      
      return instructions
    }
    
    // Format route for display
    const formattedRoute = {
      ...response,
      id: `route-${Date.now()}`,
      name: `Route from ${searchParams.value.startLocation} to ${advancedParams.value.destination}`,
      coordinates: response.coordinates || (response.segments ? response.segments.flatMap(segment => 
        segment.waypoints ? segment.waypoints.map(wp => ({ lat: wp.lat, lon: wp.lon })) : []
      ) : []),
      segments: response.segments || [],
      instructions: response.instructions || generateInstructions(response.segments),
      images: response.images || [],
      isSaved: response.isSaved || false,
      duration: response.totalDuration ? Math.round(response.totalDuration / 3600 * 10) / 10 : 0,
      distance: response.totalDistance ? Math.round(response.totalDistance / 1000 * 10) / 10 : 0,
      difficulty: response.difficulty || 'moderate'
    }
    
    routeResults.value = [formattedRoute]
    selectedRouteIndex.value = 0
    
    emit('route-calculated', formattedRoute)
    
  } catch (err) {
    console.error('Error calculating route:', err)
    error.value = ErrorHandler.handleApiError(err, 'Route Calculation')
  } finally {
    calculating.value = false
  }
}

const getAlternatives = async () => {
  if (!canCalculateAdvanced.value) return
  
  calculating.value = true
  
  try {
    let destination = advancedParams.value.destination
    
    // If no destination provided, find the nearest hiking location
    if (!destination.trim()) {
      console.log('🔍 Finding nearest hiking location for alternatives...')
      
      // First, geocode the start location to get coordinates
      const startCoords = await reverseGeocode(0, 0) // This would need actual coordinates
      if (!startCoords || !startCoords.location) {
        throw new Error('Could not find coordinates for starting location')
      }
      
      const startLocation = startCoords.location
      
      // Find nearby trails/POIs
      const nearbyTrails = await getNearbyLocations(startLocation, { 
        radius: 20000, 
        types: ['trail', 'trailhead'], 
        limit: 20 
      })
      
      if (nearbyTrails && nearbyTrails.length > 0) {
        // Use the closest trail as destination
        const closestTrail = nearbyTrails[0]
        destination = closestTrail.name
        console.log('🎯 Using nearest hiking location for alternatives:', destination)
        
        // Update the destination field in the UI
        advancedParams.value.destination = destination
      } else {
        // Fallback: use a default hiking location near Boston
        destination = 'Blue Hills Reservation, Milton, MA'
        advancedParams.value.destination = destination
        console.log('🎯 Using fallback hiking location for alternatives:', destination)
      }
    }
    
    const response = await getAlternativeRoutes(
      'route-id', // This would be the actual route ID
      advancedParams.value.preferences
    )
    
    // Generate instructions helper function
    const generateInstructions = (segments) => {
      if (!segments || segments.length === 0) return []
      
      const instructions = []
      let stepNumber = 1
      
      segments.forEach((segment, index) => {
        if (segment.waypoints && segment.waypoints.length > 1) {
          if (index === 0) {
            instructions.push(`${stepNumber}. Start at ${segment.waypoints[0].name || 'starting point'}`)
            stepNumber++
          }
          
          if (segment.mode === 'walking') {
            instructions.push(`${stepNumber}. Walk ${formatDistance(segment.distance)} (${formatDuration(segment.duration)})`)
          } else if (segment.mode === 'transit') {
            instructions.push(`${stepNumber}. Take transit ${formatDistance(segment.distance)} (${formatDuration(segment.duration)})`)
          } else if (segment.mode === 'driving') {
            instructions.push(`${stepNumber}. Drive ${formatDistance(segment.distance)} (${formatDuration(segment.duration)})`)
          }
          stepNumber++
          
          for (let i = 1; i < segment.waypoints.length - 1; i++) {
            const waypoint = segment.waypoints[i]
            if (waypoint.name) {
              instructions.push(`${stepNumber}. Pass by ${waypoint.name}`)
              stepNumber++
            }
          }
          
          if (index === segments.length - 1) {
            const lastWaypoint = segment.waypoints[segment.waypoints.length - 1]
            instructions.push(`${stepNumber}. Arrive at ${lastWaypoint.name || 'destination'}`)
          }
        }
      })
      
      return instructions
    }
    
    // Format alternative routes for display
    const formattedAlternatives = (response.alternatives || []).map((route, index) => ({
      ...route,
      id: route.id || `alternative-${Date.now()}-${index}`,
      name: route.name || `Alternative Route ${index + 1}`,
      coordinates: route.coordinates || (route.segments ? route.segments.flatMap(segment => 
        segment.waypoints ? segment.waypoints.map(wp => ({ lat: wp.lat, lon: wp.lon })) : []
      ) : []),
      segments: route.segments || [],
      instructions: route.instructions || generateInstructions(route.segments),
      images: route.images || [],
      isSaved: route.isSaved || false,
      duration: route.totalDuration ? Math.round(route.totalDuration / 3600 * 10) / 10 : 0,
      distance: route.totalDistance ? Math.round(route.totalDistance / 1000 * 10) / 10 : 0,
      difficulty: route.difficulty || 'moderate'
    }))
    
    routeResults.value = formattedAlternatives
    selectedRouteIndex.value = 0
    
  } catch (err) {
    console.error('Error getting alternatives:', err)
    error.value = ErrorHandler.handleApiError(err, 'Route Alternatives')
  } finally {
    calculating.value = false
  }
}

const selectRoute = (index) => {
  selectedRouteIndex.value = index
}

const useRoute = (route) => {
  console.log('Using route:', route)
  
  // Generate instructions from route segments
  const generateInstructions = (segments) => {
    if (!segments || segments.length === 0) return []
    
    const instructions = []
    let stepNumber = 1
    
    segments.forEach((segment, index) => {
      if (segment.waypoints && segment.waypoints.length > 1) {
        if (index === 0) {
          instructions.push(`${stepNumber}. Start at ${segment.waypoints[0].name || 'starting point'}`)
          stepNumber++
        }
        
        if (segment.mode === 'walking') {
          instructions.push(`${stepNumber}. Walk ${formatDistance(segment.distance)} (${formatDuration(segment.duration)})`)
        } else if (segment.mode === 'transit') {
          instructions.push(`${stepNumber}. Take transit ${formatDistance(segment.distance)} (${formatDuration(segment.duration)})`)
        } else if (segment.mode === 'driving') {
          instructions.push(`${stepNumber}. Drive ${formatDistance(segment.distance)} (${formatDuration(segment.duration)})`)
        }
        stepNumber++
        
        for (let i = 1; i < segment.waypoints.length - 1; i++) {
          const waypoint = segment.waypoints[i]
          if (waypoint.name) {
            instructions.push(`${stepNumber}. Pass by ${waypoint.name}`)
            stepNumber++
          }
        }
        
        if (index === segments.length - 1) {
          const lastWaypoint = segment.waypoints[segment.waypoints.length - 1]
          instructions.push(`${stepNumber}. Arrive at ${lastWaypoint.name || 'destination'}`)
        }
      }
    })
    
    return instructions
  }
  
  // Ensure route has proper structure for map display and route details
  const formattedRoute = {
    ...route,
    id: route.id || `route-${Date.now()}`,
    name: route.name || `Route from ${searchParams.value.startLocation} to ${advancedParams.value.destination}`,
    coordinates: route.coordinates || (route.segments ? route.segments.flatMap(segment => 
      segment.waypoints ? segment.waypoints.map(wp => ({ lat: wp.lat, lon: wp.lon })) : []
    ) : []),
    segments: route.segments || [],
    instructions: route.instructions || generateInstructions(route.segments),
    images: route.images || [],
    isSaved: route.isSaved || false,
    duration: route.totalDuration ? Math.round(route.totalDuration / 3600 * 10) / 10 : 0,
    distance: route.totalDistance ? Math.round(route.totalDistance / 1000 * 10) / 10 : 0,
    difficulty: route.difficulty || 'moderate'
  }
  
  console.log('Formatted route for map:', formattedRoute)
  
  // Show success feedback
  showRouteSelectionFeedback()
  
  emit('route-selected', formattedRoute)
  emit('route-calculated', formattedRoute)
}

const showRouteSelectionFeedback = () => {
  // Create a temporary success notification
  const notification = document.createElement('div')
  notification.className = 'route-selection-feedback'
  notification.innerHTML = `
    <div class="feedback-content">
      <span class="feedback-icon">✅</span>
      <span class="feedback-text">Route selected! Switching to map view...</span>
    </div>
  `
  
  // Add to the route search container
  const searchElement = document.querySelector('.route-search')
  if (searchElement) {
    searchElement.appendChild(notification)
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 3000)
  }
}

// Using standardized formatters from utils/formatters.js

onMounted(() => {
  routeStore.loadSavedRoutes()
})
</script>

<style scoped>
.route-search {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  padding: 3rem;
  margin-bottom: 2rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.search-form {
  margin-bottom: 2rem;
}

.search-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  border: 2px solid #e1e8ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.search-section:hover {
  border-color: #3498db;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.1);
}

.section-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #ecf0f1;
}

.section-header h3 {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.4rem;
  font-weight: 600;
}

.section-description {
  color: #7f8c8d;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.input-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.input-group.full-width {
  width: 100%;
}

.input-group label {
  font-weight: 500;
  margin-bottom: 0.75rem;
  color: #000000;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.location-input,
.trail-input {
  padding: 1rem;
  border: 1px solid #e5e5e5;
  border-radius: 0;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  background: #ffffff;
  color: #000000;
}

.location-input:focus,
.trail-input:focus {
  outline: none;
  border-color: #000000;
}

.location-input-container {
  position: relative;
}

.location-input {
  width: 100%;
}

.location-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e1e8ed;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid #f1f3f4;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background: #f8f9fa;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.suggestion-text {
  flex: 1;
  font-weight: 500;
  color: #2c3e50;
}

.suggestion-type {
  font-size: 0.8rem;
  color: #7f8c8d;
  text-transform: capitalize;
  background: #ecf0f1;
  padding: 2px 6px;
  border-radius: 4px;
}

.duration-select {
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
}

.duration-select:focus {
  outline: none;
  border-color: #3498db;
}

.search-button {
  width: 100%;
  padding: 1rem 2rem;
  background: #000000;
  color: #ffffff;
  border: none;
  border-radius: 0;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-button:hover:not(:disabled) {
  background: #333333;
  transform: translateY(-2px);
}

.search-button:disabled {
  background: #666666;
  cursor: not-allowed;
  transform: none;
}

.saved-routes {
  border-top: 2px solid #ecf0f1;
  padding-top: 1.5rem;
}

.saved-routes h3 {
  color: #e67e22;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.saved-routes-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.saved-route-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.saved-route-item:hover {
  background: #e9ecef;
}

.route-path {
  font-size: 1.2rem;
}

.route-duration {
  font-weight: 600;
  color: #2c3e50;
  min-width: 3rem;
}

.route-name {
  flex: 1;
  color: #34495e;
}

.star-icon {
  color: #f39c12;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #dc2626;
  font-size: 0.9rem;
}

.error-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.error-close {
  background: none;
  border: none;
  color: #dc2626;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  margin-left: auto;
  flex-shrink: 0;
}

.error-close:hover {
  color: #b91c1c;
}

/* Advanced Options Styles */
.advanced-toggle {
  margin: 1.5rem 0;
  display: flex;
  justify-content: center;
}

.advanced-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #f8f9fa;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.advanced-toggle-btn:hover {
  background: #e9ecef;
}

.advanced-toggle-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.toggle-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

.advanced-options {
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 2px solid #e1e8ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.advanced-options:hover {
  border-color: #3498db;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.1);
}

.advanced-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #ecf0f1;
}

.advanced-header h4 {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.advanced-description {
  color: #7f8c8d;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.preferences-section,
.route-options {
  margin-bottom: 1.5rem;
}

.preferences-section h5,
.route-options h5 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.preferences-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.preference-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preference-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.preference-select,
.preference-input {
  padding: 0.5rem;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  font-size: 0.9rem;
}

.preference-checkbox {
  width: 20px;
  height: 20px;
  accent-color: #3498db;
}

.options-grid {
  display: flex;
  gap: 2rem;
}

.option-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.option-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  color: #2c3e50;
}

.option-radio {
  width: 18px;
  height: 18px;
  accent-color: #3498db;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.calculate-btn,
.alternatives-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  flex: 1;
}

.calculate-btn {
  background: #27ae60;
  color: white;
}

.calculate-btn:hover:not(:disabled) {
  background: #229954;
}

.calculate-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.alternatives-btn {
  background: #3498db;
  color: white;
}

.alternatives-btn:hover:not(:disabled) {
  background: #2980b9;
}

.alternatives-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

/* Route Results Styles */
.route-results {
  border-top: 2px solid #ecf0f1;
  padding-top: 1.5rem;
}

.route-results h4 {
  color: #2c3e50;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.route-option {
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.route-option:hover {
  border-color: #3498db;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.15);
}

.route-option.selected {
  border-color: #27ae60;
  background: #f8fff8;
}

.route-summary {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.route-distance,
.route-duration {
  font-weight: 600;
  color: #2c3e50;
}

.route-difficulty {
  background: #e67e22;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  text-transform: capitalize;
}

.route-details {
  flex: 1;
  margin: 0 1rem;
}

.route-segments {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.segment {
  background: #ecf0f1;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #7f8c8d;
}

.use-route-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.use-route-btn:hover {
  background: #229954;
}

/* Route Selection Feedback */
.route-selection-feedback {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  animation: slideDown 0.3s ease-out;
}

.feedback-content {
  background: #27ae60;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.feedback-icon {
  font-size: 1.2rem;
}

.feedback-text {
  font-size: 0.9rem;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@media (max-width: 768px) {
  .route-search {
    padding: 1rem;
    margin: 0.5rem;
    max-width: none;
  }
  
  .search-section,
  .advanced-options {
    padding: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .section-header h3 {
    font-size: 1.2rem;
  }
  
  .advanced-header h4 {
    font-size: 1.1rem;
  }
  
  .input-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .input-group {
    width: 100%;
  }
  
  .preferences-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .options-grid {
    flex-direction: column;
    gap: 1rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .calculate-btn,
  .alternatives-btn {
    width: 100%;
    padding: 1rem;
  }
  
  .route-option {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    padding: 1rem;
  }
  
  .route-details {
    margin: 0;
  }
  
  .route-summary {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .use-route-btn {
    width: 100%;
    padding: 0.75rem;
  }
  
  .suggestions-dropdown {
    max-height: 150px;
  }
  
  .suggestion-item {
    padding: 0.5rem;
  }
  
  .suggestion-text {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .route-search {
    padding: 0.75rem;
    margin: 0.25rem;
  }
  
  .search-section,
  .advanced-options {
    padding: 1rem;
  }
  
  .section-header h3 {
    font-size: 1.1rem;
  }
  
  .advanced-header h4 {
    font-size: 1rem;
  }
  
  .location-input,
  .trail-input,
  .duration-select {
    padding: 0.75rem;
    font-size: 0.9rem;
  }
  
  .search-button {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
  }
  
  .advanced-toggle-btn {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
  
  .toggle-icon {
    font-size: 1rem;
  }
}
</style>
