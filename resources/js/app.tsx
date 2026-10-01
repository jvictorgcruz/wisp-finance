import '@css/app.css';
import './bootstrap';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { DEFAULT_APP_TITLE } from './constants';

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Wisp Finance';

createInertiaApp({
    title: (title) => (!title || title === appName || title === DEFAULT_APP_TITLE ? (title || appName) : `${title} - ${appName}`),
    resolve: (name) => resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx') as any),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B3BC9',
    },
});
