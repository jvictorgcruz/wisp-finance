import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
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
    const { auth, demo_mode } = usePage<any>().props;
    const { t, localeRoute } = useTranslation();
    const [isDemoLoading, setIsDemoLoading] = React.useState(false);

    const isAuthed = Boolean(auth?.user);

    const handleDemo = () => {
        setIsDemoLoading(true);
        router.get(localeRoute('/demo'), {}, {
            onFinish: () => setIsDemoLoading(false),
        });
    };

    return (
        <div 
            className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-2 animate-in fade-in slide-in-from-bottom-12 duration-1500 delay-300 ${className}`}
            role="region"
            aria-label={t('home.hero_carousel.aria_cta')}
        >
            {isAuthed ? (
                <Link 
                    href="/accounts" 
                    className="h-14 sm:h-15 px-8 bg-slate-900 text-white rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                    aria-label={t('home.nav.go_to_app')}
                >
                    {t('home.nav.go_to_app')}
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            ) : (
                <>
                    <Link 
                        href={localeRoute('/register')} 
                        className="h-14 sm:h-15 px-7 sm:px-8 bg-primary text-white rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        aria-label={t('home.cta')}
                    >
                        {t('home.cta')}
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    {demo_mode && (
                        <button
                            type="button"
                            onClick={handleDemo}
                            disabled={isDemoLoading}
                            className="h-12 sm:h-13 px-5 sm:px-6 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] shadow-xs group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-70 disabled:cursor-not-allowed"
                            aria-label={t('home.cta_demo')}
                        >
                            {isDemoLoading ? (
                                <div className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-700 rounded-full animate-spin" />
                            ) : (
                                t('home.cta_demo')
                            )}
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
