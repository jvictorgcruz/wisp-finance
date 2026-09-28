import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/Hooks/useTranslation';
import { 
    TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight, 
    Wallet, Building2, ShoppingCart, Tv, Calendar, TrendingDown,
    MoreVertical, Activity, Play, Pause
} from 'lucide-react';
import { useHeroMockupData } from './hooks/useHeroMockupData';
import { useStepProgress } from './hooks/useStepProgress';

function useAccountAnimation(isActive: boolean) {
    const [typedAccountName, setTypedAccountName] = useState('');
    const [typedAccountLimit, setTypedAccountLimit] = useState('');
    const [activeAccountField, setActiveAccountField] = useState<'name' | 'limit' | null>('name');
    const [isCreateAccountBtnClicked, setIsCreateAccountBtnClicked] = useState(false);
    const [isAccountToastVisible, setIsAccountToastVisible] = useState(false);

    useEffect(() => {
        if (!isActive) {
            setTypedAccountName('');
            setTypedAccountLimit('');
            setActiveAccountField('name');
            setIsCreateAccountBtnClicked(false);
            setIsAccountToastVisible(false);
            return;
        }

        const timeouts: NodeJS.Timeout[] = [];
        const intervals: NodeJS.Timeout[] = [];
        
        const fullAccountName = 'Nubank';
        const fullAccountLimit = 'R$ 3.000,00';

        let nameIdx = 0;
        const initialDelay = setTimeout(() => {
            const nameTimer = setInterval(() => {
                nameIdx++;
                setTypedAccountName(fullAccountName.slice(0, nameIdx));
                if (nameIdx >= fullAccountName.length) {
                    clearInterval(nameTimer);
                    const t1 = setTimeout(() => {
                        setActiveAccountField('limit');
                        let limitIdx = 0;
                        const limitTimer = setInterval(() => {
                            limitIdx++;
                            setTypedAccountLimit(fullAccountLimit.slice(0, limitIdx));
                            if (limitIdx >= fullAccountLimit.length) {
                                clearInterval(limitTimer);
                                const t2 = setTimeout(() => {
                                    setActiveAccountField(null);
                                    const t3 = setTimeout(() => {
                                        setIsCreateAccountBtnClicked(true);
                                        setIsAccountToastVisible(true);
                                        const t4 = setTimeout(() => setIsCreateAccountBtnClicked(false), 400);
                                        timeouts.push(t4);
                                    }, 400);
                                    timeouts.push(t3);
                                }, 300);
                                timeouts.push(t2);
                            }
                        }, 50);
                        intervals.push(limitTimer);
                    }, 550);
                    timeouts.push(t1);
                }
            }, 60);
            intervals.push(nameTimer);
        }, 600);
        timeouts.push(initialDelay);

        return () => {
            timeouts.forEach(clearTimeout);
            intervals.forEach(clearInterval);
        };
    }, [isActive]);

    return {
        typedAccountName,
        typedAccountLimit,
        activeAccountField,
        isCreateAccountBtnClicked,
        isAccountToastVisible
    };
}

function useTransactionAnimation(isActive: boolean) {
    const [typedTransactionDesc, setTypedTransactionDesc] = useState('');
    const [typedTransactionAmount, setTypedTransactionAmount] = useState('');
    const [isTransactionAccountSelected, setIsTransactionAccountSelected] = useState(false);
    const [isTransactionCategorySelected, setIsTransactionCategorySelected] = useState(false);
    const [activeTransactionField, setActiveTransactionField] = useState<'desc' | 'amount' | 'account' | 'category' | null>('desc');
    const [isSaveTransactionBtnClicked, setIsSaveTransactionBtnClicked] = useState(false);
    const [isTransactionToastVisible, setIsTransactionToastVisible] = useState(false);

    useEffect(() => {
        if (!isActive) {
            setTypedTransactionDesc('');
            setTypedTransactionAmount('');
            setIsTransactionAccountSelected(false);
            setIsTransactionCategorySelected(false);
            setActiveTransactionField('desc');
            setIsSaveTransactionBtnClicked(false);
            setIsTransactionToastVisible(false);
            return;
        }

        const timeouts: NodeJS.Timeout[] = [];
        const intervals: NodeJS.Timeout[] = [];
        
        const fullTransactionDesc = 'Supermercado';
        const fullTransactionAmount = 'R$ 145,50';

        let descIdx = 0;
        const initialDelayDesc = setTimeout(() => {
            const descTimer = setInterval(() => {
                descIdx++;
                setTypedTransactionDesc(fullTransactionDesc.slice(0, descIdx));
                if (descIdx >= fullTransactionDesc.length) {
                    clearInterval(descTimer);
                    const t1 = setTimeout(() => {
                        setActiveTransactionField('amount');
                        let amtIdx = 0;
                        const amtTimer = setInterval(() => {
                            amtIdx++;
                            setTypedTransactionAmount(fullTransactionAmount.slice(0, amtIdx));
                            if (amtIdx >= fullTransactionAmount.length) {
                                clearInterval(amtTimer);
                                const t2 = setTimeout(() => {
                                    setActiveTransactionField('account');
                                    setIsTransactionAccountSelected(true);
                                    const t3 = setTimeout(() => {
                                        setActiveTransactionField('category');
                                        setIsTransactionCategorySelected(true);
                                        const t4 = setTimeout(() => {
                                            setActiveTransactionField(null);
                                            const t5 = setTimeout(() => {
                                                setIsSaveTransactionBtnClicked(true);
                                                setIsTransactionToastVisible(true);
                                                const t6 = setTimeout(() => setIsSaveTransactionBtnClicked(false), 400);
                                                timeouts.push(t6);
                                            }, 300);
                                            timeouts.push(t5);
                                        }, 400);
                                        timeouts.push(t4);
                                    }, 550);
                                    timeouts.push(t3);
                                }, 500);
                                timeouts.push(t2);
                            }
                        }, 50);
                        intervals.push(amtTimer);
                    }, 500);
                    timeouts.push(t1);
                }
            }, 55);
            intervals.push(descTimer);
        }, 600);
        timeouts.push(initialDelayDesc);

        return () => {
            timeouts.forEach(clearTimeout);
            intervals.forEach(clearInterval);
        };
    }, [isActive]);

    return {
        typedTransactionDesc,
        typedTransactionAmount,
        isTransactionAccountSelected,
        isTransactionCategorySelected,
        activeTransactionField,
        isSaveTransactionBtnClicked,
        isTransactionToastVisible
    };
}

export default function HeroMockup() {
    const { t, locale } = useTranslation();
    const [activeSlide, setActiveSlide] = useState(0);
    const [isHoverPaused, setIsHoverPaused] = useState(false);
    const [isIntersectionPaused, setIsIntersectionPaused] = useState(false);
    const [chartHoverIndex, setChartHoverIndex] = useState<number | null>(null);
    const [isUserPaused, setIsUserPaused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const mockupData = useHeroMockupData();
    const chartPoints = mockupData.chartPoints;
    const activeChartPoint = chartHoverIndex !== null ? chartPoints[chartHoverIndex] : null;

    const {
        typedAccountName,
        typedAccountLimit,
        activeAccountField,
        isCreateAccountBtnClicked,
        isAccountToastVisible
    } = useAccountAnimation(activeSlide === 0);

    const {
        typedTransactionDesc,
        typedTransactionAmount,
        isTransactionAccountSelected,
        isTransactionCategorySelected,
        activeTransactionField,
        isSaveTransactionBtnClicked,
        isTransactionToastVisible
    } = useTransactionAnimation(activeSlide === 1);

    const changeSlide = (nextIndex: number) => {
        setActiveSlide(nextIndex);
    };

    const handleChartMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        if (!rect.width) return;
        const relativeX = ((e.clientX - rect.left) / rect.width) * 300;
        let closestIdx = 0;
        let minDiff = Infinity;
        chartPoints.forEach((pt, idx) => {
            const diff = Math.abs(pt.x - relativeX);
            if (diff < minDiff) {
                minDiff = diff;
                closestIdx = idx;
            }
        });
        setChartHoverIndex(closestIdx);
    };

    const handleChartMouseLeave = () => {
        setChartHoverIndex(null);
    };

    useEffect(() => {
        if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                setIsIntersectionPaused(!entry.isIntersecting);
            },
            { threshold: 0.2 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);


    // Swipe gestures
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                changeSlide((activeSlide + 1) % 5);
            } else {
                changeSlide((activeSlide - 1 + 5) % 5);
            }
        }
        touchStartX.current = null;
        touchEndX.current = null;
    };

    const handlePointerEnter = (e: React.PointerEvent) => {
        if (e.pointerType === 'mouse' || !e.pointerType) {
            setIsHoverPaused(true);
        }
    };

    const handlePointerLeave = (e: React.PointerEvent) => {
        if (e.pointerType === 'mouse' || !e.pointerType) {
            setIsHoverPaused(false);
        }
    };

    const isPaused = isHoverPaused || isIntersectionPaused || isUserPaused;

    useEffect(() => {
        if (isPaused) return;

        const getDuration = (slide: number) => {
            switch (slide) {
                case 0: return 4300;
                case 1: return 5300;
                case 2: return 2500;
                case 3: return 2500;
                case 4: return 4500;
                default: return 3000;
            }
        };

        const duration = getDuration(activeSlide);

        const timer = setTimeout(() => {
            changeSlide((activeSlide + 1) % 5);
        }, duration);

        return () => clearTimeout(timer);
    }, [activeSlide, isPaused]);

    // Animations using progress
    const invoiceSlideProgress = useStepProgress(activeSlide === 2, 1000);
    const historySlideProgress = useStepProgress(activeSlide === 3, 1000, 600);
    const dashboardSlideProgress = useStepProgress(activeSlide === 4, 1500);

    const interpolatedInvoice = mockupData.supermarketExpense * invoiceSlideProgress;
    const interpolatedExpense = mockupData.totalExpenseBefore + (mockupData.supermarketExpense * dashboardSlideProgress);
    const interpolatedNetWorth = mockupData.netWorthBefore - (mockupData.supermarketExpense * dashboardSlideProgress);

    const handleTabClick = (index: number) => {
        changeSlide(index);
    };

    const getFormattedDate = (day?: number) => {
        const today = new Date();
        const targetDay = day ?? today.getDate();
        const targetDate = new Date(today.getFullYear(), today.getMonth(), targetDay);
        const loc = locale === 'en' ? 'en-US' : 'pt-BR';
        return targetDate.toLocaleDateString(loc, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const getDynamicDateHeader = (day?: number) => {
        const today = new Date();
        const targetDay = day ?? today.getDate();
        const loc = locale === 'en' ? 'en-US' : 'pt-BR';
        const month = today.toLocaleDateString(loc, { month: 'long' }).toUpperCase();
        return locale === 'en' ? `${month} ${targetDay}` : `${targetDay} DE ${month}`;
    };

    const slides = [
        {
            key: 'accounts',
            tabLabel: t('home.hero_carousel.step_accounts'),
            title: t('home.hero_carousel.step_accounts_desc'),
        },
        {
            key: 'transaction',
            tabLabel: t('home.hero_carousel.step_transaction'),
            title: t('home.hero_carousel.step_transaction_desc'),
        },
        {
            key: 'invoice',
            tabLabel: t('home.hero_carousel.step_invoice'),
            title: t('home.hero_carousel.step_invoice_desc'),
        },
        {
            key: 'history',
            tabLabel: t('home.hero_carousel.step_history'),
            title: t('home.hero_carousel.step_history_desc'),
        },
        {
            key: 'dashboard',
            tabLabel: t('home.hero_carousel.step_dashboard'),
            title: t('home.hero_carousel.step_dashboard_desc'),
        },
    ];

        return (
        <div 
            ref={containerRef}
            className="relative animate-in fade-in zoom-in-95 duration-700 motion-reduce:animate-none motion-reduce:transition-none select-none w-full"
            id={`tabpanel-${activeSlide}`}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            aria-roledescription="carousel"
            role="region"
            aria-label={t('home.hero_carousel.step_dashboard')}
        >
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/25 blur-[120px] rounded-full pointer-events-none" aria-hidden="true" />
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-emerald-400/25 blur-[120px] rounded-full pointer-events-none" aria-hidden="true" />

            <div className="relative bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-white/80 p-4 sm:p-7 md:p-8 shadow-[0_32px_64px_-16px_rgba(15,23,42,0.12)] space-y-4 sm:space-y-6 overflow-hidden transition-all hover:shadow-[0_40px_80px_-16px_rgba(15,23,42,0.16)] min-h-130 sm:min-h-145 flex flex-col">
                <div className="flex flex-wrap justify-center sm:flex-nowrap gap-2 sm:gap-3 pb-3.5 border-b border-slate-100 relative" role="tablist">
                    {slides.map((slide, index) => {
                        const isActive = activeSlide === index;
                        return (
                            <button
                                key={slide.key}
                                onClick={() => handleTabClick(index)}
                                role="tab"
                                aria-selected={isActive}
                                aria-controls={`tabpanel-${index}`}
                                className={`flex-1 min-w-[30%] sm:min-w-0 sm:flex-1 py-1.5 sm:py-2 px-1 sm:px-1.5 rounded-xl text-xs sm:text-sm tracking-tight transition-all motion-reduce:transition-none text-center whitespace-normal ${
                                    isActive
                                        ? 'text-slate-900 font-black scale-105'
                                        : 'text-slate-500 hover:text-slate-800 font-bold'
                                }`}
                            >
                                {slide.tabLabel}
                            </button>
                        );
                    })}
                </div>

                <div className="space-y-2 px-1 relative flex justify-between items-center min-h-12">
                    <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight pr-4">
                        {slides[activeSlide].title}
                    </h3>
                    
                    {/* Dynamic Toast 0 */}
                    <div className={`absolute right-1 top-1/2 -translate-y-1/2 bg-white text-slate-700 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-sm font-bold shadow-lg border border-slate-100 flex items-center gap-2 sm:gap-3 transition-all duration-500 z-50 ${
                        activeSlide === 0 && isAccountToastVisible
                            ? 'opacity-100 translate-x-0 scale-100' 
                            : 'opacity-0 translate-x-8 scale-95 pointer-events-none'
                    }`}>
                        <div className="w-4 h-4 sm:w-6 sm:h-6 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center shrink-0">
                            <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <span className="whitespace-nowrap">{t('home.hero_carousel.toast_card_created')}</span>
                    </div>

                    {/* Dynamic Toast 1 */}
                    <div className={`absolute right-1 top-1/2 -translate-y-1/2 bg-white text-slate-700 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-sm font-bold shadow-lg border border-slate-100 flex items-center gap-2 sm:gap-3 transition-all duration-500 z-50 ${
                        activeSlide === 1 && isTransactionToastVisible
                            ? 'opacity-100 translate-x-0 scale-100' 
                            : 'opacity-0 translate-x-8 scale-95 pointer-events-none'
                    }`}>
                        <div className="w-4 h-4 sm:w-6 sm:h-6 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center shrink-0">
                            <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <span className="whitespace-nowrap">{t('home.hero_carousel.toast_expense_added')}</span>
                    </div>
                </div>


                <div className="relative h-136 sm:h-102.5 w-full overflow-hidden">
                    <div 
                        className="flex w-full h-full transition-transform duration-500 ease-out"
                        style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                    >

                        <div className="w-full h-full shrink-0">
                            <div className="w-full h-full bg-slate-50/90 rounded-3xl p-4 sm:p-6 border border-slate-200/80 flex flex-col justify-between space-y-3 sm:space-y-4 shadow-xs">
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                    {t('home.hero_carousel.account_type_label')}
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-1.5 sm:gap-2 text-center">
                                    <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200/60 flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-2 sm:gap-1 hover:border-slate-300 hover:shadow-xs transition-all cursor-default min-w-0">
                                        <div className="p-1.5 bg-blue-50 rounded-lg shrink-0">
                                            <Building2 className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="text-slate-600 text-xs sm:text-[9px] font-bold tracking-normal text-left sm:text-center truncate w-full block">{t('home.hero_carousel.type_bank')}</span>
                                    </div>
                                    <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200/60 flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-2 sm:gap-1 hover:border-purple-300 hover:shadow-xs transition-all cursor-default min-w-0">
                                        <div className="p-1.5 bg-purple-50 rounded-lg shrink-0">
                                            <TrendingUp className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <span className="text-slate-600 text-xs sm:text-[9px] font-bold tracking-normal text-left sm:text-center truncate w-full block">{t('home.hero_carousel.type_investments')}</span>
                                    </div>
                                    <div className="bg-purple-50 p-2 sm:p-2.5 rounded-xl border-2 border-purple-600 flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-2 sm:gap-1 shadow-2xs cursor-default min-w-0">
                                        <div className="p-1.5 bg-purple-600 text-white rounded-lg shrink-0">
                                            <CreditCard className="w-4 h-4" />
                                        </div>
                                        <span className="text-purple-700 font-black text-xs sm:text-[9px] tracking-normal text-left sm:text-center truncate w-full block">{t('home.hero_carousel.type_card')}</span>
                                    </div>
                                    <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200/60 flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-2 sm:gap-1 hover:border-rose-300 hover:shadow-xs transition-all cursor-default min-w-0">
                                        <div className="p-1.5 bg-rose-50 rounded-lg shrink-0">
                                            <TrendingDown className="w-4 h-4 text-rose-500" />
                                        </div>
                                        <span className="text-slate-600 text-xs sm:text-[9px] font-bold tracking-normal text-left sm:text-center truncate w-full block">{t('home.hero_carousel.type_debts')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
                                        {t('home.hero_carousel.card_name_label')}
                                    </span>
                                    <div className={`font-bold text-slate-800 bg-white p-2.5 rounded-xl border text-xs sm:text-sm truncate transition-all cursor-default select-none ${
                                        activeAccountField === 'name' 
                                            ? 'ring-2 ring-purple-500/50 border-purple-500 bg-purple-50/20 shadow-xs' 
                                            : 'border-slate-200/60 hover:border-slate-300 hover:bg-slate-50/50'
                                    }`}>
                                        {typedAccountName || (activeSlide === 0 ? '\u00A0' : 'Nubank')}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
                                        {t('home.hero_carousel.credit_limit_label')}
                                    </span>
                                    <div className={`font-bold text-purple-700 bg-white p-2.5 rounded-xl border text-xs sm:text-sm truncate transition-all cursor-default select-none ${
                                        activeAccountField === 'limit' 
                                            ? 'ring-2 ring-purple-500/50 border-purple-500 bg-purple-50/30 shadow-xs' 
                                            : 'border-slate-200/60 hover:border-purple-300 hover:bg-purple-50/20'
                                    }`}>
                                        {typedAccountLimit || (activeSlide === 0 ? 'R$ 0,00' : 'R$ 3.000,00')}
                                    </div>
                                </div>
                            </div>

                            <button className={`w-full text-white font-bold py-3 rounded-xl text-xs sm:text-sm transition-all shadow-sm cursor-default ${
                                isCreateAccountBtnClicked
                                    ? 'bg-primary/90 scale-95 ring-4 ring-primary/30 shadow-inner'
                                    : 'bg-primary hover:bg-primary/90'
                            }`}>
                                {t('home.hero_carousel.create_card_btn')}
                            </button>
                            </div>
                        </div>

                        <div className="w-full h-full shrink-0">
                            <div className="w-full h-full bg-slate-50/90 rounded-3xl p-5 sm:p-6 border border-slate-200/80 flex flex-col justify-between space-y-3 sm:space-y-4 shadow-xs">
                            <div className="flex justify-center items-center pb-2.5 border-b border-slate-200/60 w-full">
                                <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-bold w-full text-center">
                                    <span className="py-2 px-1 bg-rose-500 text-white rounded-lg shadow-xs block font-extrabold text-center truncate cursor-default">
                                        <span className="max-[360px]:inline hidden">{String(t('home.hero_carousel.expense'))[0]?.toUpperCase() || 'D'}</span>
                                        <span className="max-[360px]:hidden inline">{t('home.hero_carousel.expense')}</span>
                                    </span>
                                    <span className="py-2 px-1 text-slate-500 block text-center font-bold hover:text-slate-700 hover:bg-slate-200/80 rounded-lg truncate transition-all cursor-default">
                                        <span className="max-[360px]:inline hidden">{String(t('home.hero_carousel.income'))[0]?.toUpperCase() || 'R'}</span>
                                        <span className="max-[360px]:hidden inline">{t('home.hero_carousel.income')}</span>
                                    </span>
                                    <span className="py-2 px-1 text-slate-500 block text-center font-bold hover:text-slate-700 hover:bg-slate-200/80 rounded-lg truncate transition-all cursor-default">
                                        <span className="max-[360px]:inline hidden">{String(t('home.hero_carousel.transfer'))[0]?.toUpperCase() || 'T'}</span>
                                        <span className="max-[360px]:hidden inline">{t('home.hero_carousel.transfer')}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
                                        {t('home.hero_carousel.date')}
                                    </span>
                                    <div className="flex items-center gap-2 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/60 hover:border-slate-300 hover:bg-slate-50/50 transition-all cursor-default select-none">
                                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span className="font-bold text-slate-700 truncate">{getFormattedDate(15)}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
                                        {t('home.hero_carousel.description')}
                                    </span>
                                    <div className={`bg-white p-2.5 sm:p-3 rounded-xl border truncate transition-all cursor-default select-none ${
                                        activeTransactionField === 'desc' 
                                            ? 'ring-2 ring-rose-500/50 border-rose-500 bg-rose-50/10 shadow-xs' 
                                            : 'border-slate-200/60 hover:border-slate-300 hover:bg-slate-50/50'
                                    }`}>
                                        <span className="font-bold text-slate-800">{typedTransactionDesc || (activeSlide === 1 ? '\u00A0' : 'Supermercado')}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
                                    {t('home.hero_carousel.amount')}
                                </span>
                                <div className={`bg-white p-2.5 sm:p-3 rounded-xl border transition-all cursor-default select-none ${
                                    activeTransactionField === 'amount' 
                                        ? 'ring-2 ring-rose-500/50 border-rose-500 bg-rose-50/20 shadow-xs' 
                                        : 'border-slate-200/60 hover:border-rose-300 hover:bg-rose-50/20'
                                }`}>
                                    <span className="font-black text-rose-600 text-lg sm:text-xl">{typedTransactionAmount || (activeSlide === 1 ? 'R$ 0,00' : 'R$ 145,50')}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
                                        {t('home.hero_carousel.pay_with')}
                                    </span>
                                    <div className={`flex items-center gap-2 bg-white p-2.5 sm:p-3 rounded-xl border truncate transition-all cursor-default select-none ${
                                        activeTransactionField === 'account' 
                                            ? 'ring-2 ring-purple-500/50 border-purple-500 bg-purple-50/30 scale-[1.02] shadow-xs' 
                                            : 'border-slate-200/60 hover:border-purple-300 hover:bg-purple-50/20'
                                    }`}>
                                        {isTransactionAccountSelected ? (
                                            <>
                                                <CreditCard className="w-4 h-4 text-purple-600 shrink-0" />
                                                <span className="font-bold text-purple-700 truncate">Nubank</span>
                                            </>
                                        ) : (
                                            <span className="font-normal text-slate-400 text-xs sm:text-sm truncate">{t('home.hero_carousel.select_account')}</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
                                        {t('home.hero_carousel.category')}
                                    </span>
                                    <div className={`flex items-center gap-2 bg-white p-2.5 sm:p-3 rounded-xl border truncate transition-all cursor-default select-none ${
                                        activeTransactionField === 'category' 
                                            ? 'ring-2 ring-rose-500/50 border-rose-500 bg-rose-50/30 scale-[1.02] shadow-xs' 
                                            : 'border-slate-200/60 hover:border-rose-300 hover:bg-rose-50/20'
                                    }`}>
                                        {isTransactionCategorySelected ? (
                                            <>
                                                <ShoppingCart className="w-4 h-4 text-rose-500 shrink-0" />
                                                <span className="font-bold text-slate-800 truncate">{t('home.hero_carousel.item_supermarket')}</span>
                                            </>
                                        ) : (
                                            <span className="font-normal text-slate-400 text-xs sm:text-sm truncate">{t('home.hero_carousel.select_category')}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 sm:gap-3 pt-2">
                                <button className="px-3 sm:px-5 py-2 sm:py-2.5 text-slate-400 hover:text-slate-600 text-xs sm:text-sm font-bold transition-colors cursor-default">
                                    {t('home.hero_carousel.cancel')}
                                </button>
                                <button className={`text-white font-bold px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-default whitespace-nowrap ${
                                    isSaveTransactionBtnClicked
                                        ? 'bg-rose-600 scale-95 ring-4 ring-rose-400/40 shadow-inner'
                                        : 'bg-rose-500 hover:bg-rose-600 shadow-xs'
                                }`}>
                                    <span className="sm:hidden">{t('common.save')}</span>
                                    <span className="hidden sm:inline">{t('home.hero_carousel.save_transaction')}</span>
                                </button>
                            </div>
                            </div>
                        </div>

                        <div className="w-full h-full shrink-0">
                            <div className="w-full h-full bg-slate-50/90 rounded-3xl p-5 sm:p-6 border border-slate-200/80 flex flex-col justify-between space-y-4 shadow-xs">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-purple-100 text-purple-600 rounded-2xl shrink-0">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-black text-base text-slate-900 leading-tight">Nubank</p>
                                    </div>
                                </div>
                            </div>

                            <div className="text-left">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                    {t('home.hero_carousel.current_invoice')}
                                </span>
                                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight block mt-1">{mockupData.formatCurrency(interpolatedInvoice)}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center text-xs sm:text-sm">
                                <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                                    <span className="text-xs font-bold text-slate-400 block uppercase">
                                        {t('home.hero_carousel.closing')}
                                    </span>
                                    <span className="font-bold text-slate-800 text-sm">{t('home.hero_carousel.day_format', { day: 5 })}</span>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                                    <span className="text-xs font-bold text-slate-400 block uppercase">
                                        {t('home.hero_carousel.due_date')}
                                    </span>
                                    <span className="font-bold text-rose-600 text-sm">{t('home.hero_carousel.day_format', { day: 12 })}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button className="w-full bg-primary text-white font-bold py-3 rounded-xl text-xs sm:text-sm shadow-xs hover:bg-primary/90 transition-colors">
                                    {t('home.hero_carousel.pay_invoice')}
                                </button>
                                <button className="w-full bg-white border border-slate-200/80 text-slate-700 font-bold py-3 rounded-xl text-xs sm:text-sm hover:bg-slate-50 transition-colors">
                                    {t('home.hero_carousel.view_invoice')}
                                </button>
                            </div>

                            <div className="space-y-1.5">
                                <div className="hidden sm:flex justify-between text-xs font-bold text-slate-500">
                                    <span>{mockupData.formatCurrency(interpolatedInvoice)} {t('home.hero_carousel.limit_used_label')}</span>
                                    <span>{Math.round((interpolatedInvoice / 300000) * 100)}% de {mockupData.formatCurrency(300000)}</span>
                                </div>
                                <div className="sm:hidden text-left text-[11px] font-bold text-slate-500 leading-tight">
                                    {mockupData.formatCurrency(interpolatedInvoice)} / {mockupData.formatCurrency(300000)} ({Math.round((interpolatedInvoice / 300000) * 100)}%) {t('home.hero_carousel.limit_used_label')}
                                </div>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                    <div className="bg-purple-600 h-full rounded-full" style={{ width: `${Math.min(100, (interpolatedInvoice / 300000) * 100)}%` }} />
                                </div>
                            </div>
                            </div>
                        </div>

                        <div className="w-full h-full shrink-0">
                            <div className="w-full h-full bg-slate-50/90 rounded-3xl p-4 sm:p-5 border border-slate-200/80 flex flex-col justify-between space-y-3 shadow-xs overflow-hidden">
                            <div className="space-y-2 flex-1 flex flex-col justify-start">
                                {/* Date: Day 15 (Newest) */}
                                <div style={{ 
                                    opacity: historySlideProgress, 
                                    transform: `translateX(${(1 - historySlideProgress) * 30}px)`,
                                    maxHeight: `${historySlideProgress * 150}px`,
                                    overflow: 'hidden'
                                }}>
                                    <div className="text-xs font-black uppercase text-slate-400 tracking-wider pb-1 border-b border-slate-200/60 mb-1.5">
                                        <span>{getDynamicDateHeader(15)}</span>
                                    </div>
                                    <div className="flex flex-col min-[400px]:flex-row items-start min-[400px]:items-center justify-between gap-2 min-[400px]:gap-0 p-2.5 sm:p-3 bg-white rounded-2xl border border-slate-100 shadow-2xs hover:border-slate-200 hover:shadow-xs hover:scale-[1.01] transition-all duration-200 cursor-default">
                                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 w-full">
                                            <div className="p-2 bg-rose-100 text-rose-500 rounded-xl shrink-0">
                                                <ShoppingCart className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">{t('home.hero_carousel.item_supermarket')}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">{t('home.hero_carousel.cat_groceries')}</p>
                                            </div>
                                        </div>
                                        <div className="text-left min-[400px]:text-right shrink-0 pl-[2.6rem] min-[400px]:pl-0 w-full min-[400px]:w-auto">
                                            <span className="text-xs sm:text-sm font-black text-rose-500 block">- {mockupData.formatCurrency(mockupData.supermarketExpense)}</span>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{t('home.hero_carousel.acc_nubank')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Date: Day 10 */}
                                <div>
                                    <div className="text-xs font-black uppercase text-slate-400 tracking-wider pb-1 border-b border-slate-200/60 mb-1.5">
                                        <span>{getDynamicDateHeader(10)}</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex flex-col min-[400px]:flex-row items-start min-[400px]:items-center justify-between gap-2 min-[400px]:gap-0 p-2.5 sm:p-3 bg-white rounded-2xl border border-slate-100 shadow-2xs hover:border-slate-200 hover:shadow-xs hover:scale-[1.01] transition-all duration-200 cursor-default">
                                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 w-full">
                                                <div className="p-2 bg-rose-100 text-rose-500 rounded-xl shrink-0">
                                                    <Tv className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">{t('home.hero_carousel.item_utility')}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">{t('home.hero_carousel.cat_fixed')}</p>
                                                </div>
                                            </div>
                                            <div className="text-left min-[400px]:text-right shrink-0 pl-[2.6rem] min-[400px]:pl-0 w-full min-[400px]:w-auto">
                                                <span className="text-xs sm:text-sm font-black text-rose-500 block">- {mockupData.formatCurrency(12000)}</span>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{t('home.hero_carousel.acc_itau')}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col min-[400px]:flex-row items-start min-[400px]:items-center justify-between gap-2 min-[400px]:gap-0 p-2.5 sm:p-3 bg-white rounded-2xl border border-slate-100 shadow-2xs hover:border-slate-200 hover:shadow-xs hover:scale-[1.01] transition-all duration-200 cursor-default">
                                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 w-full">
                                                <div className="p-2 bg-rose-100 text-rose-500 rounded-xl shrink-0">
                                                    <ShoppingCart className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">{t('home.hero_carousel.item_bakery')}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">{t('home.hero_carousel.cat_food')}</p>
                                                </div>
                                            </div>
                                            <div className="text-left min-[400px]:text-right shrink-0 pl-[2.6rem] min-[400px]:pl-0 w-full min-[400px]:w-auto">
                                                <span className="text-xs sm:text-sm font-black text-rose-500 block">- {mockupData.formatCurrency(2450)}</span>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{t('home.hero_carousel.acc_cash')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Date: Day 5 (Salary) */}
                                <div>
                                    <div className="text-xs font-black uppercase text-slate-400 tracking-wider pb-1 border-b border-slate-200/60 mb-1.5">
                                        <span>{getDynamicDateHeader(5)}</span>
                                    </div>
                                    <div className="flex flex-col min-[400px]:flex-row items-start min-[400px]:items-center justify-between gap-2 min-[400px]:gap-0 p-2.5 sm:p-3 bg-white rounded-2xl border border-slate-100 shadow-2xs hover:border-slate-200 hover:shadow-xs hover:scale-[1.01] transition-all duration-200 cursor-default">
                                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 w-full">
                                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl shrink-0">
                                                <ArrowUpRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">{t('home.hero_carousel.item_salary')}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">{t('home.hero_carousel.cat_salary')}</p>
                                            </div>
                                        </div>
                                        <div className="text-left min-[400px]:text-right shrink-0 pl-[2.6rem] min-[400px]:pl-0 w-full min-[400px]:w-auto">
                                            <span className="text-xs sm:text-sm font-black text-emerald-600 block">+ {mockupData.formatCurrency(mockupData.income)}</span>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{t('home.hero_carousel.acc_itau')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>

                        <div className="w-full h-full shrink-0">
                            <div className="w-full h-full bg-slate-50/80 rounded-3xl p-4 sm:p-5 border border-slate-100 flex flex-col justify-between space-y-3 shadow-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-100 shadow-2xs min-w-0 hover:border-emerald-200 hover:shadow-xs transition-all cursor-default">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-black uppercase tracking-wider text-emerald-600 truncate">
                                            {t('home.hero_carousel.income_label')}
                                        </span>
                                        <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                            <ArrowUpRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                    <span className="text-sm sm:text-base font-black text-slate-900 block truncate">{mockupData.formatCurrency(mockupData.income)}</span>
                                </div>

                                <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-100 shadow-2xs min-w-0 hover:border-rose-200 hover:shadow-xs transition-all cursor-default">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-black uppercase tracking-wider text-rose-500 truncate">
                                            {t('home.hero_carousel.expense_label')}
                                        </span>
                                        <div className="w-4 h-4 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                                            <ArrowDownRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                    <span className="text-sm sm:text-base font-black text-slate-900 block truncate">{mockupData.formatCurrency(interpolatedExpense)}</span>
                                </div>
                            </div>

                            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-2xs flex-1 flex flex-col justify-between gap-2 relative">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs sm:text-sm font-black text-slate-900">{t('home.hero_carousel.net_worth_evolution')}</p>
                                </div>

                                <div 
                                    className="relative h-28 sm:h-32 w-full cursor-crosshair group pb-4"
                                    onMouseMove={handleChartMouseMove}
                                    onMouseLeave={handleChartMouseLeave}
                                >
                                    {activeChartPoint && (
                                        <div 
                                            className="absolute z-20 pointer-events-none transition-all duration-150 ease-out motion-reduce:transition-none"
                                            style={{
                                                left: `${(activeChartPoint.x / 300) * 100}%`,
                                                top: `${(activeChartPoint.y / 70) * 100}%`,
                                                transform: 'translate(-50%, -125%)',
                                            }}
                                        >
                                            <div className="bg-white text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap flex items-center gap-1.5 border border-slate-200">
                                                <span className="text-slate-500 font-medium" aria-hidden="true">{activeChartPoint.date}:</span>
                                                <span className="font-bold text-emerald-600">{activeChartPoint.val}</span>
                                            </div>
                                            <div className="w-2 h-2 bg-white rotate-45 mx-auto -mt-1 border-r border-b border-slate-200" />
                                        </div>
                                    )}

                                    {(() => {
                                        const currentChartPoints = mockupData.chartPoints.map((pt, idx) => {
                                            if (idx >= 6) {
                                                const prevPt = mockupData.chartPoints[5];
                                                const targetPt = pt;
                                                
                                                // Create in real-time by expanding X and morphing Y
                                                const animatedX = prevPt.x + (targetPt.x - prevPt.x) * dashboardSlideProgress;
                                                const animatedY = prevPt.y + (targetPt.y - prevPt.y) * dashboardSlideProgress;
                                                
                                                return { ...pt, x: animatedX, y: animatedY, val: mockupData.formatCurrency(interpolatedNetWorth) };
                                            }
                                            return pt;
                                        });

                                        const pathData = currentChartPoints.map((pt, i) => {
                                            if (i === 0) return `M ${pt.x} ${pt.y}`;
                                            const prev = currentChartPoints[i - 1];
                                            if (Math.abs(pt.x - prev.x) < 1) return `L ${pt.x} ${pt.y}`;
                                            const midX = prev.x + (pt.x - prev.x) / 2;
                                            return `C ${midX} ${prev.y}, ${midX} ${pt.y}, ${pt.x} ${pt.y}`;
                                        }).join(' ');

                                        return (
                                            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 70" preserveAspectRatio="none">
                                                <defs>
                                                    <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                                                    </linearGradient>
                                                </defs>

                                                <path 
                                                    d={`${pathData} L 300 70 L 0 70 Z`} 
                                                    fill="url(#heroGradient)" 
                                                />

                                                <path 
                                                    d={pathData} 
                                                    fill="none" 
                                                    stroke="#3b82f6" 
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />

                                                {currentChartPoints.map((pt, i) => (
                                                    <circle 
                                                        key={i}
                                                        cx={pt.x}
                                                        cy={pt.y}
                                                        r={chartHoverIndex === i ? 4 : 0}
                                                        fill="#ffffff"
                                                        stroke="#3b82f6"
                                                        strokeWidth="2"
                                                        className="transition-all duration-200"
                                                    />
                                                ))}

                                                {activeChartPoint && (
                                                    <g className="transition-all duration-150">
                                                        <line 
                                                            x1={activeChartPoint.x} 
                                                            y1={0} 
                                                            x2={activeChartPoint.x} 
                                                            y2={70} 
                                                            stroke="#3b82f6" 
                                                            strokeWidth="1.5" 
                                                            strokeDasharray="3 3" 
                                                            strokeOpacity="0.6"
                                                        />
                                                        <circle 
                                                            cx={activeChartPoint.x} 
                                                            cy={activeChartPoint.y} 
                                                            r="7" 
                                                            fill="#3b82f6" 
                                                            fillOpacity="0.25"
                                                        />
                                                        <circle 
                                                            cx={activeChartPoint.x} 
                                                            cy={activeChartPoint.y} 
                                                            r="4.5" 
                                                            fill="#3b82f6" 
                                                            stroke="#ffffff" 
                                                            strokeWidth="2"
                                                        />
                                                    </g>
                                                )}
                                            </svg>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

                {/* Play/Pause Footer */}
                <div className="flex w-full pt-3 mt-1 border-t border-slate-100 justify-center items-center shrink-0">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsUserPaused(!isUserPaused); }}
                        className="flex items-center justify-center gap-2 text-slate-500 bg-slate-50 hover:bg-slate-100 px-4 py-1.5 rounded-full font-semibold text-xs transition-colors"
                        aria-label={isUserPaused ? "Play animation" : "Pause animation"}
                    >
                        {isUserPaused ? (
                            <>
                                <Play className="w-3.5 h-3.5 fill-current" /> {t('home.hero_carousel.play_demo')}
                            </>
                        ) : (
                            <>
                                <Pause className="w-3.5 h-3.5 fill-current" /> {t('home.hero_carousel.pause_demo')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
