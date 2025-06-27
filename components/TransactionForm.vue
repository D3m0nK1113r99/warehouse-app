<template>
  <div class="modal d-block" tabindex="-1" :style="overlayStyle" @click.self="onCancel">
    <div class="modal-dialog">
      <form class="modal-content" @submit.prevent="onSave">
        <div class="modal-header">
          <h5 class="modal-title">New Stock Transaction</h5>
          <button type="button" class="btn-close" @click="onCancel"></button>
        </div>

        <div class="modal-body row g-3">
          <div class="col-12">
            <label class="form-label">Type</label>
            <select v-model="form.type" class="form-select" required>
              <option value="IN">IN (Receive)</option>
              <option value="OUT">OUT (Ship)</option>
              <option value="ADJUST">ADJUST (Manual)</option>
            </select>
          </div>
          <div class="col-12">
            <label class="form-label">Product</label>
            <select v-model="form.product_id" class="form-select" required>
              <option value="">Select a product...</option>
              <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>
          <div class="col-12">
            <label class="form-label">Location</label>
            <select v-model="form.location_id" class="form-select" required>
              <option value="">Select a location...</option>
              <option v-for="l in locations" :key="l.id" :value="l.id">{{ l.name }}</option>
            </select>
          </div>
          <div class="col-12">
            <label class="form-label">Quantity (+ in, – out)</label>
            <input v-model.number="form.quantity" type="number" class="form-control" required />
          </div>
          <div class="col-12">
            <label class="form-label">Note</label>
            <textarea v-model="form.note" class="form-control" rows="2" />
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="onCancel">Cancel</button>
          <button type="submit" class="btn btn-primary">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useProducts } from '~/composables/useProducts'
import { useLocations } from '~/composables/useLocations'
import type { TxnType } from '~/composables/useTransactions'

const emit = defineEmits(['close', 'saved'])
const { products, fetchProducts } = useProducts()
const { locations, fetchLocations } = useLocations()

const form = reactive({ type: 'IN' as TxnType, product_id: '', location_id: '', quantity: 0, note: '' })

// Load products and locations when component mounts
onMounted(async () => {
  await Promise.all([
    fetchProducts(false, true), // showArchived=false, fetchAll=true
    fetchLocations(false, true)
  ])
})

function onCancel() { emit('close') }
function onSave() {
  // Validate form before saving
  if (!form.product_id || !form.location_id || form.quantity === 0) {
    alert('Please fill in all required fields')
    return
  }
  emit('saved', { ...form })
}
const overlayStyle = { backgroundColor: 'rgba(0,0,0,.5)' }
</script>
