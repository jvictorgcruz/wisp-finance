import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Info } from 'lucide-react';
import Tooltip from '@/Components/Common/Tooltip';

interface Option {
    id: string;
    label: string;
    tooltip?: string;
}

interface Props {
    options: Option[];
    activeId: string;
    onChange: (id: string) => void;
}

export default function ViewToggle({ options, activeId, onChange }: Props) {
    return (
        <div className="relative flex w-full sm:w-auto bg-surface-low p-1 rounded-xl border border-transparent items-center">
            {options.map((option) => (
                <button
                    key={option.id}
                    onClick={() => onChange(option.id)}
                    className={clsx(
                        'relative z-10 flex-1 sm:flex-initial justify-center px-3 sm:px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.12em] transition-all duration-300 outline-none cursor-pointer flex items-center gap-1.5 whitespace-nowrap',
                        activeId === option.id 
                            ? 'text-primary' 
                            : 'text-slate-500 hover:text-slate-700'
                    )}
                >
                    {activeId === option.id && (
                        <motion.div
                            layoutId="active-pill-final"
                            className="absolute inset-0 bg-surface-lowest rounded-lg shadow-sm"
                            transition={{ type: 'spring', bounce: 0.1, duration: 0.5 }}
                        />
                    )}
                    <span className="relative z-20">{option.label}</span>
                    {option.tooltip && (
                        <span className="relative z-20" onClick={(e) => e.stopPropagation()}>
                            <Tooltip content={option.tooltip} position="bottom">
                                <span className="inline-flex p-0.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                                    <Info className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
                                </span>
                            </Tooltip>
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}
