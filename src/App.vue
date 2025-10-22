<template>
  <div id="app">
    <header class="app-header">
      <h1>Route Planner</h1>
    </header>
    
    <main class="app-main">
      <RouteSearch @search="handleSearch" />
      <RouteList 
        v-if="showRouteList" 
        :routes="routes" 
        @route-selected="handleRouteSelected"
        @route-saved="handleRouteSaved"
      />
      <RouteDetail 
        v-if="selectedRoute" 
        :route="selectedRoute"
        @start-navigation="handleStartNavigation"
        @route-saved="handleRouteSaved"
      />
      <Navigation 
        v-if="isNavigating" 
        @stop-navigation="handleStopNavigation"
        @emergency="handleEmergency"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouteStore } from './stores/routeStore.js'
import { useNavigationStore } from './stores/navigationStore.js'
import RouteSearch from './components/RouteSearch.vue'
import RouteList from './components/RouteList.vue'
import RouteDetail from './components/RouteDetail.vue'
import Navigation from './components/Navigation.vue'

const routeStore = useRouteStore()
const navigationStore = useNavigationStore()

const selectedRoute = ref(null)
const showRouteList = ref(false)

const routes = computed(() => routeStore.filteredRoutes)
const isNavigating = computed(() => navigationStore.isNavigating)

const handleSearch = async (searchParams) => {
  await routeStore.searchForRoutes(searchParams)
  showRouteList.value = true
  selectedRoute.value = null
}

const handleRouteSelected = async (route) => {
  selectedRoute.value = route
  showRouteList.value = false
}

const handleRouteSaved = async (routeId) => {
  await routeStore.toggleSaveRoute(routeId)
}

const handleStartNavigation = async (route) => {
  await navigationStore.startNavigation(route.id)
  selectedRoute.value = null
  showRouteList.value = false
}

const handleStopNavigation = () => {
  navigationStore.stopNavigation()
}

const handleEmergency = async () => {
  await navigationStore.triggerEmergency()
}

onMounted(() => {
  routeStore.loadSavedRoutes()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.app-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

.app-main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 768px) {
  .app-main {
    padding: 1rem;
  }
}
</style>
