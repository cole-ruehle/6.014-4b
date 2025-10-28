import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  searchRoutes, 
  getRouteDetails, 
  getSavedRoutes, 
  saveRoute, 
  unsaveRoute,
  calculateRoute,
  searchLocations,
  getNearbyLocations,
  getSearchSuggestions
} from '../api/api-spec.js'

export const useRouteStore = defineStore('routes', () => {
  // State
  const routes = ref([])
  const savedRoutes = ref([])
  const currentRoute = ref(null)
  const searchParams = ref({
    startLocation: '',
    duration: 1,
    hikingTrail: ''
  })
  const loading = ref(false)
  const error = ref(null)
  
  // Enhanced state for mapping
  const pois = ref([])
  const searchSuggestions = ref([])
  const mapCenter = ref({ lat: 42.3601, lon: -71.0589 })
  const selectedLocation = ref(null)
  const calculatedRoutes = ref([])

  // Getters
  const filteredRoutes = computed(() => {
    console.log('🔍 RouteStore: Filtering routes. Total routes:', routes.value.length)
    console.log('🔍 RouteStore: Search params:', searchParams.value)
    
    const filtered = routes.value.filter(route => {
      // Only filter by hiking trail if specified, otherwise show all routes
      if (searchParams.value.hikingTrail && 
          !route.name.toLowerCase().includes(searchParams.value.hikingTrail.toLowerCase())) {
        return false
      }
      return true
    })
    
    console.log('🔍 RouteStore: Filtered routes:', filtered.length)
    return filtered
  })

  const isRouteSaved = computed(() => (routeId) => {
    return savedRoutes.value.some(route => route.id === routeId)
  })

  // Actions
  const searchForRoutes = async (params = {}) => {
    console.log('🚀 RouteStore: Starting searchForRoutes')
    loading.value = true
    error.value = null
    
    try {
      const searchData = { ...searchParams.value, ...params }
      // Update the stored search params
      searchParams.value = searchData
      console.log('🔍 RouteStore: Searching with params:', searchData)
      
      // Use real backend API call - searchPlaces for finding hiking locations
      console.log('📡 RouteStore: Attempting API call...')
      const results = await searchPlaces(searchData.startLocation || 'Boston', { limit: 10 })
      console.log('✅ RouteStore: API search results:', results)
      
      routes.value = results
      console.log('📝 RouteStore: Routes set to:', routes.value)
      console.log('📊 RouteStore: Number of routes:', routes.value.length)
    } catch (err) {
      error.value = err.message
      console.error('❌ RouteStore: Failed to search routes:', err)
    } finally {
      loading.value = false
      console.log('🏁 RouteStore: Search completed, loading set to false')
    }
  }

  const loadRouteDetails = async (routeId) => {
    loading.value = true
    error.value = null
    
    try {
      const route = await getRouteDetails(routeId)
      currentRoute.value = route
      return route
    } catch (err) {
      error.value = err.message
      console.error('Failed to load route details:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadSavedRoutes = async () => {
    loading.value = true
    error.value = null
    
    try {
      const saved = await getSavedRoutes()
      savedRoutes.value = saved
    } catch (err) {
      error.value = err.message
      console.error('Failed to load saved routes:', err)
    } finally {
      loading.value = false
    }
  }

  const toggleSaveRoute = async (routeId) => {
    try {
      const isSaved = isRouteSaved.value(routeId)
      
      if (isSaved) {
        await unsaveRoute(routeId)
        savedRoutes.value = savedRoutes.value.filter(route => route.id !== routeId)
      } else {
        await saveRoute(routeId)
        const route = routes.value.find(r => r.id === routeId)
        if (route) {
          savedRoutes.value.push({ ...route, isSaved: true })
        }
      }
      
      // Update the route in the main routes array
      const routeIndex = routes.value.findIndex(r => r.id === routeId)
      if (routeIndex !== -1) {
        routes.value[routeIndex].isSaved = !isSaved
      }
      
      // Update current route if it's the same
      if (currentRoute.value && currentRoute.value.id === routeId) {
        currentRoute.value.isSaved = !isSaved
      }
    } catch (err) {
      error.value = err.message
      console.error('Failed to toggle save route:', err)
      throw err
    }
  }

  const updateSearchParams = (params) => {
    searchParams.value = { ...searchParams.value, ...params }
  }

  const clearError = () => {
    error.value = null
  }

  // Enhanced methods for mapping functionality
  const searchForPlaces = async (query, center = null, radius = 10) => {
    loading.value = true
    error.value = null
    
    try {
      const results = await searchLocations(query, { center, radius, limit: 10 })
      return results
    } catch (err) {
      error.value = err.message
      console.error('Failed to search places:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const findNearbyTrails = async (center, radius = 10, difficulty = null) => {
    loading.value = true
    error.value = null
    
    try {
      const results = await getNearbyLocations(center, { 
        radius, 
        types: ['trail', 'trailhead'], 
        limit: 20 
      })
      return results
    } catch (err) {
      error.value = err.message
      console.error('Failed to find trails:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadPOIs = async (center, types = ['trail', 'trailhead'], radius = 5) => {
    loading.value = true
    error.value = null
    
    try {
      const results = await getNearbyLocations(center, { radius, types, limit: 20 })
      pois.value = results || []
      return results
    } catch (err) {
      error.value = err.message
      console.error('Failed to load POIs:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const calculateRouteData = async (origin, destination, mode = 'hiking', preferences = {}) => {
    loading.value = true
    error.value = null
    
    try {
      // If origin and destination are strings, geocode them first
      let originCoords = origin
      let destinationCoords = destination
      
      if (typeof origin === 'string') {
        console.log('🔍 Geocoding origin:', origin)
        const originResults = await searchLocations(origin, { limit: 1 })
        if (!originResults || originResults.length === 0) {
          throw new Error('Could not find coordinates for origin')
        }
        originCoords = {
          lat: originResults[0].location.lat,
          lon: originResults[0].location.lon,
          address: originResults[0].address || origin,
          name: originResults[0].name || origin
        }
      }
      
      if (typeof destination === 'string') {
        console.log('🔍 Geocoding destination:', destination)
        const destinationResults = await searchLocations(destination, { limit: 1 })
        if (!destinationResults || destinationResults.length === 0) {
          throw new Error('Could not find coordinates for destination')
        }
        destinationCoords = {
          lat: destinationResults[0].location.lat,
          lon: destinationResults[0].location.lon,
          address: destinationResults[0].address || destination,
          name: destinationResults[0].name || destination
        }
      }
      
      console.log('🚀 Calling calculateRoute with:', { origin: originCoords, destination: destinationCoords })
      const results = await calculateRoute(originCoords, destinationCoords, mode, preferences)
      calculatedRoutes.value = [results]
      return results
    } catch (err) {
      error.value = err.message
      console.error('Failed to calculate route:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const calculateMultiModalRouteData = async (origin, destination, options = {}) => {
    loading.value = true
    error.value = null
    
    try {
      // If origin and destination are strings, geocode them first
      let originCoords = origin
      let destinationCoords = destination
      
      if (typeof origin === 'string') {
        console.log('🔍 Geocoding origin for multimodal:', origin)
        const originResults = await searchLocations(origin, { limit: 1 })
        if (!originResults || originResults.length === 0) {
          throw new Error('Could not find coordinates for origin')
        }
        originCoords = {
          lat: originResults[0].location.lat,
          lon: originResults[0].location.lon,
          address: originResults[0].address || origin,
          name: originResults[0].name || origin
        }
      }
      
      if (typeof destination === 'string') {
        console.log('🔍 Geocoding destination for multimodal:', destination)
        const destinationResults = await searchLocations(destination, { limit: 1 })
        if (!destinationResults || destinationResults.length === 0) {
          throw new Error('Could not find coordinates for destination')
        }
        destinationCoords = {
          lat: destinationResults[0].location.lat,
          lon: destinationResults[0].location.lon,
          address: destinationResults[0].address || destination,
          name: destinationResults[0].name || destination
        }
      }
      
      console.log('🚀 Calling calculateRoute for multimodal with:', { origin: originCoords, destination: destinationCoords })
      const results = await calculateRoute(originCoords, destinationCoords, 'multimodal', options)
      calculatedRoutes.value = [results]
      return results
    } catch (err) {
      error.value = err.message
      console.error('Failed to calculate multi-modal route:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const setMapCenter = (center) => {
    mapCenter.value = center
  }

  const setSelectedLocation = (location) => {
    selectedLocation.value = location
    mapCenter.value = location
  }


  return {
    // State
    routes,
    savedRoutes,
    currentRoute,
    searchParams,
    loading,
    error,
    pois,
    searchSuggestions,
    mapCenter,
    selectedLocation,
    calculatedRoutes,
    
    // Getters
    filteredRoutes,
    isRouteSaved,
    
    // Actions
    searchForRoutes,
    loadRouteDetails,
    loadSavedRoutes,
    toggleSaveRoute,
    updateSearchParams,
    clearError,
    
    // Enhanced actions
    searchForPlaces,
    findNearbyTrails,
    loadPOIs,
    calculateRoute: calculateRouteData,
    calculateMultiModalRoute: calculateMultiModalRouteData,
    setMapCenter,
    setSelectedLocation
  }
})
