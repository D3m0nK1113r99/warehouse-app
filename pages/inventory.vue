<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="mb-0">Inventory</h1>
      <div class="text-muted small" v-if="lastUpdated && !loading">
        Last updated: {{ formatLastUpdated(lastUpdated) }}
        <i v-if="autoRefresh" class="bi bi-arrow-clockwise ms-1 text-primary" title="Auto-refresh active"></i>
      </div>
    </div>

    <!-- Filters / Poll toggle -->
    <div class="row g-3 align-items-end mb-3">
      <div class="col-sm-4">
        <label class="form-label">Product filter</label>
        <input 
          v-model="filterProduct" 
          type="text" 
          class="form-control" 
          placeholder="Search product"
          :disabled="loading" 
        />
      </div>
      <div class="col-sm-4">
        <label class="form-label">Location filter</label>
        <input 
          v-model="filterLocation" 
          type="text" 
          class="form-control" 
          placeholder="Search location"
          :disabled="loading" 
        />
      </div>
      <div class="col-sm-2 form-check mt-4">
        <input 
          id="auto" 
          type="checkbox" 
          class="form-check-input" 
          v-model="autoRefresh" 
          :disabled="loading"
        />
        <label class="form-check-label" for="auto">Auto‑refresh</label>
      </div>
      <div class="col-sm-2">
        <button 
          class="btn btn-outline-secondary w-100" 
          @click="fetchInventory"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
          {{ loading ? 'Loading...' : 'Refresh now' }}
        </button>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error && !loading" class="alert alert-danger d-flex align-items-center mb-3">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      <div>
        <strong>Error:</strong> {{ error }}
        <button class="btn btn-sm btn-outline-danger ms-2" @click="fetchInventory">
          Try Again
        </button>
      </div>
    </div>

    <!-- Inventory table -->
    <div v-if="!loading && !error">
      <table class="table table-striped align-middle" v-if="rows.length > 0">
        <thead>
          <tr>
            <th>Product</th>
            <th>Location</th>
            <th class="text-end">Quantity</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td>{{ row.product_id?.name || 'Unknown Product' }}</td>
            <td>{{ row.location_id?.name || 'Unknown Location' }}</td>
            <td class="text-end">{{ formatQty(row.quantity) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Empty state -->
      <div v-else class="text-center py-5">
        <i class="bi bi-inbox display-1 text-muted mb-3"></i>
        <h4 class="text-muted">No inventory items found</h4>
        <p class="text-muted mb-3">
          <span v-if="filterProduct || filterLocation">
            Try adjusting your filters or 
            <button class="btn btn-link p-0" @click="clearFilters">clear all filters</button>
          </span>
          <span v-else>
            No inventory items are currently available.
          </span>
        </p>
      </div>
    </div>

    <!-- Loading state -->
    <div class="d-flex justify-content-center py-5" v-if="loading">
      <div class="text-center">
        <div class="spinner-border mb-3" role="status"></div>
        <div class="text-muted">Loading inventory...</div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="card mt-3" v-if="total > limit && !loading">
      <div class="card-footer bg-white">
        <div class="d-flex justify-content-between align-items-center">
          <small class="text-muted">
            Showing {{ (page - 1) * limit + 1 }} to {{ Math.min(page * limit, total) }} of {{ total }} entries
          </small>
          <nav aria-label="Page navigation">
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: page === 1 }">
                <button class="page-link" @click="page > 1 && changePage(page - 1)">
                  <i class="bi bi-chevron-left"></i>
                </button>
              </li>
              <li class="page-item disabled">
                <span class="page-link">Page {{ page }}</span>
              </li>
              <li class="page-item" :class="{ disabled: page * limit >= total }">
                <button class="page-link" @click="page * limit < total && changePage(page + 1)">
                  <i class="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useInventory } from '~/composables/useInventory'

const { 
  rows, 
  loading, 
  error, 
  lastUpdated, 
  filterProduct, 
  filterLocation,
  page,
  limit,
  total,
  fetchInventory, 
  startPolling, 
  stopPolling 
} = useInventory()

const autoRefresh = ref(false)

// Simple debounce implementation
let debounceTimer: NodeJS.Timeout | null = null
const debouncedFetch = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchInventory, 500)
}

watch(autoRefresh, (enable) => enable ? startPolling() : stopPolling())
watch([filterProduct, filterLocation], debouncedFetch)
watch(page, fetchInventory)

onMounted(fetchInventory)

const formatQty = (q: number) => {
  if (q === null || q === undefined) return '0'
  return new Intl.NumberFormat().format(q)
}

const formatLastUpdated = (date: Date) => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  
  return date.toLocaleString()
}

const clearFilters = () => {
  filterProduct.value = ''
  filterLocation.value = ''
}

const changePage = (newPage: number) => {
  page.value = newPage
}
</script>

<style scoped>
.page-link {
  border-radius: 0.25rem;
  margin: 0 0.125rem;
}

.card-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.page-item.disabled .page-link { 
  pointer-events: none; 
  filter: grayscale(0.5); 
}
</style>