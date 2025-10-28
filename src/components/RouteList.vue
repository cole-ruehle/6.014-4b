<template>
  <div class="route-list">
    <div class="list-header">
      <h2>{{ startLocation }} - {{ duration }}hr Routes</h2>
      <button class="filters-button" @click="toggleFilters">
        Filters
      </button>
    </div>
    
    <div class="filters-panel" v-if="showFilters">
      <div class="filter-group">
        <label>Difficulty:</label>
        <select v-model="filters.difficulty">
          <option value="">All</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Transport:</label>
        <div class="transport-options">
          <label v-for="mode in transportModes" :key="mode">
            <input 
              type="checkbox" 
              :value="mode" 
              v-model="filters.transportModes"
            />
            {{ mode }}
          </label>
        </div>
      </div>
      
      <button @click="applyFilters" class="apply-filters-btn">
        Apply Filters
      </button>
    </div>
    
    <div v-if="filteredRoutes.length === 0" class="no-routes">
      <div class="no-routes-icon">🛤️</div>
      <h3>No routes found</h3>
      <p>Try adjusting your search criteria or filters</p>
      <div class="debug-info">
        <p><strong>Debug Info:</strong></p>
        <p>Total routes: {{ props.routes.length }}</p>
        <p>Filtered routes: {{ filteredRoutes.length }}</p>
        <p>Current page: {{ currentPage }}</p>
      </div>
    </div>
    
    <div class="routes-container" v-else>
      <div 
        v-for="route in filteredRoutes" 
        :key="route.id"
        class="route-card"
        @click="selectRoute(route)"
      >
        <div class="route-image">
          <div class="image-placeholder">
            🌲
          </div>
        </div>
        
        <div class="route-info">
          <div class="transit-info">
            <div class="transit-time">{{ route.transitTime }}hr transit</div>
            <div class="transit-distance">{{ route.transitDistance }} miles</div>
            <div class="transport-modes">
              <span v-for="mode in route.transportModes" :key="mode" class="transport-icon">
                {{ getTransportIcon(mode) }}
              </span>
            </div>
          </div>
          
          <div class="hike-info">
            <div class="hike-time">{{ route.hikeTime }}hr hike</div>
            <div class="hike-distance">{{ route.hikeDistance }} miles</div>
            <div class="difficulty">Difficulty: {{ route.difficulty }}</div>
          </div>
        </div>
        
        <div class="route-actions">
          <button 
            @click.stop="toggleSave(route.id)"
            class="save-button"
            :class="{ saved: route.isSaved }"
          >
            {{ route.isSaved ? '⭐' : '☆' }}
          </button>
        </div>
      </div>
    </div>
    
    <div class="pagination" v-if="totalPages > 1">
      <div class="pagination-dots">
        <span 
          v-for="page in totalPages" 
          :key="page"
          class="dot"
          :class="{ active: currentPage === page }"
        ></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  routes: {
    type: Array,
    default: () => []
  },
  startLocation: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['route-selected', 'route-saved'])

const showFilters = ref(false)
const currentPage = ref(1)
const itemsPerPage = 6

const filters = ref({
  difficulty: '',
  transportModes: []
})

const transportModes = ['bus', 'car', 'walk']

const filteredRoutes = computed(() => {
  console.log('RouteList - props.routes:', props.routes)
  let filtered = [...props.routes]
  
  if (filters.value.difficulty) {
    filtered = filtered.filter(route => route.difficulty === filters.value.difficulty)
  }
  
  if (filters.value.transportModes.length > 0) {
    filtered = filtered.filter(route => 
      filters.value.transportModes.some(mode => 
        route.transportModes.includes(mode)
      )
    )
  }
  
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  const result = filtered.slice(start, end)
  console.log('RouteList - filtered routes:', result)
  return result
})

const totalPages = computed(() => {
  return Math.ceil(props.routes.length / itemsPerPage)
})

const getTransportIcon = (mode) => {
  const icons = {
    bus: '🚌',
    car: '🚗',
    walk: '🚶'
  }
  return icons[mode] || '🚌'
}

const selectRoute = (route) => {
  emit('route-selected', route)
}

const toggleSave = (routeId) => {
  emit('route-saved', routeId)
}

const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const applyFilters = () => {
  currentPage.value = 1
  showFilters.value = false
}

// Debug: Log when component is created
console.log('RouteList component created with routes:', props.routes)
</script>

<style scoped>
.route-list {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #ecf0f1;
}

.list-header h2 {
  color: #2c3e50;
  font-size: 1.5rem;
}

.filters-button {
  padding: 0.5rem 1rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.filters-button:hover {
  background: #2980b9;
}

.filters-panel {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  display: flex;
  gap: 2rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: #2c3e50;
}

.filter-group select {
  padding: 0.5rem;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  background: white;
}

.transport-options {
  display: flex;
  gap: 1rem;
}

.transport-options label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: normal;
  cursor: pointer;
}

.apply-filters-btn {
  padding: 0.5rem 1rem;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.routes-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.route-card {
  border: 2px solid #e1e8ed;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.route-card:hover {
  border-color: #3498db;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.15);
}

.route-image {
  flex-shrink: 0;
}

.image-placeholder {
  width: 60px;
  height: 60px;
  background: #e8f5e8;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.route-info {
  flex: 1;
  display: flex;
  gap: 1rem;
}

.transit-info,
.hike-info {
  flex: 1;
}

.transit-time,
.hike-time {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.transit-distance,
.hike-distance {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.transport-modes {
  display: flex;
  gap: 0.5rem;
}

.transport-icon {
  font-size: 1.2rem;
}

.difficulty {
  color: #e67e22;
  font-weight: 500;
  font-size: 0.9rem;
}

.route-actions {
  flex-shrink: 0;
}

.save-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.save-button:hover {
  background: #f8f9fa;
}

.save-button.saved {
  color: #f39c12;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.pagination-dots {
  display: flex;
  gap: 0.5rem;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #bdc3c7;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dot.active {
  background: #3498db;
}

.no-routes {
  text-align: center;
  padding: 3rem 2rem;
  color: #7f8c8d;
}

.no-routes-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.no-routes h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.no-routes p {
  margin-bottom: 1rem;
}

.debug-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
  text-align: left;
  font-size: 0.9rem;
}

.debug-info p {
  margin: 0.25rem 0;
}

@media (max-width: 768px) {
  .routes-container {
    grid-template-columns: 1fr;
  }
  
  .filters-panel {
    flex-direction: column;
    align-items: stretch;
  }
  
  .transport-options {
    flex-wrap: wrap;
  }
}
</style>
