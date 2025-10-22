import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  searchRoutes, 
  getRouteDetails, 
  getSavedRoutes, 
  saveRoute, 
  unsaveRoute 
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

  // Getters
  const filteredRoutes = computed(() => {
    return routes.value.filter(route => {
      if (searchParams.value.startLocation && 
          !route.startLocation.toLowerCase().includes(searchParams.value.startLocation.toLowerCase())) {
        return false
      }
      if (searchParams.value.duration && 
          Math.abs(route.duration - searchParams.value.duration) > 0.5) {
        return false
      }
      if (searchParams.value.hikingTrail && 
          !route.name.toLowerCase().includes(searchParams.value.hikingTrail.toLowerCase())) {
        return false
      }
      return true
    })
  })

  const isRouteSaved = computed(() => (routeId) => {
    return savedRoutes.value.some(route => route.id === routeId)
  })

  // Actions
  const searchForRoutes = async (params = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const searchData = { ...searchParams.value, ...params }
      const results = await searchRoutes(searchData)
      routes.value = results
    } catch (err) {
      error.value = err.message
      console.error('Failed to search routes:', err)
    } finally {
      loading.value = false
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

  return {
    // State
    routes,
    savedRoutes,
    currentRoute,
    searchParams,
    loading,
    error,
    
    // Getters
    filteredRoutes,
    isRouteSaved,
    
    // Actions
    searchForRoutes,
    loadRouteDetails,
    loadSavedRoutes,
    toggleSaveRoute,
    updateSearchParams,
    clearError
  }
})
