import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),
  
  getters: {
    // Get current user profile
    profile: (state) => state.user,
    
    // Check if user is logged in
    loggedIn: (state) => state.isAuthenticated,
    
    // Get user's display name or username
    displayName: (state) => {
      if (!state.user) return ''
      return state.user.displayName || state.user.username || 'User'
    }
  },
  
  actions: {
    // Login action
    async login(credentials) {
      this.loading = true
      this.error = null
      
      try {
        // Replace with your actual API call
        const response = await fakeApiCall(credentials)
        
        this.user = response.user
        this.isAuthenticated = true
        return this.user
      } catch (err) {
        this.error = err.message || 'Failed to login'
        throw err
      } finally {
        this.loading = false
      }
    },
    
    // Logout action
    async logout() {
      this.user = null
      this.isAuthenticated = false
    },
    
    // Update user profile
    updateProfile(profileData) {
      this.user = {
        ...this.user,
        ...profileData
      }
    }
  }
})

// Mock API function (replace with real implementation)
function fakeApiCall(credentials) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        user: {
          id: 1,
          username: 'user1',
          displayName: 'Test User',
          email: credentials.email
        }
      })
    }, 500)
  })
}
