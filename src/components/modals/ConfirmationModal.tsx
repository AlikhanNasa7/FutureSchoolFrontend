'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import type { ConfirmationModalData } from '@/lib/modalController';

interface ConfirmationModalProps {
    data: ConfirmationModalData;
    isOpen: boolean;
    onClose: () => void;
}

export default function ConfirmationModal({
    data,
    isOpen,
    onClose,
}: ConfirmationModalProps) {
    const [loading, setLoading] = useState(false);

    const {
        title,
        message,
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        confirmVariant = 'danger',
        onConfirm,
        onSuccess,
    } = data;

    const getConfirmButtonStyles = () => {
        switch (confirmVariant) {
            case 'danger':
                return 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white';
            case 'primary':
                return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white';
            case 'secondary':
                return 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 text-white';
            default:
                return 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white';
        }
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Confirmation action failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
            <div className="text-center">
                {/* Icon */}
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>

                {/* Title */}
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    {title}
                </h3>

                {/* Message */}
                <p className="mt-2 text-sm text-gray-600">{message}</p>

                {/* Buttons */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="order-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:order-1 sm:w-auto"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={loading}
                        className={`order-1 w-full rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:order-2 sm:w-auto ${getConfirmButtonStyles()}`}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                <span className="ml-2">Processing...</span>
                            </div>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
