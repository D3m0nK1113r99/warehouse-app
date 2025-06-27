<template>
  <div class="auth-layout">
    <div class="auth-background">
      <!-- Animated background elements -->
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
      </div>
      
      <!-- Background pattern overlay -->
      <div class="pattern-overlay"></div>
    </div>
    
    <!-- Header with branding -->
    <header class="auth-header">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center py-3">
          <div class="brand d-flex align-items-center">
            <i class="bi bi-boxes fs-2 text-white me-2"></i>
            <div>
              <h5 class="text-white mb-0 fw-bold">Warehouse Manager</h5>
              <small class="text-white-50">Enterprise Solution</small>
            </div>
          </div>
          
          <!-- Language/Theme selector could go here -->
          <div class="header-actions">
            <button class="btn btn-outline-light btn-sm" type="button" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Need help?">
              <i class="bi bi-question-circle"></i>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content area -->
    <main class="auth-main">
      <div class="container-fluid h-100">
        <div class="row h-100">
          <!-- Left side - Branding/Info -->
          <div class="col-lg-7 d-none d-lg-flex flex-column justify-content-center auth-info-panel">
            <div class="info-content">
              <div class="mb-5">
                <h1 class="display-4 text-white fw-bold mb-4">
                  Streamline Your Warehouse Operations
                </h1>
                <p class="lead text-white-75 mb-4">
                  Comprehensive inventory management, real-time tracking, and powerful analytics 
                  to optimize your warehouse efficiency.
                </p>
              </div>
              
              <!-- Feature highlights -->
              <div class="features-grid">
                <div class="feature-item">
                  <div class="feature-icon">
                    <i class="bi bi-graph-up-arrow"></i>
                  </div>
                  <div>
                    <h6 class="text-white mb-1">Real-time Analytics</h6>
                    <small class="text-white-50">Track performance metrics</small>
                  </div>
                </div>
                
                <div class="feature-item">
                  <div class="feature-icon">
                    <i class="bi bi-shield-check"></i>
                  </div>
                  <div>
                    <h6 class="text-white mb-1">Secure Access</h6>
                    <small class="text-white-50">Role-based permissions</small>
                  </div>
                </div>
                
                <div class="feature-item">
                  <div class="feature-icon">
                    <i class="bi bi-lightning"></i>
                  </div>
                  <div>
                    <h6 class="text-white mb-1">Fast Operations</h6>
                    <small class="text-white-50">Optimized workflows</small>
                  </div>
                </div>
                
                <div class="feature-item">
                  <div class="feature-icon">
                    <i class="bi bi-phone"></i>
                  </div>
                  <div>
                    <h6 class="text-white mb-1">Mobile Ready</h6>
                    <small class="text-white-50">Access anywhere</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Right side - Auth content -->
          <div class="col-lg-5 d-flex flex-column justify-content-center auth-form-panel">
            <div class="auth-form-container">
              <slot />
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="auth-footer">
      <div class="container">
        <div class="row align-items-center py-3">
          <div class="col-md-6">
            <p class="text-white-50 mb-0 small">
              &copy; {{ new Date().getFullYear() }} Warehouse Manager. All rights reserved.
            </p>
          </div>
          <div class="col-md-6 text-md-end">
            <div class="footer-links">
              <a href="#" class="text-white-50 text-decoration-none me-3 small">Privacy Policy</a>
              <a href="#" class="text-white-50 text-decoration-none me-3 small">Terms of Service</a>
              <a href="#" class="text-white-50 text-decoration-none small">Support</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
// Import Bootstrap JS for tooltips if needed
import { onMounted } from 'vue'

onMounted(() => {
  // Initialize Bootstrap tooltips
  if (typeof window !== 'undefined') {
    import('bootstrap').then((bootstrap) => {
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
      const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
    })
  }
})
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* Background */
.auth-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #5f27cd 100%);
  z-index: -2;
}

/* Floating shapes animation */
.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite linear;
}

.shape-1 {
  width: 80px;
  height: 80px;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 120px;
  height: 120px;
  left: 70%;
  animation-delay: -5s;
}

.shape-3 {
  width: 60px;
  height: 60px;
  left: 40%;
  animation-delay: -10s;
}

.shape-4 {
  width: 100px;
  height: 100px;
  left: 20%;
  animation-delay: -15s;
}

.shape-5 {
  width: 140px;
  height: 140px;
  left: 80%;
  animation-delay: -7s;
}

@keyframes float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

/* Pattern overlay */
.pattern-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  z-index: -1;
}

/* Header */
.auth-header {
  position: relative;
  z-index: 10;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.brand h5 {
  letter-spacing: -0.5px;
}

.header-actions .btn {
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.header-actions .btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

/* Main content */
.auth-main {
  flex: 1;
  position: relative;
  z-index: 5;
}

/* Info panel */
.auth-info-panel {
  padding: 2rem;
  position: relative;
}

.info-content {
  max-width: 500px;
  margin-left: auto;
  margin-right: 2rem;
}

.text-white-75 {
  color: rgba(255, 255, 255, 0.75) !important;
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.feature-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
  flex-shrink: 0;
}

/* Form panel */
.auth-form-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
  position: relative;
}

.auth-form-container {
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
}

/* Footer */
.auth-footer {
  position: relative;
  z-index: 10;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
}

.footer-links a:hover {
  color: rgba(255, 255, 255, 0.8) !important;
  text-decoration: underline !important;
}

/* Responsive design */
@media (max-width: 991.98px) {
  .auth-form-panel {
    background: rgba(255, 255, 255, 0.1);
    border-left: none;
  }
  
  .auth-main {
    padding: 1rem 0;
  }
}

@media (max-width: 767.98px) {
  .info-content {
    margin-right: 0;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .auth-form-container {
    padding: 0 1rem;
  }
}

/* Glass effect for better visual hierarchy */
.auth-form-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(5px);
  pointer-events: none;
}
</style>