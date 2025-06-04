"use client";

import { useState, useCallback } from 'react';

export interface ToastMessage {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

export const useToast = () => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((
        message: string,
        type: ToastMessage['type'] = 'info',
        duration: number = 5000
    ) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast: ToastMessage = { id, message, type, duration };

        setToasts(prev => [...prev, newToast]);

        return id;
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const showSuccess = useCallback((message: string, duration?: number) => {
        return addToast(message, 'success', duration);
    }, [addToast]);

    const showError = useCallback((message: string, duration?: number) => {
        return addToast(message, 'error', duration);
    }, [addToast]);

    const showInfo = useCallback((message: string, duration?: number) => {
        return addToast(message, 'info', duration);
    }, [addToast]);

    const showWarning = useCallback((message: string, duration?: number) => {
        return addToast(message, 'warning', duration);
    }, [addToast]);

    const clearAll = useCallback(() => {
        setToasts([]);
    }, []);

    return {
        toasts,
        addToast,
        removeToast,
        showSuccess,
        showError,
        showInfo,
        showWarning,
        clearAll
    };
};