import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  getStatusUpdates, 
  postStatusUpdate 
} from '../api/api-spec.js'

export const useStatusStore = defineStore('status', () => {
  // State
  const statusUpdates = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const recentUpdates = computed(() => {
    return statusUpdates.value
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10)
  })

  const emergencyUpdates = computed(() => {
    return statusUpdates.value.filter(update => update.type === 'emergency')
  })

  const hasActiveEmergency = computed(() => {
    return emergencyUpdates.value.length > 0
  })

  // Actions
  const loadStatusUpdates = async () => {
    loading.value = true
    error.value = null
    
    try {
      const updates = await getStatusUpdates()
      statusUpdates.value = updates
    } catch (err) {
      error.value = err.message
      console.error('Failed to load status updates:', err)
    } finally {
      loading.value = false
    }
  }

  const addStatusUpdate = async (update) => {
    try {
      const newUpdate = await postStatusUpdate({
        ...update,
        timestamp: new Date().toISOString()
      })
      statusUpdates.value.unshift(newUpdate)
      return newUpdate
    } catch (err) {
      error.value = err.message
      console.error('Failed to add status update:', err)
      throw err
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    statusUpdates,
    loading,
    error,
    
    // Getters
    recentUpdates,
    emergencyUpdates,
    hasActiveEmergency,
    
    // Actions
    loadStatusUpdates,
    addStatusUpdate,
    clearError
  }
})
