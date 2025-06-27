import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { login, logout, readMe, refresh, staticToken, rest } from '@directus/sdk'
import { useDirectusClient } from '~/composables/useDirectus'

export interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  role?: {
    id: string
    name: string
    admin_access?: boolean
  }
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires: number
}

export const useAuth = () => {
  const client = useDirectusClient()
  
  // Reactive state
  const user: Ref<User | null> = ref(null)
  const tokens: Ref<AuthTokens | null> = ref(null)
  const loading = ref(false)
  const isAuthenticated = computed(() => !!user.value && !!tokens.value)

  // Storage keys
  const ACCESS_TOKEN_KEY = 'auth_access_token'
  const REFRESH_TOKEN_KEY = 'auth_refresh_token'
  const EXPIRES_KEY = 'auth_expires'
  const USER_KEY = 'auth_user'
  const LOGIN_TIME_KEY = 'auth_login_time'
  const LOGIN_INFO_KEY = 'auth_login_info'

  // Helper functions for localStorage
  const saveToStorage = (key: string, value: any) => {
    if (process.client) {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }

  const getFromStorage = (key: string) => {
    if (process.client) {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    }
    return null
  }

  const removeFromStorage = (key: string) => {
    if (process.client) {
      localStorage.removeItem(key)
    }
  }

  // Save auth data to localStorage
  const saveAuthData = (authTokens: AuthTokens, userData: User) => {
    const loginTime = new Date().toISOString()
    const loginInfo = {
      email: userData.email,
      role: userData.role?.name,
      loginTime: loginTime,
      deviceInfo: {
        userAgent: process.client ? navigator.userAgent : 'Server',
        timestamp: Date.now()
      }
    }
    
    // Update reactive state
    tokens.value = authTokens
    user.value = userData
    
    // Save to localStorage
    saveToStorage(ACCESS_TOKEN_KEY, authTokens.access_token)
    saveToStorage(REFRESH_TOKEN_KEY, authTokens.refresh_token)
    saveToStorage(EXPIRES_KEY, authTokens.expires)
    saveToStorage(USER_KEY, userData)
    saveToStorage(LOGIN_TIME_KEY, loginTime)
    saveToStorage(LOGIN_INFO_KEY, loginInfo)
  }

  // Clear auth data
  const clearAuthData = () => {
    tokens.value = null
    user.value = null
    
    removeFromStorage(ACCESS_TOKEN_KEY)
    removeFromStorage(REFRESH_TOKEN_KEY)
    removeFromStorage(EXPIRES_KEY)
    removeFromStorage(USER_KEY)
    removeFromStorage(LOGIN_TIME_KEY)
    removeFromStorage(LOGIN_INFO_KEY)
  }

  // Load auth data from localStorage
  const loadAuthData = () => {
    const accessToken = getFromStorage(ACCESS_TOKEN_KEY)
    const refreshToken = getFromStorage(REFRESH_TOKEN_KEY)
    const expires = getFromStorage(EXPIRES_KEY)
    const userData = getFromStorage(USER_KEY)

    // Only require accessToken, expires, and userData (refreshToken can be empty)
    if (accessToken && expires && userData) {
      tokens.value = {
        access_token: accessToken,
        refresh_token: refreshToken || '', // Allow empty refresh token
        expires: expires
      }
      user.value = userData
    }
  }

  // Check if token is expired
  const isTokenExpired = () => {
    if (!tokens.value) return true
    return Date.now() >= tokens.value.expires
  }

  // Login function
  const loginUser = async (credentials: LoginCredentials) => {
    loading.value = true
    try {
      // Login and get tokens
      const authResult = await client.request(login(credentials.email, credentials.password))
      
      // Extract tokens from response - Directus SDK v18 format
      let accessToken, refreshToken, expires
      
      if (authResult && typeof authResult === 'object') {
        // Directus SDK v18 returns tokens directly in the response object
        accessToken = authResult.access_token
        refreshToken = authResult.refresh_token || null
        expires = authResult.expires
      }
      
      // Validate required tokens
      if (!accessToken) {
        throw new Error('Invalid authentication response - missing access token')
      }
      
      // Handle missing refresh token (some Directus configs don't use refresh tokens)
      if (!refreshToken) {
        refreshToken = '' // Set empty string to avoid null issues
      }
      
      // Handle expires field - convert duration to timestamp
      if (expires && expires < 31536000000) { // Less than 1 year in ms = duration
        expires = Date.now() + expires
      }
      
      // Get user info
      const authenticatedClient = client.with(rest()).with(staticToken(accessToken))
      const userData = await authenticatedClient.request(
        readMe({
          fields: ['id', 'email', 'first_name', 'last_name', 'role.*']
        })
      )

      const authTokens: AuthTokens = {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires: expires || Date.now() + (15 * 60 * 1000) // Default 15 minutes
      }

      saveAuthData(authTokens, userData as User)
      
      return { success: true, user: userData }
    } catch (error: any) {
      clearAuthData()
      
      // Provide user-friendly error messages
      let errorMessage = 'Login failed'
      
      if (error.message?.toLowerCase().includes('invalid') || 
          error.code === 'INVALID_CREDENTIALS' || 
          error.status === 401) {
        errorMessage = 'Invalid email or password'
      } else if (error.status === 403) {
        errorMessage = 'Access denied - account may be inactive'
      } else if (error.message?.toLowerCase().includes('network') || 
                 error.message?.toLowerCase().includes('fetch')) {
        errorMessage = 'Unable to connect to server. Please check your connection.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  // Logout function
  const logoutUser = async () => {
    loading.value = true
    try {
      if (tokens.value?.refresh_token) {
        await client.request(logout(tokens.value.refresh_token))
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAuthData()
      loading.value = false
      await navigateTo('/login')
    }
  }

  // Refresh token function
  const refreshTokens = async () => {
    if (!tokens.value?.refresh_token) {
      throw new Error('No refresh token available')
    }

    try {
      const authResult = await client.request(refresh('json', tokens.value.refresh_token))
      
      // Extract tokens from response - Directus SDK v18 format
      let accessToken, refreshToken, expires
      
      if (authResult && typeof authResult === 'object') {
        // Directus SDK v18 returns tokens directly in the response object
        accessToken = authResult.access_token
        refreshToken = authResult.refresh_token
        expires = authResult.expires
      }
      if (!accessToken || !refreshToken) {
        throw new Error('Token refresh failed: Missing tokens')
      }
      
      // Handle expires field - convert duration to timestamp
      if (expires && expires < 31536000000) { // Less than 1 year in ms = duration
        expires = Date.now() + expires
      
      }
      
      const authTokens: AuthTokens = {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires: expires || Date.now() + (15 * 60 * 1000)
      }

      tokens.value = authTokens
      saveToStorage(ACCESS_TOKEN_KEY, authTokens.access_token)
      saveToStorage(REFRESH_TOKEN_KEY, authTokens.refresh_token)
      saveToStorage(EXPIRES_KEY, authTokens.expires)

      return authResult
    } catch (error) {
      clearAuthData()
      throw error
    }
  }

  // Get current user
  const getCurrentUser = async () => {
    if (!tokens.value?.access_token) {
      throw new Error('No access token available')
    }

    try {
      const authenticatedClient = client.with(rest()).with(staticToken(tokens.value.access_token))
      const userData = await authenticatedClient.request(
        readMe({
          fields: ['id', 'email', 'first_name', 'last_name', 'role.*']
        })
      )

      user.value = userData as User
      saveToStorage(USER_KEY, userData)
      return userData
    } catch (error) {
      throw error
    }
  }

  // Get authenticated client
  const getAuthenticatedClient = () => {
    if (!tokens.value?.access_token) {
      throw new Error('No access token available')
    }
    return client.with(rest()).with(staticToken(tokens.value.access_token))
  }

  // Get login information
  const getLoginInfo = () => {
    return getFromStorage(LOGIN_INFO_KEY)
  }

  // Get login time
  const getLoginTime = () => {
    return getFromStorage(LOGIN_TIME_KEY)
  }

  // Check user permissions
  const hasRole = (roleName: string) => {
    return user.value?.role?.name === roleName
  }

  const isAdmin = () => {
    return user.value?.role?.admin_access === true || hasRole('Admin') || hasRole('admin')
  }

  const isOperator = () => {
    return hasRole('Operator') || hasRole('operator') || isAdmin()
  }

  const isViewer = () => {
    // If user is authenticated but has no role defined, grant viewer access by default
    if (user.value && (!user.value.role || !user.value.role.name)) {
      return true
    }
    return hasRole('Viewer') || hasRole('viewer') || isOperator()
  }

  const canEdit = () => {
    // If user is authenticated but has no role defined, allow editing by default
    if (user.value && (!user.value.role || !user.value.role.name)) {
      return true
    }
    return isOperator()
  }

  const canDelete = () => {
    // If user is authenticated but has no role defined, allow deleting by default
    if (user.value && (!user.value.role || !user.value.role.name)) {
      return true
    }
    return isAdmin()
  }

  // Initialize auth state on composable creation
  if (process.client) {
    loadAuthData()
  }

  return {
    // State
    user: readonly(user),
    tokens: readonly(tokens),
    loading: readonly(loading),
    isAuthenticated,

    // Methods
    loginUser,
    logoutUser,
    refreshTokens,
    getCurrentUser,
    getAuthenticatedClient,
    loadAuthData,
    clearAuthData,
    isTokenExpired,
    getLoginInfo,
    getLoginTime,

    // Permission methods
    hasRole,
    isAdmin,
    isOperator,
    isViewer,
    canEdit,
    canDelete
  }
}