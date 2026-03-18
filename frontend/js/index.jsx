import './bootstrap';
import '../scss/app.scss';

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './BaseApp';

const rootElement = document.getElementById('app');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
}
