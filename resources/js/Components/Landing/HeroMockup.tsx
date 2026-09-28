import { useState, useEffect } from 'react';
import { useTranslation } from '@/Hooks/useTranslation';
import { 
    TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight, 
    Wallet, Building2, ShoppingCart, Tv, Calendar, TrendingDown,
    MoreVertical, Activity
} from 'lucide-react';

export default function HeroMockup() {
    const { t, locale } = useTranslation();
    const [activeSlide, setActiveSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [chartHoverIndex, setChartHoverIndex] = useState<number | null>(null);

    const [typedSlide0Name, setTypedSlide0Name] = useState('');
    const [typedSlide0Limit, setTypedSlide0Limit] = useState('');
    const [activeField0, setActiveField0] = useState<'name' | 'limit' | null>('name');
    const [isBtnClicked0, setIsBtnClicked0] = useState(false);

    const [typedSlide1Desc, setTypedSlide1Desc] = useState('');
    const [typedSlide1Amount, setTypedSlide1Amount] = useState('');
    const [selectedAccount1, setSelectedAccount1] = useState(false);
    const [selectedCategory1, setSelectedCategory1] = useState(false);
    const [activeField1, setActiveField1] = useState<'desc' | 'amount' | 'account' | 'category' | null>('desc');
    const [isBtnClicked1, setIsBtnClicked1] = useState(false);

    const chartPoints = [
        { date: '01/09', val: 'R$ 0,00', x: 0, y: 66 },
        { date: '05/09', val: 'R$ 3.500,00', x: 80, y: 3 },
        { date: '15/09', val: 'R$ 3.354,50', x: 180, y: 10 },
        { date: '22/09', val: 'R$ 3.234,50', x: 250, y: 14 },
        { date: '30/09', val: 'R$ 3.210,00', x: 300, y: 15 },
    ];

    const activeChartPoint = chartHoverIndex !== null ? chartPoints[chartHoverIndex] : null;

    const changeSlide = (nextIndex: number) => {
        if (nextIndex === 0) {
            setTypedSlide0Name('');
            setTypedSlide0Limit('');
            setActiveField0('name');
            setIsBtnClicked0(false);
        } else if (nextIndex === 1) {
            setTypedSlide1Desc('');
            setTypedSlide1Amount('');
            setSelectedAccount1(false);
            setSelectedCategory1(false);
            setActiveField1('desc');
            setIsBtnClicked1(false);
        }
        setActiveSlide(nextIndex);
    };

    useEffect(() => {
        let timeouts: NodeJS.Timeout[] = [];
        let intervals: NodeJS.Timeout[] = [];

        const full0Name = 'Nubank';
        const full0Limit = 'R$ 3.000,00';
        const full1Desc = 'Supermercado';
        const full1Amount = 'R$ 145,50';

        if (activeSlide === 0) {
            setTypedSlide0Name('');
            setTypedSlide0Limit('');
            setIsBtnClicked0(false);
            setActiveField0('name');

            let nameIdx = 0;
            const nameTimer = setInterval(() => {
                nameIdx++;
                setTypedSlide0Name(full0Name.slice(0, nameIdx));
                if (nameIdx >= full0Name.length) {
                    clearInterval(nameTimer);
                    const t1 = setTimeout(() => {
                        setActiveField0('limit');
                        let limitIdx = 0;
                        const limitTimer = setInterval(() => {
                            limitIdx++;
                            setTypedSlide0Limit(full0Limit.slice(0, limitIdx));
                            if (limitIdx >= full0Limit.length) {
                                clearInterval(limitTimer);
                                const t2 = setTimeout(() => {
                                    setActiveField0(null);
                                    const t3 = setTimeout(() => {
                                        setIsBtnClicked0(true);
                                        const t4 = setTimeout(() => setIsBtnClicked0(false), 400);
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
        } else if (activeSlide === 1) {
            setTypedSlide1Desc('');
            setTypedSlide1Amount('');
            setSelectedAccount1(false);
            setSelectedCategory1(false);
            setIsBtnClicked1(false);
            setActiveField1('desc');

            let descIdx = 0;
            const descTimer = setInterval(() => {
                descIdx++;
                setTypedSlide1Desc(full1Desc.slice(0, descIdx));
                if (descIdx >= full1Desc.length) {
                    clearInterval(descTimer);
                    const t1 = setTimeout(() => {
                        setActiveField1('amount');
                        let amtIdx = 0;
                        const amtTimer = setInterval(() => {
                            amtIdx++;
                            setTypedSlide1Amount(full1Amount.slice(0, amtIdx));
                            if (amtIdx >= full1Amount.length) {
                                clearInterval(amtTimer);
                                const t2 = setTimeout(() => {
                                    setActiveField1('account');
                                    setSelectedAccount1(true);
                                    const t3 = setTimeout(() => {
                                        setActiveField1('category');
                                        setSelectedCategory1(true);
                                        const t4 = setTimeout(() => {
                                            setActiveField1(null);
                                            const t5 = setTimeout(() => {
                                                setIsBtnClicked1(true);
                                                const t6 = setTimeout(() => setIsBtnClicked1(false), 400);
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
        } else {
            setTypedSlide0Name('');
            setTypedSlide0Limit('');
            setTypedSlide1Desc('');
            setTypedSlide1Amount('');
            setSelectedAccount1(false);
            setSelectedCategory1(false);
            setIsBtnClicked0(false);
            setIsBtnClicked1(false);
            setActiveField0(null);
            setActiveField1(null);
        }

        return () => {
            timeouts.forEach(clearTimeout);
            intervals.forEach(clearInterval);
        };
    }, [activeSlide]);

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
        if (isPaused) return;

        const getDuration = (slide: number) => {
            if (slide === 0) return 4000;
            if (slide === 1) return 4500;
            if (slide === 2) return 3500;
            return 3000;
        };

        const duration = getDuration(activeSlide);

        const timer = setTimeout(() => {
            changeSlide((activeSlide + 1) % 5);
        }, duration);

        return () => clearTimeout(timer);
    }, [activeSlide, isPaused]);

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
            className="relative animate-in fade-in zoom-in-95 duration-700 select-none w-full"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            aria-roledescription="carousel"
            role="region"
            aria-label={t('home.hero_carousel.step_dashboard')}
        >
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/25 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-emerald-400/25 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-white/80 p-5 sm:p-7 md:p-8 shadow-[0_32px_64px_-16px_rgba(15,23,42,0.12)] space-y-5 sm:space-y-6 overflow-hidden transition-all hover:shadow-[0_40px_80px_-16px_rgba(15,23,42,0.16)]">
                <div className="grid grid-cols-5 gap-1 sm:gap-3 pb-3.5 border-b border-slate-100 overflow-hidden">
                    {slides.map((slide, index) => {
                        const isActive = activeSlide === index;
                        return (
                            <button
                                key={slide.key}
                                onClick={() => handleTabClick(index)}
                                className={`w-full py-1.5 sm:py-2 px-0.5 sm:px-1.5 rounded-xl text-[10px] sm:text-sm tracking-tight transition-all text-center truncate ${
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

                <div className="space-y-2 px-1">
                    <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                        {slides[activeSlide].title}
                    </h3>
                </div>

                <div className="h-95 sm:h-102.5 w-full flex items-stretch justify-center overflow-hidden">
                    {activeSlide === 0 && (
                        <div className="w-full h-full bg-slate-50/90 rounded-3xl p-4 sm:p-6 border border-slate-200/80 flex flex-col justify-between space-y-3 sm:space-y-4 shadow-xs animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                    {t('home.hero_carousel.account_type_label')}
                                </span>
                                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center">
                                    <div className="bg-white p-1.5 sm:p-2.5 rounded-xl border border-slate-200/60 flex flex-col items-center justify-center gap-1 hover:border-slate-300 hover:shadow-xs transition-all cursor-default min-w-0">
                                        <div className="p-1 sm:p-1.5 bg-blue-50 rounded-lg shrink-0">
                                            <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                                        </div>
                                        <span className="text-slate-600 text-[8px] sm:text-[9px] font-bold tracking-tighter sm:tracking-normal truncate w-full block">{t('home.hero_carousel.type_bank')}</span>
                                    </div>
                                    <div className="bg-white p-1.5 sm:p-2.5 rounded-xl border border-slate-200/60 flex flex-col items-center justify-center gap-1 hover:border-purple-300 hover:shadow-xs transition-all cursor-default min-w-0">
                                        <div className="p-1 sm:p-1.5 bg-purple-50 rounded-lg shrink-0">
                                            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                                        </div>
                                        <span className="text-slate-600 text-[8px] sm:text-[9px] font-bold tracking-tighter sm:tracking-normal truncate w-full block">{t('home.hero_carousel.type_investments')}</span>
                                    </div>
                                    <div className="bg-purple-50 p-1.5 sm:p-2.5 rounded-xl border-2 border-purple-600 flex flex-col items-center justify-center gap-1 shadow-2xs cursor-default min-w-0">
                                        <div className="p-1 sm:p-1.5 bg-purple-600 text-white rounded-lg shrink-0">
                                            <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </div>
                                        <span className="text-purple-700 font-black text-[8px] sm:text-[9px] tracking-tighter sm:tracking-normal truncate w-full block">{t('home.hero_carousel.type_card')}</span>
                                    </div>
                                    <div className="bg-white p-1.5 sm:p-2.5 rounded-xl border border-slate-200/60 flex flex-col items-center justify-center gap-1 hover:border-rose-300 hover:shadow-xs transition-all cursor-default min-w-0">
                                        <div className="p-1 sm:p-1.5 bg-rose-50 rounded-lg shrink-0">
                                            <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
                                        </div>
                                        <span className="text-slate-600 text-[8px] sm:text-[9px] font-bold tracking-tighter sm:tracking-normal truncate w-full block">{t('home.hero_carousel.type_debts')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
                                        {t('home.hero_carousel.card_name_label')}
                                    </span>
                                    <div className={`font-bold text-slate-800 bg-white p-2.5 rounded-xl border text-xs sm:text-sm truncate transition-all cursor-default select-none ${
                                        activeField0 === 'name' 
                                            ? 'ring-2 ring-purple-500/50 border-purple-500 bg-purple-50/20 shadow-xs' 
                                            : 'border-slate-200/60 hover:border-slate-300 hover:bg-slate-50/50'
                                    }`}>
                                        {typedSlide0Name || (activeSlide === 0 ? '\u00A0' : 'Nubank')}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
                                        {t('home.hero_carousel.credit_limit_label')}
                                    </span>
                                    <div className={`font-bold text-purple-700 bg-white p-2.5 rounded-xl border text-xs sm:text-sm truncate transition-all cursor-default select-none ${
                                        activeField0 === 'limit' 
                                            ? 'ring-2 ring-purple-500/50 border-purple-500 bg-purple-50/30 shadow-xs' 
                                            : 'border-slate-200/60 hover:border-purple-300 hover:bg-purple-50/20'
                                    }`}>
                                        {typedSlide0Limit || (activeSlide === 0 ? 'R$ 0,00' : 'R$ 3.000,00')}
                                    </div>
                                </div>
                            </div>

                            <button className={`w-full text-white font-bold py-3 rounded-xl text-xs sm:text-sm transition-all shadow-sm cursor-default ${
                                isBtnClicked0
                                    ? 'bg-primary/90 scale-95 ring-4 ring-primary/30 shadow-inner'
                                    : 'bg-primary hover:bg-primary/90'
                            }`}>
                                {t('home.hero_carousel.create_card_btn')}
                            </button>
                        </div>
                    )}

                    {activeSlide === 1 && (
                        <div className="w-full h-full bg-slate-50/90 rounded-3xl p-5 sm:p-6 border border-slate-200/80 flex flex-col justify-between space-y-3 sm:space-y-4 shadow-xs animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex justify-center items-center pb-2.5 border-b border-slate-200/60 w-full">
                                <div className="grid grid-cols-3 gap-1.5 bg-slate-200/60 p-1.5 rounded-xl text-xs font-bold w-full text-center">
                                    <span className="py-2 bg-rose-500 text-white rounded-lg shadow-xs block font-extrabold text-center cursor-default">
                                        {t('home.hero_carousel.expense')}
                                    </span>
                                    <span className="py-2 text-slate-500 block text-center font-bold hover:text-slate-700 hover:bg-slate-200/80 rounded-lg transition-all cursor-default">
                                        {t('home.hero_carousel.income')}
                                    </span>
                                    <span className="py-2 text-slate-500 block text-center font-bold hover:text-slate-700 hover:bg-slate-200/80 rounded-lg transition-all cursor-default">
                                        {t('home.hero_carousel.transfer')}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
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
                                        activeField1 === 'desc' 
                                            ? 'ring-2 ring-rose-500/50 border-rose-500 bg-rose-50/10 shadow-xs' 
                                            : 'border-slate-200/60 hover:border-slate-300 hover:bg-slate-50/50'
                                    }`}>
                                        <span className="font-bold text-slate-800">{typedSlide1Desc || (activeSlide === 1 ? '\u00A0' : 'Supermercado')}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
                                    {t('home.hero_carousel.amount')}
                                </span>
                                <div className={`bg-white p-2.5 sm:p-3 rounded-xl border transition-all cursor-default select-none ${
                                    activeField1 === 'amount' 
                                        ? 'ring-2 ring-rose-500/50 border-rose-500 bg-rose-50/20 shadow-xs' 
                                        : 'border-slate-200/60 hover:border-rose-300 hover:bg-rose-50/20'
                                }`}>
                                    <span className="font-black text-rose-600 text-lg sm:text-xl">{typedSlide1Amount || (activeSlide === 1 ? 'R$ 0,00' : 'R$ 145,50')}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
                                        {t('home.hero_carousel.pay_with')}
                                    </span>
                                    <div className={`flex items-center gap-2 bg-white p-2.5 sm:p-3 rounded-xl border truncate transition-all cursor-default select-none ${
                                        activeField1 === 'account' 
                                            ? 'ring-2 ring-purple-500/50 border-purple-500 bg-purple-50/30 scale-[1.02] shadow-xs' 
                                            : 'border-slate-200/60 hover:border-purple-300 hover:bg-purple-50/20'
                                    }`}>
                                        {selectedAccount1 ? (
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
                                        activeField1 === 'category' 
                                            ? 'ring-2 ring-rose-500/50 border-rose-500 bg-rose-50/30 scale-[1.02] shadow-xs' 
                                            : 'border-slate-200/60 hover:border-rose-300 hover:bg-rose-50/20'
                                    }`}>
                                        {selectedCategory1 ? (
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

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button className="px-5 py-2.5 text-slate-400 hover:text-slate-600 text-xs sm:text-sm font-bold transition-colors cursor-default">
                                    {t('home.hero_carousel.cancel')}
                                </button>
                                <button className={`text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-default ${
                                    isBtnClicked1
                                        ? 'bg-rose-600 scale-95 ring-4 ring-rose-400/40 shadow-inner'
                                        : 'bg-rose-500 hover:bg-rose-600 shadow-xs'
                                }`}>
                                    {t('home.hero_carousel.save_transaction')}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeSlide === 2 && (
                        <div className="w-full h-full bg-slate-50/90 rounded-3xl p-5 sm:p-6 border border-slate-200/80 flex flex-col justify-between space-y-4 shadow-xs animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-purple-100 text-purple-600 rounded-2xl shrink-0">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-black text-base text-slate-900 leading-tight">Nubank Ultravioleta</p>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            {t('home.hero_mockup.active_card')}
                                        </p>
                                    </div>
                                </div>
                                <MoreVertical className="w-5 h-5 text-slate-400 shrink-0" />
                            </div>

                            <div className="text-left">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                    {t('home.hero_carousel.current_invoice')}
                                </span>
                                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight block mt-1">R$ 145,50</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-center text-xs sm:text-sm">
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

                            <div className="grid grid-cols-2 gap-3">
                                <button className="w-full bg-primary text-white font-bold py-3 rounded-xl text-xs sm:text-sm shadow-xs hover:bg-primary/90 transition-colors">
                                    {t('home.hero_carousel.pay_invoice')}
                                </button>
                                <button className="w-full bg-white border border-slate-200/80 text-slate-700 font-bold py-3 rounded-xl text-xs sm:text-sm hover:bg-slate-50 transition-colors">
                                    {t('home.hero_carousel.view_invoice')}
                                </button>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-bold text-slate-500">
                                    <span>R$ 145,50 {t('home.hero_carousel.limit_used_label')}</span>
                                    <span>5% de R$ 3.000,00</span>
                                </div>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                    <div className="bg-purple-600 h-full rounded-full w-[5%]" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSlide === 3 && (
                        <div className="w-full h-full bg-slate-50/90 rounded-3xl p-4 sm:p-5 border border-slate-200/80 flex flex-col justify-between space-y-3 shadow-xs animate-in fade-in slide-in-from-right-4 duration-300 overflow-hidden">
                            <div className="space-y-2 flex-1 flex flex-col justify-between">
                                {/* Date 1: Day 22 */}
                                <div>
                                    <div className="text-xs font-black uppercase text-slate-400 tracking-wider pb-1 border-b border-slate-200/60 mb-1.5">
                                        <span>{getDynamicDateHeader(22)}</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between p-2.5 sm:p-3 bg-white rounded-2xl border border-slate-100 shadow-2xs hover:border-slate-200 hover:shadow-xs hover:scale-[1.01] transition-all duration-200 cursor-default">
                                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                                <div className="p-2 bg-rose-100 text-rose-500 rounded-xl shrink-0">
                                                    <Tv className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">{t('home.hero_carousel.item_utility')}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">{t('home.hero_carousel.cat_fixed')}</p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="text-xs sm:text-sm font-black text-rose-500 block">- R$ 120,00</span>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{t('home.hero_carousel.acc_itau')}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-2.5 sm:p-3 bg-white rounded-2xl border border-slate-100 shadow-2xs hover:border-slate-200 hover:shadow-xs hover:scale-[1.01] transition-all duration-200 cursor-default">
                                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                                <div className="p-2 bg-rose-100 text-rose-500 rounded-xl shrink-0">
                                                    <ShoppingCart className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">{t('home.hero_carousel.item_bakery')}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">{t('home.hero_carousel.cat_food')}</p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="text-xs sm:text-sm font-black text-rose-500 block">- R$ 24,50</span>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{t('home.hero_carousel.acc_cash')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Date 2: Day 15 */}
                                <div>
                                    <div className="text-xs font-black uppercase text-slate-400 tracking-wider pb-1 border-b border-slate-200/60 mb-1.5">
                                        <span>{getDynamicDateHeader(15)}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2.5 sm:p-3 bg-white rounded-2xl border border-slate-100 shadow-2xs hover:border-slate-200 hover:shadow-xs hover:scale-[1.01] transition-all duration-200 cursor-default">
                                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                            <div className="p-2 bg-rose-100 text-rose-500 rounded-xl shrink-0">
                                                <ShoppingCart className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">{t('home.hero_carousel.item_supermarket')}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">{t('home.hero_carousel.cat_groceries')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-xs sm:text-sm font-black text-rose-500 block">- R$ 145,50</span>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{t('home.hero_carousel.acc_nubank')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Date 3: Day 5 (Salary) */}
                                <div>
                                    <div className="text-xs font-black uppercase text-slate-400 tracking-wider pb-1 border-b border-slate-200/60 mb-1.5">
                                        <span>{getDynamicDateHeader(5)}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2.5 sm:p-3 bg-white rounded-2xl border border-slate-100 shadow-2xs hover:border-slate-200 hover:shadow-xs hover:scale-[1.01] transition-all duration-200 cursor-default">
                                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl shrink-0">
                                                <ArrowUpRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">{t('home.hero_carousel.item_salary')}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">{t('home.hero_carousel.cat_salary')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-xs sm:text-sm font-black text-emerald-600 block">+ R$ 3.500,00</span>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{t('home.hero_carousel.acc_itau')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSlide === 4 && (
                        <div className="w-full h-full bg-slate-50/80 rounded-3xl p-4 sm:p-5 border border-slate-100 flex flex-col justify-between space-y-3 shadow-xs animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-100 shadow-2xs min-w-0 hover:border-emerald-200 hover:shadow-xs transition-all cursor-default">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-black uppercase tracking-wider text-slate-400 truncate">
                                            {t('home.hero_carousel.income_label')}
                                        </span>
                                        <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                            <ArrowUpRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                    <span className="text-sm sm:text-base font-black text-slate-900 block truncate">+R$ 3.500,00</span>
                                    <span className="text-xs font-bold text-emerald-600 block">+100.0%</span>
                                </div>

                                <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-100 shadow-2xs min-w-0 hover:border-rose-200 hover:shadow-xs transition-all cursor-default">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-black uppercase tracking-wider text-slate-400 truncate">
                                            {t('home.hero_carousel.expense_label')}
                                        </span>
                                        <div className="w-4 h-4 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                                            <ArrowDownRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                    <span className="text-sm sm:text-base font-black text-slate-900 block truncate">-R$ 290,00</span>
                                    <span className="text-xs font-bold text-rose-500 block">+2.5%</span>
                                </div>
                            </div>

                            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-2xs flex-1 flex flex-col justify-between gap-2 relative">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs sm:text-sm font-black text-slate-900">{t('home.hero_carousel.net_worth_evolution')}</p>
                                </div>

                                <div 
                                    className="relative h-28 sm:h-32 w-full cursor-crosshair group"
                                    onMouseMove={handleChartMouseMove}
                                    onMouseLeave={handleChartMouseLeave}
                                >
                                    {activeChartPoint && (
                                        <div 
                                            className="absolute z-20 pointer-events-none transition-all duration-150 ease-out"
                                            style={{
                                                left: `${(activeChartPoint.x / 300) * 100}%`,
                                                top: `${(activeChartPoint.y / 70) * 100}%`,
                                                transform: 'translate(-50%, -125%)',
                                            }}
                                        >
                                            <div className="bg-white text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap flex items-center gap-1.5 border border-slate-200">
                                                <span className="text-slate-500 font-medium">{activeChartPoint.date}:</span>
                                                <span className="font-bold text-emerald-600">{activeChartPoint.val}</span>
                                            </div>
                                            <div className="w-2 h-2 bg-white rotate-45 mx-auto -mt-1 border-r border-b border-slate-200" />
                                        </div>
                                    )}

                                    <svg className="w-full h-full overflow-visible" viewBox="0 0 300 70" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                                            </linearGradient>
                                        </defs>
                                        <path 
                                            d="M 0 66 L 45 66 C 60 66, 65 3, 80 3 L 155 3 C 165 3, 170 10, 180 10 L 225 10 C 235 10, 240 14, 250 14 L 300 15 L 300 70 L 0 70 Z" 
                                            fill="url(#heroGradient)" 
                                        />
                                        <path 
                                            d="M 0 66 L 45 66 C 60 66, 65 3, 80 3 L 155 3 C 165 3, 170 10, 180 10 L 225 10 C 235 10, 240 14, 250 14 L 300 15" 
                                            fill="none" 
                                            stroke="#3b82f6" 
                                            strokeWidth="3" 
                                            strokeLinecap="round" 
                                        />

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
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
