<template>
  <div class="container py-4">
    <h1>Authentication Debug</h1>
    
    <div class="row">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h5>Directus Connection Test</h5>
          </div>
          <div class="card-body">
            <button @click="testDirectusConnection" class="btn btn-primary" :disabled="testing">
              {{ testing ? 'Testing...' : 'Test Directus Connection' }}
            </button>
            
            <div v-if="connectionResult" class="mt-3">
              <div class="alert" :class="connectionResult.success ? 'alert-success' : 'alert-danger'">
                <strong>{{ connectionResult.success ? 'Success:' : 'Error:' }}</strong>
                {{ connectionResult.message }}
              </div>
              <div v-if="connectionResult.data">
                <h6>Response Data:</h6>
                <pre>{{ JSON.stringify(connectionResult.data, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h5>Login Test</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="testLogin">
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input v-model="loginForm.email" type="email" class="form-control" value="admin@example.com">
              </div>
              <div class="mb-3">
                <label class="form-label">Password</label>
                <input v-model="loginForm.password" type="password" class="form-control" value="password">
              </div>
              <button type="submit" class="btn btn-primary" :disabled="testing">
                {{ testing ? 'Testing Login...' : 'Test Login' }}
              </button>
            </form>
            
            <div v-if="loginResult" class="mt-3">
              <div class="alert" :class="loginResult.success ? 'alert-success' : 'alert-danger'">
                <strong>{{ loginResult.success ? 'Success:' : 'Error:' }}</strong>
                {{ loginResult.message }}
              </div>
              <div v-if="loginResult.data">
                <h6>Response Data:</h6>
                <pre>{{ JSON.stringify(loginResult.data, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row mt-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5>Configuration Info</h5>
          </div>
          <div class="card-body">
            <p><strong>Directus URL:</strong> {{ directusUrl }}</p>
            <p><strong>Environment:</strong> {{ process.client ? 'Client' : 'Server' }}</p>
            <p><strong>Current Path:</strong> {{ $route.path }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { login, rest } from '@directus/sdk'

definePageMeta({
  auth: false
})

const { public: { directusUrl } } = useRuntimeConfig()
const testing = ref(false)
const connectionResult = ref<any>(null)
const loginResult = ref<any>(null)

const loginForm = ref({
  email: 'admin@example.com',
  password: 'password'
})

const testDirectusConnection = async () => {
  testing.value = true
  connectionResult.value = null
  
  try {
    const client = useDirectusClient()
    
    // Try to make a simple request to test connection
    const response = await fetch(`${directusUrl}/server/info`)
    const data = await response.json()
    
    connectionResult.value = {
      success: true,
      message: 'Successfully connected to Directus server',
      data: data
    }
  } catch (error: any) {
    connectionResult.value = {
      success: false,
      message: error.message || 'Failed to connect to Directus server',
      data: error
    }
  } finally {
    testing.value = false
  }
}

const testLogin = async () => {
  testing.value = true
  loginResult.value = null
  
  try {
    const client = useDirectusClient()
    console.log('Testing login with:', loginForm.value)
    
    // Test the login request directly
    const authResult = await client.request(login(loginForm.value.email, loginForm.value.password))
    console.log('Raw auth result:', authResult)
    
    loginResult.value = {
      success: true,
      message: 'Login successful',
      data: {
        hasAccessToken: !!authResult.access_token,
        hasRefreshToken: !!authResult.refresh_token,
        hasExpires: !!authResult.expires,
        accessTokenType: typeof authResult.access_token,
        refreshTokenType: typeof authResult.refresh_token,
        expiresType: typeof authResult.expires,
        expiresValue: authResult.expires,
        fullResponse: authResult
      }
    }
  } catch (error: any) {
    console.error('Login test failed:', error)
    loginResult.value = {
      success: false,
      message: error.message || 'Login test failed',
      data: {
        error: error,
        errorDetails: {
          message: error.message,
          code: error.code,
          status: error.status,
          stack: error.stack
        }
      }
    }
  } finally {
    testing.value = false
  }
}
</script>