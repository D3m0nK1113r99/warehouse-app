<template>
  <div class="container">
    <!-- Hero Section -->
    <div class="row align-items-center py-5">
      <div class="col-lg-6">
        <h1 class="display-4 fw-bold text-primary mb-3">Warehouse Management System</h1>
        <p class="lead mb-4">
          Streamline your inventory operations with our powerful warehouse management solution. Track products, manage locations, and optimize your supply chain.
        </p>
        <div class="d-flex gap-3 mb-5">
          <NuxtLink to="/products" class="btn btn-primary btn-lg px-4">
            <i class="bi bi-box me-2"></i>Manage Products
          </NuxtLink>
          <NuxtLink to="/locations" class="btn btn-outline-primary btn-lg px-4">
            <i class="bi bi-geo-alt me-2"></i>View Locations
          </NuxtLink>
        </div>
      </div>
      <div class="col-lg-6 d-none d-lg-block">
        <img src="https://placehold.co/600x400/e9f2ff/0d6efd?text=Warehouse+Management" alt="Warehouse Management" class="img-fluid rounded shadow-lg" />
      </div>
    </div>

    <!-- Features Section -->
    <div class="row py-5">
      <div class="col-12 text-center mb-5">
        <h2 class="fw-bold">Key Features</h2>
        <p class="text-muted">Everything you need to manage your warehouse efficiently</p>
      </div>
      
      <div class="col-md-4 mb-4">
        <div class="card h-100 p-4">
          <div class="text-primary mb-3">
            <i class="bi bi-box-seam fs-1"></i>
          </div>
          <h3 class="h5 fw-bold">Product Management</h3>
          <p class="text-muted">Easily add, edit, and track all your products in one place.</p>
        </div>
      </div>
      
      <div class="col-md-4 mb-4">
        <div class="card h-100 p-4">
          <div class="text-primary mb-3">
            <i class="bi bi-geo fs-1"></i>
          </div>
          <h3 class="h5 fw-bold">Location Tracking</h3>
          <p class="text-muted">Organize your warehouse with customizable location management.</p>
        </div>
      </div>
      
      <div class="col-md-4 mb-4">
        <div class="card h-100 p-4">
          <div class="text-primary mb-3">
            <i class="bi bi-graph-up fs-1"></i>
          </div>
          <h3 class="h5 fw-bold">Inventory Analytics</h3>
          <p class="text-muted">Get insights into your inventory with detailed analytics.</p>
        </div>
      </div>
    </div>

    <!-- Call to Action -->
    <div class="row py-5">
      <div class="col-12">
        <div class="card bg-primary text-white p-5 text-center">
          <h2 class="fw-bold mb-3">Ready to optimize your warehouse?</h2>
          <p class="lead mb-4">Start managing your inventory more efficiently today.</p>
          <div class="d-flex justify-content-center gap-3">
            <NuxtLink to="/products" class="btn btn-light btn-lg px-4 text-primary">
              Get Started
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

// Show dashboard for authenticated users
const { isAuthenticated, user } = useAuth()
</script>

<style scoped>
.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}
</style>