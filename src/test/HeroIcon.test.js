import { render } from '@testing-library/vue';
import HeroIcon from '@/components/ui/HeroIcon.vue';

describe('HeroIcon Component', () => {
  it('renders with default props', () => {
    const { getByRole } = render(HeroIcon, {
      props: { name: 'home' },
    });

    const icon = getByRole('img', { hidden: true });
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('w-5', 'h-5'); // default md size
  });

  it('applies correct size classes', () => {
    const { getByRole } = render(HeroIcon, {
      props: { name: 'search', size: 'lg' },
    });

    const icon = getByRole('img', { hidden: true });
    expect(icon).toHaveClass('w-6', 'h-6');
  });

  it('maps common icon names correctly', () => {
    const { container } = render(HeroIcon, {
      props: { name: 'search' },
    });

    // Should render MagnifyingGlassIcon component
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('shows aria-label when provided', () => {
    const { getByLabelText } = render(HeroIcon, {
      props: { name: 'settings', ariaLabel: 'Open settings' },
    });

    const icon = getByLabelText('Open settings');
    expect(icon).toBeInTheDocument();
  });
});
