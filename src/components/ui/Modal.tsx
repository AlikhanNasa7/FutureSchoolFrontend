'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    maxWidth?: string;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'max-w-md',
}: ModalProps) {
    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={handleBackdropClick}
        >
            <div
                className={`bg-white rounded-lg shadow-lg p-3 sm:p-6 w-full ${maxWidth} max-h-[95vh] overflow-hidden flex flex-col`}
            >
                {title && (
                    <div className="flex items-center justify-between mb-4 sm:mb-6 flex-shrink-0">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate pr-2">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                        >
                            <X size={20} className="sm:w-6 sm:h-6" />
                        </button>
                    </div>
                )}
                <div className="flex-1 overflow-auto">{children}</div>
            </div>
        </div>
    );
}
