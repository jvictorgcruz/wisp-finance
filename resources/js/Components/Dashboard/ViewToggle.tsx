import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface Option {
    id: string;
    label: string;
}

interface Props {
    options: Option[];
    activeId: string;
    onChange: (id: string) => void;
}

export default function ViewToggle({ options, activeId, onChange }: Props) {
    return (
        <div className="relative flex bg-surface-low p-1 rounded-xl border border-transparent">
            {options.map((option) => (
                <button
                    key={option.id}
                    onClick={() => onChange(option.id)}
                    className={clsx(
                        'relative z-10 px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.12em] transition-all duration-300 outline-none cursor-pointer',
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
                </button>
            ))}
        </div>
    );
}
