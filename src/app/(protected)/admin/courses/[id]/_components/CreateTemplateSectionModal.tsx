'use client';

import { useState, useEffect } from 'react';
import { courseService } from '@/services/courseService';
import type { CourseSection } from '@/types/course';
import Modal from '@/components/ui/Modal';

interface CreateTemplateSectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: number;
    section?: CourseSection | null;
    onSuccess: () => void;
}

type ScheduleType = 'week' | 'offset';

export default function CreateTemplateSectionModal({
    isOpen,
    onClose,
    courseId,
    section,
    onSuccess,
}: CreateTemplateSectionModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        position: 0,
        is_general: false,
        scheduleType: 'week' as ScheduleType,
        template_week_index: null as number | null,
        template_start_offset_days: null as number | null,
        template_duration_days: 7,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (section) {
            // Editing mode
            setFormData({
                title: section.title,
                position: section.position,
                is_general: section.is_general,
                scheduleType:
                    section.template_week_index !== null &&
                    section.template_week_index !== undefined
                        ? 'week'
                        : 'offset',
                template_week_index: section.template_week_index ?? null,
                template_start_offset_days: section.template_start_offset_days ?? null,
                template_duration_days: section.template_duration_days ?? 7,
            });
        } else {
            // Create mode - reset form
            setFormData({
                title: '',
                position: 0,
                is_general: false,
                scheduleType: 'week',
                template_week_index: null,
                template_start_offset_days: null,
                template_duration_days: 7,
            });
        }
        setErrors({});
    }, [section, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Validation
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) {
            newErrors.title = 'Название секции обязательно';
        }
        if (formData.scheduleType === 'week') {
            if (
                formData.template_week_index === null ||
                formData.template_week_index === undefined
            ) {
                newErrors.template_week_index = 'Укажите номер недели';
            } else if (formData.template_week_index < 0) {
                newErrors.template_week_index = 'Номер недели должен быть неотрицательным';
            }
        } else {
            if (
                formData.template_start_offset_days === null ||
                formData.template_start_offset_days === undefined
            ) {
                newErrors.template_start_offset_days = 'Укажите смещение в днях';
            } else if (formData.template_start_offset_days < 0) {
                newErrors.template_start_offset_days =
                    'Смещение должно быть неотрицательным';
            }
        }
        if (!formData.template_duration_days || formData.template_duration_days < 1) {
            newErrors.template_duration_days = 'Длительность должна быть больше 0';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setSubmitting(true);
            const payload: any = {
                course: courseId,
                subject_group: null, // Important: null for template sections
                title: formData.title.trim(),
                is_general: formData.is_general,
                template_duration_days: formData.template_duration_days,
            };

            if (formData.position > 0) {
                payload.position = formData.position;
            }

            if (formData.scheduleType === 'week') {
                payload.template_week_index = formData.template_week_index;
                payload.template_start_offset_days = null;
            } else {
                payload.template_start_offset_days = formData.template_start_offset_days;
                payload.template_week_index = null;
            }

            if (section) {
                await courseService.updateCourseSection(section.id, payload);
            } else {
                await courseService.createTemplateSection(payload);
            }

            onSuccess();
        } catch (error: any) {
            console.error('Error saving section:', error);
            if (error.response?.data) {
                const apiErrors = error.response.data;
                const errorMessages: Record<string, string> = {};
                Object.keys(apiErrors).forEach((key) => {
                    errorMessages[key] = Array.isArray(apiErrors[key])
                        ? apiErrors[key][0]
                        : apiErrors[key];
                });
                setErrors(errorMessages);
            } else {
                setErrors({
                    general: section
                        ? 'Не удалось обновить секцию'
                        : 'Не удалось создать секцию',
                });
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={section ? 'Редактировать секцию' : 'Создать шаблонную секцию'}
            maxWidth="max-w-2xl"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-800">{errors.general}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Название секции <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                errors.title ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Неделя 1: Сложение и вычитание"
                        />
                        {errors.title && (
                            <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Позиция
                            </label>
                            <input
                                type="number"
                                value={formData.position || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        position: parseInt(e.target.value) || 0,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Автоматически"
                                min="0"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Если не указано, будет установлено автоматически
                            </p>
                        </div>

                        <div className="flex items-center pt-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_general}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            is_general: e.target.checked,
                                        })
                                    }
                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm text-gray-700">Общая секция</span>
                            </label>
                        </div>
                    </div>

                    {/* Schedule Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Тип расписания <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="scheduleType"
                                    value="week"
                                    checked={formData.scheduleType === 'week'}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            scheduleType: 'week' as ScheduleType,
                                            template_start_offset_days: null,
                                        })
                                    }
                                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                                />
                                <span className="text-sm text-gray-700">По неделе</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="scheduleType"
                                    value="offset"
                                    checked={formData.scheduleType === 'offset'}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            scheduleType: 'offset' as ScheduleType,
                                            template_week_index: null,
                                        })
                                    }
                                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                                />
                                <span className="text-sm text-gray-700">По смещению</span>
                            </label>
                        </div>
                    </div>

                    {/* Week Index */}
                    {formData.scheduleType === 'week' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Номер недели учебного года{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={formData.template_week_index ?? ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        template_week_index:
                                            e.target.value === ''
                                                ? null
                                                : parseInt(e.target.value),
                                    })
                                }
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                    errors.template_week_index
                                        ? 'border-red-500'
                                        : 'border-gray-300'
                                }`}
                                placeholder="0 (первая неделя)"
                                min="0"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                0 = первая неделя учебного года
                            </p>
                            {errors.template_week_index && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.template_week_index}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Offset Days */}
                    {formData.scheduleType === 'offset' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Смещение от начала учебного года (дни){' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={formData.template_start_offset_days ?? ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        template_start_offset_days:
                                            e.target.value === ''
                                                ? null
                                                : parseInt(e.target.value),
                                    })
                                }
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                    errors.template_start_offset_days
                                        ? 'border-red-500'
                                        : 'border-gray-300'
                                }`}
                                placeholder="0"
                                min="0"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Количество дней от начала учебного года
                            </p>
                            {errors.template_start_offset_days && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.template_start_offset_days}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Длительность секции (дни) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={formData.template_duration_days}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    template_duration_days: parseInt(e.target.value) || 7,
                                })
                            }
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                errors.template_duration_days
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                            }`}
                            placeholder="7"
                            min="1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Обычно 7 дней для недельной секции
                        </p>
                        {errors.template_duration_days && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.template_duration_days}
                            </p>
                        )}
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
                                ? section
                                    ? 'Сохранение...'
                                    : 'Создание...'
                                : section
                                  ? 'Сохранить'
                                  : 'Создать'}
                        </button>
                    </div>
                </form>
        </Modal>
    );
}

