export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated, isOperator } = useAuth()
  
  // First check if user is authenticated
  if (!isAuthenticated.value) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
  
  // Check if user has operator role or higher
  if (!isOperator()) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. Operator role or higher required.'
    })
  }
})