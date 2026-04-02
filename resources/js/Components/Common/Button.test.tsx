import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button Component', () => {
  it('should render children correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeDefined();
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when isLoading is true', () => {
    render(<Button isLoading>Click Me</Button>);
    const button = screen.getByRole('button');
    expect(button.closest('button')).toBeDisabled();
    expect(screen.getByText('Click Me')).toBeDefined();
  });

  it('should apply primary variant classes by default', () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole('button');
    expect(button.closest('button')?.className).toContain('bg-indigo-600');
  });

  it('should apply custom className', () => {
    render(<Button className="custom-class">Click Me</Button>);
    const button = screen.getByRole('button');
    expect(button.closest('button')?.className).toContain('custom-class');
  });
});
