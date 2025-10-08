'use client';

import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';

interface CourseSectionCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    subjectId: number;
    onSectionCreated?: () => void;
}

interface SectionFormData {
    title: string;
}

export default function CourseSectionCreateModal({
    isOpen,
    onClose,
    subjectId,
    onSectionCreated,
}: CourseSectionCreateModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [sectionForm, setSectionForm] = useState<SectionFormData>({
        title: '',
    });

    const handleSectionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const sectionData = {
                subject_group: subjectId,
                title: sectionForm.title,
            };

            console.log('Creating section:', sectionData);

            const response = await axiosInstance.post(
                '/course-sections/',
                sectionData
            );
            console.log('Section created successfully:', response.data);
            setSuccess('Section created successfully!');
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
            title="Create New Course Section"
            maxWidth="max-w-2xl"
        >
            <div className="space-y-6">
                {/* Error and Success Messages */}
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

                {/* Section Form */}
                <form onSubmit={handleSectionSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Section Name *
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
                                placeholder="Enter section name"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Section'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
