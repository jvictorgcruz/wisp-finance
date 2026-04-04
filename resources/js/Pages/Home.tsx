import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    ArrowRight, Maximize2, Zap,
    Target
} from 'lucide-react';
import logo from '@images/logo.png';
import { useTranslation } from '@/Hooks/useTranslation';
import LanguageSelector from '@/Components/Navigation/LanguageSelector';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="bg-white p-8 rounded-4xl border border-slate-100 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 group hover:-translate-y-1">
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
            <Icon className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2 truncate">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed font-medium">{description}</p>
    </div>
);

export default function Home() {
    const { auth } = usePage<any>().props;
    const { t, locale } = useTranslation();

    // Helper for guest links with locale prefix
    const localeLink = (path: string) => `/${locale}${path}`;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary/20">
            <Head title={t('home.title') + " " + t('home.title_highlight')} />

            {/* Navigation Header */}
            <nav className="h-24 flex items-center justify-between px-8 lg:px-20 max-w-7xl mx-auto">
                <div className="flex items-center gap-0.5 group cursor-pointer">
                    <img src={logo} alt="Wisp Logo" className="w-9 h-9 object-contain group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-2xl tracking-tighter">Wisp</span>
                </div>

                <div className="flex items-center gap-6">
                    <LanguageSelector 
                        className="w-48 hidden md:block" 
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
                                href={localeLink('/login')} 
                                className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                {t('home.nav.login')}
                            </Link>
                            <Link 
                                href={localeLink('/register')} 
                                className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                            >
                                {t('home.nav.register')}
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <main className="px-8 lg:px-20 max-w-7xl mx-auto pt-20 lg:pt-32 pb-20 overflow-hidden">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-10 relative z-10">
                        <h1 className="text-4xl lg:text-6xl font-black tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            {t('home.title')} <br />
                            <span className="text-primary">{t('home.title_highlight')}</span>
                        </h1>

                        <p className="text-lg lg:text-xl text-slate-500 max-w-md leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-12 duration-1200 delay-150">
                            {t('home.subtitle')}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-in fade-in slide-in-from-bottom-12 duration-1500 delay-300">
                            <Link 
                                href={localeLink('/register')} 
                                className="h-16 px-10 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-200 group"
                            >
                                {t('home.cta')}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* Hero Visual Placeholder */}
                    <div className="relative animate-in fade-in zoom-in duration-1500">
                        <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full scale-110" />
                        <div className="relative bg-white aspect-4/3 rounded-[3rem] border border-white p-4 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden">
                            <div className="w-full h-full bg-slate-50 rounded-4xl border border-slate-100 flex flex-col p-8 space-y-6">
                                <div className="h-3 w-1/3 bg-slate-200 rounded-full" />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="h-32 bg-white rounded-3xl border border-slate-100 shadow-sm" />
                                    <div className="h-32 bg-white rounded-3xl border border-slate-100 shadow-sm" />
                                </div>
                                <div className="space-y-3">
                                    <div className="h-2 w-full bg-slate-100 rounded-full" />
                                    <div className="h-2 w-5/6 bg-slate-100 rounded-full" />
                                    <div className="h-2 w-4/6 bg-slate-100 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Features Section */}
            <section className="bg-white py-32 px-8 lg:px-20 border-t border-slate-100">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center space-y-4 mb-20">
                        <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-slate-900">{t('home.features_title')}</h2>
                        <p className="text-slate-500 font-medium max-w-lg mx-auto">{t('home.features_subtitle')}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={Target}
                            title={t('home.feature_1_title')}
                            description={t('home.feature_1_desc')}
                        />
                        <FeatureCard 
                            icon={Zap}
                            title={t('home.feature_2_title')}
                            description={t('home.feature_2_desc')}
                        />
                        <FeatureCard 
                            icon={Maximize2}
                            title={t('home.feature_3_title')}
                            description={t('home.feature_3_desc')}
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-8 lg:px-20 text-center space-y-6">
                <div className="flex items-center justify-center gap-0.5">
                    <img src={logo} alt="Wisp Logo" className="w-6 h-6 " />
                    <span className="font-bold text-lg tracking-tighter">Wisp</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
                    Wisp Finance &bull; {new Date().getFullYear()}
                </p>
            </footer>
        </div>
    );
}
