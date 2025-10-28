// Error Handling Utility for Hiking App

export class ErrorHandler {
  static handleApiError(error, context = 'API') {
    console.error(`${context} Error:`, error)
    
    if (error.status) {
      switch (error.status) {
        case 400:
          return 'Invalid request. Please check your input and try again.'
        case 401:
          return 'Authentication required. Please log in and try again.'
        case 403:
          return 'Access denied. You do not have permission to perform this action.'
        case 404:
          return 'The requested resource was not found.'
        case 408:
          return 'Request timeout. Please check your connection and try again.'
        case 429:
          return 'Too many requests. Please wait a moment and try again.'
        case 500:
          return 'Server error. Please try again later.'
        case 502:
          return 'Service temporarily unavailable. Please try again later.'
        case 503:
          return 'Service unavailable. Please try again later.'
        default:
          return `An error occurred (${error.status}). Please try again.`
      }
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return 'Network error. Please check your internet connection and try again.'
    }
    
    if (error.message) {
      return error.message
    }
    
    return 'An unexpected error occurred. Please try again.'
  }
  
  static handleValidationError(error) {
    if (error.errors) {
      return Object.values(error.errors).join(', ')
    }
    return error.message || 'Validation error. Please check your input.'
  }
  
  static handleLocationError(error) {
    if (error.code) {
      switch (error.code) {
        case 1:
          return 'Location access denied. Please enable location services.'
        case 2:
          return 'Location unavailable. Please check your GPS settings.'
        case 3:
          return 'Location request timeout. Please try again.'
        default:
          return 'Unable to get your location. Please try again.'
      }
    }
    return 'Location error. Please check your GPS settings and try again.'
  }
  
  static handleMapError(error) {
    if (error.message.includes('tile')) {
      return 'Map tiles failed to load. Please check your connection and try again.'
    }
    if (error.message.includes('style')) {
      return 'Map style failed to load. Please try selecting a different style.'
    }
    return 'Map error. Please refresh the page and try again.'
  }
  
  static handleRouteError(error) {
    if (error.message.includes('no route')) {
      return 'No route found between the selected points. Please try different locations.'
    }
    if (error.message.includes('distance')) {
      return 'Route too long. Please select closer points or adjust your preferences.'
    }
    return 'Route calculation failed. Please try again with different parameters.'
  }
  
  static logError(error, context = 'App') {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    console.error(`${context} Error:`, errorInfo)
    
    // In production, you would send this to an error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo })
  }
}

// Global error handler for unhandled promises
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  ErrorHandler.logError(event.reason, 'Unhandled Promise')
})

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error)
  ErrorHandler.logError(event.error, 'Uncaught Error')
})

