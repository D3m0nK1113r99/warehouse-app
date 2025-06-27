<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Authentication Test</h1>
    
    <!-- User Authentication Section -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">User Authentication</h2>
      
      <div v-if="!isAuthenticated" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Email:</label>
          <input 
            v-model="credentials.email" 
            type="email" 
            class="w-full p-2 border rounded"
            placeholder="Enter your email"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Password:</label>
          <input 
            v-model="credentials.password" 
            type="password" 
            class="w-full p-2 border rounded"
            placeholder="Enter your password"
          >
        </div>
        
        <button 
          @click="handleLogin" 
          :disabled="loading"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </div>
      
      <div v-else class="space-y-4">
        <div class="bg-green-100 p-4 rounded">
          <p class="text-green-800">✅ Successfully authenticated!</p>
          <p><strong>User:</strong> {{ user?.email }}</p>
          <p><strong>Name:</strong> {{ user?.first_name }} {{ user?.last_name }}</p>
          <p><strong>Role:</strong> {{ user?.role?.name }}</p>
        </div>
        
        <button 
          @click="handleLogout"
          class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      
      <div v-if="userError" class="mt-4 bg-red-100 p-4 rounded">
        <p class="text-red-800">❌ {{ userError }}</p>
      </div>
    </div>
    
    <!-- Static Token Section -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">Static Token Test</h2>
      
      <button 
        @click="testStaticToken"
        :disabled="staticTokenLoading"
        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
      >
        {{ staticTokenLoading ? 'Testing...' : 'Test Static Token' }}
      </button>
      
      <div v-if="staticTokenResult" class="mt-4">
        <div v-if="staticTokenResult.success" class="bg-green-100 p-4 rounded">
          <p class="text-green-800">✅ Static token working!</p>
          <pre class="text-sm mt-2 bg-gray-100 p-2 rounded">{{ JSON.stringify(staticTokenResult.data, null, 2) }}</pre>
        </div>
        
        <div v-else class="bg-red-100 p-4 rounded">
          <p class="text-red-800">❌ Static token failed</p>
          <p class="text-sm mt-1">{{ staticTokenResult.error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useStaticTokenDirectusClient } from '~/composables/useDirectus'

const { 
  user, 
  loading, 
  isAuthenticated, 
  loginUser, 
  logoutUser 
} = useAuth()

const credentials = ref({
  email: '',
  password: ''
})

const userError = ref('')
const staticTokenLoading = ref(false)
const staticTokenResult = ref(null)

const handleLogin = async () => {
  try {
    userError.value = ''
    await loginUser(credentials.value)
  } catch (error) {
    userError.value = error.message
  }
}

const handleLogout = async () => {
  try {
    await logoutUser()
  } catch (error) {
    console.error('Logout error:', error)
  }
}

const testStaticToken = async () => {
  staticTokenLoading.value = true
  staticTokenResult.value = null
  
  try {
    const client = useStaticTokenDirectusClient()
    
    // Test by getting server info
    const result = await client.request({
      method: 'GET',
      path: '/server/info'
    })
    
    staticTokenResult.value = {
      success: true,
      data: result
    }
  } catch (error) {
    staticTokenResult.value = {
      success: false,
      error: error.message
    }
  } finally {
    staticTokenLoading.value = false
  }
}
</script>

<style scoped>
/* Add any custom styles here */
</style>