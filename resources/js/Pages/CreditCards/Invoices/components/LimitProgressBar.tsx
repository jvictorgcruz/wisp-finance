import { useTranslation } from '@/Hooks/useTranslation';

interface Props {
  limit: number;
  currentBalance: number;
}

export default function LimitProgressBar({ limit, currentBalance }: Props) {
  const { t } = useTranslation();
  
  const usagePercentage = limit > 0 ? (currentBalance / limit) * 100 : 0;
  const isOverLimit = currentBalance > limit;
  
  // Visual logic: 
  // - If over limit, the bar represents the proportion of the limit, 
  //   but we might want to cap it at 100% and use a different color 
  //   or show the true percentage.
  // - Premium design: a secondary bar or a glowing red indicator.
  
  const displayPercentage = Math.min(usagePercentage, 100);

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-sm font-medium text-slate-400">
          {t('credit_cards.invoices.limit_usage')}
        </span>
        <span className={`text-sm font-bold ${isOverLimit ? 'text-rose-500' : 'text-slate-200'}`}>
          {usagePercentage.toFixed(1)}%
        </span>
      </div>
      
      <div className="relative h-3 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner">
        <div 
          className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out rounded-full ${
            isOverLimit 
              ? 'bg-linear-to-r from-rose-600 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]' 
              : 'bg-linear-to-r from-indigo-600 to-violet-500'
          }`}
          style={{ width: `${displayPercentage}%` }}
        />
        
        {isOverLimit && (
          <div 
            className="absolute top-0 left-0 h-full bg-rose-500/20 animate-pulse"
            style={{ width: '100%' }}
          />
        )}
      </div>
      
      <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-slate-500">
        <span>R$ 0,00</span>
        <span>{t('credit_cards.invoices.limit')}: R$ {(limit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
  );
}
