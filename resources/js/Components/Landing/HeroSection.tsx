import React from 'react';
import HeroHeader from '@/Components/Landing/HeroHeader';
import HeroCTA from '@/Components/Landing/HeroCTA';
import HeroMockup from '@/Components/Landing/HeroMockup';

interface HeroSectionProps {
    className?: string;
}

/**
 * HeroSection component modularizes the top landing page hero block.
 * Encapsulates HeroHeader, HeroCTA, and HeroMockup inside a responsive grid layout
 * with proper WCAG-compliant HTML5 landmark attributes.
 */
export default function HeroSection({ className = '' }: HeroSectionProps) {
    return (
        <section 
            className={`px-8 lg:px-20 max-w-7xl mx-auto pt-16 lg:pt-24 pb-20 overflow-hidden ${className}`}
            aria-label="Hero"
        >
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                <div className="space-y-8 lg:col-span-5">
                    <HeroHeader />
                    <HeroCTA />
                </div>

                <div className="lg:col-span-7 w-full">
                    <HeroMockup />
                </div>
            </div>
        </section>
    );
}
