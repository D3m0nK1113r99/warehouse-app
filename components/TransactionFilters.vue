<template>
  <div class="card mb-4">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h6 class="mb-0">
        <i class="fas fa-filter me-2"></i>
        Filters & Search
      </h6>
      <button 
        class="btn btn-sm btn-outline-secondary"
        @click="toggleFilters"
      >
        {{ showFilters ? 'Hide' : 'Show' }} Filters
        <i :class="showFilters ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="ms-1"></i>
      </button>
    </div>
    
    <div class="card-body" v-show="showFilters">
      <div class="row g-3">
        <!-- Search -->
        <div class="col-md-6 col-lg-4">
          <label class="form-label">Search</label>
          <div class="input-group">
            <input 
              v-model="localFilters.search"
              type="text" 
              class="form-control" 
              placeholder="Search notes, products, locations..."
              @input="debounceApplyFilters"
            />
            <button 
              class="btn btn-outline-secondary" 
              type="button"
              @click="clearSearch"
              v-if="localFilters.search"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <!-- Date From -->
        <div class="col-md-3 col-lg-2">
          <label class="form-label">Date From</label>
          <input 
            v-model="localFilters.dateFrom"
            type="date" 
            class="form-control"
            @change="applyFilters"
          />
        </div>
        
        <!-- Date To -->
        <div class="col-md-3 col-lg-2">
          <label class="form-label">Date To</label>
          <input 
            v-model="localFilters.dateTo"
            type="date" 
            class="form-control"
            @change="applyFilters"
          />
        </div>
        
        <!-- Transaction Type -->
        <div class="col-md-6 col-lg-2">
          <label class="form-label">Type</label>
          <select v-model="localFilters.type" class="form-select" @change="applyFilters">
            <option value="">All Types</option>
            <option value="purchase">📦 Purchase</option>
            <option value="sale">💰 Sale</option>
            <option value="adjustment">⚖️ Adjustment</option>
            <option value="transfer">🔄 Transfer</option>
          </select>
        </div>
        
        <!-- Product Filter -->
        <div class="col-md-6 col-lg-2">
          <label class="form-label">Product</label>
          <select v-model="localFilters.productId" class="form-select" @change="applyFilters">
            <option value="">All Products</option>
            <option v-for="product in products" :key="product.id" :value="product.id">
              {{ product.name }}
            </option>
          </select>
        </div>
        
        <!-- Location Filter -->
        <div class="col-md-6 col-lg-2">
          <label class="form-label">Location</label>
          <select v-model="localFilters.locationId" class="form-select" @change="applyFilters">
            <option value="">All Locations</option>
            <option v-for="location in locations" :key="location.id" :value="location.id">
              {{ location.name }}
            </option>
          </select>
        </div>
      </div>
      
      <!-- Filter Actions -->
      <div class="row mt-3">
        <div class="col-12 d-flex justify-content-between">
          <div class="d-flex gap-2">
            <button class="btn btn-primary btn-sm" @click="applyFilters">
              <i class="fas fa-search me-1"></i>
              Apply Filters
            </button>
            <button class="btn btn-outline-secondary btn-sm" @click="clearAllFilters">
              <i class="fas fa-times me-1"></i>
              Clear All
            </button>
          </div>
          
          <!-- Active filters indicator -->
          <div v-if="hasActiveFilters" class="text-muted small">
            <i class="fas fa-info-circle me-1"></i>
            {{ activeFilterCount }} filter(s) active
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useProducts } from '~/composables/useProducts'
import { useLocations } from '~/composables/useLocations'
import type { TransactionFilters } from '~/composables/useTransactions'

interface Props {
  filters: TransactionFilters
}

const props = defineProps<Props>()
const emit = defineEmits<{
  filtersChanged: [filters: TransactionFilters]
}>()

const showFilters = ref(false)
const { products, fetchProducts } = useProducts()
const { locations, fetchLocations } = useLocations()

const localFilters = reactive<TransactionFilters>({
  dateFrom: '',
  dateTo: '',
  productId: '',
  locationId: '',
  type: undefined,
  search: ''
})

let debounceTimer: NodeJS.Timeout | null = null

const hasActiveFilters = computed(() => {
  return !!(localFilters.search || localFilters.dateFrom || localFilters.dateTo || 
           localFilters.productId || localFilters.locationId || localFilters.type)
})

const activeFilterCount = computed(() => {
  let count = 0
  if (localFilters.search) count++
  if (localFilters.dateFrom) count++
  if (localFilters.dateTo) count++
  if (localFilters.productId) count++
  if (localFilters.locationId) count++
  if (localFilters.type) count++
  return count
})

onMounted(async () => {
  // Initialize with props
  Object.assign(localFilters, props.filters)
  
  // Load products and locations for filters
  try {
    await Promise.all([
      fetchProducts(false, true),
      fetchLocations(true)
    ])
  } catch (error) {
    console.error('Error loading filter options:', error)
  }
})

function toggleFilters() {
  showFilters.value = !showFilters.value
}

function applyFilters() {
  emit('filtersChanged', { ...localFilters })
}

function debounceApplyFilters() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    applyFilters()
  }, 300)
}

function clearSearch() {
  localFilters.search = ''
  applyFilters()
}

function clearAllFilters() {
  Object.assign(localFilters, {
    dateFrom: '',
    dateTo: '',
    productId: '',
    locationId: '',
    type: undefined,
    search: ''
  })
  applyFilters()
}
</script>

<style scoped>
.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.form-label {
  font-weight: 500;
  margin-bottom: 0.25rem;
}
</style>