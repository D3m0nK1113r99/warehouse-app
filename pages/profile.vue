<template>
  <div class="container py-4">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <h1 class="h3 mb-1">
              <i class="bi bi-person-circle me-2 text-primary"></i>
              Personal Information
            </h1>
            <p class="text-muted mb-0">Welcome to your personal dashboard</p>
          </div>
          <button 
            @click="handleLogout" 
            class="btn btn-outline-danger"
            :disabled="loading"
          >
            <i class="bi bi-box-arrow-right me-1"></i>
            Logout
          </button>
        </div>
      </div>
    </div>

    <!-- Login Success Alert -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="alert alert-success d-flex align-items-center" role="alert">
          <i class="bi bi-check-circle-fill me-2"></i>
          <div>
            <strong>Login Successful!</strong> 
            Your login information has been saved securely and you've been redirected to your profile page.
            <br>
            <small class="text-success-emphasis">
              <i class="bi bi-info-circle me-1"></i>
              Session started at: {{ formatDate(new Date(loginTime.value || Date.now())) }}
            </small>
          </div>
        </div>
      </div>
    </div>

    <!-- User Information Cards -->
    <div class="row g-4">
      <!-- User Profile Card -->
      <div class="col-md-6">
        <div class="card h-100 shadow-sm">
          <div class="card-header bg-primary text-white">
            <h5 class="card-title mb-0">
              <i class="bi bi-person-fill me-2"></i>
              User Profile
            </h5>
          </div>
          <div class="card-body">
            <div v-if="user" class="space-y-3">
              <div class="row mb-3">
                <div class="col-sm-4">
                  <strong class="text-muted">User ID:</strong>
                </div>
                <div class="col-sm-8">
                  <span class="badge bg-light text-dark">{{ user.id }}</span>
                </div>
              </div>
              
              <div class="row mb-3">
                <div class="col-sm-4">
                  <strong class="text-muted">Email:</strong>
                </div>
                <div class="col-sm-8">
                  <span class="text-primary">
                    <i class="bi bi-envelope me-1"></i>
                    {{ user.email }}
                  </span>
                </div>
              </div>
              
              <div class="row mb-3" v-if="user.first_name || user.last_name">
                <div class="col-sm-4">
                  <strong class="text-muted">Full Name:</strong>
                </div>
                <div class="col-sm-8">
                  {{ user.first_name || '' }} {{ user.last_name || '' }}
                </div>
              </div>
              
              <div class="row mb-3" v-if="user.role">
                <div class="col-sm-4">
                  <strong class="text-muted">Role:</strong>
                </div>
                <div class="col-sm-8">
                  <span class="badge" :class="getRoleBadgeClass(user.role.name)">
                    <i :class="getRoleIcon(user.role.name)" class="me-1"></i>
                    {{ user.role.name }}
                  </span>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center text-muted">
              <i class="bi bi-person-x display-4 mb-3"></i>
              <p>No user information available</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Session Information Card -->
      <div class="col-md-6">
        <div class="card h-100 shadow-sm">
          <div class="card-header bg-success text-white">
            <h5 class="card-title mb-0">
              <i class="bi bi-shield-check me-2"></i>
              Session Information
            </h5>
          </div>
          <div class="card-body">
            <div v-if="tokens" class="space-y-3">
              <div class="row mb-3">
                <div class="col-sm-4">
                  <strong class="text-muted">Status:</strong>
                </div>
                <div class="col-sm-8">
                  <span class="badge bg-success">
                    <i class="bi bi-check-circle me-1"></i>
                    Authenticated
                  </span>
                </div>
              </div>
              
              <div class="row mb-3">
                <div class="col-sm-4">
                  <strong class="text-muted">Login Time:</strong>
                </div>
                <div class="col-sm-8">
                  <small class="text-muted">
                    <i class="bi bi-clock me-1"></i>
                    {{ formatDate(new Date(loginTime.value || Date.now())) }}
                  </small>
                </div>
              </div>
              
              <div class="row mb-3" v-if="tokens.expires">
                <div class="col-sm-4">
                  <strong class="text-muted">Token Expires:</strong>
                </div>
                <div class="col-sm-8">
                  <small class="text-muted">
                    <i class="bi bi-hourglass-split me-1"></i>
                    {{ formatDate(new Date(tokens.expires)) }}
                  </small>
                </div>
              </div>
              
              <div class="row mb-3">
                <div class="col-sm-4">
                  <strong class="text-muted">Refresh Token:</strong>
                </div>
                <div class="col-sm-8">
                  <span class="badge" :class="tokens.refresh_token ? 'bg-success' : 'bg-warning'">
                    <i :class="tokens.refresh_token ? 'bi bi-check-circle' : 'bi bi-exclamation-triangle'" class="me-1"></i>
                    {{ tokens.refresh_token ? 'Available' : 'Not Available' }}
                  </span>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center text-muted">
              <i class="bi bi-shield-x display-4 mb-3"></i>
              <p>No session information available</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Permissions Card -->
    <div class="row mt-4">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-info text-white">
            <h5 class="card-title mb-0">
              <i class="bi bi-key-fill me-2"></i>
              Permissions & Access
            </h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-3">
                <div class="text-center p-3 rounded" :class="isAdmin() ? 'bg-success bg-opacity-10 text-success' : 'bg-light text-muted'">
                  <i class="bi bi-person-fill-gear display-6"></i>
                  <h6 class="mt-2 mb-1">Admin Access</h6>
                  <span class="badge" :class="isAdmin() ? 'bg-success' : 'bg-secondary'">
                    {{ isAdmin() ? 'Granted' : 'Denied' }}
                  </span>
                </div>
              </div>
              
              <div class="col-md-3">
                <div class="text-center p-3 rounded" :class="canEdit() ? 'bg-warning bg-opacity-10 text-warning' : 'bg-light text-muted'">
                  <i class="bi bi-pencil-square display-6"></i>
                  <h6 class="mt-2 mb-1">Edit Access</h6>
                  <span class="badge" :class="canEdit() ? 'bg-warning' : 'bg-secondary'">
                    {{ canEdit() ? 'Granted' : 'Denied' }}
                  </span>
                </div>
              </div>
              
              <div class="col-md-3">
                <div class="text-center p-3 rounded" :class="canDelete() ? 'bg-danger bg-opacity-10 text-danger' : 'bg-light text-muted'">
                  <i class="bi bi-trash3 display-6"></i>
                  <h6 class="mt-2 mb-1">Delete Access</h6>
                  <span class="badge" :class="canDelete() ? 'bg-danger' : 'bg-secondary'">
                    {{ canDelete() ? 'Granted' : 'Denied' }}
                  </span>
                </div>
              </div>
              
              <div class="col-md-3">
                <div class="text-center p-3 rounded" :class="isViewer() ? 'bg-primary bg-opacity-10 text-primary' : 'bg-light text-muted'">
                  <i class="bi bi-eye display-6"></i>
                  <h6 class="mt-2 mb-1">View Access</h6>
                  <span class="badge" :class="isViewer() ? 'bg-primary' : 'bg-secondary'">
                    {{ isViewer() ? 'Granted' : 'Denied' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="row mt-4">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="bi bi-lightning-fill me-2"></i>
              Quick Actions
            </h5>
          </div>
          <div class="card-body">
            <div class="d-flex flex-wrap gap-2">
              <NuxtLink to="/" class="btn btn-outline-primary">
                <i class="bi bi-house me-1"></i>
                Dashboard
              </NuxtLink>
              
              <NuxtLink to="/inventory" class="btn btn-outline-success" v-if="isViewer()">
                <i class="bi bi-boxes me-1"></i>
                Inventory
              </NuxtLink>
              
              <NuxtLink to="/products" class="btn btn-outline-info" v-if="isViewer()">
                <i class="bi bi-box me-1"></i>
                Products
              </NuxtLink>
              
              <NuxtLink to="/transactions" class="btn btn-outline-warning" v-if="isViewer()">
                <i class="bi bi-arrow-left-right me-1"></i>
                Transactions
              </NuxtLink>
              
              <button @click="refreshUserData" class="btn btn-outline-secondary" :disabled="loading">
                <i class="bi bi-arrow-clockwise me-1"></i>
                {{ loading ? 'Refreshing...' : 'Refresh Data' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { 
  user, 
  tokens, 
  loading, 
  logoutUser, 
  getCurrentUser,
  getLoginInfo,
  getLoginTime,
  isAdmin,
  isOperator,
  isViewer,
  canEdit,
  canDelete 
} = useAuth()

const router = useRouter()

// Get login information
const loginInfo = ref(getLoginInfo())
const loginTime = ref(getLoginTime())

// Handle logout
const handleLogout = async () => {
  try {
    await logoutUser()
  } catch (error) {
    console.error('Logout error:', error)
    // Force redirect to login even if logout fails
    await router.push('/login')
  }
}

// Refresh user data
const refreshUserData = async () => {
  try {
    await getCurrentUser()
    const { $toast } = useNuxtApp()
    ;($toast as any)?.success?.('User data refreshed successfully!')
  } catch (error) {
    console.error('Failed to refresh user data:', error)
    const { $toast } = useNuxtApp()
    ;($toast as any)?.error?.('Failed to refresh user data')
  }
}

// Helper functions
const formatDate = (date: Date) => {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getRoleBadgeClass = (roleName: string) => {
  switch (roleName?.toLowerCase()) {
    case 'admin':
    case 'administrator':
      return 'bg-danger'
    case 'operator':
      return 'bg-warning'
    case 'viewer':
      return 'bg-info'
    default:
      return 'bg-secondary'
  }
}

const getRoleIcon = (roleName: string) => {
  switch (roleName?.toLowerCase()) {
    case 'admin':
    case 'administrator':
      return 'bi bi-person-fill-gear'
    case 'operator':
      return 'bi bi-person-fill'
    case 'viewer':
      return 'bi bi-person-fill-check'
    default:
      return 'bi bi-person'
  }
}

// Show welcome toast on page load and ensure user data is available
onMounted(async () => {
  const { $toast } = useNuxtApp()
  
  // Refresh login info
  loginInfo.value = getLoginInfo()
  loginTime.value = getLoginTime()
  
  // Refresh user data if not available
  if (!user.value) {
    try {
      await getCurrentUser()
    } catch (error) {
      console.error('Failed to load user data:', error)
      ;($toast as any)?.error?.('Failed to load user information')
      return
    }
  }
  
  // Show welcome message with login info
  const welcomeMessage = loginInfo.value 
    ? `Welcome back, ${user.value?.email || 'User'}! Login saved successfully.`
    : `Welcome back, ${user.value?.email || 'User'}!`
  
  ;($toast as any)?.success?.(welcomeMessage)
})
</script>

<style scoped>
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
}

.badge {
  font-size: 0.85em;
}

.space-y-3 > * + * {
  margin-top: 1rem;
}

.bg-opacity-10 {
  background-color: rgba(var(--bs-primary-rgb), 0.1) !important;
}

.display-6 {
  font-size: 2rem;
}

@media (max-width: 768px) {
  .d-flex.flex-wrap.gap-2 {
    flex-direction: column;
  }
  
  .d-flex.flex-wrap.gap-2 > * {
    margin-bottom: 0.5rem;
  }
}
</style>