import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    server: {
        open: '/frontend/index.html',
    },
    plugins: [
        laravel({
            input: ['frontend/scss/app.scss', 'frontend/js/index.jsx'],
            refresh: true,
        }),
        react(),
    ],
});
