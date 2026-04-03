import { PropsWithChildren } from 'react';
import { Head, Link } from '@inertiajs/react';
import logo from '@images/logo.png';

interface Props {
    title: string;
    subtitle?: string;
}

export default function AuthLayout({ title, subtitle, children }: PropsWithChildren<Props>) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col sm:justify-center items-center pt-6 sm:pt-0 px-4">
            <Head title={title} />

            <div className="w-full sm:max-w-md mt-6 px-8 py-10 bg-white border border-slate-100 shadow-soft rounded-xl animate-in fade-in zoom-in-95 duration-500">
                <div className="mb-10 flex flex-col items-center gap-3">
                    <Link href="/">
                        <img src={logo} alt="Wisp Logo" className="w-12 h-12 object-contain hover:scale-110 transition-transform" />
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
                <p className="text-sm text-slate-400 font-medium">
                    &copy; {new Date().getFullYear()} Wisp Finance.
                </p>
            </div>
        </div>
    );
}
