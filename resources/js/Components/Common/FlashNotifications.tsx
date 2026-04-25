import React, { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast, Toaster } from 'sonner';

export default function FlashNotifications() {
    const { props } = usePage();
    const { flash } = props as any || {};

    useEffect(() => {
        if (!flash) return;

        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
        if (flash.warning) {
            toast.warning(flash.warning);
        }
    }, [flash]);

    return (
        <Toaster 
            position="top-right" 
            richColors 
            closeButton
            theme="light"
            toastOptions={{
                style: {
                    borderRadius: '1.25rem',
                    padding: '1rem',
                }
            }}
        />
    );
}
