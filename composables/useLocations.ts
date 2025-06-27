import { ref } from 'vue'
import type { Ref } from 'vue'
import { readItems, createItem, updateItem, deleteItem, aggregate } from '@directus/sdk'
import { useDirectusClient } from '~/composables/useDirectus'

export interface Location {
  id: string
  name: string
  description?: string
  deleted?: number  // timestamp (float)
  created_at?: string
  updated_at?: string
}

export const useLocations = () => {
  const client = useDirectusClient()
  const COLLECTION = 'locations'

  const locations: Ref<Location[]> = ref([])
  const total: Ref<number>         = ref(0)
  const page: Ref<number>          = ref(1)
  const limit: Ref<number>         = ref(10)
  const loading: Ref<boolean>      = ref(false)
  const searchQuery: Ref<string>   = ref('')

  /* --------------------- CRUD METHODS --------------------- */
  const fetchLocations = async (showArchived = false, fetchAll = false) => {
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
          { description: { _icontains: searchQuery.value.trim() } }
        ]
      };
      
      if (Object.keys(filter).length > 0) {
        filter = { _and: [filter, searchCondition] };
      } else {
        filter = searchCondition;
      }
    }

    // Prepare request options
    const requestOptions: any = {
      sort: ['-id'],
      filter
    }
    
    if (!fetchAll) {
      requestOptions.limit = limit.value
      requestOptions.page = page.value
    }

    const list = await client.request(readItems(COLLECTION, requestOptions))
    locations.value = list as Location[]

    // Fetch total count only if paginated
    if (!fetchAll) {
      const [{ count }] = await client.request(
        aggregate(COLLECTION, { 
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

  const createLocation = (payload: Partial<Location>) =>
    client.request(createItem(COLLECTION, payload))

  const updateLocation = (id: string, payload: Partial<Location>) =>
    client.request(updateItem(COLLECTION, id, payload))

  const deleteLocation = async (id: string) => {
    // Try to convert the ID to ensure it's in the right format
    const idToUse = String(id).trim()
    
    try {
      // Instead of deleting, update the location to set deleted timestamp
      const result = await client.request(updateItem(COLLECTION, idToUse, {
        deleted: Date.now() / 1000  // Unix timestamp as float
      }))
      return result
    } catch (error) {
      throw error
    }
  }

  return {
    locations, total, page, limit, loading, searchQuery,
    fetchLocations, createLocation, updateLocation, deleteLocation
  }
}