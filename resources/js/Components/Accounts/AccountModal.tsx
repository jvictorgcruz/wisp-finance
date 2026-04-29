import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import Modal from '@/Components/Common/Modal';
import TextField from '@/Components/Common/TextField';
import LucideIcon from '@/Components/Common/LucideIcon';
import DropdownSelector from '@/Components/Common/DropdownSelector';
import { Account } from './AccountRow';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type { Account };

interface AccountModalProps {
    show: boolean;
    onClose: () => void;
    mode: 'create' | 'edit' | 'subaccount';
    account?: Account | null;
    parentAccount?: Account | null;
    rootAccounts?: Account[];
    rootCategories?: any[];
    availableColors?: string[];
    availableIcons?: string[];
}

export default function AccountModal({ 
    show, 
    onClose, 
    mode, 
    account, 
    parentAccount,
    rootAccounts = [],
    rootCategories = [],
    availableColors = [],
    availableIcons = []
}: AccountModalProps) {
    const { t } = useTranslation();
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        type: 'asset',
        parent_Key: 'bank', 
        parent_id: null as number | null,
        ui_metadata: {
            icon: '', // Removed for accounts
            color: '#3b82f6',
        }
    });

    useEffect(() => {
        if (show) {
            if (mode === 'edit' && account) {
                setData({
                    name: account.name,
                    type: account.type,
                    parent_Key: account.parent_Key || '', 
                    parent_id: account.parent_id,
                    ui_metadata: {
                        icon: account.ui_metadata?.icon || '', 
                        color: account.ui_metadata?.color || '#3b82f6',
                    }
                });
            } else if (mode === 'subaccount' && parentAccount) {
                setData({
                    name: '',
                    type: parentAccount.type,
                    parent_Key: parentAccount.parent_Key || '', 
                    parent_id: parentAccount.id,
                    ui_metadata: {
                        icon: '',
                        color: parentAccount.ui_metadata?.color || '#3b82f6',
                    }
                });
            } else {
                const defaultCat = rootCategories.find(c => c.key === 'bank')!;
                const parent = rootAccounts.find(r => r.name === defaultCat.name);
                
                setData({
                    name: '',
                    type: defaultCat.type,
                    parent_Key: 'bank',
                    parent_id: parent?.id || null,
                    ui_metadata: {
                        icon: '',
                        color: '#3b82f6',
                    }
                });
            }
        } else {
            clearErrors();
        }
    }, [show, mode, account, parentAccount, rootAccounts, rootCategories]);

    const handleCategorySelect = (cat: any) => {
        if (cat.disabled) return;
        
        const parent = rootAccounts.find(r => r.name === cat.name);
        setData(d => ({
            ...d,
            type: cat.type,
            parent_Key: cat.key,
            parent_id: parent?.id || null
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (mode !== 'edit' && !data.parent_id) {
            console.error('Missing parent_id for account creation');
            return;
        }

        if (mode === 'edit' && account) {
            put(`/accounts/${account.id}`, {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        } else {
            post('/accounts', {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        }
    };

    const initials = data.name ? data.name.substring(0, 3).toUpperCase() : '';
    const title = mode === 'edit' 
        ? t('accounts.modal.title_edit') 
        : (mode === 'subaccount' 
            ? t('accounts.modal.title_subaccount', { 
                parent: parentAccount?.name.startsWith('accounts.') || parentAccount?.name.startsWith('categories.') 
                    ? t(parentAccount.name) 
                    : parentAccount?.name || '' 
            }) 
            : t('accounts.modal.title_create'));

    return (
        <Modal show={show} onClose={onClose} title={title} maxWidth="md">
            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Real-time Preview */}
                <div className="bg-slate-50/50 p-6 rounded-4xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-center">
                    <div 
                        className="w-16 h-16 rounded-4xl flex items-center justify-center text-xl font-black shadow-2xl transition-all duration-300"
                        style={{ 
                            backgroundColor: `${data.ui_metadata.color}35`, 
                            color: data.ui_metadata.color,
                            boxShadow: `0 20px 40px -12px ${data.ui_metadata.color}30`
                        }}
                    >
                        {data.ui_metadata.icon ? <LucideIcon name={data.ui_metadata.icon} className="w-8 h-8" /> : initials}
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-900 truncate max-w-[200px]">
                            {data.name || t('accounts.modal.preview_name_placeholder')}
                        </h4>
                        {(data.parent_Key) && (
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                {t(`accounts.cards.${data.parent_Key}`)}
                            </p>
                        )}
                    </div>
                </div>

                {/* Account Type Cards - ONLY IN CREATE MODE */}
                {mode === 'create' && (
                    <div className="space-y-4">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                            {t('accounts.modal.type_label')}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {rootCategories.map((cat: any) => {
                                const isActive = data.parent_Key === cat.key;
                                return (
                                    <button
                                        key={cat.key}
                                        type="button"
                                        disabled={cat.disabled}
                                        onClick={() => handleCategorySelect(cat)}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all group relative overflow-hidden",
                                            isActive 
                                                ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" 
                                                : "border-slate-100 hover:border-slate-300 hover:bg-slate-50",
                                            cat.disabled && "opacity-40 cursor-not-allowed grayscale"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-2xl flex items-center justify-center mb-3 transition-colors",
                                            isActive ? "bg-primary text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                                        )}>
                                            <LucideIcon name={cat.icon} className="w-5 h-5" />
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest",
                                            isActive ? "text-primary" : "text-slate-500"
                                        )}>
                                            {t(`accounts.cards.${cat.key}`)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    <div>
                        <TextField
                            id="name"
                            label={t('accounts.modal.name_label')}
                            value={data.name}
                            onChange={(val) => setData('name', val)}
                            placeholder={t(`accounts.modal.name_placeholders.${data.parent_Key}`) !== `accounts.modal.name_placeholders.${data.parent_Key}` 
                                ? t(`accounts.modal.name_placeholders.${data.parent_Key}`) 
                                : t('accounts.modal.name_placeholder')}
                            error={errors.name}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Compact Icon Selector */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                                Ícone
                            </label>
                            <DropdownSelector 
                                value={data.ui_metadata.icon || ''} 
                                onChange={(val: any) => setData('ui_metadata', { ...data.ui_metadata, icon: val })}
                            >
                                <DropdownSelector.Trigger className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-all">
                                    <div className="w-5 h-5 flex items-center justify-center text-slate-600">
                                        {data.ui_metadata.icon ? <LucideIcon name={data.ui_metadata.icon} className="w-4 h-4" /> : <span className="text-[10px] font-black">---</span>}
                                    </div>
                                </DropdownSelector.Trigger>
                                <DropdownSelector.Panel align="left" placement="top" className="w-[240px] p-3 grid grid-cols-5 gap-2 max-h-[250px] overflow-y-auto">
                                    <DropdownSelector.Option 
                                        value={''}
                                        className={({ selected }) => cn(
                                            "w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer",
                                            selected ? "border-primary bg-primary/10 text-primary" : "border-transparent text-slate-400 hover:bg-slate-100"
                                        )}
                                        title="Nenhum"
                                    >
                                        <span className="text-xs font-black">---</span>
                                    </DropdownSelector.Option>
                                    {availableIcons.map((icon: string) => (
                                        <DropdownSelector.Option 
                                            key={icon} 
                                            value={icon}
                                            className={({ selected }) => cn(
                                                "w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer",
                                                selected ? "border-primary bg-primary/10 text-primary" : "border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                                            )}
                                        >
                                            <LucideIcon name={icon} className="w-4 h-4" />
                                        </DropdownSelector.Option>
                                    ))}
                                </DropdownSelector.Panel>
                            </DropdownSelector>
                        </div>

                        {/* Compact Color Selector */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                                {t('accounts.modal.color_label')}
                            </label>
                            <DropdownSelector 
                                value={data.ui_metadata.color} 
                                onChange={(val: any) => setData('ui_metadata', { ...data.ui_metadata, color: val })}
                            >
                                <DropdownSelector.Trigger className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-all">
                                    <div 
                                        className="w-5 h-5 rounded-full" 
                                        style={{ backgroundColor: data.ui_metadata.color }}
                                    />
                                </DropdownSelector.Trigger>
                                <DropdownSelector.Panel align="right" placement="top" className="w-[200px] p-3 grid grid-cols-5 gap-2">
                                    {availableColors.map((color: string) => (
                                        <DropdownSelector.Option 
                                            key={color} 
                                            value={color}
                                            className={({ active, selected }) => cn(
                                                "w-7 h-7 rounded-full border-2 transition-all cursor-pointer",
                                                selected ? "ring-2 ring-primary ring-offset-2 border-white scale-110" : "border-transparent hover:scale-110"
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

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        {t('accounts.modal.cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-primary text-white px-10 py-3.5 rounded-2xl cursor-pointer font-black text-[11px] uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 active:scale-[0.98]"
                    >
                        {mode === 'edit' ? t('accounts.modal.submit_edit') : t('accounts.modal.submit_create')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
