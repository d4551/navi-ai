import { render, fireEvent } from '@testing-library/vue'
import { describe, it, expect } from '@jest/globals'

// Simple example component for testing
const SimpleButton = {
  props: { label: String },
  emits: ['click'],
  template: `<button @click="$emit('click')" class="btn btn-primary">{{ label }}</button>`,
}

describe('SimpleButton', () => {
  it('renders with label and emits click event', async () => {
    const { getByRole, emitted } = render(SimpleButton, {
      props: { label: 'Save' },
    })

    const button = getByRole('button', { name: 'Save' })
    expect(button).toBeDefined()

    await fireEvent.click(button)
    expect(emitted()).toHaveProperty('click')
  })
})
