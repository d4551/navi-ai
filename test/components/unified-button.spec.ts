import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, it, expect, vi } from 'vitest'

// Mock toast composable to avoid runtime errors in tests
vi.mock('../../src/composables/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  })
}))
import UnifiedButton from '../../src/components/ui/UnifiedButton.vue'

describe('UnifiedButton', () => {
  it('renders v-btn like element and responds to click', async () => {
    const wrapper = mount(UnifiedButton, {
      props: { label: 'Click', ripple: false },
      global: {
        plugins: [createPinia()]
      }
    })

    expect(wrapper.classes()).toContain('btn')
    await wrapper.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('click')
  })
})
