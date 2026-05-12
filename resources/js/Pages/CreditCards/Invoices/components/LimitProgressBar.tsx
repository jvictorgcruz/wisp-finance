import { useTranslation } from '@/Hooks/useTranslation';

interface Props {
  limit: number;
  currentBalance: number;
}

export default function LimitProgressBar({ limit, currentBalance }: Props) {
  const { t } = useTranslation();
  
  const usagePercentage = limit > 0 ? (currentBalance / limit) * 100 : 0;
  const isOverLimit = currentBalance > limit;
  const displayPercentage = Math.min(usagePercentage, 100);

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-end">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {t('credit_cards.invoices.limit_usage')}
        </h3>
        <span className={`text-xs font-black ${isOverLimit ? 'text-rose-500' : 'text-slate-900'}`}>
          {usagePercentage.toFixed(1)}%
        </span>
      </div>
      
      <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full ${
            isOverLimit ? 'bg-rose-500' : 'bg-primary'
          }`}
          style={{ width: `${displayPercentage}%` }}
        />
      </div>
      
      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tight">
        <span>R$ 0,00</span>
        <span>{t('credit_cards.invoices.limit')}: R$ {(limit/100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
  );
}
