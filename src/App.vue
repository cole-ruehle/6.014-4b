<template>
  <div id="app">
    <!-- Top Bar -->
    <div class="top-bar" v-if="showPromo">
      <div class="promo-banner">
        <span>🌲 Discover amazing hiking trails near you</span>
        <button class="dismiss-btn" @click="dismissPromo">×</button>
      </div>
    </div>

    <!-- Header -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <h1>TrailLink</h1>
        </div>
        <div class="header-actions">
          <div class="status-indicator" :class="{ offline: !backendConnected }">
            {{ backendConnected ? 'Online' : 'Offline' }}
          </div>
          <button class="menu-toggle" @click="toggleMenu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero-section" v-if="!showRouteList && !selectedRoute">
      <div class="hero-content">
        <h2 class="hero-title">Find Your Perfect Hiking Trail</h2>
        <p class="hero-subtitle">Discover amazing routes, plan your adventure, and explore the great outdoors</p>
        <button class="cta-button" @click="scrollToSearch">
          Start Planning
        </button>
      </div>
      <div class="hero-visual">
        <div class="hero-image"></div>
      </div>
    </section>

    <!-- Slide-out Navigation -->
    <div class="nav-overlay" :class="{ active: showMenu }" @click="closeMenu">
      <nav class="slide-nav" :class="{ active: showMenu }">
        <button class="close-nav" @click="closeMenu">×</button>
        <div class="nav-content">
          <h3>Menu</h3>
          <div class="nav-actions">
            <button class="nav-button primary" @click="handleGetStarted">Get Started</button>
            <button class="nav-button secondary" @click="handleSignIn">Sign In</button>
          </div>
        </div>
      </nav>
    </div>
    
    <main class="app-main">
      <!-- Search and Planning Section -->
      <div class="search-section" ref="searchSection">
        <RouteSearch 
          @search="handleSearch" 
          @location-selected="handleLocationSelected"
          @route-calculated="handleRouteCalculated"
          @route-selected="handleRouteSelected"
        />
      </div>
      
      <!-- Main Content - Always List View -->
      <div class="main-content">
        <RouteList 
          v-if="showRouteList" 
          :routes="routes" 
          :start-location="routeStore.searchParams.startLocation"
          :duration="routeStore.searchParams.duration"
          @route-selected="handleRouteSelected"
          @route-saved="handleRouteSaved"
        />
        <RouteDetail 
          v-if="selectedRoute" 
          :route="selectedRoute"
          @start-navigation="handleStartNavigation"
          @route-saved="handleRouteSaved"
        />
      </div>
      
      <!-- Navigation -->
      <Navigation 
        v-if="isNavigating" 
        @stop-navigation="handleStopNavigation"
        @emergency="handleEmergency"
      />
    </main>
    
    <!-- Process Flow Guide -->
    <ProcessFlowGuide @close="handleGuideClose" />
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
import ProcessFlowGuide from './components/ProcessFlowGuide.vue'

const routeStore = useRouteStore()
const navigationStore = useNavigationStore()

const selectedRoute = ref(null)
const selectedLocation = ref(null)
const showRouteList = ref(false)
const backendConnected = ref(true)
const showMenu = ref(false)
const showPromo = ref(true)
const searchSection = ref(null)

const routes = computed(() => routeStore.filteredRoutes)
const isNavigating = computed(() => navigationStore.isNavigating)

const handleSearch = async (searchParams) => {
  console.log('🔍 Starting search with params:', searchParams)
  try {
    await routeStore.searchForRoutes(searchParams)
    console.log('✅ Search completed, routes found:', routeStore.routes.length)
    showRouteList.value = true
    selectedRoute.value = null
    console.log('📋 Route list should be visible:', showRouteList.value)
  } catch (error) {
    console.error('❌ Search failed:', error)
  }
}

const handleRouteSelected = async (route) => {
  selectedRoute.value = route
  showRouteList.value = false
}

const handleRouteSaved = async (routeId) => {
  await routeStore.toggleSaveRoute(routeId)
}

const handleStartNavigation = async (route) => {
  console.log('🚀 Starting navigation with route:', route)
  try {
    await navigationStore.startNavigation(route)
    selectedRoute.value = null
    showRouteList.value = false
    console.log('✅ Navigation started successfully')
  } catch (error) {
    console.error('❌ Failed to start navigation:', error)
  }
}

const handleStopNavigation = () => {
  navigationStore.stopNavigation()
}

const handleEmergency = async () => {
  await navigationStore.triggerEmergency()
}

// Event handlers
const handleLocationSelected = (location) => {
  selectedLocation.value = location
}

const handleRouteCalculated = (route) => {
  selectedRoute.value = route
  showRouteList.value = false
}

// Check backend connection
const checkBackendConnection = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/HikingApp/getAvailableStyles', {
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    })
    backendConnected.value = response.ok
  } catch (error) {
    backendConnected.value = false
  }
}

const handleGuideClose = () => {
  // Guide closed, no action needed
}

const handleGetStarted = () => {
  console.log('🚀 Get Started clicked')
  // Scroll to search section
  if (searchSection.value) {
    searchSection.value.scrollIntoView({ behavior: 'smooth' })
  }
  closeMenu()
}

const handleSignIn = () => {
  console.log('🔐 Sign In clicked')
  // For now, just show an alert - in a real app this would open a sign-in modal
  alert('Sign In functionality would be implemented here')
  closeMenu()
}

// New methods for minimalist design
const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const closeMenu = () => {
  showMenu.value = false
}

const dismissPromo = () => {
  showPromo.value = false
}

const scrollToSearch = () => {
  if (searchSection.value) {
    searchSection.value.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(() => {
  routeStore.loadSavedRoutes()
  checkBackendConnection()
})
</script>

<style>
/* Reset and Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #ffffff;
  color: #000000;
  line-height: 1.6;
  font-weight: 400;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Top Bar */
.top-bar {
  background-color: #000000;
  color: #ffffff;
  padding: 0.5rem 0;
  text-align: center;
  position: relative;
}

.promo-banner {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.dismiss-btn {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
}

.dismiss-btn:hover {
  opacity: 0.7;
}

/* Header */
.app-header {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e5e5;
  padding: 1.5rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.logo h1 {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #000000;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.status-indicator {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: #f0f0f0;
  color: #666666;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-indicator.offline {
  background: #fee2e2;
  color: #dc2626;
}

/* Menu Toggle */
.menu-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.menu-toggle span {
  width: 20px;
  height: 2px;
  background-color: #000000;
  transition: all 0.3s ease;
}

.menu-toggle:hover span {
  background-color: #666666;
}

/* Hero Section */
.hero-section {
  min-height: 80vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  position: relative;
  overflow: hidden;
}

.hero-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  z-index: 2;
  position: relative;
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: #000000;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
}

.hero-subtitle {
  font-size: 1.25rem;
  font-weight: 400;
  color: #666666;
  margin-bottom: 2.5rem;
  max-width: 500px;
  line-height: 1.5;
}

.cta-button {
  background-color: #000000;
  color: #ffffff;
  border: none;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 0;
}

.cta-button:hover {
  background-color: #333333;
  transform: translateY(-2px);
}

.hero-visual {
  flex: 1;
  position: relative;
  height: 100%;
  min-height: 400px;
}

.hero-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #e8f5e8 0%, #d4edda 50%, #c3e6cb 100%);
  background-size: 400% 400%;
  animation: gradientShift 8s ease-in-out infinite;
  position: relative;
}

.hero-image::before {
  content: '🏔️';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 8rem;
  opacity: 0.3;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Slide-out Navigation */
.nav-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.nav-overlay.active {
  opacity: 1;
  visibility: visible;
}

.slide-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 320px;
  height: 100%;
  background-color: #000000;
  color: #ffffff;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 1001;
}

.slide-nav.active {
  transform: translateX(0);
}

.close-nav {
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: none;
  border: none;
  color: #ffffff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
}

.nav-content {
  padding: 4rem 2rem 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.nav-content h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.nav-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 200px;
}

.nav-button {
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid #ffffff;
  background: none;
  color: #ffffff;
}

.nav-button.primary {
  background-color: #ffffff;
  color: #000000;
}

.nav-button.primary:hover {
  background-color: #f0f0f0;
}

.nav-button.secondary:hover {
  background-color: #ffffff;
  color: #000000;
}

/* Main Content */
.app-main {
  flex: 1;
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.search-section {
  margin-bottom: 4rem;
}

.main-content {
  margin-bottom: 4rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .app-header {
    padding: 1rem;
  }
  
  .header-content {
    padding: 0;
  }
  
  .hero-section {
    min-height: 70vh;
    flex-direction: column;
  }
  
  .hero-content {
    padding: 2rem 1rem;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.125rem;
  }
  
  .hero-visual {
    min-height: 200px;
  }
  
  .app-main {
    padding: 2rem 1rem;
  }
  
  .slide-nav {
    width: 100%;
  }
  
  .nav-content {
    padding: 3rem 1rem 2rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .cta-button {
    padding: 0.875rem 1.5rem;
    font-size: 0.875rem;
  }
}
</style>
