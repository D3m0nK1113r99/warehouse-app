export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, isTokenExpired, refreshTokens, clearAuthData } = useAuth()
  
  // Allow access to login page
  if (to.path === '/login') {
    return
  }
  
  // Check if user is authenticated
  if (!isAuthenticated.value) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
  
  // Check if token is expired and refresh if needed
  if (isTokenExpired()) {
    try {
      await refreshTokens()
    } catch (error) {
      // If refresh fails, clear auth data and redirect to login
      clearAuthData()
      return navigateTo({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  }
})