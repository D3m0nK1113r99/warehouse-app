<template>
  <div class="container py-4">
    <h1>Directus Connection Test</h1>
    
    <div class="alert alert-info">
      <strong>Instructions:</strong>
      <ol class="mb-0 mt-2">
        <li>Make sure Directus is running on <code>{{ directusUrl }}</code></li>
        <li>Click "Test Connection" to verify basic connectivity</li>
        <li>If connection works, try "Test Login" with demo credentials</li>
      </ol>
    </div>

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <h5>Connection Status</h5>
            <button @click="testConnection" class="btn btn-primary me-2" :disabled="loading">
              {{ loading ? 'Testing...' : 'Test Connection' }}
            </button>
            
            <div v-if="result" class="mt-3 alert" :class="result.success ? 'alert-success' : 'alert-danger'">
              <h6>{{ result.success ? 'Success!' : 'Error!' }}</h6>
              <p class="mb-0">{{ result.message }}</p>
              <div v-if="result.details" class="mt-2">
                <small><strong>Details:</strong></small>
                <pre class="mt-1 bg-light p-2 rounded small">{{ JSON.stringify(result.details, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Simple Login Test -->
    <div class="row mt-4">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <h5>Simple Login Test</h5>
            <p class="text-muted">Test direct API call without the auth composable</p>
            
            <form @submit.prevent="testSimpleLogin">
              <div class="row">
                <div class="col-md-4">
                  <input v-model="loginData.email" type="email" class="form-control" placeholder="Email" required>
                </div>
                <div class="col-md-4">
                  <input v-model="loginData.password" type="password" class="form-control" placeholder="Password" required>
                </div>
                <div class="col-md-4">
                  <button type="submit" class="btn btn-success" :disabled="loading">
                    {{ loading ? 'Testing...' : 'Test Direct Login' }}
                  </button>
                </div>
              </div>
            </form>

            <div v-if="loginResult" class="mt-3 alert" :class="loginResult.success ? 'alert-success' : 'alert-danger'">
              <h6>{{ loginResult.success ? 'Login Success!' : 'Login Failed!' }}</h6>
              <p class="mb-0">{{ loginResult.message }}</p>
              <div v-if="loginResult.data" class="mt-2">
                <small><strong>Response Data:</strong></small>
                <pre class="mt-1 bg-light p-2 rounded small">{{ JSON.stringify(loginResult.data, null, 2) }}</pre>
              </div>
            </div>
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

const { public: { directusUrl } } = useRuntimeConfig()
const loading = ref(false)
const result = ref<any>(null)
const loginResult = ref<any>(null)

const loginData = ref({
  email: 'admin@example.com',
  password: 'password'
})

const testConnection = async () => {
  loading.value = true
  result.value = null
  
  try {
    console.log('Testing connection to:', directusUrl)
    
    // Test 1: Basic connectivity
    const response = await $fetch(`${directusUrl}/server/info`)
    console.log('Server info response:', response)
    
    result.value = {
      success: true,
      message: 'Successfully connected to Directus server!',
      details: {
        url: directusUrl,
        serverInfo: response
      }
    }
  } catch (error: any) {
    console.error('Connection test failed:', error)
    
    result.value = {
      success: false,
      message: `Failed to connect to Directus server at ${directusUrl}`,
      details: {
        error: error.message,
        status: error.status,
        statusText: error.statusText,
        url: directusUrl
      }
    }
  } finally {
    loading.value = false
  }
}

const testSimpleLogin = async () => {
  loading.value = true
  loginResult.value = null
  
  try {
    console.log('Testing login with:', loginData.value.email)
    
    const response = await $fetch(`${directusUrl}/auth/login`, {
      method: 'POST',
      body: {
        email: loginData.value.email,
        password: loginData.value.password
      }
    })
    
    console.log('Login response:', response)
    
    // Detailed analysis of response structure
    const responseObj = response && typeof response === 'object' ? response : {}
    const hasData = responseObj && typeof responseObj === 'object' && 'data' in responseObj
    const analysis = {
      responseType: typeof response,
      responseKeys: Object.keys(responseObj),
      hasData: hasData,
      hasAccessToken: responseObj && typeof responseObj === 'object' && 'access_token' in responseObj,
      dataKeys: hasData && responseObj.data && typeof responseObj.data === 'object' ? Object.keys(responseObj.data) : null,
      fullStructure: response
    }
    
    console.log('Response analysis:', analysis)
    
    loginResult.value = {
      success: true,
      message: 'Login successful! Check console for detailed response analysis.',
      data: analysis
    }
  } catch (error: any) {
    console.error('Login test failed:', error)
    
    loginResult.value = {
      success: false,
      message: 'Login failed',
      data: {
        error: error.message,
        status: error.status,
        statusText: error.statusText,
        response: error.data
      }
    }
  } finally {
    loading.value = false
  }
}

// Auto-test connection on mount
onMounted(() => {
  testConnection()
})
</script>

<style scoped>
pre {
  max-height: 300px;
  overflow-y: auto;
  font-size: 0.8em;
}
</style>