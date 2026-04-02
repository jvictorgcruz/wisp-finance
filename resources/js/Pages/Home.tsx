import { Head } from '@inertiajs/react';

export default function Home() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900">
            <Head title="Bem-vindo" />
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100 flex flex-col items-center">
                <h1 className="text-3xl font-bold text-center mb-2 tracking-tight">
                    Wisp Finance
                </h1>
            </div>
        </div>
    );
}
