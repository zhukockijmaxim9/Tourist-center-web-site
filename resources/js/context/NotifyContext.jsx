import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const NotifyContext = createContext(null);

function uid() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getErrorMessage(err, fallback = 'Произошла ошибка') {
    const msg =
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message;
    if (typeof msg === 'string' && msg.trim()) return msg.trim();
    return fallback;
}

export function useNotify() {
    const ctx = useContext(NotifyContext);
    if (!ctx) throw new Error('useNotify must be used within NotifyProvider');
    return ctx;
}

export function NotifyProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const notify = useCallback((toast) => {
        const t = {
            id: uid(),
            type: toast?.type || 'info',
            title: toast?.title || '',
            message: toast?.message || '',
            timeoutMs: Number.isFinite(toast?.timeoutMs) ? toast.timeoutMs : 4500,
        };
        setToasts((prev) => [...prev, t]);

        if (t.timeoutMs > 0) {
            window.setTimeout(() => dismiss(t.id), t.timeoutMs);
        }
        return t.id;
    }, [dismiss]);

    const api = useMemo(() => ({
        toasts,
        notify,
        dismiss,
        success: (message, opts) => notify({ type: 'success', message, ...opts }),
        error: (message, opts) => notify({ type: 'error', message, ...opts }),
        info: (message, opts) => notify({ type: 'info', message, ...opts }),
        fromError: (err, fallback, opts) => notify({ type: 'error', message: getErrorMessage(err, fallback), ...opts }),
    }), [toasts, notify, dismiss]);

    return (
        <NotifyContext.Provider value={api}>
            {children}
            <div className="toast-stack" aria-live="polite" aria-relevant="additions">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast toast--${t.type}`} role="status">
                        <div className="toast__body">
                            {t.title ? <div className="toast__title">{t.title}</div> : null}
                            {t.message ? <div className="toast__message">{t.message}</div> : null}
                        </div>
                        <button type="button" className="toast__close" onClick={() => dismiss(t.id)} aria-label="Закрыть">
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </NotifyContext.Provider>
    );
}

