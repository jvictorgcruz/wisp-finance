import React from 'react';
import { useTranslation } from '@/Hooks/useTranslation';

interface HeroHeaderProps {
    className?: string;
}

/**
 * HeroHeader component renders the main landing title, gradient text highlight,
 * and introductory subtitle with accessible HTML5 semantic tags.
 */
export default function HeroHeader({ className = '' }: HeroHeaderProps) {
    const { t } = useTranslation();

    return (
        <header className={`space-y-8 relative z-10 ${className}`} aria-label={t('home.hero_carousel.aria_hero_header')}>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-[1.05] text-balance animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {t('home.title')} <br />
                <span className="bg-linear-to-r from-primary via-blue-600 to-emerald-500 bg-clip-text text-transparent">
                    {t('home.title_highlight')}
                </span>
            </h1>

            <p className="text-lg lg:text-xl text-slate-500 max-w-md leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-12 duration-1200 delay-150">
                {t('home.subtitle')}
            </p>
        </header>
    );
}
