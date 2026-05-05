import React from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/Common/PageHeader';
import { Users, ArrowLeft, ShieldCheck, User as UserIcon, ShieldAlert, Check, Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/Hooks/useTranslation';
import Modal from '@/Components/Common/Modal';
import { Button } from '@/Components/Common/Button';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface UserRoleManagementProps {
    users: User[];
    availableRoles: { name: string; value: string }[];
}

export default function UserRoleManagement({ users, availableRoles }: UserRoleManagementProps) {
    const { t } = useTranslation();
    const [confirmingUser, setConfirmingUser] = React.useState<User | null>(null);
    const [targetRole, setTargetRole] = React.useState<string | null>(null);

    const { patch, processing } = useForm({
        role: '',
    });

    const handleRoleUpdate = (user: User, newRole: string) => {
        setConfirmingUser(user);
        setTargetRole(newRole);
    };

    const confirmRoleUpdate = () => {
        if (!confirmingUser || !targetRole) return;

        router.patch(`/admin/users/${confirmingUser.id}/role`, { role: targetRole }, {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmingUser(null);
                setTargetRole(null);
            }
        });
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'super_admin': return <ShieldAlert className="w-4 h-4" />;
            case 'admin': return <ShieldCheck className="w-4 h-4" />;
            default: return <UserIcon className="w-4 h-4" />;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'super_admin': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'admin': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const getRoleLabel = (role: string) => {
        return t(`admin.role.${role}`);
    };

    return (
        <AppLayout title={t('admin.role_management_title') || 'Role Management'}>
            <Head title={t('admin.role_management_title') || 'Role Management'} />
            <PageHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            {t('admin.role_management_title') || 'Role Management'}
                        </h2>
                        <p className="text-sm font-medium text-slate-500">
                            {t('admin.role_management_subtitle') || 'Assign system roles to users to control access level'}
                        </p>
                    </div>
                </div>
            </PageHeader>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50 bg-slate-50/50 font-bold text-xs uppercase tracking-widest text-slate-400">
                                <th className="px-8 py-5 font-black">{t('admin.user') || 'User'}</th>
                                <th className="px-8 py-5 font-black">{t('admin.current_role') || 'Current Role'}</th>
                                <th className="px-8 py-5 font-black text-right">{t('admin.actions') || 'Assign Role'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map((user) => (
                                <tr key={user.id} className="group hover:bg-slate-50/30 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-slate-500 shadow-sm border border-white">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{user.name}</div>
                                                <div className="text-xs text-slate-400 font-medium tracking-tight">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-transparent ${getRoleColor(user.role)}`}>
                                            {getRoleIcon(user.role)}
                                            {getRoleLabel(user.role)}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {availableRoles.map((role) => (
                                                <button
                                                    key={role.value}
                                                    onClick={() => handleRoleUpdate(user, role.value)}
                                                    disabled={processing || user.role === role.value || user.role === 'super_admin'}
                                                    className={`p-2.5 rounded-xl transition-all duration-300 relative group/btn ${
                                                        user.role === role.value
                                                        ? 'bg-[#4B3BC9] text-white shadow-lg shadow-[#4B3BC9]/20 cursor-default'
                                                        : user.role === 'super_admin'
                                                        ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100'
                                                        : 'bg-slate-50 text-slate-400 hover:bg-primary hover:text-white border border-slate-100'
                                                    }`}
                                                >
                                                    {getRoleIcon(role.value)}
                                                    
                                                    {/* Tooltip */}
                                                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold uppercase tracking-widest leading-none">
                                                        {getRoleLabel(role.value)}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {processing && (
                <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
                    <Loader2 className="w-5 h-5 animate-spin text-[#4B3BC9]" />
                    <span className="text-sm font-bold tracking-tight">Updating database...</span>
                </div>
            )}

            <Modal
                show={!!confirmingUser}
                onClose={() => setConfirmingUser(null)}
                title={t('admin.confirm_role_change_title')}
                maxWidth="sm"
            >
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-50 text-[#4B3BC9] rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-black text-slate-900 mb-2">
                        {t('admin.confirm_role_change_title')}
                    </h4>
                    <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                        {t('admin.confirm_role_change_message', { 
                            name: confirmingUser?.name || '', 
                            role: targetRole ? getRoleLabel(targetRole) : '' 
                        })}
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={confirmRoleUpdate}
                            className="w-full"
                            variant="primary"
                            isLoading={processing}
                        >
                            {t('admin.confirm')}
                        </Button>
                        <Button
                            onClick={() => setConfirmingUser(null)}
                            className="w-full"
                            variant="secondary"
                        >
                            {t('admin.cancel')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
