import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';

interface CategoryIndexProps {
    categories: any[];
    available_icons: string[];
    available_colors: string[];
}

export default function Index({ categories, available_icons, available_colors }: CategoryIndexProps) {
    const { t } = useTranslation();

    return (
        <AppLayout>
            <Head title={t('categories.page.title')} />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white p-8 rounded-4xl shadow-sm border border-slate-100">
                        <h1 className="text-2xl font-black text-slate-900 mb-2">
                            {t('categories.page.title')}
                        </h1>
                        <p className="text-slate-500 mb-8">
                            {t('categories.page.description')}
                        </p>

                        <div className="bg-slate-50 p-12 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                            <p className="text-slate-400 font-medium">
                                {t('categories.page.coming_soon')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
