import { ref, onBeforeUnmount } from 'vue'
import type { Ref } from 'vue'
import { readItems } from '@directus/sdk'
import { useDirectusClient } from '~/composables/useDirectus'
import { useToast } from 'vue-toastification'
import { normalizeError, getUserFriendlyMessage } from '~/utils/errorHandler'

export interface InventoryRow {
  id: string      // row id (Directus PK)
  deleted?: number  // timestamp (float)
  product_id: { 
    id: string
    name: string
    sku: string
    barcode?: string
  }
  location_id: { 
    id: string
    name: string
    description?: string
  }
  quantity: number
  created_at?: string
  updated_at?: string
}

export const useInventory = () => {
  const client = useDirectusClient()
  const toast = useToast()

  const rows: Ref<InventoryRow[]> = ref([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)
  const filterProduct = ref('')
  const filterLocation = ref('')
  const page = ref(1)
  const limit = ref(25)
  const total = ref(0)

  /* ------------------------- FETCH ------------------------- */
  const fetchInventory = async () => {
    try {
      loading.value = true
      error.value = null
      
      // Build filter object
      const filter: any = {}
      
      if (filterProduct.value) {
        filter['product_id.name'] = { _icontains: filterProduct.value }
      }
      
      if (filterLocation.value) {
        filter['location_id.name'] = { _icontains: filterLocation.value }
      }
      
      const requestOptions: any = {
        fields: [
          'deleted',
          'location_id.name',
          'location_id.id', 
          'product_id.name',
          'product_id.sku',
          'product_id.id',
          'quantity',
          'id'
        ],
        sort: ['id'],
        page: page.value,
        limit: limit.value
      }
      
      // Only add filter if there are filter conditions
      if (Object.keys(filter).length > 0) {
        requestOptions.filter = filter
      }
      
      const list = await client.request(readItems('inventory', requestOptions))
      
      rows.value = list as InventoryRow[]
      lastUpdated.value = new Date()
      
      // Note: Directus should return meta information for total count
      // If not available, we'll set total to current list length
      total.value = Array.isArray(list) ? list.length : limit.value
      
    } catch (err) {
      const normalizedError = normalizeError(err)
      error.value = getUserFriendlyMessage(err)
      toast.error(`Error loading inventory: ${error.value}`)
      console.error('Inventory fetch error:', normalizedError)
    } finally {
      loading.value = false
    }
  }

  /* ------------------------- POLLING ------------------------ */
  let timer: NodeJS.Timeout | null = null
  const startPolling = (intervalMs = 5000) => {
    stopPolling()
    timer = setInterval(fetchInventory, intervalMs)
  }
  const stopPolling = () => { if (timer) { clearInterval(timer); timer = null } }
  onBeforeUnmount(stopPolling)

  return { 
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
  }
}
