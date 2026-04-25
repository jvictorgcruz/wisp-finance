import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import { Plus } from 'lucide-react';
import CategoryTree from '@/Components/Categories/CategoryTree';
import { Category } from '@/Components/Categories/CategoryRow';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CategoryIndexProps {
    category_tree: Category[];
    available_icons: string[];
    available_colors: string[];
}

export default function Index({ category_tree, available_icons, available_colors }: CategoryIndexProps) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'expense' | 'revenue'>('expense');

    const filteredTree = category_tree.filter(cat => cat.type === activeTab);

    return (
        <AppLayout title={t('categories.page.title')}>
            <Head title={t('categories.page.title')} />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">
                        {t('categories.page.title')}
                    </h2>
                    <p className="text-sm text-slate-500 font-medium leading-none">
                        {t('categories.page.description')}
                    </p>
                </div>
                <button 
                    onClick={() => console.log('Open Create Modal')} // Handled in Task 034
                    className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 cursor-pointer w-fit"
                >
                    <Plus className="w-4 h-4" />
                    {t('categories.page.create_btn')}
                </button>
            </div>

            <div className="space-y-6">
                {/* Tabs Filter */}
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab('expense')}
                        className={cn(
                            "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            activeTab === 'expense' 
                                ? "bg-white text-slate-900 shadow-sm" 
                                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                        )}
                    >
                        {t('categories.page.expense_tab')}
                    </button>
                    <button
                        onClick={() => setActiveTab('revenue')}
                        className={cn(
                            "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            activeTab === 'revenue' 
                                ? "bg-white text-slate-900 shadow-sm" 
                                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                        )}
                    >
                        {t('categories.page.income_tab')}
                    </button>
                </div>

                {/* Tree View */}
                <div className="max-w-4xl">
                    <CategoryTree 
                        categories={filteredTree}
                        onEdit={(cat) => console.log('Edit', cat)}
                        onDelete={(cat) => console.log('Delete', cat)}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
