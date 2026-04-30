import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Settings, ArrowLeft, Save, Info, Settings2, CheckCircle2, XCircle, Search, X } from 'lucide-react';
import { useTranslation } from '@/Hooks/useTranslation';
import Modal from '@/Components/Common/Modal';
import TextField from '@/Components/Common/TextField';
import { Switch } from '@headlessui/react';

interface Setting {
    key: string;
    title: string;
    description: string;
    is_active: boolean;
    value: string | null;
}

interface SettingsProps {
    settings: Setting[];
    filters: {
        title?: string;
        status?: string;
    };
}

interface SettingCardProps {
    setting: Setting;
    onConfigure: (setting: Setting) => void;
}

function SettingCard({ setting, onConfigure }: SettingCardProps) {
    const { t } = useTranslation();

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md group">
            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <div className={`p-2 rounded-xl shrink-0 ${setting.is_active ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                        <Settings className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 
                            className="text-sm font-bold text-slate-900 leading-tight flex items-center gap-1.5"
                            title={setting.key}
                        >
                            {t(`settings.${setting.title}`)}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                            {t(`settings.${setting.description}`)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        setting.is_active 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'bg-slate-50 text-slate-400'
                    }`}>
                        {setting.is_active ? (
                            <>
                                <CheckCircle2 className="w-3 h-3" />
                                {t('settings.status_active')}
                            </>
                        ) : (
                            <>
                                <XCircle className="w-3 h-3" />
                                {t('settings.status_inactive')}
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => onConfigure(setting)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-primary hover:text-white text-slate-600 rounded-xl transition-all duration-300 text-xs font-bold"
                    >
                        <Settings2 className="w-3.5 h-3.5" />
                        {t('settings.configure')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Index({ settings }: SettingsProps) {
    const { t } = useTranslation();
    const [editingSetting, setEditingSetting] = React.useState<Setting | null>(null);
    const [processing, setProcessing] = React.useState(false);

    // Filter state
    const [titleSearch, setTitleSearch] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('all');

    const clearFilters = () => {
        setTitleSearch('');
        setStatusFilter('all');
    };

    // Client-side filtering logic
    const filteredSettings = React.useMemo(() => {
        return settings.filter((setting) => {
            const translatedTitle = t(`settings.${setting.title}`).toLowerCase();
            const translatedDescription = t(`settings.${setting.description}`).toLowerCase();
            const keyTerm = setting.key.toLowerCase();
            const search = titleSearch.toLowerCase();

            const matchesSearch = !titleSearch || 
                translatedTitle.includes(search) || 
                translatedDescription.includes(search) ||
                keyTerm.includes(search);

            const matchesStatus = statusFilter === 'all' || 
                (statusFilter === 'active' && setting.is_active) ||
                (statusFilter === 'inactive' && !setting.is_active);

            return matchesSearch && matchesStatus;
        });
    }, [settings, titleSearch, statusFilter, t]);

    // Form state inside modal
    const [formActive, setFormActive] = React.useState(false);
    const [formValue, setFormValue] = React.useState('');

    React.useEffect(() => {
        if (editingSetting) {
            setFormActive(editingSetting.is_active);
            setFormValue(editingSetting.value || '');
        }
    }, [editingSetting]);

    const handleSave = () => {
        if (!editingSetting) return;

        setProcessing(true);
        router.put('/admin/settings', { 
            key: editingSetting.key, 
            is_active: formActive, 
            value: formValue 
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingSetting(null);
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout title={t('settings.title')}>
            <Head title={t('settings.title')} />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <Link 
                            href="/dashboard" 
                            className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white transition-colors"
                            title={t('settings.back')}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            {t('settings.title')}
                        </h1>
                    </div>
                    <p className="text-sm font-medium text-slate-500">
                        {t('settings.subtitle')}
                    </p>
                </div>

            </div>
            
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex-1 relative">
                    <TextField
                        placeholder={t('settings.search_placeholder')}
                        value={titleSearch}
                        onChange={setTitleSearch}
                        icon={<Search className="w-4 h-4" />}
                    />
                </div>
                <div className="w-full md:w-64 relative group">
                    <label className="absolute left-3 top-[-8px] px-1 bg-white block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 z-10 transition-colors group-focus-within:text-primary">
                        {t('settings.filter_status')}
                    </label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer text-slate-600 font-medium"
                    >
                        <option value="all">{t('settings.all_statuses')}</option>
                        <option value="active">{t('settings.status_active')}</option>
                        <option value="inactive">{t('settings.status_inactive')}</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ArrowLeft className="w-3.5 h-3.5 -rotate-90" />
                    </div>
                </div>
                {(titleSearch || statusFilter !== 'all') && (
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-2 group"
                    >
                        <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                        {t('settings.clear_filters')}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-3">
                {filteredSettings.map((setting) => (
                    <SettingCard 
                        key={setting.key} 
                        setting={setting} 
                        onConfigure={setEditingSetting}
                    />
                ))}

                {filteredSettings.length === 0 && (
                    <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Info className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{t('settings.no_settings_found')}</h3>
                        <p className="text-slate-500">{t('settings.no_settings_found_desc')}</p>
                    </div>
                )}
            </div>

            {/* Configuration Modal */}
            <Modal
                show={!!editingSetting}
                onClose={() => !processing && setEditingSetting(null)}
                title={t(`settings.edit_setting`)}
                maxWidth='2xl'
            >
                <div className="space-y-8">
                    {editingSetting && (
                        <div>
                            <h4 className="text-xl font-black text-slate-900 leading-tight">
                                {t(`settings.${editingSetting.title}`)}
                            </h4>
                            <p className="text-base text-slate-500 mt-2 leading-relaxed">
                                {t(`settings.${editingSetting.description}`)}
                            </p>
                        </div>
                    )}
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">{t('settings.status_label')}</h4>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${formActive ? 'text-blue-600' : 'text-slate-400'}`}>
                                    {formActive ? t('settings.status_active') : t('settings.status_inactive')}
                                </span>
                                <Switch
                                    checked={formActive}
                                    onChange={setFormActive}
                                    className={`${
                                        formActive ? 'bg-blue-600' : 'bg-slate-200'
                                    } relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:ring-offset-2`}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`${
                                            formActive ? 'translate-x-5' : 'translate-x-0'
                                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                    />
                                </Switch>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5 ml-1">
                            {t('settings.setting_value')}
                        </label>
                        <input
                            type="text"
                            value={formValue}
                            onChange={(e) => setFormValue(e.target.value)}
                            placeholder={t('settings.setting_value_placeholder')}
                            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 px-5 text-slate-700 font-medium focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                        <button
                            onClick={() => setEditingSetting(null)}
                            disabled={processing}
                            className="px-6 py-3 rounded-xl font-bold text-sm text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {t('settings.cancel')}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={processing}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white transition-all shadow-lg ${
                                processing ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'
                            }`}
                        >
                            <Save className="w-4 h-4" />
                            {t('settings.save')}
                        </button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
