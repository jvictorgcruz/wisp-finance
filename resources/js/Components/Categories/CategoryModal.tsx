import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import Modal from '@/Components/Common/Modal';
import TextField from '@/Components/Common/TextField';
import LucideIcon from '@/Components/Common/LucideIcon';
import DropdownSelector from '@/Components/Common/DropdownSelector';
import { Category } from './CategoryRow';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Check, Loader2, ArrowRight } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CategoryModalProps {
    show: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    category?: Category | null;
    parentCategory?: Category | null;
    availableColors?: string[];
    availableIcons?: string[];
    initialType?: 'expense' | 'revenue';
}

export default function CategoryModal({ 
    show, 
    onClose, 
    mode, 
    category, 
    parentCategory,
    availableColors = [],
    availableIcons = [],
    initialType = 'expense'
}: CategoryModalProps) {
    const { t } = useTranslation();

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        type: initialType as 'expense' | 'revenue',
        parent_id: null as number | null,
        ui_metadata: {
            icon: 'Package',
            color: '#3b82f6',
        }
    });

    useEffect(() => {
        if (show) {
            if (mode === 'edit' && category) {
                setData({
                    name: category.name,
                    type: category.type as any,
                    parent_id: category.parent_id,
                    ui_metadata: {
                        icon: category.ui_metadata?.icon || 'Package',
                        color: category.ui_metadata?.color || '#3b82f6',
                    }
                });
            } else if (parentCategory) {
                setData({
                    name: '',
                    type: parentCategory.type as any,
                    parent_id: parentCategory.id,
                    ui_metadata: {
                        icon: 'Package',
                        color: parentCategory.ui_metadata?.color || '#3b82f6',
                    }
                });
            } else {
                setData({
                    name: '',
                    type: initialType as any,
                    parent_id: null,
                    ui_metadata: {
                        icon: 'Package',
                        color: '#3b82f6',
                    }
                });
            }
        } else {
            clearErrors();
        }
    }, [show, mode, category, parentCategory, initialType]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (mode === 'edit' && category) {
            put(`/categories/${category.id}`, {
                onSuccess: () => onClose(),
            });
        } else {
            post('/categories', {
                onSuccess: () => onClose(),
            });
        }
    };

    const isSub = !!data.parent_id || !!parentCategory;
    const title = mode === 'edit' 
        ? t('categories.modal.title_edit') 
        : (isSub ? t('categories.modal.title_add_sub_to', { name: parentCategory?.name || '' }) : t('categories.modal.title_create'));

    return (
        <Modal show={show} onClose={onClose} title={title} maxWidth="md">
            <div className="overflow-hidden">
                <form 
                    onSubmit={onSubmit} 
                    className="space-y-6"
                >
                    {/* Preview */}
                    <div className="bg-slate-50/50 p-6 rounded-4xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-center">
                        <div 
                            className="w-16 h-16 rounded-4xl flex items-center justify-center text-xl font-black shadow-2xl transition-all duration-300"
                            style={{ 
                                backgroundColor: `${data.ui_metadata.color}35`, 
                                color: data.ui_metadata.color,
                                boxShadow: `0 20px 40px -12px ${data.ui_metadata.color}30`
                            }}
                        >
                            <LucideIcon name={data.ui_metadata.icon} className="w-8 h-8" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Type Selection or Parent Label */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block">
                                {isSub ? t('categories.modal.parent_label') : t('categories.modal.type_label')}
                            </label>
                            
                            {isSub ? (
                                <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                        <LucideIcon name={parentCategory?.ui_metadata?.icon || 'Package'} className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-900">{parentCategory?.name}</span>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest",
                                            data.type === 'revenue' ? "text-emerald-600" : "text-rose-600"
                                        )}>
                                            {data.type === 'revenue' ? t('categories.page.income_tab') : t('categories.page.expense_tab')}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex bg-slate-100 p-1 rounded-2xl h-[56px] w-full">
                                    <button
                                        type="button"
                                        disabled={mode === 'edit'}
                                        onClick={() => setData('type', 'expense')}
                                        className={cn(
                                            "flex-1 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                            data.type === 'expense' ? "bg-white text-rose-600 shadow-md" : "text-slate-400 hover:text-slate-600 disabled:opacity-50"
                                        )}
                                    >
                                        {t('categories.page.expense_tab')}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={mode === 'edit'}
                                        onClick={() => setData('type', 'revenue')}
                                        className={cn(
                                            "flex-1 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                            data.type === 'revenue' ? "bg-white text-emerald-600 shadow-md" : "text-slate-400 hover:text-slate-600 disabled:opacity-50"
                                        )}
                                    >
                                        {t('categories.page.income_tab')}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Name Input */}
                        <div>
                            <TextField
                                id="name"
                                label={t('categories.modal.name_label')}
                                value={data.name}
                                onChange={(val) => setData('name', val)}
                                placeholder={t('categories.modal.name_placeholder')}
                                error={errors.name}
                                required
                                autoFocus
                                className="h-[56px] text-lg font-bold"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                                    {t('categories.modal.icon_label')}
                                </label>
                                <DropdownSelector 
                                    value={data.ui_metadata.icon} 
                                    onChange={(val: any) => setData('ui_metadata', { ...data.ui_metadata, icon: val })}
                                >
                                    <DropdownSelector.Trigger className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 transition-all">
                                        <LucideIcon name={data.ui_metadata.icon} className="w-5 h-5 text-slate-600" />
                                    </DropdownSelector.Trigger>
                                    <DropdownSelector.Panel align="left" placement="top" className="w-[280px] p-2 grid grid-cols-5 gap-2 max-h-[250px] overflow-y-auto">
                                        {availableIcons.map((icon: string) => (
                                            <DropdownSelector.Option 
                                                key={icon} 
                                                value={icon}
                                                className={({ selected }) => cn(
                                                    "w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer",
                                                    selected ? "bg-primary text-white scale-110 shadow-lg" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                                )}
                                            >
                                                <LucideIcon name={icon} className="w-5 h-5" />
                                            </DropdownSelector.Option>
                                        ))}
                                    </DropdownSelector.Panel>
                                </DropdownSelector>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                                    {t('categories.modal.color_label')}
                                </label>
                                <DropdownSelector 
                                    value={data.ui_metadata.color} 
                                    onChange={(val: any) => setData('ui_metadata', { ...data.ui_metadata, color: val })}
                                >
                                    <DropdownSelector.Trigger className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 transition-all">
                                        <div className="w-5 h-5 rounded-full shadow-inner" style={{ backgroundColor: data.ui_metadata.color }} />
                                    </DropdownSelector.Trigger>
                                    <DropdownSelector.Panel align="right" placement="top" className="w-[220px] p-3 grid grid-cols-5 gap-2">
                                        {availableColors.map((color: string) => (
                                            <DropdownSelector.Option 
                                                key={color} 
                                                value={color}
                                                className={({ selected }) => cn(
                                                    "w-8 h-8 rounded-full border-2 transition-all cursor-pointer",
                                                    selected ? "ring-2 ring-primary ring-offset-2 border-white scale-110 shadow-lg" : "border-transparent hover:scale-110"
                                                )}
                                                style={{ backgroundColor: color }}
                                            >
                                                <div className="hidden" />
                                            </DropdownSelector.Option>
                                        ))}
                                    </DropdownSelector.Panel>
                                </DropdownSelector>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 mt-8">
                        <button type="button" onClick={onClose} className="px-6 py-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
                            {t('categories.modal.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-primary text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center gap-3 active:scale-95"
                        >
                            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : (mode === 'edit' ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />)}
                            {mode === 'edit' ? t('categories.modal.submit_edit') : t('categories.modal.submit_create')}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
