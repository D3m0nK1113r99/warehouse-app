export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated, isAdmin } = useAuth()
  
  // First check if user is authenticated
  if (!isAuthenticated.value) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
  
  // Check if user has admin role
  if (!isAdmin()) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. Admin role required.'
    })
  }
})