import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Account from './pages/Account';
import ErrorBoundary from './components/ErrorBoundary';

function ProtectedRoute({ children, adminOnly = false }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="loading-screen"><div className="spinner"></div></div>;
    }

    if (!user) return <Navigate to="/login" />;
    if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;

    return children;
}

function GuestRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="loading-screen"><div className="spinner"></div></div>;
    }

    if (user) {
        return <Navigate to="/account" />;
    }

    return children;
}

function AppRoutes() {
    return (
        <>
            <Navbar />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                    <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
                    <Route
                        path="/account"
                        element={<ProtectedRoute><Account /></ProtectedRoute>}
                    />
                    <Route
                        path="/dashboard"
                        element={<ProtectedRoute><UserDashboard /></ProtectedRoute>}
                    />
                    <Route
                        path="/admin"
                        element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>}
                    />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>
        </>
    );
}

const App = () => {
    return (
        <HashRouter>
            <ThemeProvider>
                <AuthProvider>
                    <ErrorBoundary>
                        <AppRoutes />
                    </ErrorBoundary>
                </AuthProvider>
            </ThemeProvider>
        </HashRouter>
    );
};

export default App;
