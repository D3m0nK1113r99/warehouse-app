export default defineNuxtPlugin(async () => {
  const { loadAuthData, isTokenExpired, refreshTokens, clearAuthData, isAuthenticated } = useAuth()
  
  // Load auth data from localStorage on app start
  loadAuthData()
  
  // Set up token refresh interval
  if (process.client) {
    const checkTokenExpiry = async () => {
      if (isAuthenticated.value && isTokenExpired()) {
        try {
          console.log('🔄 Auto-refreshing expired token...')
          await refreshTokens()
          console.log('✅ Token auto-refreshed successfully')
        } catch (error) {
          console.error('❌ Auto token refresh failed:', error)
          clearAuthData()
        }
      }
    }
    
    // Check every 5 minutes
    setInterval(checkTokenExpiry, 5 * 60 * 1000)
    
    // Check immediately on app start
    await checkTokenExpiry()
  }
})