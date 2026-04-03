import AppLayout from '@/Layouts/AppLayout';
import { Plus, Wallet } from 'lucide-react';

export default function Accounts() {
    return (
        <AppLayout title="Contas e Categorias">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-sm text-slate-500 font-medium leading-none">
                        Gerencie seu plano de contas e categorias financeiras.
                    </p>
                </div>
                <button className="bg-brand text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-brand/90 transition-all shadow-lg shadow-brand/20">
                    <Plus className="w-4 h-4" />
                    Nova Conta
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                <div className="md:col-span-2 space-y-6">
                    {/* Placeholder para a lista de contas */}
                    <div className="bg-white rounded-4xl border border-slate-100 p-12 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                            <Wallet className="w-8 h-8 text-slate-300" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-slate-900">Nenhuma conta encontrada</h3>
                            <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                Comece criando sua primeira conta real ou use as contas de sistema geradas no setup.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Placeholder para Resumo Lateral */}
                    <div className="bg-slate-900 text-white rounded-4xl p-8 shadow-xl shadow-slate-200">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Patrimônio Total</h4>
                        <div className="text-3xl font-black tracking-tight">R$ 0,00</div>
                        <div className="mt-6 p-4 bg-white/10 rounded-2xl border border-white/10 text-[10px] font-bold uppercase tracking-widest">
                            Contexto de Precisão Ativado
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
