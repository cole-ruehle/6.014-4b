import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  getNavigation, 
  updateNavigationStatus, 
  triggerEmergencyRoute,
  getCurrentLocation,
  watchLocation,
  stopLocationWatch,
  getRealTimeDirections
} from '../api/api-spec.js'

export const useNavigationStore = defineStore('navigation', () => {
  // State
  const currentNavigation = ref(null)
  const isNavigating = ref(false)
  const isEmergency = ref(false)
  const currentLocation = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const locationWatchId = ref(null)
  const currentRoute = ref(null)
  const navigationInstructions = ref([])
  const currentStepIndex = ref(0)
  const voiceEnabled = ref(false)

  // Getters
  const nextDirection = computed(() => {
    if (navigationInstructions.value.length > 0 && currentStepIndex.value < navigationInstructions.value.length) {
      return navigationInstructions.value[currentStepIndex.value]?.instruction || ''
    }
    return currentNavigation.value?.nextDirection || ''
  })

  const remainingDistance = computed(() => {
    if (navigationInstructions.value.length > 0) {
      const remainingSteps = navigationInstructions.value.slice(currentStepIndex.value)
      return remainingSteps.reduce((total, step) => total + (step.distance || 0), 0)
    }
    return currentNavigation.value?.remainingDistance || 0
  })

  const estimatedTime = computed(() => {
    if (navigationInstructions.value.length > 0) {
      const remainingSteps = navigationInstructions.value.slice(currentStepIndex.value)
      return Math.round(remainingSteps.reduce((total, step) => total + (step.duration || 0), 0) / 60)
    }
    return currentNavigation.value?.estimatedTime || 0
  })

  const emergencyRoute = computed(() => {
    return currentNavigation.value?.emergencyRoute || null
  })

  const currentStep = computed(() => {
    if (navigationInstructions.value.length > 0 && currentStepIndex.value < navigationInstructions.value.length) {
      return navigationInstructions.value[currentStepIndex.value]
    }
    return null
  })

  const progressPercentage = computed(() => {
    if (navigationInstructions.value.length === 0) return 0
    return Math.round((currentStepIndex.value / navigationInstructions.value.length) * 100)
  })

  // Actions
  const startNavigation = async (route) => {
    loading.value = true
    error.value = null
    
    try {
      // Get current location
      const startLocation = await getCurrentLocation()
      currentLocation.value = startLocation
      
      // Get route coordinates
      const routeCoordinates = route.coordinates || []
      if (routeCoordinates.length < 2) {
        throw new Error('Route must have at least start and end coordinates')
      }
      
      const start = routeCoordinates[0]
      const end = routeCoordinates[routeCoordinates.length - 1]
      
      // Get real-time directions
      const directions = await getRealTimeDirections(start, end, 'foot-walking')
      
      // Process directions
      if (directions.features && directions.features.length > 0) {
        const feature = directions.features[0]
        const segments = feature.properties.segments || []
        
        // Extract all steps from all segments
        const allSteps = []
        segments.forEach(segment => {
          if (segment.steps) {
            allSteps.push(...segment.steps)
          }
        })
        
        navigationInstructions.value = allSteps
        currentStepIndex.value = 0
        currentRoute.value = route
        
        // Start location tracking
        startLocationTracking()
        
        // Speak first instruction if voice is enabled
        if (voiceEnabled.value && allSteps.length > 0) {
          speakInstruction(allSteps[0].instruction)
        }
      }
      
      currentNavigation.value = {
        id: `nav-${Date.now()}`,
        routeId: route.id,
        nextDirection: navigationInstructions.value[0]?.instruction || '',
        remainingDistance: remainingDistance.value,
        estimatedTime: estimatedTime.value,
        isEmergency: false
      }
      
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
    loading.value = true
    error.value = null
    
    try {
      // If we have active navigation, try API call
      if (isNavigating.value && currentNavigation.value) {
        const emergencyData = await triggerEmergencyRoute(currentNavigation.value.routeId)
        currentNavigation.value = { ...currentNavigation.value, ...emergencyData }
      } else {
        // For demo purposes, create mock emergency state
        console.log('🚨 EMERGENCY TRIGGERED! Creating demo emergency state...')
        currentNavigation.value = {
          id: 'emergency-demo',
          routeId: 'demo-route',
          nextDirection: 'Head to nearest exit point',
          remainingDistance: 0.5,
          estimatedTime: 15,
          emergencyRoute: {
            type: 'emergency',
            destination: 'Nearest Emergency Exit',
            instructions: 'Follow emergency markers to safety',
            estimatedTime: 15
          },
          isEmergency: true
        }
        isNavigating.value = true
      }
      
      isEmergency.value = true
      console.log('🚨 Emergency mode activated!')
      
    } catch (err) {
      error.value = err.message
      console.error('Failed to trigger emergency route:', err)
      
      // Even if API fails, activate emergency mode for demo
      console.log('🚨 API failed, activating emergency mode for demo...')
      isEmergency.value = true
      
      if (!currentNavigation.value) {
        currentNavigation.value = {
          id: 'emergency-demo',
          routeId: 'demo-route',
          nextDirection: 'Head to nearest exit point',
          remainingDistance: 0.5,
          estimatedTime: 15,
          emergencyRoute: {
            type: 'emergency',
            destination: 'Nearest Emergency Exit',
            instructions: 'Follow emergency markers to safety',
            estimatedTime: 15
          },
          isEmergency: true
        }
        isNavigating.value = true
      }
    } finally {
      loading.value = false
    }
  }

  const startLocationTracking = () => {
    if (locationWatchId.value) {
      stopLocationWatch(locationWatchId.value)
    }
    
    locationWatchId.value = watchLocation(
      (location) => {
        updateLocation(location)
        checkForNextStep(location)
      },
      (error) => {
        console.error('Location tracking error:', error)
        error.value = error.message
      }
    )
  }

  const checkForNextStep = (location) => {
    if (!isNavigating.value || navigationInstructions.value.length === 0) return
    
    // Simple distance-based step progression
    // In a real app, you'd use more sophisticated logic
    const currentStep = navigationInstructions.value[currentStepIndex.value]
    if (currentStep && currentStep.distance < 50) { // Less than 50m to next step
      nextStep()
    }
  }

  const nextStep = () => {
    if (currentStepIndex.value < navigationInstructions.value.length - 1) {
      currentStepIndex.value++
      
      // Speak next instruction if voice is enabled
      if (voiceEnabled.value) {
        const nextInstruction = navigationInstructions.value[currentStepIndex.value]
        if (nextInstruction) {
          speakInstruction(nextInstruction.instruction)
        }
      }
    } else {
      // Navigation complete
      completeNavigation()
    }
  }

  const speakInstruction = (instruction) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(instruction)
      utterance.rate = 0.8
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
    }
  }

  const toggleVoice = () => {
    voiceEnabled.value = !voiceEnabled.value
    if (voiceEnabled.value && currentStep.value) {
      speakInstruction(currentStep.value.instruction)
    }
  }

  const completeNavigation = () => {
    stopNavigation()
    console.log('🎉 Navigation completed!')
  }

  const stopNavigation = () => {
    if (locationWatchId.value) {
      stopLocationWatch(locationWatchId.value)
      locationWatchId.value = null
    }
    
    isNavigating.value = false
    isEmergency.value = false
    currentNavigation.value = null
    currentRoute.value = null
    navigationInstructions.value = []
    currentStepIndex.value = 0
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
    locationWatchId,
    currentRoute,
    navigationInstructions,
    currentStepIndex,
    voiceEnabled,
    
    // Getters
    nextDirection,
    remainingDistance,
    estimatedTime,
    emergencyRoute,
    currentStep,
    progressPercentage,
    
    // Actions
    startNavigation,
    updateLocation,
    triggerEmergency,
    stopNavigation,
    clearError,
    nextStep,
    toggleVoice,
    speakInstruction
  }
})
