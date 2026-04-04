import React from 'react';
import logoImg from '@images/logo.png';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface LogoProps {
    className?: string;
    imageSize?: string;
    textSize?: string;
    showText?: boolean;
}

export default function Logo({ 
    className, 
    imageSize = "w-9 h-9", 
    textSize = "text-2xl", 
    showText = true 
}: LogoProps) {
    return (
        <div className={cn("flex items-center gap-0.5 group cursor-pointer", className)}>
            <img 
                src={logoImg} 
                alt="Wisp Logo" 
                className={cn("object-contain group-hover:scale-110 transition-transform", imageSize)} 
            />
            {showText && (
                <span className={cn("font-black tracking-tighter text-slate-900", textSize)}>
                    Wisp
                </span>
            )}
        </div>
    );
}
