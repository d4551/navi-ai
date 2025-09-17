import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  TestDataFactory,
  ComponentTestHelper,
  MockApiHelper,
  StoreTestHelper,
  TimingTestHelper,
  StorageTestHelper,
  A11yTestHelper,
} from '../testHelpers'
import { defineComponent, ref } from 'vue'

// Test component for testing helpers
const TestComponent = defineComponent({
  name: 'TestComponent',
  setup() {
    const message = ref('Test Message')
    const inputValue = ref('')
    const clickCount = ref(0)

    const handleClick = () => {
      clickCount.value++
    }

    return {
      message,
      inputValue,
      clickCount,
      handleClick,
    }
  },
  template: `
    <div>
      <button @click="handleClick" data-test="test-button">
        {{ message }}
      </button>
      <input v-model="inputValue" data-test="test-input" />
    </div>
  `,
})

describe('Test Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Cleanup any test artifacts
    MockApiHelper.restoreFetch()
    StorageTestHelper.restoreStorage()
    TimingTestHelper.restoreTimers()
  })

  describe('TestDataFactory', () => {
    it('creates user data', () => {
      const user = TestDataFactory.user()

      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('name')
      expect(user).toHaveProperty('email')
      expect(user).toHaveProperty('personalInfo')
      expect(user).toHaveProperty('experience')
      expect(user).toHaveProperty('education')
      expect(user.personalInfo.email).toMatch(/\S+@\S+\.\S+/)
    })

    it('creates job data', () => {
      const job = TestDataFactory.job()

      expect(job).toHaveProperty('id')
      expect(job).toHaveProperty('title')
      expect(job).toHaveProperty('company')
      expect(job).toHaveProperty('location')
      expect(job).toHaveProperty('description')
      expect(Array.isArray(job.requirements)).toBe(true)
    })

    it('creates API response data', () => {
      const response = TestDataFactory.apiResponse({ message: 'Success' })

      expect(response).toHaveProperty('success', true)
      expect(response).toHaveProperty('status', 200)
      expect(response).toHaveProperty('data')
      expect(response.data.message).toBe('Success')
    })

    it('creates error data', () => {
      const error = TestDataFactory.error('Test error', 'TEST_ERROR')

      expect(error.message).toBe('Test error')
      expect((error as any).code).toBe('TEST_ERROR')
      expect(error instanceof Error).toBe(true)
    })
  })

  describe('ComponentTestHelper', () => {
    it('mounts component with default options', () => {
      const wrapper = ComponentTestHelper.mount(TestComponent)

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.vm).toBeDefined()
    })

    it('finds elements by test ID', () => {
      const wrapper = ComponentTestHelper.mount(TestComponent)

      const button = ComponentTestHelper.findByTestId(wrapper, 'test-button')
      const input = ComponentTestHelper.findByTestId(wrapper, 'test-input')

      expect(button.exists()).toBe(true)
      expect(input.exists()).toBe(true)
    })

    it('triggers events and waits for updates', async () => {
      const wrapper = ComponentTestHelper.mount(TestComponent)

      await ComponentTestHelper.triggerAndWait(
        wrapper,
        'click',
        '[data-test="test-button"]'
      )

      expect(wrapper.vm.clickCount).toBe(1)
    })

    it('checks for CSS classes', () => {
      const WrapperComponent = defineComponent({
        template: '<div class="test-class another-class">Test</div>',
      })

      const wrapper = ComponentTestHelper.mount(WrapperComponent)

      ComponentTestHelper.expectToHaveClass(wrapper, 'test-class')
      ComponentTestHelper.expectToHaveClass(wrapper, 'another-class')
      ComponentTestHelper.expectNotToHaveClass(wrapper, 'missing-class')
    })

    it('waits for async components', async () => {
      const AsyncComponent = defineComponent({
        async setup() {
          const message = ref('Loading...')

          // Simulate async operation
          setTimeout(() => {
            message.value = 'Loaded!'
          }, 10)

          return { message }
        },
        template: '<div>{{ message }}</div>',
      })

      const wrapper = ComponentTestHelper.mount(AsyncComponent)
      await ComponentTestHelper.waitForAsyncComponent(wrapper)

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('MockApiHelper', () => {
    it('mocks fetch responses', async () => {
      MockApiHelper.mockFetch({
        'GET /api/users': { data: { users: [] } },
        'POST /api/users': { data: { id: 1, name: 'New User' } },
      })

      const getResponse = await fetch('/api/users')
      const getData = await getResponse.json()

      expect(getData.data.users).toEqual([])

      const postResponse = await fetch('/api/users', { method: 'POST' })
      const postData = await postResponse.json()

      expect(postData.data.name).toBe('New User')
    })

    it('mocks API errors', async () => {
      MockApiHelper.mockApiError(404, 'Not Found')

      const response = await fetch('/api/missing')

      expect(response.ok).toBe(false)
      expect(response.status).toBe(404)
      expect(response.statusText).toBe('Not Found')
    })

    it('mocks network errors', async () => {
      MockApiHelper.mockNetworkError()

      try {
        await fetch('/api/test')
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Network Error')
      }
    })

    it('restores original fetch', () => {
      const originalFetch = global.fetch

      MockApiHelper.mockFetch()
      expect(global.fetch).not.toBe(originalFetch)

      MockApiHelper.restoreFetch()
      expect(global.fetch).toBe(originalFetch)
    })
  })

  describe('StoreTestHelper', () => {
    it('creates mock store', () => {
      const store = StoreTestHelper.createMockStore({
        user: { name: 'Test User' },
      })

      expect(store).toBeDefined()
    })

    it('mocks store actions', () => {
      const store = { testAction: () => {} }
      const mockAction = StoreTestHelper.mockStoreAction(store, 'testAction')

      store.testAction()

      StoreTestHelper.expectActionCalled(mockAction, 1)
    })

    it('checks action calls with arguments', () => {
      const store = { updateUser: () => {} }
      const mockAction = StoreTestHelper.mockStoreAction(store, 'updateUser')

      const userData = { name: 'Test' }
      store.updateUser(userData)

      StoreTestHelper.expectActionCalledWith(mockAction, userData)
    })
  })

  describe('TimingTestHelper', () => {
    it('mocks timers', () => {
      TimingTestHelper.mockTimers()

      let called = false
      setTimeout(() => {
        called = true
      }, 1000)

      expect(called).toBe(false)

      TimingTestHelper.advanceTimers(1000)
      expect(called).toBe(true)

      TimingTestHelper.restoreTimers()
    })

    it('runs all timers', () => {
      TimingTestHelper.mockTimers()

      let count = 0
      setTimeout(() => count++, 100)
      setTimeout(() => count++, 200)
      setTimeout(() => count++, 300)

      TimingTestHelper.runTimers()
      expect(count).toBe(3)

      TimingTestHelper.restoreTimers()
    })

    it('provides sleep utility', async () => {
      const start = Date.now()
      await TimingTestHelper.sleep(10)
      const end = Date.now()

      expect(end - start).toBeGreaterThanOrEqual(10)
    })
  })

  describe('StorageTestHelper', () => {
    it('mocks localStorage', () => {
      StorageTestHelper.mockLocalStorage({
        'test-key': 'test-value',
      })

      expect(localStorage.getItem('test-key')).toBe('test-value')
      expect(localStorage.getItem('missing-key')).toBeNull()

      localStorage.setItem('new-key', 'new-value')
      expect(localStorage.getItem('new-key')).toBe('new-value')

      localStorage.removeItem('test-key')
      expect(localStorage.getItem('test-key')).toBeNull()

      StorageTestHelper.restoreStorage()
    })

    it('mocks sessionStorage', () => {
      StorageTestHelper.mockSessionStorage({
        'session-key': 'session-value',
      })

      expect(sessionStorage.getItem('session-key')).toBe('session-value')

      sessionStorage.setItem('temp-key', 'temp-value')
      expect(sessionStorage.getItem('temp-key')).toBe('temp-value')

      StorageTestHelper.restoreStorage()
    })
  })

  describe('A11yTestHelper', () => {
    it('checks accessibility attributes', () => {
      const AccessibleComponent = defineComponent({
        template: `
          <button
            aria-label="Close dialog"
            role="button"
            tabindex="0"
          >
            X
          </button>
        `,
      })

      const wrapper = ComponentTestHelper.mount(AccessibleComponent)

      A11yTestHelper.expectHasAriaLabel(wrapper, 'Close dialog')
      A11yTestHelper.expectHasRole(wrapper, 'button')
    })

    it('checks focusability', () => {
      const FocusableComponent = defineComponent({
        template: '<button>Focusable</button>',
      })

      const wrapper = ComponentTestHelper.mount(FocusableComponent)

      A11yTestHelper.expectFocusable(wrapper)
    })
  })

  describe('Integration Tests', () => {
    it('combines multiple helpers for complete testing', async () => {
      // Mock API
      MockApiHelper.mockFetch({
        'GET /api/user': TestDataFactory.apiResponse(TestDataFactory.user()),
      })

      // Mock storage
      StorageTestHelper.mockLocalStorage({
        'user-preferences': JSON.stringify({ theme: 'dark' }),
      })

      // Mock timers for debounced operations
      TimingTestHelper.mockTimers()

      // Create component that uses all these features
      const IntegratedComponent = defineComponent({
        setup() {
          const user = ref(null)
          const searchTerm = ref('')

          const loadUser = async () => {
            const response = await fetch('/api/user')
            const data = await response.json()
            user.value = data.data
          }

          const debouncedSearch = () => {
            setTimeout(() => {
              console.log('Searching for:', searchTerm.value)
            }, 300)
          }

          return {
            user,
            searchTerm,
            loadUser,
            debouncedSearch,
          }
        },
        template: `
          <div>
            <button @click="loadUser" data-test="load-button">Load User</button>
            <div v-if="user" data-test="user-info">{{ user.name }}</div>
            <input
              v-model="searchTerm"
              @input="debouncedSearch"
              data-test="search-input"
            />
          </div>
        `,
      })

      const wrapper = ComponentTestHelper.mount(IntegratedComponent)

      // Test API integration
      await ComponentTestHelper.triggerAndWait(
        wrapper,
        'click',
        '[data-test="load-button"]'
      )

      const userInfo = ComponentTestHelper.findByTestId(wrapper, 'user-info')
      expect(userInfo.exists()).toBe(true)

      // Test storage
      const preferences = JSON.parse(
        localStorage.getItem('user-preferences') || '{}'
      )
      expect(preferences.theme).toBe('dark')

      // Test timing
      const searchInput = ComponentTestHelper.findByTestId(
        wrapper,
        'search-input'
      )
      await searchInput.setValue('test search')

      TimingTestHelper.advanceTimers(300)

      // Cleanup
      MockApiHelper.restoreFetch()
      StorageTestHelper.restoreStorage()
      TimingTestHelper.restoreTimers()
    })
  })
})
