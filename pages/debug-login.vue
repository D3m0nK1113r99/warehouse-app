<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Debug Directus Login</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Test Raw Login API</h2>
      
      <div class="space-y-4">
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
          @click="testRawLogin" 
          :disabled="loading"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {{ loading ? 'Testing...' : 'Test Raw Login' }}
        </button>
      </div>
      
      <div v-if="result" class="mt-6">
        <h3 class="text-lg font-semibold mb-2">Response Analysis:</h3>
        
        <div class="space-y-4">
          <div class="bg-gray-100 p-4 rounded">
            <h4 class="font-medium">Response Type & Structure:</h4>
            <pre class="text-sm mt-2">{{ responseAnalysis }}</pre>
          </div>
          
          <div class="bg-gray-100 p-4 rounded">
            <h4 class="font-medium">Full Response:</h4>
            <pre class="text-sm mt-2 max-h-96 overflow-auto">{{ JSON.stringify(result, null, 2) }}</pre>
          </div>
          
          <div v-if="error" class="bg-red-100 p-4 rounded">
            <h4 class="font-medium text-red-800">Error:</h4>
            <pre class="text-sm mt-2 text-red-700">{{ error }}</pre>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Test with different authentication methods -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">Test Different Methods</h2>
      
      <div class="space-y-4">
        <button 
          @click="testStaticToken" 
          :disabled="loading"
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Static Token
        </button>
        
        <button 
          @click="testServerInfo" 
          :disabled="loading"
          class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Server Info
        </button>
      </div>
      
      <div v-if="testResult" class="mt-4">
        <div class="bg-gray-100 p-4 rounded">
          <h4 class="font-medium">Test Result:</h4>
          <pre class="text-sm mt-2 max-h-64 overflow-auto">{{ JSON.stringify(testResult, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { login } from '@directus/sdk'
import { useDirectusClient, useStaticTokenDirectusClient } from '~/composables/useDirectus'

const credentials = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const result = ref(null)
const error = ref(null)
const testResult = ref(null)

const responseAnalysis = computed(() => {
  if (!result.value) return 'No data'
  
  const analysis = {
    type: typeof result.value,
    isArray: Array.isArray(result.value),
    isNull: result.value === null,
    isUndefined: result.value === undefined,
    keys: result.value && typeof result.value === 'object' ? Object.keys(result.value) : 'N/A',
    hasAccessToken: result.value && 'access_token' in result.value,
    hasData: result.value && 'data' in result.value,
    hasRefreshToken: result.value && 'refresh_token' in result.value
  }
  
  return JSON.stringify(analysis, null, 2)
})

const testRawLogin = async () => {
  loading.value = true
  result.value = null
  error.value = null
  
  try {
    const client = useDirectusClient()
    console.log('🔐 Testing raw login with client:', client)
    
    const response = await client.request(login(credentials.value.email, credentials.value.password))
    console.log('📋 Raw login response:', response)
    
    result.value = response
  } catch (err) {
    console.error('❌ Login test failed:', err)
    error.value = {
      message: err.message,
      code: err.code,
      status: err.status,
      response: err.response,
      stack: err.stack
    }
  } finally {
    loading.value = false
  }
}

const testStaticToken = async () => {
  loading.value = true
  testResult.value = null
  
  try {
    const client = useStaticTokenDirectusClient()
    console.log('🔑 Testing static token client:', client)
    
    // Try to get server info with static token
    const response = await client.request({
      method: 'GET',
      path: '/server/info'
    })
    
    testResult.value = {
      success: true,
      data: response
    }
  } catch (err) {
    console.error('❌ Static token test failed:', err)
    testResult.value = {
      success: false,
      error: err.message,
      details: err
    }
  } finally {
    loading.value = false
  }
}

const testServerInfo = async () => {
  loading.value = true
  testResult.value = null
  
  try {
    const client = useDirectusClient()
    console.log('🌐 Testing server info:', client)
    
    const response = await client.request({
      method: 'GET',
      path: '/server/info'
    })
    
    testResult.value = {
      success: true,
      data: response
    }
  } catch (err) {
    console.error('❌ Server info test failed:', err)
    testResult.value = {
      success: false,
      error: err.message,
      details: err
    }
  } finally {
    loading.value = false
  }
}
</script>