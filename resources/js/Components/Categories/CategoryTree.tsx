import React from 'react';
import CategoryRow, { Category } from './CategoryRow';
import { useTranslation } from '@/Hooks/useTranslation';
import Logo from '../Common/Logo';

interface CategoryTreeProps {
    categories: Category[];
    onEdit?: (category: Category) => void;
    onDelete?: (category: Category) => void;
    onAddSub?: (category: Category) => void;
}

export default function CategoryTree({ categories, onEdit, onDelete, onAddSub }: CategoryTreeProps) {
    const { t } = useTranslation();

    if (categories.length === 0) {
        return (
            <div className="bg-white rounded-4xl border border-slate-100 p-12 flex flex-col items-center justify-center text-center space-y-4">
                <Logo />
                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900">{t('categories.page.empty_title')}</h3>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto">
                        {t('categories.page.empty_desc')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/50 backdrop-blur-sm rounded-4xl border border-slate-100 overflow-hidden">
            <div className="divide-y divide-slate-100">
                {categories.map(category => (
                    <CategoryRow 
                        key={category.id} 
                        category={category} 
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onAddSub={onAddSub}
                    />
                ))}
            </div>
        </div>
    );
}
