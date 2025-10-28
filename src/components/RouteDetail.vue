<template>
  <div class="route-detail">
    <div class="route-header">
      <h1>{{ route.name }}</h1>
      <button 
        @click="toggleSave"
        class="save-button"
        :class="{ saved: route.isSaved }"
      >
        <span class="heart-icon">{{ route.isSaved ? '❤️' : '🤍' }}</span>
        {{ route.isSaved ? 'Saved' : 'Save' }}
      </button>
    </div>
    
    <div class="pictures-section">
      <h3>Pictures:</h3>
      <div class="pictures-grid">
        <div 
          v-for="(image, index) in route.images" 
          :key="index"
          class="picture-placeholder"
        >
          <img 
            v-if="image" 
            :src="image" 
            :alt="`Route image ${index + 1}`"
            class="route-image"
          />
          <div v-else class="placeholder-content">
            {{ getPlaceholderImage(index) }}
          </div>
        </div>
      </div>
    </div>
    
    <div class="content-grid">
      <div class="directions-section">
        <h3>Route Map</h3>
        <div class="map-container">
          <HikingMap 
            v-if="route.coordinates && route.coordinates.length > 0"
            :center="mapCenter"
            :route="route"
            :height="'300px'"
            @map-ready="handleMapReady"
          />
          <div v-else class="map-placeholder">
            <div class="route-path">
              <div class="route-line orange"></div>
              <div class="route-line red"></div>
              <div class="route-line blue"></div>
            </div>
            <div class="waypoint"></div>
            <div class="no-route-message">
              <p>No route data available for map display</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="instructions-section">
        <h3>Instructions</h3>
        <div class="instructions-list">
          <div 
            v-for="(instruction, index) in route.instructions" 
            :key="index"
            class="instruction-item"
          >
            {{ instruction }}
          </div>
        </div>
      </div>
    </div>
    
    <div class="similar-routes">
      <h3>Similar Routes</h3>
      <div class="similar-routes-grid">
        <div 
          v-for="similarRoute in similarRoutes" 
          :key="similarRoute.id"
          class="similar-route-card"
          @click="selectSimilarRoute(similarRoute)"
        >
          <div class="route-duration">{{ similarRoute.duration }}hr</div>
          <div class="route-name">{{ similarRoute.name }}</div>
        </div>
      </div>
    </div>
    
    <div class="action-buttons">
      <button @click="startNavigation" class="start-navigation-btn">
        Start Navigation
      </button>
      <button @click="goBack" class="back-button">
        Back to Routes
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import HikingMap from './HikingMap.vue'

const props = defineProps({
  route: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['route-saved', 'start-navigation', 'go-back', 'route-selected'])

const mapCenter = computed(() => {
  if (props.route && props.route.coordinates && props.route.coordinates.length > 0) {
    const firstCoord = props.route.coordinates[0]
    return { lat: firstCoord.lat, lon: firstCoord.lon }
  }
  return { lat: 42.3601, lon: -71.0589 }
})
const mapInstance = ref(null)

const similarRoutes = ref([])

const loadSimilarRoutes = async () => {
  try {
    // In a real implementation, this would call the backend API
    // to get similar routes based on the current route
    similarRoutes.value = []
  } catch (error) {
    console.error('Failed to load similar routes:', error)
  }
}

const getPlaceholderImage = (index) => {
  const placeholders = ['🏔️', '🌲', '🏞️']
  return placeholders[index] || '🌄'
}

const toggleSave = () => {
  emit('route-saved', props.route.id)
}

const startNavigation = () => {
  emit('start-navigation', props.route)
}

const selectSimilarRoute = (route) => {
  // In a real app, this would load the similar route details
  console.log('Selected similar route:', route)
  // Emit event to parent to load the selected route
  emit('route-selected', route)
}

const goBack = () => {
  emit('go-back')
}

const handleMapReady = (map) => {
  mapInstance.value = map
  console.log('🗺️ Map ready, route data:', props.route)
  console.log('📍 Map center:', mapCenter.value)
}
</script>

<style scoped>
.route-detail {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 1000px;
  margin: 0 auto;
}

.route-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #ecf0f1;
}

.route-header h1 {
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 600;
}

.save-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #f8f9fa;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.save-button:hover {
  background: #e9ecef;
}

.save-button.saved {
  background: #fff5f5;
  border-color: #fecaca;
  color: #dc2626;
}

.heart-icon {
  font-size: 1.2rem;
}

.pictures-section {
  margin-bottom: 2rem;
}

.pictures-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.pictures-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.picture-placeholder {
  aspect-ratio: 16/9;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
  border: 2px solid #e1e8ed;
}

.route-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  background: linear-gradient(135deg, #e8f5e8, #d4edda);
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.directions-section h3,
.instructions-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.map-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  min-height: 300px;
}

.map-placeholder {
  width: 100%;
  height: 100%;
  position: relative;
  background: #e8f5e8;
  border-radius: 6px;
  overflow: hidden;
}

.route-path {
  position: absolute;
  width: 100%;
  height: 100%;
}

.route-line {
  position: absolute;
  height: 4px;
  border-radius: 2px;
}

.route-line.orange {
  background: #f97316;
  bottom: 20%;
  left: 10%;
  width: 60%;
  transform: rotate(15deg);
}

.route-line.red {
  background: #dc2626;
  bottom: 30%;
  left: 50%;
  width: 30%;
  transform: rotate(-30deg);
}

.route-line.blue {
  background: #2563eb;
  top: 20%;
  left: 20%;
  width: 40%;
  transform: rotate(45deg);
}

.waypoint {
  position: absolute;
  top: 30%;
  right: 30%;
  width: 8px;
  height: 8px;
  background: #dc2626;
  border-radius: 50%;
}

.no-route-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
}

.instructions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.instruction-item {
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #3498db;
  font-size: 0.95rem;
  line-height: 1.4;
}

.similar-routes {
  margin-bottom: 2rem;
}

.similar-routes h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.similar-routes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.similar-route-card {
  padding: 1rem;
  background: #f8f9fa;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.similar-route-card:hover {
  border-color: #3498db;
  background: #e3f2fd;
}

.route-duration {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.route-name {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding-top: 2rem;
  border-top: 2px solid #ecf0f1;
}

.start-navigation-btn {
  padding: 1rem 2rem;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.start-navigation-btn:hover {
  background: #229954;
}

.back-button {
  padding: 1rem 2rem;
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.back-button:hover {
  background: #7f8c8d;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .pictures-grid,
  .similar-routes-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .route-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}
</style>
