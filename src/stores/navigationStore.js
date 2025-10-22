import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  getNavigation, 
  updateNavigationStatus, 
  triggerEmergencyRoute 
} from '../api/api-spec.js'

export const useNavigationStore = defineStore('navigation', () => {
  // State
  const currentNavigation = ref(null)
  const isNavigating = ref(false)
  const isEmergency = ref(false)
  const currentLocation = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const nextDirection = computed(() => {
    return currentNavigation.value?.nextDirection || ''
  })

  const remainingDistance = computed(() => {
    return currentNavigation.value?.remainingDistance || 0
  })

  const estimatedTime = computed(() => {
    return currentNavigation.value?.estimatedTime || 0
  })

  const emergencyRoute = computed(() => {
    return currentNavigation.value?.emergencyRoute || null
  })

  // Actions
  const startNavigation = async (routeId) => {
    loading.value = true
    error.value = null
    
    try {
      const navigation = await getNavigation(routeId)
      currentNavigation.value = navigation
      isNavigating.value = true
      isEmergency.value = false
    } catch (err) {
      error.value = err.message
      console.error('Failed to start navigation:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateLocation = async (location) => {
    currentLocation.value = location
    
    if (isNavigating.value && currentNavigation.value) {
      try {
        await updateNavigationStatus(currentNavigation.value.routeId, {
          currentLocation: location,
          timestamp: new Date().toISOString()
        })
      } catch (err) {
        console.error('Failed to update location:', err)
      }
    }
  }

  const triggerEmergency = async () => {
    if (!isNavigating.value || !currentNavigation.value) {
      throw new Error('No active navigation to trigger emergency for')
    }

    loading.value = true
    error.value = null
    
    try {
      const emergencyData = await triggerEmergencyRoute(currentNavigation.value.routeId)
      currentNavigation.value = { ...currentNavigation.value, ...emergencyData }
      isEmergency.value = true
    } catch (err) {
      error.value = err.message
      console.error('Failed to trigger emergency route:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const stopNavigation = () => {
    isNavigating.value = false
    isEmergency.value = false
    currentNavigation.value = null
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    currentNavigation,
    isNavigating,
    isEmergency,
    currentLocation,
    loading,
    error,
    
    // Getters
    nextDirection,
    remainingDistance,
    estimatedTime,
    emergencyRoute,
    
    // Actions
    startNavigation,
    updateLocation,
    triggerEmergency,
    stopNavigation,
    clearError
  }
})
