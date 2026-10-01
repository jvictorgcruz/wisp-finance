import { Head, Link } from '@inertiajs/react';
import { Settings, ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/Hooks/useTranslation';

export default function Maintenance() {
    const { t } = useTranslation();

    return (
        <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col items-center justify-center p-6 md:p-12 font-sans selection:bg-primary/20 relative">
            <Head title={t('maintenance.title')} />
            
            <div className="absolute top-8 md:top-12 left-8 right-8 flex justify-start items-center z-10 max-w-7xl mx-auto w-full px-4 lg:px-12">
                <Link 
                    href="/" 
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-editorial-wide text-slate-400 hover:text-primary transition-colors group"
                >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    {t('auth.back_to_home') || 'Back to Home'}
                </Link>
            </div>
            
            <main className="max-w-2xl w-full flex flex-col items-center text-center space-y-12">


                <div className="flex flex-col items-center space-y-8 mt-24">
                    <div className="relative">
                        <div className="absolute -inset-8 bg-primary/5 rounded-full blur-3xl"></div>
                        <div className="relative bg-white border border-slate-100 p-8 rounded-4xl shadow-sm flex items-center justify-center">
                            <Settings className="text-slate-400 w-16 h-16 md:w-20 md:h-20 animate-[spin_10s_linear_infinite]" strokeWidth={1} />
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">
                        {t('maintenance.title')}
                    </h1>
                    <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed max-w-md mx-auto">
                        {t('maintenance.subtitle')}
                    </p>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-sm">
                    {/* <Link href="#" className="bg-slate-900 text-white font-bold py-4 px-8 rounded-2xl transition-all hover:bg-slate-800 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/40 active:scale-95 flex items-center justify-center gap-2 group">
                        <Headset className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" strokeWidth={2} />
                        {t('maintenance.support')}
                    </Link>
                    <Link href="#" className="bg-white border border-slate-100 text-slate-900 font-bold py-4 px-8 rounded-2xl transition-all hover:border-slate-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/40 active:scale-95 flex items-center justify-center gap-2 group">
                        <Share2 className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" strokeWidth={2} />
                        {t('maintenance.social_media')}
                    </Link> */}
                </div>
            </main>

            {/* Footer */}
            <footer className="flex justify-center mt-auto py-12 w-full max-w-5xl">
                <p className="text-xs text-slate-400 font-medium">
                    &copy; {new Date().getFullYear()} Wisp Finance. {t('common.rights') || t('maintenance.rights')}
                </p>
            </footer>
        </div>
    );
}
