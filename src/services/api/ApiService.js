/**
 * @file Centralized API service for the application.
 * This service handles all communication with the backend API.
 */

import { logger } from '@/shared/utils/logger'

// A mock API client for demonstration purposes.
// In a real application, this would be replaced with a proper HTTP client like Axios.
const apiClient = {
  get: async (endpoint, params = {}) => {
    logger.info(`[API] Fetching data from ${endpoint}`, params, 'ApiService');
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (endpoint === '/dashboard/main') {
      return {
        data: {
          userProfile: {
            name: 'Detective Navi',
            level: 5,
            experience: 450,
            completeness: 75,
          },
          achievements: {
            completed: 12,
            total: 50,
          },
          applications: [
            { id: 1, title: 'Lead Gameplay Engineer', company: 'Riot Games', status: 'applied', appliedAt: '2023-10-26' },
            { id: 2, title: 'Senior Animator', company: 'Naughty Dog', status: 'interview', appliedAt: '2023-10-24' },
          ],
        },
      };
    }

    if (endpoint === '/gaming/studios') {
        return {
            data: [
                { id: 'riot-games', name: 'Riot Games', logoPath: 'riot-games.svg' },
                { id: 'epic-games', name: 'Epic Games', logoPath: 'epic-games.svg' },
                { id: 'naughty-dog', name: 'Naughty Dog', logoPath: 'naughty-dog.svg' },
                { id: 'cd-projekt-red', name: 'CD Projekt Red', logoPath: 'cd-projekt-red.svg' },
                { id: 'valve-corporation', name: 'Valve Corporation', logoPath: 'valve.svg' },
                { id: 'ubisoft', name: 'Ubisoft', logoPath: 'ubisoft.svg' },
            ]
        }
    }
    
    if (endpoint === '/challenges/daily') {
        return {
            data: [
                { id: 'profile', name: 'Complete Profile', xp: 25, completed: true },
                { id: 'job-search', name: 'Search for Jobs', xp: 15, completed: true },
                { id: 'resume', name: 'Build Resume', xp: 30, completed: false },
            ]
        }
    }

    // Studios search (local DB-backed)
    if (endpoint === '/studios/search') {
      try {
        const { studioService } = await import('@/modules/studios/StudioService');
        const result = await studioService.searchStudios(params || {});
        return { data: result };
      } catch (e) {
        logger.warn('[API] /studios/search failed, returning empty result', e, 'ApiService');
        return { data: { studios: [], total: 0, filtered: 0, facets: { types: {}, locations: {}, sizes: {}, genres: {} } } };
      }
    }

    return { data: null };
  },
  post: async (endpoint, payload) => {
    logger.info(`[API] Posting data to ${endpoint}`, payload, 'ApiService');
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: { success: true, message: 'Action completed successfully.' } };
  }
};

/**
 * Fetches the main data required for the dashboard.
 * @returns {Promise<Object>} An object containing user profile, achievements, and applications.
 */
export const getDashboardData = async () => {
  try {
    const response = await apiClient.get('/dashboard/main');
    return response.data;
  } catch (error) {
    logger.error('Error fetching dashboard data:', error, 'ApiService');
    throw error;
  }
};

/**
 * Fetches a list of featured gaming studios.
 * @returns {Promise<Array>} A list of gaming studios.
 */
export const getFeaturedStudios = async () => {
    try {
        const response = await apiClient.get('/gaming/studios');
        return response.data;
    } catch (error) {
        logger.error('Error fetching featured studios:', error, 'ApiService');
        throw error;
    }
}

/**
 * Fetches the daily challenges for the user.
 * @returns {Promise<Array>} A list of daily challenges.
 */
export const getDailyChallenges = async () => {
    try {
        const response = await apiClient.get('/challenges/daily');
        return response.data;
    } catch (error) {
        logger.error('Error fetching daily challenges:', error, 'ApiService');
        throw error;
    }
}

/**
 * Performs an AI analysis based on the user's profile.
 * @returns {Promise<Object>} The result of the AI analysis.
 */
export const performAIAnalysis = async () => {
    try {
        const response = await apiClient.post('/ai/analyze-profile');
        return response.data;
    } catch (error) {
        logger.error('Error performing AI analysis:', error, 'ApiService');
        throw error;
    }
}
