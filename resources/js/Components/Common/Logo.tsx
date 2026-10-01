import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface LogoProps {
    className?: string;
    imageSize?: number;
    textSize?: string;
    showText?: boolean;
}

export default function Logo({ 
    className, 
    imageSize = 6, 
    textSize = "text-2xl", 
    showText = true 
}: LogoProps) {
    return (
        <div className={cn("flex items-center gap-2 group cursor-pointer", className)}>
            <img 
                src="/logo.webp" 
                alt="Wisp Logo" 
                width={imageSize * 4}
                height={imageSize * 4}
                loading="eager"
                decoding="async"
                className={cn("object-contain group-hover:scale-110 transition-transform", `w-${imageSize} h-${imageSize}`)} 
            />
            {showText && (
                <span className={cn("font-black tracking-tighter text-slate-900", textSize)}>
                    Wisp
                </span>
            )}
        </div>
    );
}
