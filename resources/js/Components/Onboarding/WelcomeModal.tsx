import React, { Fragment, useRef } from 'react';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { X } from 'lucide-react';
import { useTranslation } from '@/Hooks/useTranslation';
import axios from 'axios';
import HeroMockup from '@/Components/Landing/HeroMockup';

interface WelcomeModalProps {
    show: boolean;
    onClose: () => void;
}

export default function WelcomeModal({ show, onClose }: WelcomeModalProps) {
    const { t } = useTranslation();
    const hasDismissedRef = useRef(false);
    const isEscapeClosingRef = useRef(false);

    React.useEffect(() => {
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

    if (!show) {
        return null;
    }

    const handleDismiss = () => {
        if (hasDismissedRef.current) return;
        hasDismissedRef.current = true;

        // Asynchronously notify server that user has seen/dismissed the welcome modal
        axios.post('/user/welcome-dismissed').catch(() => {
            // Silently handle if network failure; user can continue without blocking
        });
        onClose();
    };

    const handleDialogClose = () => {
        if (!isEscapeClosingRef.current) {
            return;
        }
        handleDismiss();
    };

    return (
        <Transition show={show} as={Fragment}>
            <Dialog open={show} as="div" className="relative z-50" onClose={handleDialogClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity" />
                </TransitionChild>

                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="flex h-full items-center justify-center p-2.5 sm:p-4 md:p-6 text-center">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="relative w-full max-w-2xl md:max-w-3xl max-h-[calc(100dvh-1.25rem)] sm:max-h-[calc(100dvh-2rem)] md:max-h-[calc(100dvh-3rem)] bg-white rounded-3xl border border-slate-200/90 shadow-2xl text-left transform transition-all flex flex-col overflow-hidden my-auto">
                                {/* Header / Close Button */}
                                <div className="absolute top-3.5 right-3.5 z-20">
                                    <button 
                                        onClick={handleDismiss}
                                        aria-label={t('common.cancel')}
                                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 rounded-2xl transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-3 sm:p-5 md:p-6 overflow-y-auto flex-1 min-h-0 flex flex-col items-center text-center space-y-3 sm:space-y-4">
                                    {/* Headline and Subtitle */}
                                    <div className="pt-1 text-center w-full px-6 space-y-1">
                                        <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                                            {t('onboarding.title')}
                                        </h2>
                                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
                                            {t('onboarding.subtitle')}
                                        </p>
                                    </div>

                                    {/* Hero Mockup as an animated feature display identical to hero */}
                                    <div className="w-full mx-auto text-left">
                                        <HeroMockup compact={false} autoPlayInModal={true} hideGlow={true} />
                                    </div>

                                    {/* Action button: Just closes the modal */}
                                    <div className="w-full max-w-sm mx-auto pt-1">
                                        <button
                                            type="button"
                                            onClick={handleDismiss}
                                            className="w-full py-3 px-6 rounded-2xl bg-primary hover:bg-primary/95 text-white font-black text-sm shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.99] transition-all duration-200 cursor-pointer"
                                        >
                                            {t('onboarding.start_button')}
                                        </button>
                                    </div>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
