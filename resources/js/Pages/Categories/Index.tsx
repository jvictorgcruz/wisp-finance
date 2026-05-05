import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/Common/PageHeader';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import { Plus } from 'lucide-react';
import CategoryTree from '@/Components/Categories/CategoryTree';
import { Category } from '@/Components/Categories/CategoryRow';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import CategoryModal from '@/Components/Categories/CategoryModal';
import { useEffect } from 'react';

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
    const { props } = usePage();
    const [activeTab, setActiveTab] = useState<'expense' | 'revenue'>('expense');
    
    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedParent, setSelectedParent] = useState<Category | null>(null);

    // Auto-open Add Sub after creation
    useEffect(() => {
        const flash = props.flash as any;
        if (flash?.new_category_id) {
            const newCat = category_tree.find(c => c.id === flash.new_category_id);
            if (newCat) {
                handleAddSub(newCat);
            }
        }
    }, [props.flash, category_tree]);

    const filteredTree = category_tree.filter(cat => cat.type === activeTab);

    const handleCreate = () => {
        setSelectedCategory(null);
        setSelectedParent(null);
        setModalMode('create');
        setModalOpen(true);
    };

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setSelectedParent(null);
        setModalMode('edit');
        setModalOpen(true);
    };

    const handleAddSub = (category: Category) => {
        setSelectedCategory(null);
        setSelectedParent(category);
        setModalMode('create');
        setModalOpen(true);
    };

    const handleDelete = (category: Category) => {
        if (!confirm(t('categories.actions.confirm_delete'))) return;
        
        // @ts-ignore
        import('@inertiajs/react').then(({ router }) => {
            router.delete(`/categories/${category.id}`);
        });
    };

    return (
        <AppLayout title={t('categories.page.title')}>
            <Head title={t('categories.page.title')} />
            
            <>
                <PageHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black tracking-tight text-slate-900">
                                {t('categories.page.title')}
                            </h2>
                            <p className="text-sm text-slate-500 font-medium">
                                {t('categories.page.description')}
                            </p>
                        </div>
                        <button 
                            onClick={handleCreate}
                            className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all cursor-pointer w-fit"
                        >
                            <Plus className="w-4 h-4" />
                            {t('categories.page.create_btn')}
                        </button>
                    </div>

                    {/* Tabs Filter */}
                    <div className="flex items-center gap-2 bg-slate-100 mt-4 p-1 rounded-2xl w-fit mb-4">
                        <button
                            onClick={() => setActiveTab('expense')}
                            className={cn(
                                "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                activeTab === 'expense' 
                                    ? "bg-white text-slate-900 border border-slate-200" 
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
                                    ? "bg-white text-slate-900 border border-slate-200" 
                                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                            )}
                        >
                            {t('categories.page.income_tab')}
                        </button>
                    </div>
                </PageHeader>

                {/* Tree View */}
                <div className="max-w-4xl pb-20">
                    <CategoryTree 
                        categories={filteredTree}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAddSub={handleAddSub}
                    />
                </div>

                <CategoryModal
                    show={modalOpen}
                    onClose={() => setModalOpen(false)}
                    mode={modalMode}
                    category={selectedCategory}
                    parentCategory={selectedParent}
                    availableColors={available_colors}
                    availableIcons={available_icons}
                    initialType={activeTab}
                />
            </>
        </AppLayout>
    );
}
