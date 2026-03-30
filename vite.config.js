import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    server: {
        open: '/frontend/index.html',
        proxy: {
            '/login': process.env.VITE_API_URL || 'http://localhost:8000',
            '/register': process.env.VITE_API_URL || 'http://localhost:8000',
            '/logout': process.env.VITE_API_URL || 'http://localhost:8000',
            '/user': process.env.VITE_API_URL || 'http://localhost:8000',
            '/api': process.env.VITE_API_URL || 'http://localhost:8000',
        },
    },
    plugins: [
        laravel({
            input: ['frontend/scss/app.scss', 'frontend/js/index.jsx'],
            refresh: true,
        }),
        react(),
    ],
});
