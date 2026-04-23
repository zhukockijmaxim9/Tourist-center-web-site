import './bootstrap';
import '../scss/app.scss';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotifyProvider } from './context/NotifyContext';
import ErrorBoundary from './components/ErrorBoundary';
import BaseApp from './BaseApp';

const root = document.getElementById('app');
const initialPage = root?.dataset?.page ? JSON.parse(root.dataset.page) : null;

createInertiaApp({
    page: initialPage,
    resolve: async (name) => {
        const pages = import.meta.glob('./pages/**/*.jsx');
        return pages[`./pages/${name}.jsx`]();
    },
    layout: () => BaseApp,
    setup({ el, App, props }) {
        createRoot(el).render(
            <ThemeProvider>
                <NotifyProvider>
                    <AuthProvider>
                        <ErrorBoundary>
                            <App {...props} />
                        </ErrorBoundary>
                    </AuthProvider>
                </NotifyProvider>
            </ThemeProvider>,
        );
    },
    progress: {
        color: '#6f7f8f',
    },
});
