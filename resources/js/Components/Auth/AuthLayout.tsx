import React, { PropsWithChildren } from 'react';
import { Head, Link } from '@inertiajs/react';

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
                        <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
                            <svg 
                                className="w-7 h-7 text-white" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M13 10V3L4 14h7v7l9-11h-7z" 
                                />
                            </svg>
                        </div>
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
                    &copy; {new Date().getFullYear()} Wisp Finance. Precision Minimalism.
                </p>
            </div>
        </div>
    );
}
