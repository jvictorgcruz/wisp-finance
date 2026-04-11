import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    show: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export default function Modal({
    show,
    onClose,
    title,
    children,
    maxWidth = 'md'
}: ModalProps) {
    if (!show) return null;

    const maxWidthClasses = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
    }[maxWidth];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4 sm:p-6">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity cursor-pointer" 
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Content */}
            <div className={`relative z-50 w-full bg-white rounded-3xl shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200 ${maxWidthClasses} max-h-[90vh] overflow-hidden flex flex-col`}>
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
                        {title}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
