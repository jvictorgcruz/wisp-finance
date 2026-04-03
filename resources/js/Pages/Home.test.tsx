import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from './Home';
import React from 'react';

describe('Home Page (Landing)', () => {
    it('should render the brand name Wisp', () => {
        render(<Home />);
        expect(screen.getAllByText(/Wisp/i)).toBeDefined();
    });

    it('should show Get Started CTA when guest', () => {
        render(<Home />);
        // The mock translator returns the key when no translation is found
        expect(screen.getByText('home.cta')).toBeDefined();
    });
});
