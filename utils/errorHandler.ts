/**
 * Utility functions for handling errors consistently across the application
 */

export interface AppError {
  message: string
  code?: string
  details?: any
}

/**
 * Converts various error types to a standardized format
 */
export const normalizeError = (error: unknown): AppError => {
  if (error instanceof Error) {
    return {
      message: error.message,
      details: error
    }
  }
  
  if (typeof error === 'string') {
    return {
      message: error
    }
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return {
      message: String(error.message),
      code: 'code' in error ? String(error.code) : undefined,
      details: error
    }
  }
  
  return {
    message: 'An unknown error occurred',
    details: error
  }
}

/**
 * Determines if an error is a network/connection error
 */
export const isNetworkError = (error: unknown): boolean => {
  const errorStr = String(error).toLowerCase()
  return errorStr.includes('network') || 
         errorStr.includes('connection') || 
         errorStr.includes('fetch') ||
         errorStr.includes('timeout')
}

/**
 * Gets user-friendly error message
 */
export const getUserFriendlyMessage = (error: unknown): string => {
  const normalized = normalizeError(error)
  
  if (isNetworkError(error)) {
    return 'Unable to connect to the server. Please check your internet connection.'
  }
  
  // Handle common HTTP errors
  if (normalized.details?.status) {
    const status = normalized.details.status
    switch (status) {
      case 401:
        return 'Authentication required. Please check your credentials.'
      case 403:
        return 'Access denied. You don\'t have permission to perform this action.'
      case 404:
        return 'The requested resource was not found.'
      case 500:
        return 'Server error. Please try again later.'
      default:
        return normalized.message
    }
  }
  
  return normalized.message
}