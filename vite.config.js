import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    server: {
        open: '/frontend/index.html',
        proxy: {
            '/login': 'http://localhost:8000',
            '/register': 'http://localhost:8000',
            '/logout': 'http://localhost:8000',
            '/user': 'http://localhost:8000',
            '/api': 'http://localhost:8000',
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
