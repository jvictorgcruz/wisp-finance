import { PropsWithChildren } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Logo from '@/Components/Common/Logo';
import LanguageSelector from '@/Components/Navigation/LanguageSelector';
import { useTranslation } from '@/Hooks/useTranslation';

interface Props {
    title: string;
    subtitle?: string;
}

export default function AuthLayout({ title, subtitle, children }: PropsWithChildren<Props>) {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col sm:justify-center items-center pt-6 sm:pt-0 px-4 relative">
            <Head title={title} />

            {/* Top Navigation */}
            <div className="absolute top-8 md:top-12 left-8 right-8 flex justify-between items-center z-10 max-w-7xl mx-auto w-full px-4 lg:px-12">
                <Link 
                    href="/" 
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-editorial-wide text-slate-400 hover:text-primary transition-colors group"
                >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    {t('auth.back_to_home') || 'Back to Home'}
                </Link>
                
                <LanguageSelector 
                    className="w-48" 
                    onChange={(next) => router.visit(window.location.pathname.replace(/^\/(en|pt)/, `/${next}`) + window.location.search)}
                />
            </div>

            <div className="w-full sm:max-w-md mt-20 sm:mt-6 px-8 py-10 bg-white border border-slate-100 shadow-soft rounded-xl animate-in fade-in zoom-in-95 duration-500">
                <div className="mb-10 flex flex-col items-center gap-3">
                    <Link href="/">
                        <Logo showText={false} imageSize={6} />
                    </Link>
                    
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="mt-1 text-sm text-slate-500">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {children}
            </div>
            
            <div className="mt-8 text-center sm:max-w-md w-full">
                <p className="text-xs text-slate-400 font-medium">
                    &copy; {new Date().getFullYear()} Wisp Finance. {t('common.rights')}
                </p>
            </div>
        </div>
    );
}
