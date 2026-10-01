import { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    ShieldCheck, Zap,
    Menu, X,
    CreditCard
} from 'lucide-react';
import Logo from '@/Components/Common/Logo';
import HeroSection from '@/Components/Landing/HeroSection';
import { useTranslation } from '@/Hooks/useTranslation';
import LanguageSelector from '@/Components/Navigation/LanguageSelector';
import { DEFAULT_APP_TITLE } from '@/constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="bg-white p-8 rounded-4xl border border-slate-100 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 group hover:-translate-y-1">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 transition-colors">
            <Icon className="w-6 h-6 text-primary transition-colors" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2 truncate">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed font-medium">{description}</p>
    </div>
);

export default function Home() {
    const { auth } = usePage<any>().props;
    const { t, localeRoute } = useTranslation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary/20 overflow-x-hidden">
            <Head title={DEFAULT_APP_TITLE} />

            <nav className="h-24 flex items-center justify-between px-8 lg:px-20 max-w-7xl mx-auto">
                <Logo />

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    <LanguageSelector 
                        variant="full"
                        className="w-auto" 
                        onChange={(next) => router.visit(window.location.pathname.replace(/^\/(en|pt)/, `/${next}`) + window.location.search)}
                    />
                    {auth.user ? (
                        <Link
                            href="/accounts"
                            className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-200"
                        >
                            {t('home.nav.go_to_app')}
                        </Link>
                    ) : (
                        <>
                            <Link 
                                href={localeRoute('/login')} 
                                className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                {t('home.nav.login')}
                            </Link>
                            <Link 
                                href={localeRoute('/register')} 
                                className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                {t('home.nav.register')}
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="md:hidden p-2 -mr-2 text-slate-500 hover:text-slate-900 transition-colors"
                    aria-label="Open menu"
                >
                    <Menu className="w-6 h-6" />
                </button>

            </nav>

            {/* Mobile Sidebar */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-100 md:hidden">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" 
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    
                    {/* Sidebar */}
                    <div className="absolute right-0 top-0 bottom-0 w-70 bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <Logo />
                            <button 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 -mr-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="flex-1 py-6 px-6 flex flex-col gap-6">
                            <div>
                                <LanguageSelector 
                                    variant="full"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl" 
                                    onChange={(next) => router.visit(window.location.pathname.replace(/^\/(en|pt)/, `/${next}`) + window.location.search)}
                                />
                            </div>
                            
                            <div className="h-px bg-slate-100" />

                            <div className="flex flex-col gap-4">
                                {auth.user ? (
                                    <Link
                                        href="/accounts"
                                        className="w-full text-center bg-slate-900 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                                    >
                                        {t('home.nav.go_to_app')}
                                    </Link>
                                ) : (
                                    <>
                                        <Link 
                                            href={localeRoute('/login')} 
                                            className="w-full text-center bg-slate-100 text-slate-900 px-6 py-3 rounded-full font-bold text-sm hover:bg-slate-200 transition-colors"
                                        >
                                            {t('home.nav.login')}
                                        </Link>
                                        <Link 
                                            href={localeRoute('/register')} 
                                            className="w-full text-center bg-primary text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                                        >
                                            {t('home.nav.register')}
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main>
                <HeroSection />
            </main>

            <section id="recursos" className="bg-white py-32 px-8 lg:px-20 border-t border-slate-100">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center space-y-4 mb-20">
                        <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-slate-900">{t('home.features_title')}</h2>
                        <p className="text-slate-500 font-medium max-w-lg mx-auto text-balance">{t('home.features_subtitle')}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={Zap}
                            title={t('home.feature_1_title')}
                            description={t('home.feature_1_desc')}
                        />
                        <FeatureCard 
                            icon={CreditCard}
                            title={t('home.feature_2_title')}
                            description={t('home.feature_2_desc')}
                        />
                        <FeatureCard 
                            icon={ShieldCheck}
                            title={t('home.feature_3_title')}
                            description={t('home.feature_3_desc')}
                        />
                    </div>
                </div>
            </section>

            <footer className="py-20 px-8 lg:px-20 text-center space-y-6">
                <div className="flex justify-center">
                    <Logo imageSize={5} textSize="text-lg" />
                </div>
                <p className="text-xs text-slate-400 font-medium">
                    &copy; {new Date().getFullYear()} Wisp Finance. {t('common.rights')}
                </p>
            </footer>
        </div>
    );
}
