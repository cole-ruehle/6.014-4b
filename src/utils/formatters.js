// Standardized formatting utilities for distance and duration

/**
 * Format distance in meters to a consistent string format
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance string
 */
export const formatDistance = (meters) => {
  if (!meters || meters < 0) return '0 km'
  
  if (meters < 1000) {
    return `${meters} m`
  }
  
  const kilometers = meters / 1000
  if (kilometers < 10) {
    return `${kilometers.toFixed(1)} km`
  }
  
  return `${Math.round(kilometers)} km`
}

/**
 * Format duration in seconds to a consistent string format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0m'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    if (minutes === 0) {
      return `${hours}h`
    }
    return `${hours}h ${minutes}m`
  }
  
  return `${minutes}m`
}

/**
 * Format elevation in meters to a consistent string format
 * @param {number} meters - Elevation in meters
 * @returns {string} Formatted elevation string
 */
export const formatElevation = (meters) => {
  if (!meters || meters < 0) return '0m'
  
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  
  const kilometers = meters / 1000
  return `${kilometers.toFixed(1)}km`
}

/**
 * Format difficulty level to a consistent string format
 * @param {string} difficulty - Difficulty level
 * @returns {string} Formatted difficulty string
 */
export const formatDifficulty = (difficulty) => {
  if (!difficulty) return 'Unknown'
  
  const difficultyMap = {
    'easy': 'Easy',
    'moderate': 'Moderate',
    'hard': 'Hard',
    'expert': 'Expert',
    'beginner': 'Beginner',
    'intermediate': 'Intermediate',
    'advanced': 'Advanced'
  }
  
  return difficultyMap[difficulty.toLowerCase()] || difficulty
}

/**
 * Format route type to a consistent string format
 * @param {string} type - Route type
 * @returns {string} Formatted route type string
 */
export const formatRouteType = (type) => {
  if (!type) return 'Unknown'
  
  const typeMap = {
    'hiking': 'Hiking',
    'walking': 'Walking',
    'running': 'Running',
    'cycling': 'Cycling',
    'multimodal': 'Multi-Modal',
    'transit': 'Transit'
  }
  
  return typeMap[type.toLowerCase()] || type
}

/**
 * Format time to a relative string (e.g., "2h ago", "Just now")
 * @param {string|Date} timestamp - ISO timestamp or Date object
 * @returns {string} Formatted relative time string
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Unknown'
  
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}

