<template>
  <div class="poi-list">
    <div class="poi-header">
      <h3>Points of Interest</h3>
      <div class="poi-filters">
        <select v-model="selectedType" @change="filterPOIs" class="type-filter">
          <option value="">All Types</option>
          <option value="trail">Trails</option>
          <option value="trailhead">Trailheads</option>
          <option value="viewpoint">Viewpoints</option>
          <option value="campground">Campgrounds</option>
        </select>
      </div>
    </div>
    
    <div class="poi-content">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>Loading POIs...</span>
      </div>
      
      <div v-else-if="filteredPOIs.length === 0" class="no-pois">
        <div class="no-pois-icon">📍</div>
        <p>No points of interest found in this area</p>
        <button @click="refreshPOIs" class="refresh-btn">Refresh</button>
      </div>
      
      <div v-else class="poi-grid">
        <div 
          v-for="poi in filteredPOIs" 
          :key="poi.id"
          class="poi-card"
          @click="selectPOI(poi)"
        >
          <div class="poi-icon">
            {{ getPOIIcon(poi.type) }}
          </div>
          
          <div class="poi-info">
            <h4 class="poi-name">{{ poi.name }}</h4>
            <p class="poi-type">{{ formatType(poi.type) }}</p>
            <p v-if="poi.description" class="poi-description">{{ poi.description }}</p>
            
            <div class="poi-details">
              <span v-if="poi.difficulty" class="poi-difficulty">
                {{ poi.difficulty }}
              </span>
              <span v-if="poi.distance" class="poi-distance">
                {{ formatDistance(poi.distance) }}
              </span>
              <span v-if="poi.elevation" class="poi-elevation">
                {{ poi.elevation }}m
              </span>
            </div>
          </div>
          
          <div class="poi-actions">
            <button @click.stop="addToRoute(poi)" class="add-to-route-btn">
              Add to Route
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouteStore } from '../stores/routeStore.js'

// Props
const props = defineProps({
  center: {
    type: Object,
    required: true
  },
  radius: {
    type: Number,
    default: 10
  }
})

// Emits
const emit = defineEmits(['poi-selected', 'poi-added-to-route'])

// Store
const routeStore = useRouteStore()

// Reactive data
const selectedType = ref('')
const loading = ref(false)

// Computed
const pois = computed(() => routeStore.pois)
const filteredPOIs = computed(() => {
  if (!selectedType.value) {
    return pois.value
  }
  return pois.value.filter(poi => poi.type === selectedType.value)
})

// Methods
const loadPOIs = async () => {
  loading.value = true
  try {
    await routeStore.loadPOIs(props.center, ['trail', 'trailhead', 'viewpoint', 'campground'], props.radius)
  } catch (error) {
    console.error('Error loading POIs:', error)
  } finally {
    loading.value = false
  }
}

const filterPOIs = () => {
  // Filtering is handled by computed property
}

const refreshPOIs = () => {
  loadPOIs()
}

const selectPOI = (poi) => {
  emit('poi-selected', poi)
}

const addToRoute = (poi) => {
  emit('poi-added-to-route', poi)
}

const getPOIIcon = (type) => {
  const icons = {
    trail: '🥾',
    trailhead: '🚶‍♂️',
    viewpoint: '👁️',
    campground: '⛺',
    parking: '🅿️',
    restroom: '🚻',
    water: '💧'
  }
  return icons[type] || '📍'
}

const formatType = (type) => {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

// Lifecycle
onMounted(() => {
  loadPOIs()
})

// Watch for center changes
watch(() => props.center, () => {
  loadPOIs()
}, { deep: true })
</script>

<style scoped>
.poi-list {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 500px;
  overflow-y: auto;
}

.poi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #ecf0f1;
}

.poi-header h3 {
  color: #2c3e50;
  font-size: 1.3rem;
  margin: 0;
}

.poi-filters {
  display: flex;
  gap: 1rem;
}

.type-filter {
  padding: 0.5rem;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
}

.type-filter:focus {
  outline: none;
  border-color: #3498db;
}

.poi-content {
  min-height: 200px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #7f8c8d;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-pois {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: #7f8c8d;
}

.no-pois-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.no-pois p {
  margin-bottom: 1rem;
  font-style: italic;
}

.refresh-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.refresh-btn:hover {
  background: #2980b9;
}

.poi-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.poi-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.poi-card:hover {
  border-color: #3498db;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.15);
}

.poi-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.poi-info {
  flex: 1;
  min-width: 0;
}

.poi-name {
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.poi-type {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
  text-transform: capitalize;
}

.poi-description {
  color: #555;
  font-size: 0.85rem;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.poi-details {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.poi-difficulty,
.poi-distance,
.poi-elevation {
  background: #ecf0f1;
  color: #2c3e50;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.poi-difficulty {
  background: #e67e22;
  color: white;
}

.poi-actions {
  flex-shrink: 0;
}

.add-to-route-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.add-to-route-btn:hover {
  background: #229954;
}

@media (max-width: 768px) {
  .poi-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .poi-filters {
    justify-content: center;
  }
  
  .poi-card {
    flex-direction: column;
    text-align: center;
  }
  
  .poi-info {
    width: 100%;
  }
  
  .poi-name {
    white-space: normal;
  }
}
</style>
