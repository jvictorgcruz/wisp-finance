import React, { useState, useEffect, useRef } from 'react';
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
    align?: 'center' | 'left' | 'right';
    className?: string;
    disabled?: boolean;
}

export default function Tooltip({ 
    children, 
    content, 
    position = 'top',
    align = 'center',
    className,
    disabled = false
}: TooltipProps) {
    const [show, setShow] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const isTouchRef = useRef(false);
    const openedByHoverRef = useRef(false);

    useEffect(() => {
        if (!show) return;
        const handleOutside = (e: MouseEvent | TouchEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShow(false);
                openedByHoverRef.current = false;
            }
        };
        document.addEventListener('mousedown', handleOutside);
        document.addEventListener('touchstart', handleOutside);
        return () => {
            document.removeEventListener('mousedown', handleOutside);
            document.removeEventListener('touchstart', handleOutside);
        };
    }, [show]);

    const horizontalAlignClasses = {
        center: 'left-1/2 -translate-x-1/2',
        left: 'left-0',
        right: 'right-0',
    }[align];

    const arrowHorizontalClasses = {
        center: 'left-1/2 -translate-x-1/2',
        left: 'left-3',
        right: 'right-3',
    }[align];
    
    const positionClasses = {
        top: `bottom-full ${horizontalAlignClasses} mb-2`,
        bottom: `top-full ${horizontalAlignClasses} mt-2`,
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const arrowClasses = {
        top: `top-full ${arrowHorizontalClasses} border-t-slate-800`,
        bottom: `bottom-full ${arrowHorizontalClasses} border-b-slate-800`,
        left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-800',
        right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-800',
    };

    return (
        <div 
            ref={containerRef}
            className={cn("relative inline-block z-20", show && "z-50", className)}
            onTouchStart={() => {
                isTouchRef.current = true;
            }}
            onMouseEnter={() => {
                if (isTouchRef.current || disabled || !content) return;
                openedByHoverRef.current = true;
                setShow(true);
            }}
            onMouseLeave={() => {
                if (isTouchRef.current) return;
                openedByHoverRef.current = false;
                setShow(false);
            }}
            onClick={() => {
                if (disabled || !content) return;
                if (openedByHoverRef.current) {
                    openedByHoverRef.current = false;
                    setShow(true);
                } else {
                    setShow(prev => !prev);
                }
            }}
        >
            {children}
            {content && !disabled && (
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
                        "absolute z-100 w-max max-w-[220px] sm:max-w-xs px-3 py-2 bg-slate-800 text-white text-[10px] font-bold rounded-lg shadow-xl pointer-events-none whitespace-normal text-left leading-relaxed",
                        positionClasses[position]
                    )}>
                        {content}
                        <div className={cn(
                            "absolute border-4 border-transparent",
                            arrowClasses[position]
                        )} />
                    </div>
                </Transition>
            )}
        </div>
    );
}
