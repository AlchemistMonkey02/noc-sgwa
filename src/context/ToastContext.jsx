import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer from '../components/ToastContainer';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 5000) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }]);

        if (duration !== Infinity) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, []);

    const success = (msg, dur) => showToast(msg, 'success', dur);
    const error = (msg, dur) => showToast(msg, 'error', dur);
    const warning = (msg, dur) => showToast(msg, 'warning', dur);
    const info = (msg, dur) => showToast(msg, 'info', dur);

    return (
        <ToastContext.Provider value={{ showToast, removeToast, success, error, warning, info }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};
