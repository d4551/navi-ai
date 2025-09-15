/**
 * Testing Utilities and Helpers
 * Provides comprehensive testing infrastructure for Vue components and composables
 */

import { mount, VueWrapper, MountingOptions } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createWebHistory } from 'vue-router';
import { vi } from 'vitest';
import { Component, nextTick } from 'vue';

// Test data factories
export class TestDataFactory {
  static user() {
    return {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      personalInfo: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        location: 'Test City, TC',
        summary: 'Test user summary',
        profilePicture: null,
        currentRole: 'Software Developer',
        currentCompany: 'Test Company',
        yearsExperience: 5,
      },
      skills: {
        technical: ['JavaScript', 'Vue.js', 'TypeScript'],
        soft: ['Communication', 'Leadership'],
        languages: ['English', 'Spanish'],
      },
      experience: [
        {
          id: '1',
          title: 'Software Developer',
          company: 'Test Company',
          startDate: '2020-01-01',
          endDate: null,
          current: true,
          description: 'Building amazing applications',
        },
      ],
      education: [
        {
          id: '1',
          institution: 'Test University',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: '2016-09-01',
          endDate: '2020-05-01',
          gpa: 3.8,
        },
      ],
    };
  }

  static job() {
    return {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      location: 'Remote',
      type: 'Full-time',
      salary: '$120,000',
      description: 'Build scalable web applications using modern technologies.',
      requirements: ['5+ years experience', 'Vue.js', 'Node.js'],
      benefits: ['Health insurance', 'Remote work', '401k'],
      postedDate: '2024-01-15',
      applicationDeadline: '2024-02-15',
      source: 'company-website',
    };
  }

  static apiResponse<T>(data: T, options: { success?: boolean; status?: number } = {}) {
    return {
      success: options.success ?? true,
      status: options.status ?? 200,
      data,
      message: options.success ?? true ? 'Success' : 'Error occurred',
      timestamp: new Date().toISOString(),
    };
  }

  static error(message: string = 'Test error', code: string = 'TEST_ERROR') {
    const error = new Error(message);
    (error as any).code = code;
    return error;
  }
}

// Component mounting helpers
export interface TestMountOptions<T = any> extends Omit<MountingOptions<T>, 'global'> {
  router?: boolean | any[];
  store?: boolean | Record<string, any>;
  mocks?: Record<string, any>;
  stubs?: Record<string, any>;
  plugins?: any[];
}

export class ComponentTestHelper {
  static mount<T extends Component>(
    component: T,
    options: TestMountOptions<T> = {}
  ): VueWrapper<any> {
    const {
      router = true,
      store = true,
      mocks = {},
      stubs = {},
      plugins = [],
      ...mountOptions
    } = options;

    // Setup router
    let routerInstance;
    if (router) {
      const routes = Array.isArray(router) ? router : [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/about', component: { template: '<div>About</div>' } },
      ];
      routerInstance = createRouter({
        history: createWebHistory(),
        routes,
      });
    }

    // Setup store
    let storeInstance;
    if (store) {
      storeInstance = createTestingPinia({
        createSpy: vi.fn,
        initialState: typeof store === 'object' ? store : {},
      });
    }

    // Default mocks
    const defaultMocks = {
      $t: (key: string) => key, // i18n mock
      $router: routerInstance,
      $route: { path: '/', query: {}, params: {} },
      ...mocks,
    };

    // Default stubs
    const defaultStubs = {
      RouterLink: { template: '<a><slot /></a>' },
      RouterView: { template: '<div><slot /></div>' },
      ...stubs,
    };

    const global = {
      plugins: [
        ...(routerInstance ? [routerInstance] : []),
        ...(storeInstance ? [storeInstance] : []),
        ...plugins,
      ],
      mocks: defaultMocks,
      stubs: defaultStubs,
    };

    return mount(component, {
      ...mountOptions,
      global,
    });
  }

  static async waitForAsyncComponent(wrapper: VueWrapper<any>) {
    await nextTick();
    await wrapper.vm.$nextTick();
  }

  static async triggerAndWait(wrapper: VueWrapper<any>, event: string, selector?: string) {
    const element = selector ? wrapper.find(selector) : wrapper;
    await element.trigger(event);
    await this.waitForAsyncComponent(wrapper);
  }

  static findByTestId(wrapper: VueWrapper<any>, testId: string) {
    return wrapper.find(`[data-test="${testId}"]`);
  }

  static findAllByTestId(wrapper: VueWrapper<any>, testId: string) {
    return wrapper.findAll(`[data-test="${testId}"]`);
  }

  static expectToHaveClass(wrapper: VueWrapper<any>, className: string) {
    expect(wrapper.classes()).toContain(className);
  }

  static expectNotToHaveClass(wrapper: VueWrapper<any>, className: string) {
    expect(wrapper.classes()).not.toContain(className);
  }
}

// API mocking helpers
export class MockApiHelper {
  private static originalFetch = global.fetch;

  static mockFetch(responses: Record<string, any> = {}) {
    global.fetch = vi.fn((url: string, options: RequestInit = {}) => {
      const method = options.method || 'GET';
      const key = `${method} ${url}`;

      if (responses[key]) {
        const response = responses[key];
        return Promise.resolve({
          ok: response.ok ?? true,
          status: response.status ?? 200,
          statusText: response.statusText ?? 'OK',
          json: () => Promise.resolve(response.data || response),
          text: () => Promise.resolve(JSON.stringify(response.data || response)),
          headers: new Map(Object.entries(response.headers || {})),
        });
      }

      // Default success response
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({}),
        text: () => Promise.resolve('{}'),
        headers: new Map(),
      });
    });
  }

  static mockApiError(status: number = 500, message: string = 'Server Error') {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status,
        statusText: message,
        json: () => Promise.resolve({ error: message }),
        text: () => Promise.resolve(JSON.stringify({ error: message })),
        headers: new Map(),
      })
    );
  }

  static mockNetworkError() {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network Error')));
  }

  static restoreFetch() {
    global.fetch = this.originalFetch;
  }
}

// Store testing helpers
export class StoreTestHelper {
  static createMockStore(initialState: Record<string, any> = {}) {
    return createTestingPinia({
      createSpy: vi.fn,
      initialState,
    });
  }

  static mockStoreAction(store: any, actionName: string, implementation?: (...args: any[]) => any) {
    store[actionName] = vi.fn(implementation || (() => Promise.resolve()));
    return store[actionName];
  }

  static expectActionCalled(action: any, times: number = 1) {
    expect(action).toHaveBeenCalledTimes(times);
  }

  static expectActionCalledWith(action: any, ...args: any[]) {
    expect(action).toHaveBeenCalledWith(...args);
  }
}

// Animation and timing helpers
export class TimingTestHelper {
  static async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static mockTimers() {
    vi.useFakeTimers();
  }

  static restoreTimers() {
    vi.useRealTimers();
  }

  static runTimers() {
    vi.runAllTimers();
  }

  static advanceTimers(ms: number) {
    vi.advanceTimersByTime(ms);
  }
}

// Local storage mocking
export class StorageTestHelper {
  private static originalLocalStorage = global.localStorage;
  private static originalSessionStorage = global.sessionStorage;

  static mockLocalStorage(initialData: Record<string, string> = {}) {
    const store = new Map(Object.entries(initialData));

    global.localStorage = {
      getItem: vi.fn((key: string) => store.get(key) || null),
      setItem: vi.fn((key: string, value: string) => store.set(key, value)),
      removeItem: vi.fn((key: string) => store.delete(key)),
      clear: vi.fn(() => store.clear()),
      length: 0,
      key: vi.fn(),
    };
  }

  static mockSessionStorage(initialData: Record<string, string> = {}) {
    const store = new Map(Object.entries(initialData));

    global.sessionStorage = {
      getItem: vi.fn((key: string) => store.get(key) || null),
      setItem: vi.fn((key: string, value: string) => store.set(key, value)),
      removeItem: vi.fn((key: string) => store.delete(key)),
      clear: vi.fn(() => store.clear()),
      length: 0,
      key: vi.fn(),
    };
  }

  static restoreStorage() {
    global.localStorage = this.originalLocalStorage;
    global.sessionStorage = this.originalSessionStorage;
  }
}

// Accessibility testing helpers
export class A11yTestHelper {
  static expectHasAriaLabel(wrapper: VueWrapper<any>, label: string) {
    expect(wrapper.attributes('aria-label')).toBe(label);
  }

  static expectHasRole(wrapper: VueWrapper<any>, role: string) {
    expect(wrapper.attributes('role')).toBe(role);
  }

  static expectIsAccessible(wrapper: VueWrapper<any>) {
    // Check for basic accessibility attributes
    const element = wrapper.element;

    if (element.tagName === 'BUTTON') {
      expect(element.hasAttribute('type')).toBe(true);
    }

    if (element.hasAttribute('aria-describedby')) {
      const describedBy = element.getAttribute('aria-describedby');
      expect(document.getElementById(describedBy!)).toBeTruthy();
    }
  }

  static expectFocusable(wrapper: VueWrapper<any>) {
    const element = wrapper.element as HTMLElement;
    element.focus();
    expect(document.activeElement).toBe(element);
  }
}

// Error boundary testing
export class ErrorTestHelper {
  static async triggerError(wrapper: VueWrapper<any>, error: Error) {
    const originalConsoleError = console.error;
    console.error = vi.fn(); // Suppress error logs in tests

    try {
      // Trigger an error in the component
      wrapper.vm.$emit('error', error);
      await nextTick();
    } finally {
      console.error = originalConsoleError;
    }
  }

  static expectErrorBoundary(wrapper: VueWrapper<any>) {
    expect(wrapper.find('[data-test="error-boundary"]').exists()).toBe(true);
  }

  static expectNoErrors(wrapper: VueWrapper<any>) {
    expect(wrapper.find('[data-test="error-boundary"]').exists()).toBe(false);
  }
}

// Visual regression testing helpers
export class VisualTestHelper {
  static async takeSnapshot(wrapper: VueWrapper<any>, name: string) {
    // This would integrate with visual regression testing tools
    // For now, just ensure component renders without errors
    expect(wrapper.html()).toMatchSnapshot(name);
  }

  static expectVisualMatch(wrapper: VueWrapper<any>, expectedHtml: string) {
    expect(wrapper.html()).toBe(expectedHtml);
  }
}

// Integration test helpers
export class IntegrationTestHelper {
  static async simulateUserFlow(wrapper: VueWrapper<any>, steps: Array<() => Promise<void>>) {
    for (const step of steps) {
      await step();
      await ComponentTestHelper.waitForAsyncComponent(wrapper);
    }
  }

  static createUserFlowStep(wrapper: VueWrapper<any>, action: string, selector?: string, value?: any) {
    return async () => {
      switch (action) {
        case 'click':
          await ComponentTestHelper.triggerAndWait(wrapper, 'click', selector);
          break;
        case 'input':
          const input = selector ? wrapper.find(selector) : wrapper;
          await input.setValue(value);
          break;
        case 'submit':
          await ComponentTestHelper.triggerAndWait(wrapper, 'submit', selector);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    };
  }
}

// Performance testing helpers
export class PerformanceTestHelper {
  static measureRenderTime(component: Component, options: TestMountOptions = {}) {
    const start = performance.now();
    const wrapper = ComponentTestHelper.mount(component, options);
    const end = performance.now();
    return {
      wrapper,
      renderTime: end - start,
    };
  }

  static expectRenderTimeLessThan(renderTime: number, maxTime: number) {
    expect(renderTime).toBeLessThan(maxTime);
  }
}

// Export all helpers for easy import
export {
  TestDataFactory,
  ComponentTestHelper,
  MockApiHelper,
  StoreTestHelper,
  TimingTestHelper,
  StorageTestHelper,
  A11yTestHelper,
  ErrorTestHelper,
  VisualTestHelper,
  IntegrationTestHelper,
  PerformanceTestHelper,
};