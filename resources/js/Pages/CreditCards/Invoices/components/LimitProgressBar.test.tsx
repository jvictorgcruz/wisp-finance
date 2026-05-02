import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LimitProgressBar from './LimitProgressBar';
import React from 'react';

// Mock custom hook
vi.mock('@/Hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('LimitProgressBar', () => {
  it('renders correctly within limits', () => {
    render(<LimitProgressBar limit={1000} currentBalance={500} />);
    
    expect(screen.getByText('50.0%')).toBeInTheDocument();
    expect(screen.getByText('credit_cards.invoices.limit: R$ 1.000,00')).toBeInTheDocument();
  });

  it('renders with error styles when over limit', () => {
    const { container } = render(<LimitProgressBar limit={1000} currentBalance={1500} />);
    
    // Percentage should show 150%
    expect(screen.getByText('150.0%')).toBeInTheDocument();
    
    // Should have text-rose-500 class for the percentage
    const percentageText = screen.getByText('150.0%');
    expect(percentageText).toHaveClass('text-rose-500');
    
    // The progress bar itself should have rose-600 or rose-500 classes
    const progressBar = container.querySelector('.bg-gradient-to-r');
    expect(progressBar).toHaveClass('from-rose-600');
  });

  it('handles zero limit gracefully', () => {
    render(<LimitProgressBar limit={0} currentBalance={100} />);
    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });
});
