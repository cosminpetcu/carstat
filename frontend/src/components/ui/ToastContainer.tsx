"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Toast, type ToastMessage } from './Toast';

interface ToastContainerProps {
    toasts: ToastMessage[];
    onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
    return (
        <div className="fixed top-20 right-6 z-50 space-y-3">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        toast={toast}
                        onRemove={onRemove}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};