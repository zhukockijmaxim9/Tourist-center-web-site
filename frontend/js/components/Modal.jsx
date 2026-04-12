import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    variant,
    overlayClassName = '',
    contentClassName = '',
}) {
    const isBooking = variant === 'booking';

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) return undefined;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const overlayCls = ['modal-overlay', isBooking && 'modal-overlay--booking', overlayClassName]
        .filter(Boolean)
        .join(' ');
    const contentCls = ['modal-content', isBooking && 'modal-content--booking', contentClassName]
        .filter(Boolean)
        .join(' ');

    return createPortal(
        <div
            className={overlayCls}
            onClick={onClose}
            role="presentation"
        >
            <div className={contentCls} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                {isBooking ? (
                    <button
                        type="button"
                        className="modal-close modal-close--booking"
                        onClick={onClose}
                        aria-label="Закрыть"
                    >
                        &times;
                    </button>
                ) : (
                    <div className="modal-header">
                        <h2>{title}</h2>
                        <button type="button" className="modal-close" onClick={onClose} aria-label="Закрыть">
                            &times;
                        </button>
                    </div>
                )}
                <div className={`modal-body ${isBooking ? 'modal-body--booking' : ''}`}>{children}</div>
            </div>
        </div>,
        document.body,
    );
}
