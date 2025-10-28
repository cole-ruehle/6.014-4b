<template>
  <div class="popup-overlay" v-if="showGuide" @click="closeGuide">
    <div class="popup-panel process-flow-guide" @click.stop>
      <div class="popup-header">
        <h3>How to Use TrailLink</h3>
        <button @click="closeGuide" class="close-btn">×</button>
      </div>
    
    <div class="guide-content">
      <div class="step" :class="{ active: currentStep >= 1 }">
        <div class="step-number">1</div>
        <div class="step-content">
          <h4>Search for Routes</h4>
          <p>Enter your starting location and desired duration, then click "Find Routes"</p>
        </div>
      </div>
      
      <div class="step" :class="{ active: currentStep >= 2 }">
        <div class="step-number">2</div>
        <div class="step-content">
          <h4>View Results</h4>
          <p>Browse the list of available routes or switch to map view to see them geographically</p>
        </div>
      </div>
      
      <div class="step" :class="{ active: currentStep >= 3 }">
        <div class="step-number">3</div>
        <div class="step-content">
          <h4>Select a Route</h4>
          <p>Click on any route card to view detailed information and instructions</p>
        </div>
      </div>
      
      <div class="step" :class="{ active: currentStep >= 4 }">
        <div class="step-number">4</div>
        <div class="step-content">
          <h4>Explore POIs</h4>
          <p>On the map, click POI markers to see details and select interesting points</p>
        </div>
      </div>
      
      <div class="step" :class="{ active: currentStep >= 5 }">
        <div class="step-number">5</div>
        <div class="step-content">
          <h4>Start Navigation</h4>
          <p>Click "Start Navigation" to begin your hiking journey with turn-by-turn directions</p>
        </div>
      </div>
    </div>
    
    <div class="guide-actions">
      <button @click="previousStep" :disabled="currentStep <= 1" class="nav-btn">
        Previous
      </button>
      <button @click="nextStep" :disabled="currentStep >= 5" class="nav-btn primary">
        Next
      </button>
      <button @click="closeGuide" class="nav-btn secondary">
        Got it!
      </button>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['close'])

const showGuide = ref(false)
const currentStep = ref(1)

const nextStep = () => {
  if (currentStep.value < 5) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const closeGuide = () => {
  showGuide.value = false
  emit('close')
}

// Show guide on first visit
onMounted(() => {
  const hasSeenGuide = localStorage.getItem('hasSeenTrailLinkGuide')
  if (!hasSeenGuide) {
    showGuide.value = true
    localStorage.setItem('hasSeenTrailLinkGuide', 'true')
  }
})

// Expose method to show guide
defineExpose({
  showGuide: () => { showGuide.value = true }
})
</script>

<style scoped>
/* Popup Overlay */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
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

.popup-header h3 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.5rem;
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

.guide-content {
  padding: 1.5rem;
  max-height: 50vh;
  overflow-y: auto;
  margin-bottom: 0;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  opacity: 0.5;
}

.step.active {
  opacity: 1;
  background: #f8f9fa;
  border-left: 4px solid #3498db;
}

.step-number {
  background: #3498db;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step.active .step-number {
  background: #27ae60;
}

.step-content h4 {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.step-content p {
  color: #7f8c8d;
  margin: 0;
  line-height: 1.5;
}

.guide-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.nav-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  background: white;
  color: #2c3e50;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #3498db;
}

.nav-btn.primary {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.nav-btn.primary:hover:not(:disabled) {
  background: #2980b9;
  border-color: #2980b9;
}

.nav-btn.secondary {
  background: #27ae60;
  color: white;
  border-color: #27ae60;
}

.nav-btn.secondary:hover {
  background: #229954;
  border-color: #229954;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .process-flow-guide {
    padding: 1.5rem;
    margin: 1rem;
  }
  
  .guide-actions {
    flex-direction: column;
  }
  
  .nav-btn {
    width: 100%;
  }
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
  .popup-panel {
    width: 95%;
    margin: 1rem;
  }
  
  .guide-content {
    padding: 1rem;
  }
}
</style>
