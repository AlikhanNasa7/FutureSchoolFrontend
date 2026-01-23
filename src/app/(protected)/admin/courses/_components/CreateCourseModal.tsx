'use client';

import { useState, useEffect } from 'react';
import { courseService } from '@/services/courseService';
import { useLocale } from '@/contexts/LocaleContext';
import Modal from '@/components/ui/Modal';
import type { Course } from '@/types/course';

interface CreateCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    course?: Course | null;
}

export default function CreateCourseModal({
    isOpen,
    onClose,
    onSuccess,
    course,
}: CreateCourseModalProps) {
    const { t } = useLocale();
    const isEditMode = !!course;
    const [formData, setFormData] = useState({
        course_code: '',
        name: '',
        description: '',
        grade: 1,
        language: 'kazakh',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    // Load course data when editing
    useEffect(() => {
        if (course) {
            setFormData({
                course_code: course.course_code || '',
                name: course.name || '',
                description: course.description || '',
                grade: course.grade || 1,
                language: (course as any).language || 'kazakh',
            });
        } else {
            setFormData({
                course_code: '',
                name: '',
                description: '',
                grade: 1,
                language: 'kazakh',
            });
        }
        setErrors({});
    }, [course, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Validation
        const newErrors: Record<string, string> = {};
        if (!formData.course_code.trim()) {
            newErrors.course_code = 'Код курса обязателен';
        } else if (formData.course_code.length > 20) {
            newErrors.course_code = 'Код курса не должен превышать 20 символов';
        }
        if (!formData.name.trim()) {
            newErrors.name = 'Название курса обязательно';
        }
        if (formData.grade < 1 || formData.grade > 12) {
            newErrors.grade = 'Класс должен быть от 1 до 12';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setSubmitting(true);
            if (isEditMode && course) {
                await courseService.updateCourse(course.id, {
                    course_code: formData.course_code.trim(),
                    name: formData.name.trim(),
                    description: formData.description.trim() || undefined,
                    grade: formData.grade,
                    language: formData.language,
                });
            } else {
                await courseService.createCourse({
                    course_code: formData.course_code.trim(),
                    name: formData.name.trim(),
                    description: formData.description.trim() || undefined,
                    grade: formData.grade,
                    language: formData.language,
                });
            }
            onSuccess();
            // Reset form only if not editing
            if (!isEditMode) {
                setFormData({
                    course_code: '',
                    name: '',
                    description: '',
                    grade: 1,
                    language: 'kazakh',
                });
            }
        } catch (error: any) {
            console.error('Error creating course:', error);
            if (error.response?.data) {
                const apiErrors = error.response.data;
                if (apiErrors.course_code) {
                    setErrors({
                        course_code: Array.isArray(apiErrors.course_code)
                            ? apiErrors.course_code[0]
                            : apiErrors.course_code,
                    });
                } else if (apiErrors.non_field_errors) {
                    setErrors({
                        course_code: Array.isArray(apiErrors.non_field_errors)
                            ? apiErrors.non_field_errors[0]
                            : apiErrors.non_field_errors,
                    });
                } else {
                    setErrors({ general: isEditMode ? 'Не удалось обновить курс' : 'Не удалось создать курс' });
                }
            } else {
                setErrors({ general: isEditMode ? 'Не удалось обновить курс' : 'Не удалось создать курс' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditMode ? 'Редактировать курс' : 'Создать курс'}
            maxWidth="max-w-md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-800">{errors.general}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Код курса <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.course_code}
                            onChange={(e) =>
                                setFormData({ ...formData, course_code: e.target.value })
                            }
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                errors.course_code ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="MATH1"
                            maxLength={20}
                        />
                        {errors.course_code && (
                            <p className="text-sm text-red-600 mt-1">{errors.course_code}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Название курса <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Математика 1 класс"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Описание
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                            rows={3}
                            placeholder="Описание курса (опционально)"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Класс <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.grade}
                            onChange={(e) =>
                                setFormData({ ...formData, grade: parseInt(e.target.value) })
                            }
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                errors.grade ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                                <option key={grade} value={grade}>
                                    {grade} класс
                                </option>
                            ))}
                        </select>
                        {errors.grade && (
                            <p className="text-sm text-red-600 mt-1">{errors.grade}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Язык обучения <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.language}
                            onChange={(e) =>
                                setFormData({ ...formData, language: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="kazakh">Қазақша</option>
                            <option value="russian">Русский</option>
                            <option value="english">English</option>
                        </select>
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
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {submitting
                                ? isEditMode
                                    ? 'Сохранение...'
                                    : 'Создание...'
                                : isEditMode
                                  ? 'Сохранить'
                                  : 'Создать'}
                        </button>
                    </div>
                </form>
        </Modal>
    );
}

