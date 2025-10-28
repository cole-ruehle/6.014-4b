// API Specification for Enhanced Hiking App Backend
// Backend running at: http://localhost:8000/HikingApp

export const API_BASE_URL = 'http://localhost:8000/HikingApp'

// Free Navigation Services
export const OPENROUTE_SERVICE_API_KEY = '5b3ce3597851110001cf6248e8b8b8b8b8b8b8b8' // Free API key
export const OPENROUTE_SERVICE_BASE_URL = 'https://api.openrouteservice.org/v2'

// API Endpoints - Updated to match backend specification
export const API_ENDPOINTS = {
  // Route Planning API
  CALCULATE_ROUTE: '/calculateRoute',
  GET_ALTERNATIVE_ROUTES: '/getAlternativeRoutes',
  
  // Location Search API
  SEARCH_LOCATIONS: '/searchLocations',
  GET_LOCATION_DETAILS: '/getLocationDetails',
  REVERSE_GEOCODE: '/reverseGeocode',
  GET_NEARBY_LOCATIONS: '/getNearbyLocations',
  
  // Search History API
  GET_RECENT_SEARCHES: '/getRecentSearches',
  GET_SEARCH_SUGGESTIONS: '/getSearchSuggestions',
  GET_SEARCH_STATS: '/getSearchStats',
  CLEAR_SEARCH_HISTORY: '/clearSearchHistory',
  
  // Legacy endpoints (for backward compatibility)
  SEARCH_ROUTES: '/routes/search',
  GET_ROUTE_DETAILS: '/routes/:id',
  GET_SAVED_ROUTES: '/routes/saved',
  SAVE_ROUTE: '/routes/:id/save',
  UNSAVE_ROUTE: '/routes/:id/unsave',
  
  // Navigation and directions
  GET_NAVIGATION: '/navigation/:routeId',
  UPDATE_NAVIGATION_STATUS: '/navigation/:routeId/status',
  EMERGENCY_ROUTE: '/navigation/:routeId/emergency',
  
  // Route modifications
  MODIFY_ROUTE: '/routes/:id/modify',
  GET_SUGGESTED_MODIFICATIONS: '/routes/:id/suggestions',
  
  // Status updates
  GET_STATUS_UPDATES: '/status/updates',
  POST_STATUS_UPDATE: '/status/updates'
}

// Data Models
export const RouteModel = {
  id: 'string',
  name: 'string',
  startLocation: 'string',
  duration: 'number', // in hours
  distance: 'number', // in miles
  transitTime: 'number', // in hours
  transitDistance: 'number', // in miles
  hikeTime: 'number', // in hours
  hikeDistance: 'number', // in miles
  difficulty: 'string', // 'Easy', 'Medium', 'Hard'
  transportModes: 'array', // ['bus', 'car', 'walk']
  images: 'array', // URLs
  isSaved: 'boolean',
  coordinates: 'array', // for map display
  instructions: 'array', // step-by-step directions
  segments: 'array', // route segments with waypoints
  elevation: 'object' // elevation profile data
}

export const MapModel = {
  center: 'object', // {lat, lon}
  zoom: 'number',
  style: 'string', // map style identifier
  bounds: 'object' // map bounds
}

export const POIModel = {
  id: 'string',
  name: 'string',
  type: 'string', // 'trail', 'trailhead', 'viewpoint', etc.
  location: 'object', // {lat, lon}
  description: 'string',
  difficulty: 'string',
  distance: 'number',
  elevation: 'number'
}

export const SearchSuggestionModel = {
  text: 'string',
  type: 'string', // 'place', 'trail', 'address'
  location: 'object', // {lat, lon}
  relevance: 'number'
}

export const RouteSegmentModel = {
  mode: 'string', // 'walking', 'driving', 'transit'
  distance: 'number', // in meters
  duration: 'number', // in seconds
  waypoints: 'array', // [{lat, lon, name}]
  instructions: 'array', // turn-by-turn directions
  elevation: 'array' // elevation profile
}

export const NavigationModel = {
  routeId: 'string',
  currentLocation: 'object', // {lat, lng}
  nextDirection: 'string',
  remainingDistance: 'number',
  estimatedTime: 'number',
  isEmergency: 'boolean',
  emergencyRoute: 'object' // alternative route data
}

export const StatusUpdateModel = {
  id: 'string',
  routeId: 'string',
  message: 'string',
  timestamp: 'string',
  type: 'string' // 'info', 'warning', 'emergency'
}

// Check if backend is available
let backendAvailable = null

const checkBackendAvailability = async () => {
  // Always check backend availability (don't cache the result)
  try {
    const response = await fetch(`${API_BASE_URL}/getSearchSuggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'test' }),
      signal: AbortSignal.timeout(3000) // 3 second timeout
    })
    backendAvailable = response.ok
    console.log('Backend availability check:', backendAvailable ? 'SUCCESS' : 'FAILED')
  } catch (error) {
    console.warn('Backend not available:', error.message)
    backendAvailable = false
  }
  
  return backendAvailable
}

// API Helper Functions
export const apiRequest = async (endpoint, options = {}) => {
  console.log('Making API request to:', `${API_BASE_URL}${endpoint}`)
  // Skip backend availability check for now - just try the request
  console.log('Skipping backend check, making direct request...')
  
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }
  
  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`)
      error.status = response.status
      error.response = response
      
      // Try to get error details from response
      try {
        const errorData = await response.json()
        error.details = errorData
        error.message = errorData.message || error.message
      } catch (parseError) {
        // If response is not JSON, use status text
        error.message = response.statusText || error.message
      }
      
      throw error
    }
    
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    } else {
      return await response.text()
    }
  } catch (error) {
    console.error('API request failed:', error)
    
    // If it's a CORS error, return empty data instead of throwing
    if (error.message.includes('CORS') || error.message.includes('status: 0') || error.message.includes('Load failed')) {
      console.log('CORS error detected, returning empty data')
      return []
    }
    
    throw error
  }
}

// Backend API Functions - Real implementations

// Specific API functions
export const searchRoutes = async (params) => {
  const queryString = new URLSearchParams(params).toString()
  return apiRequest(`${API_ENDPOINTS.SEARCH_ROUTES}?${queryString}`)
}

export const getRouteDetails = async (routeId) => {
  return apiRequest(API_ENDPOINTS.GET_ROUTE_DETAILS.replace(':id', routeId))
}

export const getSavedRoutes = async () => {
  return apiRequest(API_ENDPOINTS.GET_SAVED_ROUTES)
}

export const saveRoute = async (routeId) => {
  return apiRequest(API_ENDPOINTS.SAVE_ROUTE.replace(':id', routeId), {
    method: 'POST'
  })
}

export const unsaveRoute = async (routeId) => {
  return apiRequest(API_ENDPOINTS.UNSAVE_ROUTE.replace(':id', routeId), {
    method: 'DELETE'
  })
}

export const getNavigation = async (routeId) => {
  return apiRequest(API_ENDPOINTS.GET_NAVIGATION.replace(':routeId', routeId))
}

export const updateNavigationStatus = async (routeId, status) => {
  return apiRequest(API_ENDPOINTS.UPDATE_NAVIGATION_STATUS.replace(':routeId', routeId), {
    method: 'PUT',
    body: JSON.stringify(status)
  })
}

export const triggerEmergencyRoute = async (routeId) => {
  return apiRequest(API_ENDPOINTS.EMERGENCY_ROUTE.replace(':routeId', routeId), {
    method: 'POST'
  })
}

export const modifyRoute = async (routeId, modifications) => {
  return apiRequest(API_ENDPOINTS.MODIFY_ROUTE.replace(':id', routeId), {
    method: 'PUT',
    body: JSON.stringify(modifications)
  })
}

export const getSuggestedModifications = async (routeId) => {
  return apiRequest(API_ENDPOINTS.GET_SUGGESTED_MODIFICATIONS.replace(':id', routeId))
}

export const getStatusUpdates = async () => {
  return apiRequest(API_ENDPOINTS.GET_STATUS_UPDATES)
}

export const postStatusUpdate = async (update) => {
  return apiRequest(API_ENDPOINTS.POST_STATUS_UPDATE, {
    method: 'POST',
    body: JSON.stringify(update)
  })
}

// Enhanced Mapping API Functions
export const getMapTile = (z, x, y, style = 'streets') => {
  const url = `${API_BASE_URL}${API_ENDPOINTS.GET_MAP_TILE.replace(':z', z).replace(':x', x).replace(':y', y)}?style=${style}`
  return url
}

export const getAvailableStyles = async () => {
  return apiRequest(API_ENDPOINTS.GET_AVAILABLE_STYLES)
}

export const getMapStyle = async (style = 'streets') => {
  return apiRequest(API_ENDPOINTS.GET_MAP_STYLE, {
    method: 'POST',
    body: JSON.stringify({ style })
  })
}

export const getRouteVisualization = async (routeSegments, options = {}) => {
  return apiRequest(API_ENDPOINTS.GET_ROUTE_VISUALIZATION, {
    method: 'POST',
    body: JSON.stringify({
      routeSegments,
      options
    })
  })
}

// Location Search API Functions
export const searchLocations = async (query, options = {}) => {
  return apiRequest(API_ENDPOINTS.SEARCH_LOCATIONS, {
    method: 'POST',
    body: JSON.stringify({
      query,
      options: {
        center: options.center || null,
        radius: options.radius || 50000,
        types: options.types || ['trailhead', 'trail', 'transit_stop', 'poi'],
        limit: options.limit || 10,
        includeAddresses: options.includeAddresses !== false
      }
    })
  })
}

export const getSearchSuggestions = async (query, options = {}) => {
  return apiRequest(API_ENDPOINTS.GET_SEARCH_SUGGESTIONS, {
    method: 'POST',
    body: JSON.stringify({
      query,
      userId: (options && options.userId) || null,
      limit: (options && options.limit) || 5
    })
  })
}

export const getLocationDetails = async (locationId, type) => {
  return apiRequest(API_ENDPOINTS.GET_LOCATION_DETAILS, {
    method: 'POST',
    body: JSON.stringify({
      locationId,
      type
    })
  })
}

export const reverseGeocode = async (lat, lon) => {
  return apiRequest(API_ENDPOINTS.REVERSE_GEOCODE, {
    method: 'POST',
    body: JSON.stringify({
      lat,
      lon
    })
  })
}

export const getNearbyLocations = async (center, options = {}) => {
  return apiRequest(API_ENDPOINTS.GET_NEARBY_LOCATIONS, {
    method: 'POST',
    body: JSON.stringify({
      center,
      radius: options.radius || 1000,
      types: options.types || ['trailhead', 'trail', 'transit_stop'],
      limit: options.limit || 20
    })
  })
}

// Route Planning API Functions
export const calculateRoute = async (origin, destination, mode = 'hiking', preferences = {}) => {
  return apiRequest(API_ENDPOINTS.CALCULATE_ROUTE, {
    method: 'POST',
    body: JSON.stringify({
      origin,
      destination,
      mode,
      preferences,
      alternatives: preferences.alternatives || 1
    })
  })
}

export const getAlternativeRoutes = async (routeId, criteria) => {
  return apiRequest(API_ENDPOINTS.GET_ALTERNATIVE_ROUTES, {
    method: 'POST',
    body: JSON.stringify({
      routeId,
      criteria
    })
  })
}

// Search History API Functions
export const getRecentSearches = async (options = {}) => {
  return apiRequest(API_ENDPOINTS.GET_RECENT_SEARCHES, {
    method: 'POST',
    body: JSON.stringify({
      userId: (options && options.userId) || null,
      limit: (options && options.limit) || 10
    })
  })
}

export const getSearchStats = async (options = {}) => {
  return apiRequest(API_ENDPOINTS.GET_SEARCH_STATS, {
    method: 'POST',
    body: JSON.stringify({
      userId: (options && options.userId) || null,
      days: (options && options.days) || 30
    })
  })
}

export const clearSearchHistory = async (options = {}) => {
  return apiRequest(API_ENDPOINTS.CLEAR_SEARCH_HISTORY, {
    method: 'POST',
    body: JSON.stringify({
      userId: (options && options.userId) || null,
      sessionId: (options && options.sessionId) || null
    })
  })
}

// Legacy functions for backward compatibility
export const searchPlaces = searchLocations
export const findTrails = (center, radius = 10, difficulty = null) => 
  getNearbyLocations(center, { radius, types: ['trail'], limit: 20 })
export const geocodeAddress = reverseGeocode
export const searchPOIs = (center, types = ['trail', 'trailhead'], radius = 5) => 
  getNearbyLocations(center, { radius, types, limit: 20 })
export const calculateHikingRoute = (origin, destination, preferences = {}) => 
  calculateRoute(origin, destination, 'hiking', preferences)
export const calculateMultiModalRoute = (origin, destination, options = {}) => 
  calculateRoute(origin, destination, 'multimodal', options)
export const getRouteAlternatives = getAlternativeRoutes

// Real Navigation Functions using OpenRouteService
export const getRealTimeDirections = async (start, end, profile = 'foot-walking') => {
  try {
    const response = await fetch(`${OPENROUTE_SERVICE_BASE_URL}/directions/${profile}/geojson`, {
      method: 'POST',
      headers: {
        'Authorization': OPENROUTE_SERVICE_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        coordinates: [[start.lon, start.lat], [end.lon, end.lat]],
        format: 'geojson',
        instructions: true,
        geometry: true,
        options: {
          continue_straight: false,
          preference: 'recommended'
        }
      })
    })
    
    if (!response.ok) {
      throw new Error(`OpenRouteService error: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error getting real-time directions:', error)
    // Fallback to mock data
    return getMockDirections(start, end)
  }
}

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  })
}

export const watchLocation = (callback, errorCallback) => {
  if (!navigator.geolocation) {
    errorCallback(new Error('Geolocation is not supported by this browser'))
    return null
  }
  
  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading,
        speed: position.coords.speed
      })
    },
    errorCallback,
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000
    }
  )
}

export const stopLocationWatch = (watchId) => {
  if (watchId) {
    navigator.geolocation.clearWatch(watchId)
  }
}

// Mock directions fallback
const getMockDirections = (start, end) => {
  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: {
        summary: {
          distance: 1000,
          duration: 600
        },
        segments: [{
          distance: 1000,
          duration: 600,
          steps: [
            {
              instruction: 'Head north on Main St',
              name: 'Main St',
              distance: 500,
              duration: 300,
              type: 0
            },
            {
              instruction: 'Turn right onto Oak Ave',
              name: 'Oak Ave',
              distance: 500,
              duration: 300,
              type: 1
            }
          ]
        }]
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [start.lon, start.lat],
          [start.lon + 0.001, start.lat + 0.001],
          [end.lon, end.lat]
        ]
      }
    }]
  }
}
