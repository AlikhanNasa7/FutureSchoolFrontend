'use client';

import { useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { courseService } from '@/services/courseService';
import Modal from '@/components/ui/Modal';

interface SyncContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: number;
    courseName: string;
    onSuccess: () => void;
}

export default function SyncContentModal({
    isOpen,
    onClose,
    courseId,
    courseName,
    onSuccess,
}: SyncContentModalProps) {
    const [academicStartDate, setAcademicStartDate] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Calculate default academic start date (September 1st of current academic year)
    const getDefaultAcademicStartDate = () => {
        const now = new Date();
        let year = now.getFullYear();
        // If before September, use previous year
        if (now.getMonth() < 8) {
            year -= 1;
        }
        return `${year}-09-01`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            setSubmitting(true);
            const result = await courseService.syncContent(
                courseId,
                academicStartDate || undefined
            );
            console.log('Sync result:', result);
            setSuccess(result.detail || 'Контент успешно синхронизирован');
            // Wait a bit before calling onSuccess to show success message
            setTimeout(() => {
                onSuccess();
                setAcademicStartDate('');
                setSuccess(null);
            }, 1500);
        } catch (err: any) {
            console.error('Error syncing content:', err);
            console.error('Error response:', err.response);
            if (err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else if (err.response?.data) {
                // Handle other error formats
                const errorMsg = typeof err.response.data === 'string' 
                    ? err.response.data 
                    : JSON.stringify(err.response.data);
                setError(errorMsg);
            } else {
                setError('Не удалось синхронизировать контент. Проверьте консоль для деталей.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Синхронизировать контент"
            maxWidth="max-w-md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">
                                    Контент будет скопирован во все классы курса "{courseName}"
                                </p>
                                <p>
                                    Все шаблонные секции, ресурсы и задания будут созданы в
                                    дочерних секциях с автоматическим расчетом дат на основе
                                    начала учебного года.
                                </p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-sm text-green-800">{success}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Дата начала учебного года
                        </label>
                        <input
                            type="date"
                            value={academicStartDate || getDefaultAcademicStartDate()}
                            onChange={(e) => setAcademicStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Если не указано, будет использовано 1 сентября текущего
                            академического года
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            disabled={submitting}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Синхронизация...</span>
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4" />
                                    <span>Синхронизировать</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
        </Modal>
    );
}

