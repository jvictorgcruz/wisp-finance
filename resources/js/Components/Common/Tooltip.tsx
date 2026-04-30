import React, { useState } from 'react';
import { Transition } from '@headlessui/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface TooltipProps {
    children: React.ReactNode;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
    disabled?: boolean;
}

export default function Tooltip({ 
    children, 
    content, 
    position = 'top',
    className,
    disabled = false
}: TooltipProps) {
    const [show, setShow] = useState(false);

    if (disabled || !content) return <>{children}</>;

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-800',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-800',
        left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-800',
        right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-800',
    };

    return (
        <div 
            className={cn("relative inline-block", className)}
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}
            <Transition
                show={show}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <div className={cn(
                    "absolute z-100 w-max max-w-xs px-3 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg shadow-xl pointer-events-none",
                    positionClasses[position]
                )}>
                    {content}
                    <div className={cn(
                        "absolute border-4 border-transparent",
                        arrowClasses[position]
                    )} />
                </div>
            </Transition>
        </div>
    );
}
