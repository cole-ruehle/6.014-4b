<template>
  <div class="search-history" v-if="history.length > 0">
    <div class="history-header">
      <h4>Recent Searches</h4>
      <button @click="clearHistory" class="clear-btn" title="Clear history">
        🗑️
      </button>
    </div>
    
    <div class="history-list">
      <div 
        v-for="(item, index) in history" 
        :key="index"
        class="history-item"
        @click="selectHistoryItem(item)"
      >
        <div class="history-icon">{{ getHistoryIcon(item.type) }}</div>
        <div class="history-content">
          <div class="history-query">{{ item.query }}</div>
          <div class="history-time">{{ formatTime(item.timestamp) }}</div>
        </div>
        <button 
          @click.stop="removeHistoryItem(index)"
          class="remove-btn"
          title="Remove from history"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { formatRelativeTime } from '../utils/formatters.js'
import { getRecentSearches, clearSearchHistory } from '../api/api-spec.js'

const emit = defineEmits(['search-selected'])

const history = ref([])
const loading = ref(false)
const error = ref(null)

const loadHistory = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await getRecentSearches({ limit: 10 })
    history.value = response || []
  } catch (err) {
    console.error('Error loading search history:', err)
    error.value = err.message
    history.value = []
  } finally {
    loading.value = false
  }
}

const addToHistory = async (query, type = 'search') => {
  // This would typically be handled by the backend when a search is performed
  // For now, we'll just reload the history to get the latest from backend
  await loadHistory()
}

const selectHistoryItem = (item) => {
  emit('search-selected', item.query)
}

const removeHistoryItem = async (index) => {
  // In a real implementation, this would call a backend endpoint to remove specific items
  // For now, we'll just reload the history
  await loadHistory()
}

const clearHistory = async () => {
  try {
    await clearSearchHistory()
    history.value = []
  } catch (err) {
    console.error('Error clearing search history:', err)
    error.value = err.message
  }
}

const getHistoryIcon = (type) => {
  const icons = {
    search: '🔍',
    location: '📍',
    trail: '🥾',
    poi: '⭐'
  }
  return icons[type] || '🔍'
}

// Using standardized formatter from utils/formatters.js
const formatTime = formatRelativeTime

onMounted(async () => {
  await loadHistory()
})

// Expose methods for parent components
defineExpose({
  addToHistory
})
</script>

<style scoped>
.search-history {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #ecf0f1;
}

.history-header h4 {
  color: #2c3e50;
  font-size: 1rem;
  margin: 0;
}

.clear-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.clear-btn:hover {
  background: #f8f9fa;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.history-item:hover {
  background: #f8f9fa;
}

.history-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.history-content {
  flex: 1;
  min-width: 0;
}

.history-query {
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-time {
  color: #7f8c8d;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.remove-btn {
  background: none;
  border: none;
  color: #e74c3c;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.remove-btn:hover {
  background: #fef2f2;
}
</style>
