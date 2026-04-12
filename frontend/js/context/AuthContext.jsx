import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await authApi.getUser();
            setUser(res.data.user);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await authApi.login({ email, password });
        setUser(res.data.user);
        return res.data.user;
    };

    const register = async (data) => {
        const res = await authApi.register(data);
        setUser(res.data.user);
        return res.data.user;
    };

    const logout = async () => {
        await authApi.logout();
        setUser(null);
    };

    const updateProfile = async (data) => {
        const res = await authApi.updateProfile(data);
        setUser(res.data.user);
        return res.data.user;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be within AuthProvider');
    return ctx;
}
