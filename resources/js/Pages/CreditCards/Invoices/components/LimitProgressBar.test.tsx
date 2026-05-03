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
    render(<LimitProgressBar limit={100000} currentBalance={50000} />);
    
    expect(screen.getByText('50.0%')).toBeInTheDocument();
    expect(screen.getByText(/credit_cards\.invoices\.limit: R\$.*1\.000,00/)).toBeInTheDocument();
  });

  it('renders with error styles when over limit', () => {
    render(<LimitProgressBar limit={100000} currentBalance={150000} />);
    
    // Percentage should show 150%
    expect(screen.getByText('150.0%')).toBeInTheDocument();
    
    // Should have text-rose-500 class for the percentage
    const percentageText = screen.getByText('150.0%');
    expect(percentageText).toHaveClass('text-rose-500');
    
    // The progress bar itself should have bg-rose-500
    // We can find it by looking for the div with width style
    const container = percentageText.closest('.w-full');
    const progressBar = container?.querySelector('.rounded-full > div');
    expect(progressBar).toHaveClass('bg-rose-500');
  });

  it('handles zero limit gracefully', () => {
    render(<LimitProgressBar limit={0} currentBalance={10000} />);
    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });
});
