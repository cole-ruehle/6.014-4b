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
        <h3>Next Direction</h3>
        <div class="direction-card">
          <div class="direction-icon red-arrow">↗️</div>
          <div class="direction-text">enter park on the right</div>
        </div>
        <div class="direction-card">
          <div class="direction-icon black-arrow">↖️</div>
          <div class="direction-text">follow the left path</div>
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
    <div v-if="showStatusUpdates" class="status-panel">
      <h4>Status Updates</h4>
      <div class="status-list">
        <div 
          v-for="update in statusUpdates" 
          :key="update.id"
          class="status-item"
          :class="update.type"
        >
          <span class="status-time">{{ formatTime(update.timestamp) }}</span>
          <span class="status-message">{{ update.message }}</span>
        </div>
      </div>
    </div>
    
    <!-- Modify Route Panel -->
    <div v-if="showModifyRoute" class="modify-panel">
      <h4>Modify Route</h4>
      <div class="modify-options">
        <button @click="modifyRoute('shortcut')" class="modify-option">
          Take Shortcut
        </button>
        <button @click="modifyRoute('avoid')" class="modify-option">
          Avoid Area
        </button>
        <button @click="modifyRoute('detour')" class="modify-option">
          Take Detour
        </button>
      </div>
    </div>
    
    <!-- Suggestions Panel -->
    <div v-if="showSuggestions" class="suggestions-panel">
      <h4>Suggested Modifications</h4>
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

const emit = defineEmits(['stop-navigation', 'emergency'])

const navigationStore = useNavigationStore()
const statusStore = useStatusStore()

const showStatusUpdates = ref(false)
const showModifyRoute = ref(false)
const showSuggestions = ref(false)

const isEmergency = computed(() => navigationStore.isEmergency)
const statusUpdates = computed(() => statusStore.recentUpdates)

const routeSuggestions = ref([
  { id: 1, text: 'Take the scenic route through the park' },
  { id: 2, text: 'Avoid the busy intersection ahead' },
  { id: 3, text: 'Add a rest stop at the next viewpoint' }
])

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

const modifyRoute = (type) => {
  console.log('Modify route:', type)
  // In a real app, this would call the API to modify the route
}

const applySuggestion = (suggestion) => {
  console.log('Apply suggestion:', suggestion)
  // In a real app, this would apply the suggestion
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
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

.status-panel,
.modify-panel,
.suggestions-panel {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.status-panel h4,
.modify-panel h4,
.suggestions-panel h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.status-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  border-left: 4px solid #3498db;
}

.status-item.emergency {
  border-left-color: #dc2626;
  background: #fef2f2;
}

.status-item.warning {
  border-left-color: #f59e0b;
  background: #fffbeb;
}

.status-time {
  font-size: 0.8rem;
  color: #7f8c8d;
  min-width: 80px;
}

.status-message {
  flex: 1;
  color: #2c3e50;
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
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 6px;
  border: 2px solid #e1e8ed;
}

.suggestion-text {
  flex: 1;
  color: #2c3e50;
}

.apply-btn {
  padding: 0.5rem 1rem;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.apply-btn:hover {
  background: #229954;
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
}
</style>
