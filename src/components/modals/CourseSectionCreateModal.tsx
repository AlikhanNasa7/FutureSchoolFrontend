'use client';

import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';
import { useLocale } from '@/contexts/LocaleContext';

interface CourseSectionCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    subjectId: number;
    onSectionCreated?: () => void;
}

interface SectionFormData {
    title: string;
    quarter: number | null;
}

export default function CourseSectionCreateModal({
    isOpen,
    onClose,
    subjectId,
    onSectionCreated,
}: CourseSectionCreateModalProps) {
    const { t } = useLocale();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [sectionForm, setSectionForm] = useState<SectionFormData>({
        title: '',
        quarter: null,
    });

    const handleSectionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const sectionData: any = {
                subject_group: subjectId,
                title: sectionForm.title,
            };
            
            if (sectionForm.quarter) {
                sectionData.quarter = sectionForm.quarter;
            }

            console.log('Creating section:', sectionData);

            const response = await axiosInstance.post(
                '/course-sections/',
                sectionData
            );
            console.log('Section created successfully:', response.data);
            setSuccess(t('modals.courseSection.successMessage'));
            onSectionCreated?.();
            setTimeout(() => {
                onClose();
                resetForm();
            }, 1500);
        } catch (error: unknown) {
            console.error('Error creating section:', error);
            const errorMessage =
                error instanceof AxiosError
                    ? error.response?.data?.message ||
                      error.response?.data?.error ||
                      error.message
                    : 'Failed to create section';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setSectionForm({
            title: '',
            quarter: null,
        });
        setError(null);
        setSuccess(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={t('modals.courseSection.createTitle')}
            maxWidth="max-w-2xl"
        >
            <div className="space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <p className="text-sm text-green-600">{success}</p>
                    </div>
                )}

                <form onSubmit={handleSectionSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('modals.courseSection.sectionName')} *
                        </label>
                        <div className="relative">
                            <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={sectionForm.title}
                                onChange={e =>
                                    setSectionForm(prev => ({
                                        ...prev,
                                        title: e.target.value,
                                    }))
                                }
                                required
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={t(
                                    'modals.courseSection.enterSectionName'
                                )}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Четверть (необязательно)
                        </label>
                        <select
                            value={sectionForm.quarter || ''}
                            onChange={e =>
                                setSectionForm(prev => ({
                                    ...prev,
                                    quarter: e.target.value === '' ? null : parseInt(e.target.value),
                                }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Все четверти</option>
                            <option value="1">1 четверть</option>
                            <option value="2">2 четверть</option>
                            <option value="3">3 четверть</option>
                            <option value="4">4 четверть</option>
                        </select>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            {t('modals.courseSection.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting
                                ? t('modals.courseSection.creating')
                                : t('modals.courseSection.createSection')}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
