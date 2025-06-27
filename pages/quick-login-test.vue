<template>
  <div class="container py-4">
    <div class="card">
      <div class="card-header">
        <h5>Quick Login Test</h5>
      </div>
      <div class="card-body">
        <button @click="testLogin" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Testing...' : 'Test Login with Admin Account' }}
        </button>
        
        <div v-if="result" class="mt-3">
          <div class="alert" :class="result.success ? 'alert-success' : 'alert-danger'">
            <h6>{{ result.success ? 'Success!' : 'Failed!' }}</h6>
            <p>{{ result.message }}</p>
          </div>
          
          <div v-if="result.details" class="mt-2">
            <h6>Details:</h6>
            <pre class="bg-light p-2 rounded">{{ JSON.stringify(result.details, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  auth: false,
  layout: false
})

const { loginUser } = useAuth()
const loading = ref(false)
const result = ref<any>(null)

const testLogin = async () => {
  loading.value = true
  result.value = null
  
  try {
    console.log('🧪 Starting login test...')
    
    const loginResult = await loginUser({
      email: 'admin@example.com',
      password: 'password'
    })
    
    console.log('✅ Login test successful:', loginResult)
    
    result.value = {
      success: true,
      message: 'Login successful! Check console for detailed logs.',
      details: {
        success: loginResult.success,
        user: loginResult.user,
        timestamp: new Date().toISOString()
      }
    }
  } catch (error: any) {
    console.error('❌ Login test failed:', error)
    
    result.value = {
      success: false,
      message: error.message || 'Login failed',
      details: {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }
    }
  } finally {
    loading.value = false
  }
}
</script>