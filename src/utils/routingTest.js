// Routing Test Utility - Validates all routes and page pointers
// Tests routing functionality and ensures all links work correctly

import {
  pagePointerManager,
  ROUTE_TO_COMPONENT,
  PAGE_METADATA,
} from './pagePointers'
import { serviceRegistry, gamingStudioService } from '@/shared/services'
import { logger } from '@/shared/utils/logger'

class RoutingTestSuite {
  constructor() {
    this.testResults = {
      routeTests: [],
      componentTests: [],
      serviceTests: [],
      summary: {
        totalRoutes: 0,
        validRoutes: 0,
        totalComponents: 0,
        validComponents: 0,
        totalServices: 0,
        validServices: 0,
      },
    }
  }

  // Run complete routing test suite
  async runAllTests() {
    logger.info('Starting comprehensive routing test suite...')

    try {
      await this.testRouteToComponentMapping()
      await this.testComponentLoading()
      await this.testServiceIntegration()
      await this.testPageMetadata()

      this.generateTestReport()
      return this.testResults
    } catch (error) {
      logger.error('Routing test suite failed:', error)
      throw error
    }
  }

  // Test route to component mapping
  async testRouteToComponentMapping() {
    logger.info('Testing route to component mappings...')

    for (const [route, componentKey] of Object.entries(ROUTE_TO_COMPONENT)) {
      const testResult = {
        route,
        componentKey,
        status: 'pending',
        error: null,
      }

      try {
        const component =
          await pagePointerManager.getPageComponent(componentKey)
        if (component) {
          testResult.status = 'success'
          logger.debug(`✓ Route ${route} -> ${componentKey} [SUCCESS]`)
        } else {
          testResult.status = 'failed'
          testResult.error = 'Component returned null'
          logger.warn(
            `✗ Route ${route} -> ${componentKey} [FAILED: No component]`
          )
        }
      } catch (error) {
        testResult.status = 'error'
        testResult.error = error.message
        logger.error(
          `✗ Route ${route} -> ${componentKey} [ERROR: ${error.message}]`
        )
      }

      this.testResults.routeTests.push(testResult)
      this.testResults.summary.totalRoutes++
      if (testResult.status === 'success') {
        this.testResults.summary.validRoutes++
      }
    }
  }

  // Test component loading directly
  async testComponentLoading() {
    logger.info('Testing direct component loading...')

    const validation = await pagePointerManager.validateAllPointers()

    // Process valid components
    validation.valid.forEach(componentKey => {
      this.testResults.componentTests.push({
        componentKey,
        status: 'success',
        error: null,
      })
      this.testResults.summary.validComponents++
    })

    // Process invalid components
    validation.invalid.forEach(componentKey => {
      const errorInfo = validation.errors.find(e => e.pageKey === componentKey)
      this.testResults.componentTests.push({
        componentKey,
        status: 'failed',
        error: errorInfo?.error || 'Unknown error',
      })
      logger.error(`✗ Component ${componentKey} [FAILED: ${errorInfo?.error}]`)
    })

    this.testResults.summary.totalComponents =
      validation.valid.length + validation.invalid.length
    logger.info(
      `Component loading test completed: ${validation.valid.length}/${this.testResults.summary.totalComponents} valid`
    )
  }

  // Test service integration
  async testServiceIntegration() {
    logger.info('Testing service integration...')

    // Test gaming studio service
    await this.testGamingStudioService()

    // Test service registry
    await this.testServiceRegistry()
  }

  async testGamingStudioService() {
    const testResult = {
      service: 'gamingStudios',
      tests: [],
    }

    // Test initialization
    try {
      const initialized = await gamingStudioService.initialize()
      testResult.tests.push({
        test: 'initialization',
        status: initialized ? 'success' : 'failed',
        error: initialized ? null : 'Service failed to initialize',
      })
    } catch (_error) {
      testResult.tests.push({
        test: 'initialization',
        status: 'error',
        error: error.message,
      })
    }

    // Test basic functionality
    try {
      const studios = await gamingStudioService.getAllStudios()
      testResult.tests.push({
        test: 'getAllStudios',
        status:
          studios && Object.keys(studios).length > 0 ? 'success' : 'failed',
        error: studios ? null : 'No studios returned',
      })
    } catch (_error) {
      testResult.tests.push({
        test: 'getAllStudios',
        status: 'error',
        error: error.message,
      })
    }

    // Test search functionality
    try {
      const searchResults = await gamingStudioService.searchStudios({
        name: 'test',
      })
      testResult.tests.push({
        test: 'searchStudios',
        status: Array.isArray(searchResults) ? 'success' : 'failed',
        error: Array.isArray(searchResults)
          ? null
          : 'Search did not return array',
      })
    } catch (_error) {
      testResult.tests.push({
        test: 'searchStudios',
        status: 'error',
        error: error.message,
      })
    }

    this.testResults.serviceTests.push(testResult)
    this.testResults.summary.totalServices++

    const successfulTests = testResult.tests.filter(
      t => t.status === 'success'
    ).length
    if (successfulTests === testResult.tests.length) {
      this.testResults.summary.validServices++
    }

    logger.info(
      `Gaming Studio Service test: ${successfulTests}/${testResult.tests.length} tests passed`
    )
  }

  async testServiceRegistry() {
    const testResult = {
      service: 'serviceRegistry',
      tests: [],
    }

    // Test service listing
    try {
      const services = serviceRegistry.listServices()
      testResult.tests.push({
        test: 'listServices',
        status: Array.isArray(services) ? 'success' : 'failed',
        error: Array.isArray(services)
          ? null
          : 'Service list not returned as array',
      })
    } catch (_error) {
      testResult.tests.push({
        test: 'listServices',
        status: 'error',
        error: error.message,
      })
    }

    // Test service checking
    try {
      const hasLogger = serviceRegistry.hasService('logger')
      testResult.tests.push({
        test: 'hasService',
        status: typeof hasLogger === 'boolean' ? 'success' : 'failed',
        error:
          typeof hasLogger === 'boolean'
            ? null
            : 'hasService did not return boolean',
      })
    } catch (_error) {
      testResult.tests.push({
        test: 'hasService',
        status: 'error',
        error: error.message,
      })
    }

    this.testResults.serviceTests.push(testResult)
    this.testResults.summary.totalServices++

    const successfulTests = testResult.tests.filter(
      t => t.status === 'success'
    ).length
    if (successfulTests === testResult.tests.length) {
      this.testResults.summary.validServices++
    }

    logger.info(
      `Service Registry test: ${successfulTests}/${testResult.tests.length} tests passed`
    )
  }

  // Test page metadata
  async testPageMetadata() {
    logger.info('Testing page metadata...')

    for (const [componentKey, metadata] of Object.entries(PAGE_METADATA)) {
      if (!metadata.title || !metadata.icon) {
        logger.warn(
          `✗ Metadata incomplete for ${componentKey}: missing title or icon`
        )
      } else {
        logger.debug(`✓ Metadata valid for ${componentKey}`)
      }

      // Test service dependencies
      if (metadata.services) {
        for (const serviceName of metadata.services) {
          try {
            if (serviceName === 'gamingStudios') {
              await gamingStudioService.initialize()
            } else if (!serviceRegistry.hasService(serviceName)) {
              logger.warn(
                `✗ Service '${serviceName}' required by ${componentKey} is not available`
              )
            }
          } catch (error) {
            logger.warn(
              `✗ Failed to verify service '${serviceName}' for ${componentKey}:`,
              error.message
            )
          }
        }
      }
    }
  }

  // Generate comprehensive test report
  generateTestReport() {
    const { summary } = this.testResults

    logger.info('=== ROUTING TEST SUITE RESULTS ===')
    logger.info(`Routes: ${summary.validRoutes}/${summary.totalRoutes} valid`)
    logger.info(
      `Components: ${summary.validComponents}/${summary.totalComponents} valid`
    )
    logger.info(
      `Services: ${summary.validServices}/${summary.totalServices} valid`
    )

    const overallScore = (
      ((summary.validRoutes / Math.max(summary.totalRoutes, 1) +
        summary.validComponents / Math.max(summary.totalComponents, 1) +
        summary.validServices / Math.max(summary.totalServices, 1)) /
        3) *
      100
    ).toFixed(1)

    logger.info(`Overall Score: ${overallScore}%`)

    // Log failures
    const failedRoutes = this.testResults.routeTests.filter(
      t => t.status !== 'success'
    )
    const failedComponents = this.testResults.componentTests.filter(
      t => t.status !== 'success'
    )

    if (failedRoutes.length > 0) {
      logger.warn('Failed Routes:')
      failedRoutes.forEach(r =>
        logger.warn(`  ${r.route} -> ${r.componentKey}: ${r.error}`)
      )
    }

    if (failedComponents.length > 0) {
      logger.warn('Failed Components:')
      failedComponents.forEach(c =>
        logger.warn(`  ${c.componentKey}: ${c.error}`)
      )
    }

    logger.info('=== END TEST RESULTS ===')
  }

  // Quick health check for production
  async quickHealthCheck() {
    try {
      // Test essential routes
      const essentialRoutes = ['/', '/jobs', '/resume', '/settings']
      let healthyRoutes = 0

      for (const route of essentialRoutes) {
        try {
          await pagePointerManager.getComponentByRoute(route)
          healthyRoutes++
        } catch (_error) {
          logger.warn(`Health check failed for route ${route}:`, error.message)
        }
      }

      // Test gaming studio service
      let serviceHealthy = false
      try {
        await gamingStudioService.initialize()
        serviceHealthy = true
      } catch (error) {
        logger.warn('Gaming studio service health check failed:', error.message)
      }

      const healthScore =
        ((healthyRoutes / essentialRoutes.length + (serviceHealthy ? 1 : 0)) /
          2) *
        100

      return {
        healthy: healthScore >= 75,
        score: healthScore,
        routesHealthy: healthyRoutes,
        totalRoutes: essentialRoutes.length,
        servicesHealthy: serviceHealthy ? 1 : 0,
        totalServices: 1,
      }
    } catch (error) {
      logger.error('Health check failed:', error)
      return {
        healthy: false,
        score: 0,
        error: error.message,
      }
    }
  }
}

// Create singleton instance
export const routingTestSuite = new RoutingTestSuite()

// Helper functions
export const runRoutingTests = () => routingTestSuite.runAllTests()
export const quickHealthCheck = () => routingTestSuite.quickHealthCheck()

// Auto-run health check in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  setTimeout(async () => {
    try {
      const health = await quickHealthCheck()
      if (health.healthy) {
        logger.info(
          `✓ Routing system health check passed (${health.score.toFixed(1)}%)`
        )
      } else {
        logger.warn(
          `✗ Routing system health check failed (${health.score.toFixed(1)}%)`
        )
      }
    } catch (error) {
      logger.debug('Routing health check failed (non-critical):', error)
    }
  }, 3000)
}

export default routingTestSuite
