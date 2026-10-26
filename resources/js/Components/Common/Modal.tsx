import React, { ReactNode, Fragment, useState, useEffect, useRef, useCallback } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { useTranslation } from '@/Hooks/useTranslation';

interface ModalProps {
    show: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    afterLeave?: () => void;
    isDirty?: boolean;
}

export default function Modal({
    show,
    onClose,
    title,
    children,
    maxWidth = 'md',
    afterLeave,
    isDirty = false,
}: ModalProps) {
    const { t } = useTranslation();
    const [confirmingDiscard, setConfirmingDiscard] = useState(false);
    const isEscapeClosingRef = useRef(false);

    useEffect(() => {
        if (!show) {
            setConfirmingDiscard(false);
        }
    }, [show]);

    useEffect(() => {
        if (!show) return;

        const handleKeyDownCapture = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                isEscapeClosingRef.current = true;
                queueMicrotask(() => {
                    isEscapeClosingRef.current = false;
                });
            }
        };

        window.addEventListener('keydown', handleKeyDownCapture, true);
        return () => window.removeEventListener('keydown', handleKeyDownCapture, true);
    }, [show]);

    const handleRequestClose = useCallback(() => {
        if (isDirty) {
            setConfirmingDiscard(true);
        } else {
            onClose();
        }
    }, [isDirty, onClose]);

    const handleDialogClose = useCallback(() => {
        // Ignore outside/backdrop clicks; only react to Escape key events
        if (!isEscapeClosingRef.current) {
            return;
        }
        if (confirmingDiscard) {
            setConfirmingDiscard(false);
            return;
        }
        handleRequestClose();
    }, [confirmingDiscard, handleRequestClose]);

    const handleConfirmDiscard = useCallback(() => {
        setConfirmingDiscard(false);
        onClose();
    }, [onClose]);

    const handleKeepEditing = useCallback(() => {
        setConfirmingDiscard(false);
    }, []);

    const handleContentClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement | null;
        if (target?.closest('[data-modal-close]')) {
            e.preventDefault();
            handleRequestClose();
        }
    }, [handleRequestClose]);

    const maxWidthClasses = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
    }[maxWidth];

    return (
        <Transition show={show} as={Fragment} afterLeave={afterLeave}>
            <Dialog as="div" className="relative z-50" onClose={handleDialogClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div
                        data-testid="modal-backdrop"
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                    />
                </TransitionChild>

                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="flex h-full items-center justify-center p-4 text-center sm:p-6">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className={`relative w-full max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] bg-white rounded-3xl border-editorial text-left transform transition-all ${maxWidthClasses} flex flex-col overflow-hidden my-auto`}>
                                <div className="px-6 py-4 border-b border-editorial flex items-center justify-between bg-white shrink-0 z-10 rounded-t-3xl">
                                    <DialogTitle as="h3" className="text-sm font-bold uppercase tracking-widest text-slate-500">
                                        {title}
                                    </DialogTitle>
                                    <button 
                                        type="button"
                                        onClick={handleRequestClose}
                                        aria-label={t('common.cancel')}
                                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div
                                    className="p-6 overflow-y-auto flex-1 min-h-0"
                                    onClick={handleContentClick}
                                >
                                    {children}
                                </div>

                                {confirmingDiscard && (
                                    <div
                                        data-testid="discard-confirmation"
                                        className="absolute inset-0 z-30 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-6 animate-in fade-in duration-150"
                                    >
                                        <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 max-w-sm w-full text-center space-y-5 animate-in zoom-in-95 duration-150">
                                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                                                <AlertTriangle className="w-6 h-6" />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-base font-black text-slate-900 tracking-tight">
                                                    {t('common.discard_changes_title')}
                                                </h4>
                                                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                                                    {t('common.discard_changes_message')}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-center gap-3 pt-1">
                                                <button
                                                    type="button"
                                                    onClick={handleKeepEditing}
                                                    className="flex-1 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                                                >
                                                    {t('common.keep_editing')}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleConfirmDiscard}
                                                    className="flex-1 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all cursor-pointer"
                                                >
                                                    {t('common.discard')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

