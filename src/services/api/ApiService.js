/**
 * @file Centralized API service for the application.
 * This service handles all communication with the backend API.
 */

import { logger } from '@/shared/utils/logger'
import { APIClient } from '@/modules/api'

// Production-ready API service using centralized API client (fetches /api/v1/*)
const apiClient = {
  get: async (endpoint, params = {}) => {
    logger.info(`[API] GET ${endpoint}`, params, 'ApiService')

    // Attach query params if provided
    const qs = new URLSearchParams()
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null) qs.append(k, String(v))
    })
    const full = qs.toString() ? `${endpoint}?${qs.toString()}` : endpoint

    const data = await APIClient.get(full)
    return { data }
  },
  post: async (endpoint, payload) => {
    logger.info(`[API] POST ${endpoint}`, payload, 'ApiService')
    const data = await APIClient.post(endpoint, payload)
    return { data }
  },
}

/**
 * Fetches the main data required for the dashboard.
 * @returns {Promise<Object>} An object containing user profile, achievements, and applications.
 */
export const getDashboardData = async () => {
  try {
    const response = await apiClient.get('/dashboard/main')
    return response.data
  } catch (error) {
    logger.error('Error fetching dashboard data:', error, 'ApiService')
    throw error
  }
}

/**
 * Fetches a list of featured gaming studios.
 * @returns {Promise<Array>} A list of gaming studios.
 */
export const getFeaturedStudios = async () => {
  try {
    const response = await apiClient.get('/gaming/studios')
    return response.data
  } catch (error) {
    logger.error('Error fetching featured studios:', error, 'ApiService')
    throw error
  }
}

/**
 * Fetches the daily challenges for the user.
 * @returns {Promise<Array>} A list of daily challenges.
 */
export const getDailyChallenges = async () => {
  try {
    const response = await apiClient.get('/challenges/daily')
    return response.data
  } catch (error) {
    logger.error('Error fetching daily challenges:', error, 'ApiService')
    throw error
  }
}

/**
 * Performs an AI analysis based on the user's profile.
 * @returns {Promise<Object>} The result of the AI analysis.
 */
export const performAIAnalysis = async () => {
  try {
    const response = await apiClient.post('/ai/analyze-profile')
    return response.data
  } catch (error) {
    logger.error('Error performing AI analysis:', error, 'ApiService')
    throw error
  }
}
