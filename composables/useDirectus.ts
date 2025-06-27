import { createDirectus, rest, staticToken } from '@directus/sdk'
import { useRuntimeConfig } from '#imports'

/**
 * Returns a basic Directus REST client (no authentication)
 * Use this for login/logout operations and when you need to apply authentication manually
 */
export const useDirectusClient = () => {
  try {
    const { public: { directusUrl } } = useRuntimeConfig()
    const url = directusUrl || 'http://localhost:8055'
    
    return createDirectus(url).with(rest())
  } catch (error) {
    console.error('Failed to create Directus client:', error)
    throw new Error('Failed to initialize Directus client')
  }
}

/**
 * Returns a Directus client with static token authentication
 * Use this for server-side operations or admin access
 */
export const useStaticTokenDirectusClient = () => {
  try {
    const { public: { directusUrl } } = useRuntimeConfig()
    const url = directusUrl || 'http://localhost:8055'
    
    const token = process.env.DIRECTUS_TOKEN
    if (!token) {
      throw new Error('DIRECTUS_TOKEN is not configured in environment variables')
    }
    
    return createDirectus(url).with(rest()).with(staticToken(token))
  } catch (error) {
    console.error('Failed to create static token Directus client:', error)
    throw new Error('Failed to initialize static token Directus client')
  }
}

/**
 * Returns an authenticated Directus client using the current user's token
 */
export const useAuthenticatedDirectusClient = () => {
  // This will only work client-side and when user is authenticated
  if (process.server) {
    throw new Error('useAuthenticatedDirectusClient can only be used client-side')
  }
  
  const { getAuthenticatedClient } = useAuth()
  return getAuthenticatedClient()
}