<template>
  <div class="loading-container" :class="{ overlay: overlay }">
    <div class="loading-spinner" :class="size">
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
    </div>
    <div v-if="message" class="loading-message">{{ message }}</div>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  overlay: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
}

.loading-container.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  z-index: 1000;
}

.loading-spinner {
  position: relative;
  display: inline-block;
}

.loading-spinner.small {
  width: 20px;
  height: 20px;
}

.loading-spinner.medium {
  width: 40px;
  height: 40px;
}

.loading-spinner.large {
  width: 60px;
  height: 60px;
}

.spinner-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-ring:nth-child(1) {
  animation-delay: -0.45s;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.3s;
  border-top-color: #2980b9;
}

.spinner-ring:nth-child(3) {
  animation-delay: -0.15s;
  border-top-color: #1abc9c;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-message {
  color: #7f8c8d;
  font-size: 0.9rem;
  text-align: center;
  max-width: 200px;
}
</style>

