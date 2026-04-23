import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    server: {
        open: false,
        proxy: {
            '/api': process.env.VITE_API_URL || 'http://localhost:8000',
            '/images': process.env.VITE_API_URL || 'http://localhost:8000',
            '/fonts': process.env.VITE_API_URL || 'http://localhost:8000',
        },
    },
    plugins: [
        laravel({
            input: ['resources/scss/app.scss', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
    ],
});
