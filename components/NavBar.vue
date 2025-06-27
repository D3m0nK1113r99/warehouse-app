<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top">
    <div class="container">
      <NuxtLink class="navbar-brand fw-bold" to="/">
        <i class="bi bi-box-seam me-2"></i>Warehouse App
      </NuxtLink>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul v-if="isAuthenticated" class="navbar-nav me-auto">
          <li class="nav-item">
            <NuxtLink class="nav-link px-3" to="/" active-class="active">
              <i class="bi bi-house me-1"></i> Home
            </NuxtLink>
          </li>
          <li v-if="isViewer()" class="nav-item">
            <NuxtLink class="nav-link px-3" to="/products" active-class="active">
              <i class="bi bi-box me-1"></i> Products
            </NuxtLink>
          </li>
          <li v-if="isViewer()" class="nav-item">
            <NuxtLink class="nav-link px-3" to="/locations" active-class="active">
              <i class="bi bi-geo-alt me-1"></i> Locations
            </NuxtLink>
          </li>
          <li v-if="isViewer()" class="nav-item">
            <NuxtLink class="nav-link px-3" to="/inventory" active-class="active">
              <i class="bi bi-clipboard-data me-1"></i> Inventory
            </NuxtLink>
          </li>
          <li v-if="isViewer()" class="nav-item">
            <NuxtLink class="nav-link px-3" to="/transactions" active-class="active">
              <i class="bi bi-arrow-left-right me-1"></i> Transactions
            </NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink class="nav-link px-3" to="/profile" active-class="active">
              <i class="bi bi-person me-1"></i> Profile
            </NuxtLink>
          </li>
        </ul>
        <div v-if="isAuthenticated" class="d-flex">
          <!-- Role badge -->
          <span class="badge bg-light text-dark me-3 align-self-center">
            <i class="bi bi-shield-check me-1"></i>{{ user?.role?.name || 'No Role' }}
          </span>
          
          <div class="dropdown">
            <button class="btn btn-outline-light dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-person-circle me-1"></i>
              {{ user?.first_name || user?.email?.split('@')[0] || 'User' }}
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
              <li>
                <h6 class="dropdown-header">
                  <i class="bi bi-person me-2"></i>{{ user?.email }}
                </h6>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <button class="dropdown-item" @click="handleLogout">
                  <i class="bi bi-box-arrow-right me-2"></i>Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div v-else class="d-flex">
          <NuxtLink to="/login" class="btn btn-outline-light">
            <i class="bi bi-box-arrow-in-right me-1"></i>Login
          </NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const { user, isAuthenticated, logoutUser, isViewer } = useAuth()

const handleLogout = async () => {
  await logoutUser()
}
</script>

<style scoped>
.navbar-dark .navbar-nav .nav-link.active {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  font-weight: 500;
}

.navbar-dark .navbar-nav .nav-link {
  color: rgba(255, 255, 255, 0.85);
  transition: all 0.2s ease;
}

.navbar-dark .navbar-nav .nav-link:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
</style>