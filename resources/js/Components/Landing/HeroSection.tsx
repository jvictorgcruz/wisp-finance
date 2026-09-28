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
            className={`px-8 lg:px-20 max-w-7xl mx-auto pt-16 lg:pt-24 pb-20 ${className}`}
            aria-label="Hero"
        >
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 items-center">
                <div className="space-y-8 w-full lg:w-[46%] shrink-0">
                    <HeroHeader />
                    <HeroCTA />
                </div>

                <div className="w-full lg:w-[54%] relative">
                    <HeroMockup />
                </div>
            </div>
        </section>
    );
}
