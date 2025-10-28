<template>
  <div class="route-planner">
    <div class="planner-header">
      <h3>Advanced Route Planning</h3>
      <button 
        @click="togglePlanner" 
        class="toggle-btn"
        :class="{ active: isExpanded }"
      >
        {{ isExpanded ? '−' : '+' }}
      </button>
    </div>
    
    <div v-if="isExpanded" class="planner-content">
      <!-- Origin and Destination -->
      <div class="route-inputs">
        <div class="input-group">
          <label for="origin">Starting Point</label>
          <div class="location-input-container">
            <input
              id="origin"
              v-model="routeParams.origin"
              type="text"
              placeholder="Enter starting location"
              class="location-input"
              @input="handleOriginInput"
              @focus="showOriginSuggestions = true"
              @blur="hideOriginSuggestions"
            />
            <span class="location-icon">📍</span>
            
            <div v-if="showOriginSuggestions && originSuggestions.length > 0" class="suggestions-dropdown">
              <div 
                v-for="(suggestion, index) in originSuggestions" 
                :key="index"
                class="suggestion-item"
                @click="selectOriginSuggestion(suggestion)"
              >
                <span class="suggestion-icon">{{ getSuggestionIcon(suggestion.type) }}</span>
                <span class="suggestion-text">{{ suggestion.text }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="input-group">
          <label for="destination">Destination</label>
          <div class="location-input-container">
            <input
              id="destination"
              v-model="routeParams.destination"
              type="text"
              placeholder="Enter destination"
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
      </div>
      
      <!-- Route Preferences -->
      <div class="preferences-section">
        <h4>Route Preferences</h4>
        
        <div class="preferences-grid">
          <div class="preference-group">
            <label for="difficulty">Difficulty Level</label>
            <select id="difficulty" v-model="routeParams.preferences.difficulty" class="preference-select">
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
              v-model="routeParams.preferences.preferTrails"
              class="preference-checkbox"
            />
          </div>
          
          <div class="preference-group">
            <label for="avoidRoads">Avoid Roads</label>
            <input 
              id="avoidRoads" 
              type="checkbox" 
              v-model="routeParams.preferences.avoidRoads"
              class="preference-checkbox"
            />
          </div>
          
          <div class="preference-group">
            <label for="maxDistance">Max Distance (km)</label>
            <input 
              id="maxDistance" 
              type="number" 
              v-model="routeParams.preferences.maxDistance"
              min="1"
              max="50"
              class="preference-input"
            />
          </div>
        </div>
      </div>
      
      <!-- Route Options -->
      <div class="route-options">
        <h4>Route Options</h4>
        
        <div class="options-grid">
          <div class="option-group">
            <label>
              <input 
                type="radio" 
                v-model="routeParams.routeType" 
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
                v-model="routeParams.routeType" 
                value="multimodal"
                class="option-radio"
              />
              Multi-Modal (Transit + Hiking)
            </label>
          </div>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="planner-actions">
        <button 
          @click="calculateRoute" 
          class="calculate-btn"
          :disabled="!canCalculate || calculating"
        >
          {{ calculating ? 'Calculating...' : 'Calculate Route' }}
        </button>
        
        <button 
          @click="getAlternatives" 
          class="alternatives-btn"
          :disabled="!canCalculate || calculating"
        >
          Find Alternatives
        </button>
        
        <button 
          @click="clearRoute" 
          class="clear-btn"
        >
          Clear
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
              <div class="route-difficulty">{{ route.difficulty }}</div>
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
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  getSearchSuggestions, 
  geocodeAddress,
  calculateHikingRoute,
  calculateMultiModalRoute,
  getRouteAlternatives
} from '../api/api-spec.js'

// Props
const props = defineProps({
  selectedLocation: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['route-calculated', 'route-selected'])

// Reactive data
const isExpanded = ref(false)
const calculating = ref(false)

const routeParams = ref({
  origin: '',
  destination: '',
  routeType: 'hiking',
  preferences: {
    difficulty: '',
    preferTrails: true,
    avoidRoads: false,
    maxDistance: 10
  }
})

const originSuggestions = ref([])
const destinationSuggestions = ref([])
const showOriginSuggestions = ref(false)
const showDestinationSuggestions = ref(false)

const routeResults = ref([])
const selectedRouteIndex = ref(-1)

// Computed
const canCalculate = computed(() => {
  return routeParams.value.origin.trim() && routeParams.value.destination.trim()
})

// Methods
const togglePlanner = () => {
  isExpanded.value = !isExpanded.value
}

const handleOriginInput = async () => {
  if (routeParams.value.origin.length < 2) {
    originSuggestions.value = []
    return
  }
  
  try {
    const response = await getSearchSuggestions(routeParams.value.origin, null, 5)
    originSuggestions.value = response.suggestions || []
  } catch (error) {
    console.error('Error fetching origin suggestions:', error)
    originSuggestions.value = []
  }
}

const handleDestinationInput = async () => {
  if (routeParams.value.destination.length < 2) {
    destinationSuggestions.value = []
    return
  }
  
  try {
    const response = await getSearchSuggestions(routeParams.value.destination, null, 5)
    destinationSuggestions.value = response.suggestions || []
  } catch (error) {
    console.error('Error fetching destination suggestions:', error)
    destinationSuggestions.value = []
  }
}

const selectOriginSuggestion = async (suggestion) => {
  routeParams.value.origin = suggestion.text
  showOriginSuggestions.value = false
  originSuggestions.value = []
  
  if (suggestion.location) {
    // Use provided coordinates
  } else {
    try {
      const response = await geocodeAddress(suggestion.text)
      if (response.coordinates && response.coordinates.length > 0) {
        // Store coordinates for later use
      }
    } catch (error) {
      console.error('Error geocoding origin:', error)
    }
  }
}

const selectDestinationSuggestion = async (suggestion) => {
  routeParams.value.destination = suggestion.text
  showDestinationSuggestions.value = false
  destinationSuggestions.value = []
  
  if (suggestion.location) {
    // Use provided coordinates
  } else {
    try {
      const response = await geocodeAddress(suggestion.text)
      if (response.coordinates && response.coordinates.length > 0) {
        // Store coordinates for later use
      }
    } catch (error) {
      console.error('Error geocoding destination:', error)
    }
  }
}

const hideOriginSuggestions = () => {
  setTimeout(() => {
    showOriginSuggestions.value = false
  }, 200)
}

const hideDestinationSuggestions = () => {
  setTimeout(() => {
    showDestinationSuggestions.value = false
  }, 200)
}

const getSuggestionIcon = (type) => {
  const icons = {
    place: '📍',
    trail: '🥾',
    address: '🏠',
    poi: '⭐'
  }
  return icons[type] || '📍'
}

const calculateRoute = async () => {
  if (!canCalculate.value) return
  
  calculating.value = true
  routeResults.value = []
  
  try {
    let response
    
    if (routeParams.value.routeType === 'hiking') {
      response = await calculateHikingRoute(
        routeParams.value.origin,
        routeParams.value.destination,
        routeParams.value.preferences
      )
    } else {
      response = await calculateMultiModalRoute(
        routeParams.value.origin,
        routeParams.value.destination,
        routeParams.value.preferences
      )
    }
    
    // Generate instructions from route segments
    const generateInstructions = (segments) => {
      if (!segments || segments.length === 0) return []
      
      const instructions = []
      let stepNumber = 1
      
      segments.forEach((segment, index) => {
        if (segment.waypoints && segment.waypoints.length > 1) {
          // Add start instruction for first segment
          if (index === 0) {
            instructions.push(`${stepNumber}. Start at ${segment.waypoints[0].name || 'starting point'}`)
            stepNumber++
          }
          
          // Add mode-specific instructions
          if (segment.mode === 'walking') {
            instructions.push(`${stepNumber}. Walk ${formatDistance(segment.distance)} (${formatDuration(segment.duration)})`)
          } else if (segment.mode === 'transit') {
            instructions.push(`${stepNumber}. Take transit ${formatDistance(segment.distance)} (${formatDuration(segment.duration)})`)
          } else if (segment.mode === 'driving') {
            instructions.push(`${stepNumber}. Drive ${formatDistance(segment.distance)} (${formatDuration(segment.duration)})`)
          }
          stepNumber++
          
          // Add waypoint instructions
          for (let i = 1; i < segment.waypoints.length - 1; i++) {
            const waypoint = segment.waypoints[i]
            if (waypoint.name) {
              instructions.push(`${stepNumber}. Pass by ${waypoint.name}`)
              stepNumber++
            }
          }
          
          // Add end instruction for last segment
          if (index === segments.length - 1) {
            const lastWaypoint = segment.waypoints[segment.waypoints.length - 1]
            instructions.push(`${stepNumber}. Arrive at ${lastWaypoint.name || 'destination'}`)
          }
        }
      })
      
      return instructions
    }
    
    // Ensure response has proper structure for map display and route details
    const formattedRoute = {
      ...response,
      id: `route-${Date.now()}`,
      name: `Route from ${routeParams.value.origin} to ${routeParams.value.destination}`,
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
    
  } catch (error) {
    console.error('Error calculating route:', error)
    alert('Error calculating route. Please try again.')
  } finally {
    calculating.value = false
  }
}

const getAlternatives = async () => {
  if (!canCalculate.value) return
  
  calculating.value = true
  
  try {
    const response = await getRouteAlternatives(
      routeParams.value.origin,
      routeParams.value.destination,
      {
        maxAlternatives: 3,
        criteria: routeParams.value.preferences
      }
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
    
  } catch (error) {
    console.error('Error getting alternatives:', error)
    alert('Error getting route alternatives. Please try again.')
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
        // Add start instruction for first segment
        if (index === 0) {
          instructions.push(`${stepNumber}. Start at ${segment.waypoints[0].name || 'starting point'}`)
          stepNumber++
        }
        
        // Add mode-specific instructions
        if (segment.mode === 'walking') {
          instructions.push(`${stepNumber}. Walk ${formatDistance(segment.distance)} (${formatDuration(segment.duration)})`)
        } else if (segment.mode === 'transit') {
          instructions.push(`${stepNumber}. Take transit ${formatDistance(segment.distance)} (${formatDuration(segment.duration)})`)
        } else if (segment.mode === 'driving') {
          instructions.push(`${stepNumber}. Drive ${formatDistance(segment.distance)} (${formatDuration(segment.duration)})`)
        }
        stepNumber++
        
        // Add waypoint instructions
        for (let i = 1; i < segment.waypoints.length - 1; i++) {
          const waypoint = segment.waypoints[i]
          if (waypoint.name) {
            instructions.push(`${stepNumber}. Pass by ${waypoint.name}`)
            stepNumber++
          }
        }
        
        // Add end instruction for last segment
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
    name: route.name || `Route from ${routeParams.value.origin} to ${routeParams.value.destination}`,
    coordinates: route.coordinates || (route.segments ? route.segments.flatMap(segment => 
      segment.waypoints ? segment.waypoints.map(wp => ({ lat: wp.lat, lon: wp.lon })) : []
    ) : []),
    segments: route.segments || [],
    instructions: route.instructions || generateInstructions(route.segments),
    images: route.images || [], // Will be empty for now, can be populated later
    isSaved: route.isSaved || false,
    duration: route.totalDuration ? Math.round(route.totalDuration / 3600 * 10) / 10 : 0, // Convert to hours
    distance: route.totalDistance ? Math.round(route.totalDistance / 1000 * 10) / 10 : 0, // Convert to km
    difficulty: route.difficulty || 'moderate'
  }
  
  console.log('Formatted route for map:', formattedRoute)
  
  // Show success feedback
  showRouteSelectionFeedback()
  
  emit('route-selected', formattedRoute)
  
  // Also emit route-calculated to ensure it shows on map
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
  
  // Add to the route planner container
  const plannerElement = document.querySelector('.route-planner')
  if (plannerElement) {
    plannerElement.appendChild(notification)
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 3000)
  }
}

const clearRoute = () => {
  routeParams.value = {
    origin: '',
    destination: '',
    routeType: 'hiking',
    preferences: {
      difficulty: '',
      preferTrails: true,
      avoidRoads: false,
      maxDistance: 10
    }
  }
  routeResults.value = []
  selectedRouteIndex.value = -1
}

const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

// Watch for selected location changes
watch(() => props.selectedLocation, (newLocation) => {
  if (newLocation && !routeParams.value.origin) {
    routeParams.value.origin = `${newLocation.lat}, ${newLocation.lon}`
  }
})
</script>

<style scoped>
.route-planner {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.planner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.planner-header h3 {
  color: #2c3e50;
  font-size: 1.3rem;
  margin: 0;
}

.toggle-btn {
  background: #3498db;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  transition: background-color 0.2s;
}

.toggle-btn:hover {
  background: #2980b9;
}

.toggle-btn.active {
  background: #e74c3c;
}

.planner-content {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.route-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.location-input-container {
  position: relative;
}

.location-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.location-input:focus {
  outline: none;
  border-color: #3498db;
}

.location-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 1.2rem;
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
  max-height: 150px;
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

.preferences-section,
.route-options {
  margin-bottom: 1.5rem;
}

.preferences-section h4,
.route-options h4 {
  color: #2c3e50;
  font-size: 1.1rem;
  margin-bottom: 1rem;
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

.planner-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.calculate-btn,
.alternatives-btn,
.clear-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.calculate-btn {
  background: #27ae60;
  color: white;
  flex: 1;
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

.clear-btn {
  background: #e74c3c;
  color: white;
}

.clear-btn:hover {
  background: #c0392b;
}

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
  .route-inputs {
    grid-template-columns: 1fr;
  }
  
  .preferences-grid {
    grid-template-columns: 1fr;
  }
  
  .options-grid {
    flex-direction: column;
    gap: 1rem;
  }
  
  .planner-actions {
    flex-direction: column;
  }
  
  .route-option {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .route-details {
    margin: 0;
  }
}
</style>
