import { ref } from 'vue'
import type { Ref } from 'vue'
import { readItems, createItem, updateItem, deleteItem, aggregate } from '@directus/sdk'
import { useDirectusClient } from '~/composables/useDirectus'

export interface Product {
  id: string
  name: string
  sku: string
  barcode?: string
  unit: string
  description?: string
  deleted?: number  // timestamp (float)
  created_at?: string
  updated_at?: string
}

export const useProducts = () => {
  const client = useDirectusClient()

  const products: Ref<Product[]> = ref([])
  const total: Ref<number>       = ref(0)
  const page: Ref<number>        = ref(1)
  const limit: Ref<number>       = ref(10)
  const loading: Ref<boolean>    = ref(false)
  const searchQuery: Ref<string> = ref('')

  /* ------------------------- CRUD METHODS ------------------------- */
  const fetchProducts = async (showArchived = false, fetchAll = false) => {
    loading.value = true

    // Prepare filter based on whether to show archived items and search query
    let filter: any = {};
    
    if (!showArchived) {
      // Only show non-deleted items (deleted field is timestamp, null means not deleted)
      filter = {
        deleted: { _null: true }
      };
    }

    // Add search filter if searchQuery exists
    if (searchQuery.value.trim()) {
      const searchCondition = {
        _or: [
          { name: { _icontains: searchQuery.value.trim() } },
          { sku: { _icontains: searchQuery.value.trim() } },
          { description: { _icontains: searchQuery.value.trim() } }
        ]
      };
      
      if (Object.keys(filter).length > 0) {
        filter = { _and: [filter, searchCondition] };
      } else {
        filter = searchCondition;
      }
    }

    // 1️⃣ Fetch list with filter (all items if fetchAll is true)
    const requestOptions: any = {
      sort : ['-id'],
      filter
    }
    
    if (!fetchAll) {
      requestOptions.limit = limit.value
      requestOptions.page = page.value
    }

    const list = await client.request(readItems('products', requestOptions))
    products.value = list as Product[]

    // 2️⃣ Fetch total count with same filter (only if paginated)
    if (!fetchAll) {
      const [{ count }] = await client.request(
        aggregate('products', {
          aggregate: { count: '*' },
          filter
        })
      )
      total.value = Number(count) || list.length
    } else {
      total.value = list.length
    }

    loading.value = false
  }

  const createProduct = (payload: Partial<Product>) =>
    client.request(createItem('products', payload))

  const updateProduct = (id: string, payload: Partial<Product>) =>
    client.request(updateItem('products', id, payload))

  const deleteProduct = async (id: string) => {
    try {
      // Instead of deleting, update the product to set deleted timestamp
      const result = await client.request(updateItem('products', id, {
        deleted: Date.now() / 1000  // Unix timestamp as float
      }))
      return result
    } catch (error) {
      throw error
    }
  }

  return {
    /* state */ products, total, page, limit, loading, searchQuery,
    /* actions */ fetchProducts, createProduct, updateProduct, deleteProduct
  }
}