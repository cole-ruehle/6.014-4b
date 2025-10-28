<template>
  <div class="popup-overlay" v-if="isVisible" @click="closeModifier">
    <div class="popup-panel route-modifier" @click.stop>
      <div class="popup-header">
        <h4>Modify Route</h4>
        <button @click="closeModifier" class="close-btn">×</button>
      </div>
    
    <div class="modifier-content">
      <div class="modification-options">
        <div class="option-group">
          <label>
            <input 
              type="radio" 
              v-model="selectedModification" 
              value="shortcut"
              class="option-radio"
            />
            Take Shortcut
          </label>
          <p class="option-description">Find a faster route to your destination</p>
        </div>
        
        <div class="option-group">
          <label>
            <input 
              type="radio" 
              v-model="selectedModification" 
              value="avoid"
              class="option-radio"
            />
            Avoid Area
          </label>
          <p class="option-description">Route around a specific area or obstacle</p>
        </div>
        
        <div class="option-group">
          <label>
            <input 
              type="radio" 
              v-model="selectedModification" 
              value="detour"
              class="option-radio"
            />
            Take Detour
          </label>
          <p class="option-description">Add a scenic detour to your route</p>
        </div>
        
        <div class="option-group">
          <label>
            <input 
              type="radio" 
              v-model="selectedModification" 
              value="rest"
              class="option-radio"
            />
            Add Rest Stop
          </label>
          <p class="option-description">Add a rest area or viewpoint to your route</p>
        </div>
      </div>
      
      <div v-if="selectedModification" class="modification-details">
        <h5>Modification Details</h5>
        
        <div v-if="selectedModification === 'avoid'" class="detail-group">
          <label for="avoid-area">Area to Avoid:</label>
          <input 
            id="avoid-area"
            v-model="modificationDetails.avoidArea"
            type="text"
            placeholder="Enter area name or description"
            class="detail-input"
          />
        </div>
        
        <div v-if="selectedModification === 'detour'" class="detail-group">
          <label for="detour-point">Detour Point:</label>
          <input 
            id="detour-point"
            v-model="modificationDetails.detourPoint"
            type="text"
            placeholder="Enter detour location"
            class="detail-input"
          />
        </div>
        
        <div v-if="selectedModification === 'rest'" class="detail-group">
          <label for="rest-type">Rest Stop Type:</label>
          <select id="rest-type" v-model="modificationDetails.restType" class="detail-select">
            <option value="viewpoint">Viewpoint</option>
            <option value="restroom">Restroom</option>
            <option value="water">Water Source</option>
            <option value="shelter">Shelter</option>
          </select>
        </div>
      </div>
      
      <div class="modifier-actions">
        <button 
          @click="applyModification" 
          class="apply-btn"
          :disabled="!canApply"
        >
          Apply Modification
        </button>
        <button @click="resetModification" class="reset-btn">
          Reset
        </button>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { modifyRoute, getSuggestedModifications } from '../api/api-spec.js'
import { ErrorHandler } from '../utils/errorHandler.js'

const props = defineProps({
  routeId: {
    type: String,
    required: true
  },
  isVisible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['modification-applied', 'close'])

const selectedModification = ref('')
const modificationDetails = ref({
  avoidArea: '',
  detourPoint: '',
  restType: 'viewpoint'
})
const loading = ref(false)
const error = ref(null)

const canApply = computed(() => {
  if (!selectedModification.value) return false
  
  switch (selectedModification.value) {
    case 'avoid':
      return modificationDetails.value.avoidArea.trim().length > 0
    case 'detour':
      return modificationDetails.value.detourPoint.trim().length > 0
    case 'rest':
      return true
    case 'shortcut':
      return true
    default:
      return false
  }
})

const applyModification = async () => {
  if (!canApply.value) return
  
  loading.value = true
  error.value = null
  
  try {
    const modification = {
      type: selectedModification.value,
      details: modificationDetails.value
    }
    
    const result = await modifyRoute(props.routeId, modification)
    
    emit('modification-applied', {
      modification,
      result
    })
    
    closeModifier()
    
  } catch (err) {
    console.error('Error applying modification:', err)
    error.value = ErrorHandler.handleApiError(err, 'Route Modification')
  } finally {
    loading.value = false
  }
}

const resetModification = () => {
  selectedModification.value = ''
  modificationDetails.value = {
    avoidArea: '',
    detourPoint: '',
    restType: 'viewpoint'
  }
  error.value = null
}

const closeModifier = () => {
  emit('close')
  resetModification()
}

// Watch for route changes
watch(() => props.routeId, () => {
  resetModification()
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
  max-width: 600px;
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

.modifier-content {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.modification-options {
  margin-bottom: 1.5rem;
}

.option-group {
  margin-bottom: 1rem;
  padding: 1rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  transition: border-color 0.2s;
}

.option-group:hover {
  border-color: #3498db;
}

.option-group label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.option-radio {
  width: 18px;
  height: 18px;
  accent-color: #3498db;
}

.option-description {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0;
  margin-left: 2rem;
}

.modification-details {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.modification-details h5 {
  color: #2c3e50;
  font-size: 1rem;
  margin: 0 0 1rem 0;
}

.detail-group {
  margin-bottom: 1rem;
}

.detail-group label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.detail-input,
.detail-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.detail-input:focus,
.detail-select:focus {
  outline: none;
  border-color: #3498db;
}

.modifier-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.apply-btn,
.reset-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.apply-btn {
  background: #27ae60;
  color: white;
}

.apply-btn:hover:not(:disabled) {
  background: #229954;
}

.apply-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.reset-btn {
  background: #e74c3c;
  color: white;
}

.reset-btn:hover {
  background: #c0392b;
}

@media (max-width: 768px) {
  .modifier-actions {
    flex-direction: column;
  }
  
  .option-description {
    margin-left: 0;
    margin-top: 0.5rem;
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
  
  .modifier-content {
    padding: 1rem;
  }
}
</style>
