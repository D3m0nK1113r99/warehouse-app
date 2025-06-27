<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-backdrop fade show"></div>
    <div v-if="modelValue" class="modal d-block" tabindex="-1" :style="overlayStyle" @click.self="onCancel">
      <div class="modal-dialog modal-dialog-centered">
        <form class="modal-content shadow-lg border-0" @submit.prevent="onSave">
          <div class="modal-header bg-light">
            <h5 class="modal-title">
              <i class="bi" :class="editing ? 'bi-pencil-square text-primary' : 'bi-plus-circle text-success'"></i>
              {{ editing ? 'Edit' : 'Add' }} Product
            </h5>
            <button type="button" class="btn-close" @click="onCancel"></button>
          </div>

          <div class="modal-body p-4">
            <div class="mb-3">
              <label class="form-label fw-medium">Product Name <span class="text-danger">*</span></label>
              <input 
                v-model="form.name" 
                class="form-control form-control-lg" 
                placeholder="Enter product name"
                required 
                autofocus
              />
            </div>
            
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label fw-medium">SKU <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text bg-light"><i class="bi bi-upc"></i></span>
                  <input 
                    v-model="form.sku" 
                    class="form-control" 
                    placeholder="Product SKU"
                    required 
                  />
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-medium">Unit <span class="text-danger">*</span></label>
                <select v-model="form.unit" class="form-select" required>
                  <option value="" disabled>Select unit</option>
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="box">Box</option>
                  <option value="liter">Liter</option>
                  <option value="meter">Meter</option>
                </select>
              </div>
            </div>
            
            <div class="mb-3">
              <label class="form-label fw-medium">Description</label>
              <textarea 
                v-model="form.description" 
                class="form-control" 
                rows="3"
                placeholder="Enter product description (optional)"
              ></textarea>
              <small class="text-muted">Provide additional details about the product</small>
            </div>
          </div>

          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-outline-secondary" @click="onCancel">
              <i class="bi bi-x me-1"></i>Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              <i class="bi bi-check2 me-1"></i>Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, watch, computed, toRefs, onMounted, onUnmounted } from 'vue'
import type { Product } from '~/composables/useProducts'

interface Props {
  modelValue: boolean      // visibility control
  product?: Product | null // existing product for edit; null for create
}

const props = defineProps<Props>()
const { modelValue } = toRefs(props)
const emit = defineEmits(['update:modelValue', 'saved'])

/* -------------------------- FORM STATE --------------------------- */
const form = reactive<Partial<Product>>({})
const editing = computed(() => !!props.product?.id)

watch(
  () => props.product,
  (value) => {
    Object.assign(form, value ?? { name: '', sku: '', unit: '', description: '' })
  },
  { immediate: true }
)

/* -------------------------- HANDLERS ----------------------------- */
function onCancel() {
  emit('update:modelValue', false)
}

function onSave() {
  emit('saved', { ...form })
  emit('update:modelValue', false)
}

const overlayStyle = {
  zIndex: 1055
}

// Add keyboard event listener to close modal on Escape key
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.modelValue) {
    onCancel()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

// Add/remove modal-open class to body when modal visibility changes
watch(() => props.modelValue, (isVisible) => {
  if (isVisible) {
    document.body.classList.add('modal-open')
  } else {
    document.body.classList.remove('modal-open')
  }
}, { immediate: true })
</script>

<style>
/* Global styles */
body.modal-open {
  overflow: hidden;
  padding-right: 15px; /* Prevent layout shift */
}
</style>

<style scoped>
.modal.d-block {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  outline: 0;
  z-index: 1055;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
  opacity: 0.5;
  z-index: 1050;
}
</style>