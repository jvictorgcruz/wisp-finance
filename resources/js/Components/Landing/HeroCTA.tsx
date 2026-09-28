import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/Hooks/useTranslation';

interface HeroCTAProps {
    className?: string;
}

/**
 * HeroCTA component handles primary call-to-action buttons for the hero section.
 * Automatically checks authentication state to redirect visitors to registration or
 * logged-in users directly to their dashboard/accounts.
 */
export default function HeroCTA({ className = '' }: HeroCTAProps) {
    const { auth } = usePage<any>().props;
    const { t, localeRoute } = useTranslation();

    const isAuthed = Boolean(auth?.user);

    return (
        <div 
            className={`flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-2 animate-in fade-in slide-in-from-bottom-12 duration-1500 delay-300 ${className}`}
            role="region"
            aria-label={t('home.hero_carousel.aria_cta')}
        >
            {isAuthed ? (
                <Link 
                    href="/accounts" 
                    className="h-16 px-10 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                    aria-label={t('home.nav.go_to_app')}
                >
                    {t('home.nav.go_to_app')}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            ) : (
                <>
                    <Link 
                        href={localeRoute('/register')} 
                        className="h-16 px-10 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        aria-label={t('home.cta')}
                    >
                        {t('home.cta')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </>
            )}
        </div>
    );
}
