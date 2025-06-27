<template>
  <div class="container py-4">
    <div class="card mb-4">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="h3 mb-0">
              <i class="bi bi-arrow-left-right text-primary me-2"></i>Stock Transactions
            </h1>
            <p class="text-muted mb-0">Track all inventory movements</p>
          </div>
          <button class="btn btn-primary" @click="openForm">
            <i class="bi bi-plus-lg me-1"></i> New Transaction
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="showArchived" v-model="showArchived" @change="loadTransactions">
              <label class="form-check-label" for="showArchived">
                <i class="bi bi-archive me-1"></i> Show Archived
              </label>
            </div>
          </div>
          <div class="col-md-9 text-md-end">
            <span class="badge bg-primary rounded-pill fs-6">
              <i class="bi bi-arrow-left-right me-1"></i> {{ txns.length }} Transactions
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Transactions table -->
    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0" v-if="!loading">
            <thead class="bg-light">
              <tr>
                <th class="ps-3">Date</th>
                <th>Type</th>
                <th>Product</th>
                <th>Location</th>
                <th class="text-end">Qty</th>
                <th>Note</th>
                <th class="text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody v-if="txns.length > 0">
              <tr v-for="t in txns" :key="t.id">
                <td class="ps-3">
                  {{ formatDate(t.created_at) }}
                </td>
                <td>
                  <span class="badge" :class="`bg-${getTransactionTypeColor(t.type)}`">
                    {{ getTransactionTypeLabel(t.type) }}
                  </span>
                </td>
                <td class="fw-medium">{{ t.product?.name || '-' }}</td>
                <td>{{ t.location?.name || '-' }}</td>
                <td class="text-end">{{ t.quantity }}</td>
                <td class="text-truncate" style="max-width: 200px;">{{ t.note || '-' }}</td>
                <td class="text-end pe-3">
                  <template v-if="!t.deleted">
                    <button class="btn btn-sm btn-outline-danger" @click="onDelete(t.id)" title="Archive transaction">
                      <i class="bi bi-archive"></i>
                    </button>
                  </template>
                  <template v-else>
                    <span class="badge bg-warning text-dark me-2">Archived</span>
                    <button class="btn btn-sm btn-outline-success" @click="onRestore(t.id)" title="Restore transaction">
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
          
          <div v-if="!loading && txns.length === 0" class="text-center py-5">
            <div class="text-muted mb-3">
              <i class="bi bi-inbox fs-1"></i>
            </div>
            <h5>{{ showArchived ? 'No archived transactions found' : 'No transactions found' }}</h5>
            <p class="text-muted">{{ showArchived ? 'No transactions have been archived yet' : 'Try adding a new transaction to get started' }}</p>
            <button v-if="!showArchived" class="btn btn-primary" @click="openForm">
              <i class="bi bi-plus-lg me-1"></i> New Transaction
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <TransactionForm v-if="formVisible" @saved="onSave" @close="formVisible = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import TransactionForm from '~/components/TransactionForm.vue'
import { useTransactions } from '~/composables/useTransactions'
import { useInventory } from '~/composables/useInventory'

const toast = useToast()
const formVisible = ref(false)
const showArchived = ref(false)
const {
  txns,
  loading,
  fetchTransactions,
  createTransaction,
  deleteTransaction,
  restoreTransaction,
  getTransactionTypeLabel,
  getTransactionTypeColor
} = useTransactions()
const { fetchInventory } = useInventory()

// Load transactions
const loadTransactions = () => fetchTransactions(showArchived.value)
onMounted(loadTransactions)
function openForm() { formVisible.value = true }

function formatDate(dateString: string | undefined) {
  if (!dateString) return '-'
  
  const date = new Date(dateString)
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid Date'
  
  const now = new Date()
  const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  // Show relative time if within last 24 hours
  if (diffInHours < 24) {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return rtf.format(-diffInMinutes, 'minute')
    } else {
      return rtf.format(-Math.floor(diffInHours), 'hour')
    }
  }
  
  // Show full date/time for older transactions
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

async function onSave(payload: any) {
  formVisible.value = false
  try {
    await createTransaction(payload)
    toast.success('Transaction saved')
  } catch (e) {
    console.error('Error saving transaction:', e)
    toast.error('Unable to save transaction')
    return
  }
  try {
    await Promise.all([loadTransactions(), fetchInventory()])
  } catch (e) {
    console.error('Error refreshing data:', e)
    toast.warning('Saved, but refresh failed')
  }
}

async function onDelete(id: string) {
  if (!confirm('Archive this transaction? It will be hidden from the list but can be restored later.')) return
  try {
    await deleteTransaction(id)
    toast.success('Transaction archived')
    await Promise.all([loadTransactions(), fetchInventory()])
  } catch (e) {
    console.error('Error archiving transaction:', e)
    toast.error('Unable to archive transaction')
  }
}

async function onRestore(id: string) {
  if (!confirm('Restore this transaction? It will be visible in the main list again.')) return
  try {
    await restoreTransaction(id)
    toast.success('Transaction restored')
    await Promise.all([loadTransactions(), fetchInventory()])
  } catch (e) {
    console.error('Error restoring transaction:', e)
    toast.error('Unable to restore transaction')
  }
}
</script>

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

/* keep actions column narrow */
th:last-child,
td:last-child {
  width: 1%;
  white-space: nowrap;
}

.card-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}
</style>
