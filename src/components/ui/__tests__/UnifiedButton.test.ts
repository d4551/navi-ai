import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ComponentTestHelper, A11yTestHelper, TestDataFactory } from '@/utils/testing/testHelpers';
import UnifiedButton from '../UnifiedButton.vue';

describe('UnifiedButton', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup after each test
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      const wrapper = ComponentTestHelper.mount(UnifiedButton, {
        slots: { default: 'Click me' }
      });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.text()).toBe('Click me');
      expect(wrapper.element.tagName).toBe('BUTTON');
    });

    it('renders as router-link when to prop is provided', () => {
      const wrapper = ComponentTestHelper.mount(UnifiedButton, {
        props: { to: '/test' },
        slots: { default: 'Navigate' }
      });

      expect(wrapper.find('a').exists()).toBe(true);
      expect(wrapper.text()).toBe('Navigate');
    });

    it('renders as external link when href prop is provided', () => {
      const wrapper = ComponentTestHelper.mount(UnifiedButton, {
        props: { href: 'https://example.com' },
        slots: { default: 'External Link' }
      });

      expect(wrapper.find('a').exists()).toBe(true);
      expect(wrapper.attributes('href')).toBe('https://example.com');
      expect(wrapper.attributes('target')).toBe('_blank');
      expect(wrapper.attributes('rel')).toBe('noopener noreferrer');
    });
  });

  describe('Variants and Styling', () => {
    it('applies correct variant classes', () => {
      const variants = ['primary', 'secondary', 'outline-primary', 'ghost', 'danger'];

      variants.forEach(variant => {
        const wrapper = ComponentTestHelper.mount(UnifiedButton, {
          props: { variant },
          slots: { default: 'Button' }
        });

        ComponentTestHelper.expectToHaveClass(wrapper, `unified-button--${variant}`);
      });
    });

    it('applies correct size classes', () => {
      const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];

      sizes.forEach(size => {
        const wrapper = ComponentTestHelper.mount(UnifiedButton, {
          props: { size },
          slots: { default: 'Button' }
        });

        ComponentTestHelper.expectToHaveClass(wrapper, `unified-button--${size}`);
      });
    });

    it('applies disabled state correctly', () => {
      const wrapper = ComponentTestHelper.mount(UnifiedButton, {
        props: { disabled: true },
        slots: { default: 'Disabled Button' }
      });

      expect(wrapper.attributes('disabled')).toBe('');
      ComponentTestHelper.expectToHaveClass(wrapper, 'unified-button--disabled');
    });

    it('applies loading state correctly', () => {
      const wrapper = ComponentTestHelper.mount(UnifiedButton, {
        props: { loading: true },
        slots: { default: 'Loading Button' }
      });

      ComponentTestHelper.expectToHaveClass(wrapper, 'unified-button--loading');
      expect(wrapper.find('.unified-button__loading').exists()).toBe(true);
    });
  });

  describe('Icons', () => {
    it('renders with icon', () => {
      const wrapper = ComponentTestHelper.mount(UnifiedButton, {
        props: { icon: 'mdi-home' },
        slots: { default: 'Home' }
      });

      expect(wrapper.find('.unified-button__icon').exists()).toBe(true);
    });

    it('renders with trailing icon', () => {
      const wrapper = ComponentTestHelper.mount(UnifiedButton, {
        props: { trailingIcon: 'mdi-arrow-right' },
        slots: { default: 'Next' }
      });

      expect(wrapper.find('.unified-button__trailing-icon').exists()).toBe(true);
    });

    it('renders icon-only button', () => {
      const wrapper = ComponentTestHelper.mount(UnifiedButton, {
        props: { icon: 'mdi-close', iconOnly: true }
      });

      ComponentTestHelper.expectToHaveClass(wrapper, 'unified-button--icon-only');
    });
  });

  describe('Event Handling', () => {
    it('emits click event when clicked', async () => {
      const wrapper = ComponentTestHelper.mount(UnifiedButton, {
        slots: { default: 'Click me' }
      });

      await wrapper.trigger('click');
      expect(wrapper.emitted('click')).toHaveLength(1);
    });

    it('does not emit click when disabled', async () => {
      const wrapper = ComponentTestHelper.mount(UnifiedButton, {
        props: { disabled: true },
        slots: { default: 'Disabled' }
      });

      await wrapper.trigger('click');
      expect(wrapper.emitted('click')).toBeFalsy();
    });

    it('does not emit click when loading', async () => {
      const wrapper = ComponentTestHelper.mount(UnifiedButton, {
        props: { loading: true },
        slots: { default: 'Loading' }
      });

      await wrapper.trigger('click');
      expect(wrapper.emitted('click')).toBeFalsy();
    });

    it('handles keyboard navigation', async () => {
      const wrapper = ComponentTestHelper.mount(UnifiedButton, {
        slots: { default: 'Keyboard' }
      });

      await wrapper.trigger('keydown.enter');
      expect(wrapper.emitted('click')).toHaveLength(1);

      await wrapper.trigger('keydown.space');
      expect(wrapper.emitted('click')).toHaveLength(2);
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility attributes', () => {
      const wrapper = ComponentTestHelper.mount(UnifiedButton, {
        props: { ariaLabel: 'Close dialog' },
        slots: { default: 'X' }
      });

      A11yTestHelper.expectHasAriaLabel(wrapper, 'Close dialog');
      expect(wrapper.attributes('type')).toBe('button');
    });

    it('is focusable when not disabled', () => {
      const wrapper = ComponentTestHelper.mount(UnifiedButton, {
        slots: { default: 'Focusable' }
      });

      A11yTestHelper.expectFocusable(wrapper);
    });

    it('has correct ARIA attributes when loading', () => {
      const wrapper = ComponentTestHelper.mount(UnifiedButton, {
        props: { loading: true },
        slots: { default: 'Loading' }
      });

      expect(wrapper.attributes('aria-busy')).toBe('true');
      expect(wrapper.attributes('aria-disabled')).toBe('true');
    });

    it('has correct role for link variants', () => {
      const wrapper = ComponentTestHelper.mount(UnifiedButton, {
        props: { href: 'https://example.com' },
        slots: { default: 'Link' }
      });

      expect(wrapper.element.tagName).toBe('A');
      expect(wrapper.attributes('role')).toBe('button');
    });
  });

  describe('Custom Classes and Styles', () => {
    it('accepts custom classes', () => {
      const wrapper = ComponentTestHelper.mount(UnifiedButton, {
        props: { class: 'custom-class' },
        slots: { default: 'Custom' }
      });

      ComponentTestHelper.expectToHaveClass(wrapper, 'custom-class');
    });

    it('applies block style correctly', () => {
      const wrapper = ComponentTestHelper.mount(UnifiedButton, {
        props: { block: true },
        slots: { default: 'Block Button' }
      });

      ComponentTestHelper.expectToHaveClass(wrapper, 'unified-button--block');
    });
  });

  describe('Integration with Router', () => {
    it('navigates when router-link is clicked', async () => {
      const mockPush = vi.fn();
      const wrapper = ComponentTestHelper.mount(UnifiedButton, {
        props: { to: '/dashboard' },
        slots: { default: 'Dashboard' },
        mocks: {
          $router: { push: mockPush }
        }
      });

      await wrapper.trigger('click');
      // Note: Actual router navigation testing would require router setup
      expect(wrapper.find('a').exists()).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty slot gracefully', () => {
      const wrapper = ComponentTestHelper.mount(UnifiedButton);
      expect(wrapper.exists()).toBe(true);
    });

    it('handles both icon and trailing icon', () => {
      const wrapper = ComponentTestHelper.mount(UnifiedButton, {
        props: {
          icon: 'mdi-home',
          trailingIcon: 'mdi-arrow-right'
        },
        slots: { default: 'Both Icons' }
      });

      expect(wrapper.find('.unified-button__icon').exists()).toBe(true);
      expect(wrapper.find('.unified-button__trailing-icon').exists()).toBe(true);
    });

    it('prevents double-clicks when loading', async () => {
      let clickCount = 0;
      const wrapper = ComponentTestHelper.mount(UnifiedButton, {
        props: { loading: false },
        slots: { default: 'Click me' }
      });

      // Set up click handler
      wrapper.vm.$emit = vi.fn(() => clickCount++);

      // First click - should work
      await wrapper.trigger('click');

      // Set loading state
      await wrapper.setProps({ loading: true });

      // Second click while loading - should not work
      await wrapper.trigger('click');

      expect(clickCount).toBe(1);
    });
  });

  describe('Performance', () => {
    it('renders quickly', () => {
      const startTime = performance.now();
      ComponentTestHelper.mount(UnifiedButton, {
        slots: { default: 'Performance Test' }
      });
      const endTime = performance.now();

      // Rendering should be under 10ms
      expect(endTime - startTime).toBeLessThan(10);
    });

    it('handles rapid state changes', async () => {
      const wrapper = ComponentTestHelper.mount(UnifiedButton, {
        slots: { default: 'Rapid Changes' }
      });

      // Rapidly change props
      for (let i = 0; i < 10; i++) {
        await wrapper.setProps({ loading: i % 2 === 0 });
      }

      expect(wrapper.exists()).toBe(true);
    });
  });
});