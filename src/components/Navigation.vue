<template>
  <div class="navigation" :class="{ emergency: isEmergency }">
    <div class="navigation-header">
      <div class="app-logo">4w</div>
      <h2>Navigation</h2>
    </div>
    
    <div class="navigation-content">
      <div class="map-section">
        <div class="map-view">
          <div class="map-placeholder">
            <div class="current-location">
              <div class="location-marker">📍</div>
            </div>
            <div class="route-path">
              <div class="path-segment blue"></div>
              <div class="path-segment orange"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="direction-section">
        <h3>Navigation</h3>
        
        <!-- Progress Bar -->
        <div class="progress-section">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <div class="progress-text">{{ progressPercentage }}% Complete</div>
        </div>
        
        <!-- Current Step -->
        <div v-if="currentStep" class="current-step">
          <div class="step-number">Step {{ currentStepIndex + 1 }} of {{ navigationInstructions.length }}</div>
          <div class="direction-card current">
            <div class="direction-icon">{{ getDirectionIcon(currentStep.type) }}</div>
            <div class="direction-text">{{ currentStep.instruction }}</div>
          </div>
          <div class="step-details">
            <div class="step-distance">{{ formatDistance(currentStep.distance) }}</div>
            <div class="step-duration">{{ formatDuration(currentStep.duration) }}</div>
          </div>
        </div>
        
        <!-- Next Steps Preview -->
        <div v-if="nextSteps.length > 0" class="next-steps">
          <h4>Upcoming Directions</h4>
          <div 
            v-for="(step, index) in nextSteps" 
            :key="index"
            class="direction-card upcoming"
          >
            <div class="direction-icon">{{ getDirectionIcon(step.type) }}</div>
            <div class="direction-text">{{ step.instruction }}</div>
          </div>
        </div>
        
        <!-- Voice Controls -->
        <div class="voice-controls">
          <button 
            @click="toggleVoice"
            class="voice-button"
            :class="{ active: voiceEnabled }"
          >
            {{ voiceEnabled ? '🔊 Voice On' : '🔇 Voice Off' }}
          </button>
        </div>
      </div>
    </div>
    
    <div class="navigation-controls">
      <button 
        @click="showStatusUpdates = !showStatusUpdates"
        class="control-button status-updates"
        :class="{ active: showStatusUpdates }"
      >
        Status Updates
      </button>
      
      <button 
        @click="showModifyRoute = !showModifyRoute"
        class="control-button modify-route"
        :class="{ active: showModifyRoute }"
      >
        Modify Route
      </button>
      
      <button 
        @click="showSuggestions = !showSuggestions"
        class="control-button suggestions"
        :class="{ active: showSuggestions }"
      >
        Suggested Modifications
      </button>
      
      <button 
        @click="triggerEmergency"
        class="control-button emergency"
        :class="{ active: isEmergency }"
      >
        Emergency
      </button>
    </div>
    
    <!-- Status Updates Panel -->
    <div v-if="showStatusUpdates" class="popup-overlay" @click="showStatusUpdates = false">
      <div class="popup-panel status-panel" @click.stop>
        <div class="popup-header">
          <h4>Status Updates</h4>
          <button @click="showStatusUpdates = false" class="close-btn">×</button>
        </div>
        <div class="status-list">
          <div 
            v-for="update in statusUpdates" 
            :key="update.id"
            class="status-item"
            :class="update.type"
          >
            <div class="status-time">{{ formatTime(update.timestamp) }}</div>
            <div class="status-message">{{ update.message }}</div>
          </div>
          <div v-if="statusUpdates.length === 0" class="no-updates">
            <div class="no-updates-icon">📋</div>
            <p>No status updates available</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Route Modifier Component -->
    <RouteModifier 
      v-if="showModifyRoute"
      :route-id="currentRouteId"
      :is-visible="showModifyRoute"
      @modification-applied="handleModificationApplied"
      @close="showModifyRoute = false"
    />
    
    <!-- Suggestions Panel -->
    <div v-if="showSuggestions" class="popup-overlay" @click="showSuggestions = false">
      <div class="popup-panel suggestions-panel" @click.stop>
        <div class="popup-header">
          <h4>Suggested Modifications</h4>
          <button @click="showSuggestions = false" class="close-btn">×</button>
        </div>
        <div class="suggestion-list">
          <div 
            v-for="suggestion in routeSuggestions" 
            :key="suggestion.id"
            class="suggestion-item"
          >
            <div class="suggestion-text">{{ suggestion.text }}</div>
            <button @click="applySuggestion(suggestion)" class="apply-btn">
              Apply
            </button>
          </div>
          <div v-if="routeSuggestions.length === 0" class="no-suggestions">
            <div class="no-suggestions-icon">💡</div>
            <p>No suggestions available at this time</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="navigation-footer">
      <button @click="stopNavigation" class="stop-navigation-btn">
        Stop Navigation
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNavigationStore } from '../stores/navigationStore.js'
import { useStatusStore } from '../stores/statusStore.js'
import RouteModifier from './RouteModifier.vue'

const emit = defineEmits(['stop-navigation', 'emergency'])

const navigationStore = useNavigationStore()
const statusStore = useStatusStore()

const showStatusUpdates = ref(false)
const showModifyRoute = ref(false)
const showSuggestions = ref(false)

const isEmergency = computed(() => navigationStore.isEmergency)
const statusUpdates = computed(() => statusStore.recentUpdates)

// Real navigation data
const currentStep = computed(() => navigationStore.currentStep)
const currentStepIndex = computed(() => navigationStore.currentStepIndex)
const navigationInstructions = computed(() => navigationStore.navigationInstructions)
const progressPercentage = computed(() => navigationStore.progressPercentage)
const voiceEnabled = computed(() => navigationStore.voiceEnabled)

const nextSteps = computed(() => {
  if (navigationInstructions.value.length === 0) return []
  return navigationInstructions.value.slice(currentStepIndex.value + 1, currentStepIndex.value + 4)
})

const routeSuggestions = ref([
  { id: 1, text: 'Take the scenic route through the park' },
  { id: 2, text: 'Avoid the busy intersection ahead' },
  { id: 3, text: 'Add a rest stop at the next viewpoint' }
])

const currentRouteId = computed(() => {
  return navigationStore.currentNavigation?.routeId || 'demo-route'
})

const triggerEmergency = async () => {
  try {
    await navigationStore.triggerEmergency()
    emit('emergency')
  } catch (error) {
    console.error('Failed to trigger emergency:', error)
  }
}

const stopNavigation = () => {
  emit('stop-navigation')
}

const handleModificationApplied = (modification) => {
  console.log('Route modification applied:', modification)
  showModifyRoute.value = false
  // In a real app, this would update the navigation with the new route
}

const applySuggestion = (suggestion) => {
  console.log('Apply suggestion:', suggestion)
  // In a real app, this would apply the suggestion
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

const formatDuration = (seconds) => {
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

const getDirectionIcon = (type) => {
  const icons = {
    0: '⬆️', // straight
    1: '↗️', // slight right
    2: '➡️', // right
    3: '↘️', // sharp right
    4: '⬇️', // u-turn
    5: '↙️', // sharp left
    6: '⬅️', // left
    7: '↖️', // slight left
    8: '🏁', // destination
    9: '📍', // waypoint
  }
  return icons[type] || '⬆️'
}

const toggleVoice = () => {
  navigationStore.toggleVoice()
}

// Mock location updates
let locationInterval = null

onMounted(() => {
  statusStore.loadStatusUpdates()
  
  // Simulate location updates
  locationInterval = setInterval(() => {
    const mockLocation = {
      lat: 42.3601 + (Math.random() - 0.5) * 0.01,
      lng: -71.0589 + (Math.random() - 0.5) * 0.01
    }
    navigationStore.updateLocation(mockLocation)
  }, 5000)
})

onUnmounted(() => {
  if (locationInterval) {
    clearInterval(locationInterval)
  }
})
</script>

<style scoped>
.navigation {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
}

.navigation.emergency {
  border: 3px solid #dc2626;
  background: #fef2f2;
}

.navigation-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #ecf0f1;
}

.app-logo {
  width: 40px;
  height: 40px;
  background: #3498db;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.navigation-header h2 {
  color: #2c3e50;
  font-size: 1.5rem;
}

.navigation-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.map-view {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  min-height: 200px;
}

.map-placeholder {
  width: 100%;
  height: 100%;
  position: relative;
  background: #e8f5e8;
  border-radius: 6px;
  overflow: hidden;
}

.current-location {
  position: absolute;
  bottom: 20%;
  left: 20%;
}

.location-marker {
  font-size: 2rem;
}

.route-path {
  position: absolute;
  width: 100%;
  height: 100%;
}

.path-segment {
  position: absolute;
  height: 6px;
  border-radius: 3px;
}

.path-segment.blue {
  background: #2563eb;
  bottom: 30%;
  left: 20%;
  width: 50%;
  transform: rotate(15deg);
}

.path-segment.orange {
  background: #f97316;
  bottom: 40%;
  left: 50%;
  width: 30%;
  transform: rotate(-20deg);
}

.direction-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.direction-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.direction-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.direction-icon.red-arrow {
  background: #fecaca;
  color: #dc2626;
}

.direction-icon.black-arrow {
  background: #e5e7eb;
  color: #374151;
}

.direction-text {
  flex: 1;
  font-weight: 500;
  color: #2c3e50;
}

/* Progress Bar */
.progress-section {
  margin-bottom: 1.5rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e1e8ed;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #27ae60, #2ecc71);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 500;
}

/* Current Step */
.current-step {
  margin-bottom: 1.5rem;
}

.step-number {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
  text-align: center;
}

.direction-card.current {
  background: #e3f2fd;
  border: 2px solid #3498db;
  font-weight: 600;
}

.step-details {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #7f8c8d;
}

/* Next Steps */
.next-steps {
  margin-bottom: 1.5rem;
}

.next-steps h4 {
  color: #2c3e50;
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.direction-card.upcoming {
  background: #f8f9fa;
  opacity: 0.8;
  font-size: 0.9rem;
}

.direction-card.upcoming .direction-text {
  font-weight: 400;
}

/* Voice Controls */
.voice-controls {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.voice-button {
  padding: 0.75rem 1.5rem;
  background: #f8f9fa;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.voice-button:hover {
  background: #e9ecef;
}

.voice-button.active {
  background: #27ae60;
  color: white;
  border-color: #27ae60;
}

.navigation-controls {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.control-button {
  padding: 1rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.control-button:hover {
  background: #f8f9fa;
}

.control-button.active {
  background: #e3f2fd;
  border-color: #3498db;
  color: #2980b9;
}

.control-button.emergency {
  border-color: #fecaca;
  color: #dc2626;
}

.control-button.emergency:hover {
  background: #fef2f2;
}

.control-button.emergency.active {
  background: #dc2626;
  color: white;
  border-color: #dc2626;
}

/* Popup Overlay */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease-out;
}

.popup-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e5e5;
  background: #f8f9fa;
}

.popup-header h4 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #e9ecef;
  color: #e74c3c;
}

.status-panel,
.suggestions-panel {
  background: white;
}

.status-panel .popup-header,
.suggestions-panel .popup-header {
  background: #f8f9fa;
}

.status-list {
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
  margin-bottom: 0.75rem;
  transition: all 0.2s;
}

.status-item:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

.status-item.emergency {
  border-left-color: #dc2626;
  background: #fef2f2;
}

.status-item.emergency:hover {
  background: #fee2e2;
}

.status-item.warning {
  border-left-color: #f59e0b;
  background: #fffbeb;
}

.status-item.warning:hover {
  background: #fef3c7;
}

.status-time {
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: 500;
}

.status-message {
  color: #2c3e50;
  font-weight: 500;
  line-height: 1.4;
}

.no-updates,
.no-suggestions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: #7f8c8d;
}

.no-updates-icon,
.no-suggestions-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.modify-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.modify-option {
  padding: 0.75rem;
  background: white;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.modify-option:hover {
  background: #f8f9fa;
  border-color: #3498db;
}

.suggestion-list {
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e1e8ed;
  margin-bottom: 0.75rem;
  transition: all 0.2s;
}

.suggestion-item:hover {
  background: #e9ecef;
  border-color: #3498db;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.15);
}

.suggestion-text {
  flex: 1;
  color: #2c3e50;
  font-weight: 500;
  line-height: 1.4;
  margin-right: 1rem;
}

.apply-btn {
  padding: 0.5rem 1rem;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
}

.apply-btn:hover {
  background: #229954;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(34, 153, 84, 0.3);
}

.navigation-footer {
  display: flex;
  justify-content: center;
  padding-top: 2rem;
  border-top: 2px solid #ecf0f1;
}

.stop-navigation-btn {
  padding: 1rem 2rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.stop-navigation-btn:hover {
  background: #c0392b;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .navigation-content {
    grid-template-columns: 1fr;
  }
  
  .navigation-controls {
    grid-template-columns: 1fr;
  }
  
  .suggestion-item {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
  
  .popup-panel {
    width: 95%;
    margin: 1rem;
  }
}
</style>
