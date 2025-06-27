<template>
  <div class="container py-4">
    <div class="card mb-4">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="h3 mb-0">
              <i class="bi bi-geo-alt text-primary me-2"></i>Locations
            </h1>
            <p class="text-muted mb-0">Manage your warehouse locations</p>
          </div>
          <button class="btn btn-primary" @click="openCreateForm">
            <i class="bi bi-plus-lg me-1"></i> Add Location
          </button>
        </div>
      </div>
    </div>

    <!-- Search and filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input v-model="searchQuery" type="text" class="form-control border-start-0"
                placeholder="Search locations..." />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="showArchived" v-model="showArchived"
                @change="loadLocations">
              <label class="form-check-label" for="showArchived">
                <i class="bi bi-archive me-1"></i> Show Archived
              </label>
            </div>
          </div>
          <div class="col-md-3 text-md-end">
            <span class="badge bg-primary rounded-pill fs-6">
              <i class="bi bi-geo-alt me-1"></i> {{ total }} Locations
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Locations table -->
    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0" v-if="!loading">
            <thead class="bg-light">
              <tr>
                <!-- <th class="ps-3">ID</th> -->
                <th>Name</th>
                <th>Description</th>
                <th class="text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="loc in locations" :key="loc.id">
                <!-- <td class="ps-3 text-muted">{{ loc.id }}</td> -->
                <td class="fw-medium">
                  {{ loc.name }}
                </td>
                <td class="text-truncate" style="max-width: 400px;">{{ loc.description  }}</td>
                <td class="text-end pe-3">
                  <template v-if="!loc.deleted">
                    <button class="btn btn-sm btn-outline-primary me-1" @click="openEditForm(loc)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="onDelete(loc.id)" title="Archive location">
                      <i class="bi bi-archive"></i>
                    </button>
                  </template>
                  <template v-else>
                    <span class="badge bg-warning text-dark me-2">Archived</span>
                    <button class="btn btn-sm btn-outline-success" @click="onRestore(loc.id)" title="Restore location">
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

          <div v-if="!loading && locations.length === 0" class="text-center py-5">
            <div class="text-muted mb-3">
              <i class="bi bi-geo fs-1"></i>
            </div>
            <h5>No locations found</h5>
            <p class="text-muted">Try adding a new location or changing your search criteria</p>
            <button class="btn btn-primary" @click="openCreateForm">
              <i class="bi bi-plus-lg me-1"></i> Add Location
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="card-footer bg-white" v-if="total > limit && !loading">
        <div class="d-flex justify-content-between align-items-center">
          <small class="text-muted">Showing {{ (page - 1) * limit + 1 }} to {{ Math.min(page * limit, total) }} of {{
            total }}
            entries</small>
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
    <LocationForm v-model="formVisible" :location="selected" @saved="onSave" />
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
import { ref, watch } from 'vue'
import { useToast } from 'vue-toastification'
import LocationForm from '~/components/LocationForm.vue'
import { useLocations, type Location } from '~/composables/useLocations'

const toast = useToast()

const { locations, total, page, limit, loading, searchQuery, fetchLocations,
  createLocation, updateLocation, deleteLocation } = useLocations()

const formVisible = ref(false)
const selected = ref<Location | null>(null)
const showArchived = ref(false)

// Initial load + watch page changes
const loadLocations = () => fetchLocations(showArchived.value)
loadLocations()
watch(page, loadLocations)
watch(showArchived, loadLocations)

// Debounced search
let searchTimeout: NodeJS.Timeout | null = null
const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1 // Reset to first page when searching
    loadLocations()
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

/* helpers */
function openCreateForm() { selected.value = null; formVisible.value = true }
function openEditForm(loc: Location) { selected.value = loc; formVisible.value = true }
function changePage(p: number) { page.value = p }

/* CRUD handlers with toast */
async function onSave(payload: Partial<Location>) {
  try {
    if (selected.value?.id) {
      await updateLocation(selected.value.id, payload)
      toast.success('Location updated')
    } else {
      // naive duplicate name guard (optional)
      if (locations.value.some(l => l.name.trim().toLowerCase() === (payload.name ?? '').trim().toLowerCase())) {
        toast.error('Duplicate location name')
        return
      }
      await createLocation(payload)
      toast.success('Location added')
    }
    formVisible.value = false // Explicitly close the form
    await loadLocations()
  } catch (err) {
    console.error(err)
    toast.error('Unable to save location')
  }
}

async function onDelete(id: string) {
  if (!confirm('Archive this location? It will be hidden from the list but can be restored later.')) return
  try {
    await deleteLocation(id)
    toast.success('Location archived')
    await loadLocations()
  } catch (err) {
    toast.error('Unable to archive location')
  }
}

async function onRestore(id: string) {
  if (!confirm('Restore this location? It will be visible in the main list again.')) return

  try {
    await updateLocation(id, { deleted: undefined })  // Set deleted to undefined to restore
    toast.success('Location restored')
    await loadLocations()
  } catch (err) {
    toast.error('Unable to restore location')
  }
}
</script>

<style scoped>
.page-item.disabled .page-link {
  pointer-events: none;
  filter: grayscale(0.5)
}
</style>