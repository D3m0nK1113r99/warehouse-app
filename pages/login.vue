<template>
  <div class="login-form">
    <!-- Welcome Header -->
    <div class="text-center mb-4">
      <div class="welcome-icon mb-3">
        <i class="bi bi-shield-lock display-4 text-white"></i>
      </div>
      <h2 class="h3 mb-2 fw-bold text-white">Welcome Back</h2>
      <p class="text-white-50 mb-0">Sign in to access your dashboard</p>
    </div>

    <!-- Login Form -->
    <div class="card border-0 shadow-lg">
      <div class="card-body p-4">
        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label for="email" class="form-label text-muted">Email Address</label>
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0">
                <i class="bi bi-envelope text-muted"></i>
              </span>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="form-control border-start-0 ps-0"
                placeholder="Enter your email"
                required
                :disabled="loading"
                autocomplete="email"
              />
            </div>
          </div>

          <div class="mb-3">
            <label for="password" class="form-label text-muted">Password</label>
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0">
                <i class="bi bi-lock text-muted"></i>
              </span>
              <input
                id="password"
                v-model="form.password"
                type="password"
                class="form-control border-start-0 ps-0"
                placeholder="Enter your password"
                required
                :disabled="loading"
                autocomplete="current-password"
              />
            </div>
          </div>

          <div class="mb-4">
            <div class="form-check">
              <input
                id="remember-me"
                v-model="form.rememberMe"
                type="checkbox"
                class="form-check-input"
              />
              <label for="remember-me" class="form-check-label text-muted">
                Remember me for 30 days
              </label>
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary w-100 py-3 mb-3"
            :disabled="isLoading || !form.email || !form.password"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            <i v-else class="bi bi-box-arrow-in-right me-2"></i>
            {{ isLoading ? 'Signing in...' : 'Sign In to Dashboard' }}
          </button>

          <!-- Error Alert -->
          <div v-if="error" class="alert alert-danger d-flex align-items-center" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            <div>
              <strong>Authentication Failed:</strong> {{ error }}
            </div>
          </div>
        </form>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  auth: false
})

const { loginUser, loading, isAuthenticated, user, tokens } = useAuth()
const router = useRouter()

const form = ref({
  email: '',
  password: '',
  rememberMe: false
})

const error = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  if (isLoading.value) return
  
  error.value = ''
  isLoading.value = true
  
  try {
    const result = await loginUser({
      email: form.value.email,
      password: form.value.password
    })
    
    // Show success message
    const { $toast } = useNuxtApp()
    ;($toast as any)?.success?.('Login successful! Redirecting...')
    
    // Check for redirect query parameter or default to dashboard
    const router = useRouter()
    const route = useRoute()
    const redirectTo = route.query.redirect as string || '/'
    
    // Use proper navigation instead of window.location
    setTimeout(() => {
      router.push(redirectTo)
    }, 500) // Shorter delay
    
  } catch (err: any) {
    error.value = err.message || 'Login failed. Please check your credentials.'
    isLoading.value = false
  }
}

// Simple redirect on page load if already authenticated
onMounted(() => {
  if (isAuthenticated.value) {
    const router = useRouter()
    router.push('/')
  }
})
</script>

<style scoped>
.login-form {
  max-width: 100%;
}

.text-white-50 {
  color: rgba(255, 255, 255, 0.6) !important;
}

/* Welcome header styling */
.welcome-icon {
  padding: 1rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: inline-block;
  backdrop-filter: blur(10px);
}

/* Card styling */
.card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 1rem;
}

/* Form input styling */
.input-group-text {
  background: #f8f9fa;
  border-color: #dee2e6;
}

.form-control {
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
}

.input-group:focus-within .input-group-text {
  border-color: #0d6efd;
  background: rgba(13, 110, 253, 0.05);
}

/* Button styling */
.btn-primary {
  background: linear-gradient(135deg, #0d6efd 0%, #6610f2 100%);
  border: none;
  font-weight: 600;
  letter-spacing: 0.025em;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #0b5ed7 0%, #520dc2 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(13, 110, 253, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.65;
  transform: none !important;
}

/* Alert styling */
.alert {
  border: none;
  border-radius: 0.5rem;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}



/* Responsive design */
@media (max-width: 767.98px) {
  .login-form {
    padding: 0 1rem;
  }
  
  .card-body {
    padding: 1.5rem !important;
  }
}

/* Loading animation */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Smooth form transitions */
.form-control, .input-group-text {
  transition: all 0.3s ease;
}

/* Focus ring improvements */
.form-check-input:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
}


</style>