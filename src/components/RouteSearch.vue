<template>
  <div class="route-search">
    <div class="search-form">
      <div class="input-row">
        <div class="input-group">
          <label for="start-location">When to start...</label>
          <input
            id="start-location"
            v-model="searchParams.startLocation"
            type="text"
            placeholder="Enter starting location"
            class="location-input"
          />
          <span class="location-icon">📍</span>
        </div>
        
        <div class="input-group">
          <label for="duration">Duration</label>
          <select
            id="duration"
            v-model="searchParams.duration"
            class="duration-select"
          >
            <option value="1">1hr</option>
            <option value="2">2hr</option>
            <option value="3">3hr</option>
            <option value="4">4hr</option>
            <option value="5">5hr</option>
            <option value="6">6hr</option>
          </select>
        </div>
      </div>
      
      <div class="input-group full-width">
        <label for="hiking-trail">(Optional) hiking trail</label>
        <input
          id="hiking-trail"
          v-model="searchParams.hikingTrail"
          type="text"
          placeholder="Enter specific trail name"
          class="trail-input"
        />
      </div>
      
      <button 
        @click="handleSearch" 
        class="search-button"
        :disabled="loading"
      >
        {{ loading ? 'Searching...' : 'Find Routes' }}
      </button>
    </div>
    
    <div class="saved-routes" v-if="savedRoutes.length > 0">
      <h3>Saved Routes</h3>
      <div class="saved-routes-list">
        <div 
          v-for="route in savedRoutes" 
          :key="route.id"
          class="saved-route-item"
          @click="selectSavedRoute(route)"
        >
          <div class="route-path">🛤️</div>
          <span class="route-duration">{{ route.duration }}hr</span>
          <span class="route-name">{{ route.name }}</span>
          <span class="star-icon">⭐</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouteStore } from '../stores/routeStore.js'

const emit = defineEmits(['search'])

const routeStore = useRouteStore()

const searchParams = ref({
  startLocation: '',
  duration: 1,
  hikingTrail: ''
})

const loading = computed(() => routeStore.loading)
const savedRoutes = computed(() => routeStore.savedRoutes)

const handleSearch = async () => {
  if (!searchParams.value.startLocation.trim()) {
    alert('Please enter a starting location')
    return
  }
  
  emit('search', { ...searchParams.value })
}

const selectSavedRoute = (route) => {
  emit('search', {
    startLocation: route.startLocation,
    duration: route.duration,
    hikingTrail: route.name
  })
}

onMounted(() => {
  routeStore.loadSavedRoutes()
})
</script>

<style scoped>
.route-search {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.search-form {
  margin-bottom: 2rem;
}

.input-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.input-group.full-width {
  width: 100%;
}

.input-group label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.location-input,
.trail-input {
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.location-input:focus,
.trail-input:focus {
  outline: none;
  border-color: #3498db;
}

.location-input {
  position: relative;
}

.location-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.duration-select {
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
}

.duration-select:focus {
  outline: none;
  border-color: #3498db;
}

.search-button {
  width: 100%;
  padding: 1rem;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-button:hover:not(:disabled) {
  background: #229954;
}

.search-button:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.saved-routes {
  border-top: 2px solid #ecf0f1;
  padding-top: 1.5rem;
}

.saved-routes h3 {
  color: #e67e22;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.saved-routes-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.saved-route-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.saved-route-item:hover {
  background: #e9ecef;
}

.route-path {
  font-size: 1.2rem;
}

.route-duration {
  font-weight: 600;
  color: #2c3e50;
  min-width: 3rem;
}

.route-name {
  flex: 1;
  color: #34495e;
}

.star-icon {
  color: #f39c12;
}

@media (max-width: 768px) {
  .input-row {
    flex-direction: column;
  }
  
  .route-search {
    padding: 1.5rem;
  }
}
</style>
