<template>
  <div class="hiking-map">
    <div ref="mapContainer" class="map-container"></div>
    
    <!-- Map Controls -->
    <div class="map-controls">
      <div class="style-selector">
        <label for="map-style">Map Style:</label>
        <select 
          id="map-style" 
          v-model="selectedStyle" 
          @change="changeMapStyle"
          class="style-select"
        >
          <option v-for="style in availableStyles" :key="style.id" :value="style.id">
            {{ style.name }}
          </option>
        </select>
      </div>
      
      <div class="poi-toggle">
        <label>
          <input 
            type="checkbox" 
            v-model="showPOIs" 
            @change="togglePOIs"
          />
          Show POIs
        </label>
      </div>
      
      <div class="trails-toggle">
        <label>
          <input 
            type="checkbox" 
            v-model="showTrails" 
            @change="toggleTrails"
          />
          Show All Trails
        </label>
      </div>
    </div>
    
    <!-- Loading indicator -->
    <div v-if="loading" class="map-loading">
      <div class="loading-spinner"></div>
      <span>Loading map...</span>
    </div>
    
    <!-- Error message -->
    <div v-if="error" class="map-error">
      <div class="error-icon">⚠️</div>
      <span>{{ error }}</span>
      <button @click="error = null" class="error-close">×</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import L from '../utils/leaflet-config.js'
import { 
  getMapTile, 
  getAvailableStyles, 
  getMapStyle,
  searchPOIs, 
  getRouteVisualization,
  API_BASE_URL
} from '../api/api-spec.js'

// Props
const props = defineProps({
  center: {
    type: Object,
    default: () => ({ lat: 42.3601, lon: -71.0589 })
  },
  zoom: {
    type: Number,
    default: 10
  },
  route: {
    type: Object,
    default: null
  },
  height: {
    type: String,
    default: '400px'
  }
})

// Emits
const emit = defineEmits(['map-ready', 'location-selected', 'poi-selected'])

// Reactive data
const mapContainer = ref(null)
const map = ref(null)
const selectedStyle = ref('streets')
const availableStyles = ref([])
const error = ref(null)
const showPOIs = ref(true)
const showTrails = ref(false)
const loading = ref(false)
const tileLayer = ref(null)
const poiMarkers = ref([])
const routeLayer = ref(null)
const trailLayers = ref([])

// Initialize map
const initMap = async () => {
  if (!mapContainer.value) return
  
  try {
    loading.value = true
    
    // Load available styles from backend
    await loadAvailableStyles()
    
    // Create map instance
    map.value = L.map(mapContainer.value).setView([props.center.lat, props.center.lon], props.zoom)
    
    // Add tile layer with current style
    await updateMapStyle()
    
    // Add event listeners
    map.value.on('click', handleMapClick)
    map.value.on('moveend', handleMapMove)
    
    // Load POIs if enabled
    if (showPOIs.value) {
      await loadPOIs()
    }
    
    // Load route if provided
    if (props.route) {
      await loadRoute()
    }
    
    emit('map-ready', map.value)
    loading.value = false
    
  } catch (error) {
    console.error('Error initializing map:', error)
    loading.value = false
    showError('Failed to initialize map. Please try again.')
  }
}

// Load Points of Interest
const loadPOIs = async () => {
  if (!map.value) return
  
  try {
    const bounds = map.value.getBounds()
    const center = map.value.getCenter()
    
    const response = await searchPOIs(
      { lat: center.lat, lon: center.lng },
      ['trail', 'trailhead', 'viewpoint'],
      10
    )
    
    // Clear existing POI markers
    clearPOIMarkers()
    
    // Add new POI markers
    if (response.pois && response.pois.length > 0) {
      response.pois.forEach(poi => {
        const marker = L.marker([poi.location.lat, poi.location.lon])
          .addTo(map.value)
        
        // Create popup content
        const popupContent = document.createElement('div')
        popupContent.className = 'poi-popup'
        popupContent.innerHTML = `
          <div class="poi-header">
            <h4>${poi.name}</h4>
            <span class="poi-type-badge">${poi.type}</span>
          </div>
          <div class="poi-details">
            ${poi.description ? `<p class="poi-description">${poi.description}</p>` : ''}
            ${poi.difficulty ? `<p class="poi-difficulty"><strong>Difficulty:</strong> ${poi.difficulty}</p>` : ''}
          </div>
          <div class="poi-actions">
            <button class="select-poi-btn primary">Select This POI</button>
            <button class="add-to-route-btn secondary">Add to Route</button>
          </div>
        `
        
        // Add click handlers to the buttons
        const selectButton = popupContent.querySelector('.select-poi-btn')
        const addToRouteButton = popupContent.querySelector('.add-to-route-btn')
        
        selectButton.addEventListener('click', (e) => {
          e.stopPropagation()
          e.preventDefault()
          handlePOISelection(poi)
        })
        
        addToRouteButton.addEventListener('click', (e) => {
          e.stopPropagation()
          e.preventDefault()
          handleAddToRoute(poi)
        })
        
        marker.bindPopup(popupContent, {
          maxWidth: 300,
          closeOnClick: false
        })
        marker.poiData = poi
        poiMarkers.value.push(marker)
      })
    }
    
  } catch (error) {
    console.error('Error loading POIs:', error)
    showError('Failed to load points of interest. Please try again.')
  }
}

// Load route visualization
const loadRoute = async () => {
  if (!map.value || !props.route) {
    console.log('⚠️ Cannot load route - map or route not available')
    return
  }
  
  console.log('🛣️ Loading route visualization for:', props.route)
  
  try {
    if (props.route.segments) {
      console.log('📊 Using segments for route visualization')
      const response = await getRouteVisualization(props.route.segments, {
        includeWaypoints: true,
        showElevation: true
      })
      
      // Clear existing route
      if (routeLayer.value) {
        map.value.removeLayer(routeLayer.value)
      }
      
      // Add route layer
      if (response.route) {
        routeLayer.value = L.geoJSON(response.route, {
          style: {
            color: '#3887be',
            weight: 5,
            opacity: 0.8
          }
        }).addTo(map.value)
        
        // Fit map to route bounds
        if (response.route.bounds) {
          map.value.fitBounds([
            [response.route.bounds.south, response.route.bounds.west],
            [response.route.bounds.north, response.route.bounds.east]
          ])
        }
        console.log('✅ Route loaded from segments')
      }
    } else if (props.route.coordinates && props.route.coordinates.length > 0) {
      console.log('📍 Using coordinates for route visualization:', props.route.coordinates)
      // Fallback: create simple polyline from coordinates
      const coordinates = props.route.coordinates.map(coord => [coord.lat, coord.lon])
      console.log('🗺️ Mapped coordinates:', coordinates)
      
      routeLayer.value = L.polyline(coordinates, {
        color: '#3887be',
        weight: 5,
        opacity: 0.8
      }).addTo(map.value)
      
      // Fit map to route
      map.value.fitBounds(routeLayer.value.getBounds())
      console.log('✅ Route loaded from coordinates')
    } else {
      console.log('⚠️ No route data available for visualization')
    }
  } catch (error) {
    console.error('❌ Error loading route:', error)
    showError('Failed to load route visualization. Please try again.')
  }
}

// Clear POI markers
const clearPOIMarkers = () => {
  poiMarkers.value.forEach(marker => {
    map.value.removeLayer(marker)
  })
  poiMarkers.value = []
}

// Event handlers
const handleMapClick = (e) => {
  emit('location-selected', {
    lat: e.latlng.lat,
    lon: e.latlng.lng
  })
}

const handleMapMove = () => {
  if (showPOIs.value) {
    loadPOIs()
  }
}

// Load available styles from backend
const loadAvailableStyles = async () => {
  try {
    const styles = await getAvailableStyles()
    availableStyles.value = styles.styles || [
      { id: 'streets', name: 'Streets' },
      { id: 'satellite', name: 'Satellite' },
      { id: 'terrain', name: 'Terrain' },
      { id: 'hiking', name: 'Hiking' }
    ]
  } catch (error) {
    console.error('Error loading map styles:', error)
    // Fallback to default styles
    availableStyles.value = [
      { id: 'streets', name: 'Streets' },
      { id: 'satellite', name: 'Satellite' },
      { id: 'terrain', name: 'Terrain' },
      { id: 'hiking', name: 'Hiking' }
    ]
  }
}

// Update map style
const updateMapStyle = async () => {
  if (!map.value) return
  
  try {
    // Remove existing tile layer
    if (tileLayer.value) {
      map.value.removeLayer(tileLayer.value)
    }
    
    // Check if backend is available
    const isBackendAvailable = await checkBackendAvailability()
    
    if (isBackendAvailable) {
      // Use backend tiles
      tileLayer.value = L.tileLayer(getMapTile('{z}', '{x}', '{y}', selectedStyle.value), {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(map.value)
    } else {
      // Use different tile sources based on style
      const tileSources = {
        streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        hiking: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
      }
      
      const tileUrl = tileSources[selectedStyle.value] || tileSources.streets
      const attribution = selectedStyle.value === 'satellite' 
        ? '© Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
        : '© OpenStreetMap contributors'
      
      tileLayer.value = L.tileLayer(tileUrl, {
        attribution: attribution,
        maxZoom: 18,
        subdomains: ['a', 'b', 'c']
      }).addTo(map.value)
    }
    
  } catch (error) {
    console.error('Error updating map style:', error)
    showError('Failed to update map style. Please try again.')
  }
}

// Check backend availability
const checkBackendAvailability = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/getAvailableStyles`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000)
    })
    return response.ok
  } catch (error) {
    return false
  }
}

const changeMapStyle = async () => {
  await updateMapStyle()
}

// Show error message
const showError = (message) => {
  error.value = message
  setTimeout(() => {
    error.value = null
  }, 5000)
}

// Handle POI selection
const handlePOISelection = (poi) => {
  console.log('POI selected:', poi)
  
  // Show visual feedback
  showPOISelectionFeedback(poi)
  
  // Emit the selection event
  emit('poi-selected', poi)
  
  // Close the popup after a short delay
  setTimeout(() => {
    if (map.value) {
      map.value.closePopup()
    }
  }, 1000)
}

// Handle adding POI to route
const handleAddToRoute = (poi) => {
  console.log('Adding POI to route:', poi)
  
  // Show feedback
  showPOISelectionFeedback(poi, 'Added to route!')
  
  // Emit add to route event
  emit('poi-added-to-route', poi)
  
  // Close popup
  setTimeout(() => {
    if (map.value) {
      map.value.closePopup()
    }
  }, 1000)
}

// Show visual feedback for POI selection
const showPOISelectionFeedback = (poi, message = 'Selected!') => {
  // Create a temporary notification
  const notification = document.createElement('div')
  notification.className = 'poi-selection-feedback'
  notification.innerHTML = `
    <div class="feedback-content">
      <span class="feedback-icon">✅</span>
      <span class="feedback-text">${message}</span>
      <span class="feedback-poi">${poi.name}</span>
    </div>
  `
  
  // Add to map container
  if (mapContainer.value) {
    mapContainer.value.appendChild(notification)
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 3000)
  }
}

const togglePOIs = () => {
  if (showPOIs.value) {
    loadPOIs()
  } else {
    clearPOIMarkers()
  }
}

const toggleTrails = async () => {
  if (showTrails.value) {
    await loadTrailSegments()
  } else {
    clearTrails()
  }
}

const loadTrailSegments = async () => {
  if (!map.value) return
  
  try {
    const bounds = map.value.getBounds()
    const south = bounds.getSouth()
    const west = bounds.getWest()
    const north = bounds.getNorth()
    const east = bounds.getEast()
    
    // For now, we'll create mock trail data since backend doesn't exist yet
    const mockTrails = generateMockTrails(south, west, north, east)
    
    // Clear existing trails
    clearTrails()
    
    // Add trail segments to map
    mockTrails.forEach(trail => {
      if (trail.coordinates && trail.coordinates.length > 1) {
        const polyline = L.polyline(
          trail.coordinates.map(coord => [coord.lat, coord.lon]),
          {
            color: '#27ae60', // Green color
            weight: 3,
            opacity: 0.8,
            dashArray: trail.type === 'hiking' ? '5, 5' : '10, 10'
          }
        ).addTo(map.value)
        
        // Add popup with trail info
        polyline.bindPopup(`
          <div class="trail-popup">
            <h4>${trail.name}</h4>
            <p><strong>Type:</strong> ${trail.type}</p>
            <p><strong>Difficulty:</strong> ${trail.difficulty}</p>
            <p><strong>Surface:</strong> ${trail.surface}</p>
          </div>
        `)
        
        trailLayers.value.push(polyline)
      }
    })
    
  } catch (error) {
    console.error('Error loading trail segments:', error)
    showError('Failed to load trail segments')
  }
}

const generateMockTrails = (south, west, north, east) => {
  // Generate mock trail data for the current map bounds
  const trails = []
  const centerLat = (south + north) / 2
  const centerLon = (west + east) / 2
  
  // Create some sample trails
  for (let i = 0; i < 5; i++) {
    const trail = {
      id: `trail-${i}`,
      name: `Trail ${i + 1}`,
      type: i % 2 === 0 ? 'hiking' : 'footway',
      difficulty: ['Easy', 'Moderate', 'Hard'][i % 3],
      surface: ['Dirt', 'Gravel', 'Paved'][i % 3],
      coordinates: []
    }
    
    // Generate a simple trail path
    const numPoints = 10 + Math.floor(Math.random() * 10)
    for (let j = 0; j < numPoints; j++) {
      const lat = centerLat + (Math.random() - 0.5) * (north - south) * 0.8
      const lon = centerLon + (Math.random() - 0.5) * (east - west) * 0.8
      trail.coordinates.push({ lat, lon })
    }
    
    trails.push(trail)
  }
  
  return trails
}

const clearTrails = () => {
  trailLayers.value.forEach(layer => {
    if (map.value) {
      map.value.removeLayer(layer)
    }
  })
  trailLayers.value = []
}

// Watch for prop changes
watch(() => props.center, (newCenter) => {
  if (map.value) {
    map.value.setView([newCenter.lat, newCenter.lon], map.value.getZoom())
  }
})

watch(() => props.route, (newRoute) => {
  if (map.value && newRoute) {
    loadRoute()
  }
})

// Lifecycle
onMounted(async () => {
  await nextTick()
  await initMap()
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
})

// Expose methods for parent components
defineExpose({
  map: map,
  loadPOIs,
  loadRoute,
  clearPOIMarkers
})
</script>

<style scoped>
.hiking-map {
  position: relative;
  width: 100%;
  height: v-bind(height);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.map-container {
  width: 100%;
  height: 100%;
}

.map-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  padding: 10px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 200px;
}

.style-selector {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.style-selector label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #2c3e50;
}

.style-select {
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.poi-toggle, .trails-toggle {
  display: flex;
  align-items: center;
  gap: 5px;
}

.poi-toggle label, .trails-toggle label {
  font-size: 0.9rem;
  color: #2c3e50;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.map-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  z-index: 1001;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.map-error {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1002;
  color: #dc2626;
  font-size: 0.9rem;
}

.error-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.error-close {
  background: none;
  border: none;
  color: #dc2626;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  margin-left: auto;
  flex-shrink: 0;
}

.error-close:hover {
  color: #b91c1c;
}

/* Leaflet CSS fixes */
:deep(.leaflet-popup-content) {
  margin: 8px 12px;
  line-height: 1.4;
}

:deep(.poi-popup) {
  min-width: 250px;
}

:deep(.poi-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ecf0f1;
}

:deep(.poi-popup h4) {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
}

:deep(.poi-type-badge) {
  background: #3498db;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  text-transform: capitalize;
}

:deep(.poi-details) {
  margin-bottom: 16px;
}

:deep(.poi-popup p) {
  margin: 6px 0;
  font-size: 0.9rem;
  color: #555;
  line-height: 1.4;
}

:deep(.poi-difficulty) {
  color: #e67e22;
  font-weight: 500;
}

:deep(.poi-actions) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

:deep(.select-poi-btn),
:deep(.add-to-route-btn) {
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
}

:deep(.select-poi-btn.primary) {
  background: #27ae60;
  color: white;
}

:deep(.select-poi-btn.primary:hover) {
  background: #229954;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

:deep(.add-to-route-btn.secondary) {
  background: #f8f9fa;
  color: #2c3e50;
  border: 1px solid #e1e8ed;
}

:deep(.add-to-route-btn.secondary:hover) {
  background: #e9ecef;
  border-color: #3498db;
  transform: translateY(-1px);
}

:deep(.select-poi-btn:active),
:deep(.add-to-route-btn:active) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* POI Selection Feedback */
.poi-selection-feedback {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1003;
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

.feedback-poi {
  font-size: 0.8rem;
  opacity: 0.9;
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

.trail-popup {
  min-width: 200px;
}

.trail-popup h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.trail-popup p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #555;
}

@media (max-width: 768px) {
  .map-controls {
    position: relative;
    top: 0;
    right: 0;
    margin-bottom: 10px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .style-selector {
    flex-direction: row;
    align-items: center;
  }
}
</style>
