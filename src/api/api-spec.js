// API Specification for Route Planner Backend
// Backend running at: http://localhost:8000/api

export const API_BASE_URL = 'http://localhost:8000/api'

// API Endpoints
export const API_ENDPOINTS = {
  // Route search and discovery
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
  instructions: 'array' // step-by-step directions
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

// API Helper Functions
export const apiRequest = async (endpoint, options = {}) => {
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
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

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
