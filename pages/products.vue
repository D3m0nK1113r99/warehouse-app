<template>
  <div class="container py-4">
    <div class="card mb-4">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="h3 mb-0">
              <i class="bi bi-box text-primary me-2"></i>Products
            </h1>
            <p class="text-muted mb-0">Manage your product inventory</p>
          </div>
          <button v-if="canEdit()" class="btn btn-primary" @click="openCreateForm">
            <i class="bi bi-plus-lg me-1"></i> Add Product
          </button>
        </div>
      </div>
    </div>

    <!-- Search and filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-5">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input v-model="searchQuery" type="text" class="form-control border-start-0" placeholder="Search products..." />
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select">
              <option value="">All Units</option>
              <option value="pcs">Pieces</option>
              <option value="kg">Kilograms</option>
              <option value="box">Boxes</option>
            </select>
          </div>
          <div class="col-md-2">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="showArchived" v-model="showArchived" @change="loadProducts">
              <label class="form-check-label" for="showArchived">
                <i class="bi bi-archive me-1"></i> Show Archived
              </label>
            </div>
          </div>
          <div class="col-md-2 text-md-end">
            <span class="badge bg-primary rounded-pill fs-6">
              <i class="bi bi-box me-1"></i> {{ total }} Products
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Products table -->
    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0" v-if="!loading">
            <thead class="bg-light">
              <tr>
                <th class="ps-3">ID</th>
                <th>Name</th>
                <th>SKU</th>
                <th>Unit</th>
                <th>Description</th>
                <th class="text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="prod in products" :key="prod.id">
                <td class="ps-3 text-muted">{{ prod.id }}</td>
                <td class="fw-medium">{{ prod.name }}</td>
                <td><span class="badge bg-light text-dark">{{ prod.sku }}</span></td>
                <td>{{ prod.unit }}</td>
                <td class="text-truncate" style="max-width: 200px;">{{ prod.description  }}</td>
                <td class="text-end pe-3">
                  <template v-if="!prod.deleted">
                    <button v-if="canEdit()" class="btn btn-sm btn-outline-primary me-1" @click="openEditForm(prod)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button v-if="canDelete()" class="btn btn-sm btn-outline-danger" @click="onDelete(prod.id)" title="Archive product">
                      <i class="bi bi-archive"></i>
                    </button>
                  </template>
                  <template v-else>
                    <span class="badge bg-warning text-dark me-2">Archived</span>
                    <button v-if="canEdit()" class="btn btn-sm btn-outline-success" @click="onRestore(prod.id)" title="Restore product">
                      <i class="bi bi-arrow-counterclockwise"></i>
                    </button>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div class="d-flex justify-content-center py-5" v-if="loading">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          
          <div v-if="!loading && products.length === 0" class="text-center py-5">
            <div class="text-muted mb-3">
              <i class="bi bi-inbox fs-1"></i>
            </div>
            <h5>No products found</h5>
            <p class="text-muted">Try adding a new product or changing your search criteria</p>
            <button v-if="canEdit()" class="btn btn-primary" @click="openCreateForm">
              <i class="bi bi-plus-lg me-1"></i> Add Product
            </button>
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div class="card-footer bg-white" v-if="total > limit && !loading">
        <div class="d-flex justify-content-between align-items-center">
          <small class="text-muted">Showing {{ (page - 1) * limit + 1 }} to {{ Math.min(page * limit, total) }} of {{ total }} entries</small>
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

    <!-- Modal form -->
    <ProductForm v-model="formVisible" :product="selected" @saved="onSave" />
  </div>
</template>

<style scoped>
.table th {
  font-weight: 600;
  border-top: none;
  border-bottom-width: 1px;
}

.table td {
  vertical-align: middle;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.badge {
  font-weight: 500;
}

.page-link {
  border-radius: 0.25rem;
  margin: 0 0.125rem;
}

.card-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}
</style>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})
import { ref, watch } from 'vue'
import { useToast } from 'vue-toastification'
import ProductForm from '~/components/ProductForm.vue'
import { useProducts, type Product } from '~/composables/useProducts'

const toast = useToast()
const { canEdit, canDelete } = useAuth()

const {
  /* state */ products, total, page, limit, loading, searchQuery,
  /* actions */ fetchProducts, createProduct, updateProduct, deleteProduct
} = useProducts()

const formVisible = ref(false)
const selected    = ref<Product | null>(null)
const showArchived = ref(false)

// Initial load + watch page changes
const loadProducts = () => fetchProducts(showArchived.value)
loadProducts()
watch(page, loadProducts)
watch(showArchived, loadProducts)

// Debounced search
let searchTimeout: NodeJS.Timeout | null = null
const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1 // Reset to first page when searching
    loadProducts()
  }, 500)
}
watch(searchQuery, debouncedSearch)

const formatDate = (dateValue: string | number | null | undefined) => {
  if (!dateValue) return '-'
  
  let date: Date
  if (typeof dateValue === 'number') {
    // If it's a timestamp (for deleted field)
    date = new Date(dateValue * 1000)
  } else {
    // If it's a string (for created_at/updated_at)
    date = new Date(dateValue)
  }
  
  if (isNaN(date.getTime())) return '-'
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/* UI helpers */
function openCreateForm() {
  selected.value = null
  formVisible.value = true
}
function openEditForm(prod: Product) {
  selected.value = prod
  formVisible.value = true
}
function changePage(p: number) {
  page.value = p
}

/* CRUD handlers with toasts */
async function onSave(payload: Partial<Product>) {
  try {
    if (selected.value?.id) {
      await updateProduct(selected.value.id, payload)
      toast.success('Product updated')
    } else {
      await createProduct(payload)
      toast.success('Product added')
    }
    formVisible.value = false // Explicitly close the form
    await loadProducts()
  } catch (err) {
    console.error(err)
    toast.error('Unable to save product')
  }
}

async function onDelete(id: string) {
  if (!confirm('Archive this product? It will be hidden from the list but can be restored later.')) return

  try {
    await deleteProduct(id)
    toast.success('Product archived')
    await loadProducts()
  } catch (err) {
    toast.error('Unable to archive product')
  }
}

async function onRestore(id: string) {
  if (!confirm('Restore this product? It will be visible in the main list again.')) return

  try {
    await updateProduct(id, { deleted: undefined })  // Set deleted to undefined to restore
    toast.success('Product restored')
    await loadProducts()
  } catch (err) {
    toast.error('Unable to restore product')
  }
}
</script>

<style scoped>
.page-item.disabled .page-link { pointer-events: none; filter: grayscale(0.5); }
</style>