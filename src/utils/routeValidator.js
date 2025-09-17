// Route validation test
import { createRouter, createWebHashHistory } from 'vue-router'
import { logger } from '@/shared/utils/logger'

// Test route loading
async function validateRoutes() {
  const routesToTest = [
    '/dashboard',
    '/gaming-dashboard', 
    '/documents',
    '/portfolio',
    '/jobs',
    '/skills',
    '/interview-prep',
    '/settings',
    '/studios/database',
    '/ai/job-matching',
    '/flow'
  ]

  console.log('🔍 Testing route components...')
  
  let successCount = 0
  let errorCount = 0
  
  for (const route of routesToTest) {
    try {
      // Import router to test route resolution
      const { default: router } = await import('@/router/index.js')
      const resolved = router.resolve(route)
      
      if (resolved && resolved.matched && resolved.matched.length > 0) {
        console.log(`✅ ${route} - Route resolved successfully`)
        successCount++
      } else {
        console.log(`❌ ${route} - Route not found`)  
        errorCount++
      }
    } catch (error) {
      console.log(`❌ ${route} - Error: ${error.message}`)
      errorCount++
    }
  }
  
  console.log(`\n📊 Route Validation Summary:`)
  console.log(`✅ Successful: ${successCount}`)
  console.log(`❌ Errors: ${errorCount}`)
  console.log(`📈 Success Rate: ${Math.round((successCount / routesToTest.length) * 100)}%`)
  
  return { successCount, errorCount, totalRoutes: routesToTest.length }
}

// Also validate that key Vue components can be imported
async function validateComponents() {
  const componentsToTest = [
    '@/views/Dashboard.vue',
    '@/views/Settings.vue', 
    '@/views/Jobs.vue',
    '@/views/ModernPortfolio.vue',
    '@/views/DocumentBuilder.vue'
  ]
  
  console.log('\n🔍 Testing Vue components...')
  
  let successCount = 0
  let errorCount = 0
  
  for (const component of componentsToTest) {
    try {
      const module = await import(component)
      if (module && module.default) {
        console.log(`✅ ${component} - Component loaded successfully`)
        successCount++
      } else {
        console.log(`❌ ${component} - No default export found`)
        errorCount++
      }
    } catch (error) {
      console.log(`❌ ${component} - Error: ${error.message}`)
      errorCount++
    }
  }
  
  console.log(`\n📊 Component Validation Summary:`)
  console.log(`✅ Successful: ${successCount}`) 
  console.log(`❌ Errors: ${errorCount}`)
  console.log(`📈 Success Rate: ${Math.round((successCount / componentsToTest.length) * 100)}%`)
  
  return { successCount, errorCount, totalComponents: componentsToTest.length }
}

export { validateRoutes, validateComponents }