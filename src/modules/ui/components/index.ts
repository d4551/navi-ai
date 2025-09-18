// UI Components utilities and helpers
// Additional component-related functionality

// Component composition helpers
export const createComponentProps = <T extends Record<string, any>>(
  defaults: T
) => {
  return (overrides: Partial<T> = {}): T => ({
    ...defaults,
    ...overrides,
  })
}

// Common component prop factories
export const buttonProps = createComponentProps({
  variant: 'primary',
  size: 'md',
  disabled: false,
})

export const inputProps = createComponentProps({
  type: 'text',
  placeholder: '',
  disabled: false,
  required: false,
})

export const modalProps = createComponentProps({
  show: false,
  size: 'md',
  closable: true,
  backdrop: true,
})
