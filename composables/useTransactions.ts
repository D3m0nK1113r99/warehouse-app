import { ref } from 'vue'
import type { Ref } from 'vue'
import { readItems, createItem, updateItem, deleteItem } from '@directus/sdk'
import { useDirectusClient } from '~/composables/useDirectus'

export type TxnType = 'IN' | 'OUT' | 'ADJUST'

export interface Transaction {
  id: string
  type: TxnType
  product_id: string | { id: string; name: string; sku?: string }
  location_id: string | { id: string; name: string }
  quantity: number
  note?: string
  created_at?: string
  deleted?: boolean
  // Helper getters for easier access
  product?: { id: string; name: string; sku?: string }
  location?: { id: string; name: string }
}

export interface CreateTransactionPayload {
  type: TxnType
  product_id: string
  location_id: string
  quantity: number
  note?: string
}

export interface TransactionFilters {
  type?: TxnType | ''
  product?: string
  location?: string
  productId?: string  // For backward compatibility
  locationId?: string // For backward compatibility
  search?: string
  dateFrom?: string
  dateTo?: string
}

export const useTransactions = () => {
  const client = useDirectusClient()

  const txns: Ref<Transaction[]> = ref([])
  const loading = ref(false)
  const filters = ref<TransactionFilters>({})

  const fetchTransactions = async (showArchived = false, filterParams?: TransactionFilters) => {
    loading.value = true
    try {
      const currentFilters = filterParams || filters.value

      // Build filters for the API request
      let filter: any = {}

      // Handle archived/deleted filter
      if (showArchived) {
        filter.deleted = { _eq: true }
      } else {
        filter._or = [
          { deleted: { _null: true } },
          { deleted: { _eq: false } }
        ]
      }

      if (currentFilters.type) {
        filter.type = { _eq: currentFilters.type }
      }

      if (currentFilters.product || currentFilters.productId) {
        filter.product_id = { _eq: currentFilters.product || currentFilters.productId }
      }

      if (currentFilters.location || currentFilters.locationId) {
        filter.location_id = { _eq: currentFilters.location || currentFilters.locationId }
      }

      if (currentFilters.search) {
        filter._or = [
          { 'product_id.name': { _icontains: currentFilters.search } },
          { 'location_id.name': { _icontains: currentFilters.search } },
          { note: { _icontains: currentFilters.search } }
        ]
      }

      if (currentFilters.dateFrom) {
        filter.created_at = { _gte: currentFilters.dateFrom }
      }

      if (currentFilters.dateTo) {
        filter.created_at = { ...filter.created_at, _lte: currentFilters.dateTo }
      }

      const requestOptions: any = {
        fields: [
          'id', 
          'type',
          'product_id',
          'location_id',
          'product_id.id',
          'product_id.name',
          'product_id.sku',
          'location_id.id', 
          'location_id.name',
          'quantity', 
          'note', 
          'created_at', 
          'deleted'
        ],
        limit: 100,
        sort: ['-created_at']
      }

      if (Object.keys(filter).length > 0) {
        requestOptions.filter = filter
      }

      const list = await client.request(readItems('transactions', requestOptions))
      
      // Map the response to normalize product and location data for easier template access
      txns.value = (list as any[]).map((item: any) => ({
        ...item,
        // Create helper properties for easier template access
        product: typeof item.product_id === 'object' && item.product_id ? item.product_id : null,
        location: typeof item.location_id === 'object' && item.location_id ? item.location_id : null
      })) as Transaction[]
    } catch (error) {
      console.error('Error fetching transactions:', error)
      txns.value = []
    } finally {
      loading.value = false
    }
  }

  const createTransaction = async (payload: CreateTransactionPayload) => {
    try {
      return await client.request(createItem('transactions', payload))
    } catch (error) {
      console.error('Error creating transaction:', error)
      throw error
    }
  }

  const updateTransaction = async (id: string, payload: Partial<Transaction>) => {
    try {
      return await client.request(updateItem('transactions', id, payload))
    } catch (error) {
      console.error('Error updating transaction:', error)
      throw error
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      return await client.request(updateItem('transactions', id, { deleted: true }))
    } catch (error) {
      console.error('Error deleting transaction:', error)
      throw error
    }
  }

  const restoreTransaction = async (id: string) => {
    try {
      return await client.request(updateItem('transactions', id, { deleted: false }))
    } catch (error) {
      console.error('Error restoring transaction:', error)
      throw error
    }
  }

  const getTransactionTypeLabel = (type: TxnType): string => {
    switch (type) {
      case 'IN': return 'IN (Receive)'
      case 'OUT': return 'OUT (Ship)'
      case 'ADJUST': return 'ADJUST (Manual)'
      default: return type
    }
  }

  const getTransactionTypeColor = (type: TxnType): string => {
    switch (type) {
      case 'IN': return 'success'
      case 'OUT': return 'danger'
      case 'ADJUST': return 'warning'
      default: return 'secondary'
    }
  }

  const setFilters = (newFilters: TransactionFilters) => {
    filters.value = { ...newFilters }
  }

  return {
    txns,
    loading,
    filters,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    restoreTransaction,
    getTransactionTypeLabel,
    getTransactionTypeColor,
    setFilters
  }
}