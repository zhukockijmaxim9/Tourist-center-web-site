import React from 'react';
import Navbar from './components/Navbar';

export default function BaseApp({ children }) {
    return (
        <>
            <Navbar />
            <main className="main-content">{children}</main>
        </>
    );
}
