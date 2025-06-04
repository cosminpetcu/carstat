"use client";

import { useEffect } from 'react';
import { motion } from 'framer-motion';

export interface ToastMessage {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

interface ToastProps {
    toast: ToastMessage;
    onRemove: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(toast.id);
        }, toast.duration || 5000);

        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onRemove]);

    const getToastStyles = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-green-500 text-white';
            case 'error':
                return 'bg-red-500 text-white';
            case 'warning':
                return 'bg-yellow-500 text-black';
            case 'info':
                return 'bg-blue-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            case 'info':
                return 'ℹ';
            default:
                return '';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.95 }}
            className={`px-6 py-3 rounded-lg shadow-lg transition-all flex items-center gap-3 min-w-[300px] max-w-[500px] ${getToastStyles()}`}
        >
            <span className="flex-shrink-0 font-bold text-lg">{getIcon()}</span>
            <span className="flex-grow text-sm font-medium">{toast.message}</span>
            <button
                onClick={() => onRemove(toast.id)}
                className="flex-shrink-0 ml-2 opacity-70 hover:opacity-100 transition-opacity text-lg font-bold"
            >
                ×
            </button>
        </motion.div>
    );
};