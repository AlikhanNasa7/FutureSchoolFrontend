'use client';

import { useState, useEffect } from 'react';
import { courseService } from '@/services/courseService';
import Modal from '@/components/ui/Modal';
import axiosInstance from '@/lib/axios';
import ScheduleBuilder from '@/components/schedule/ScheduleBuilder';

interface Teacher {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
}

interface Classroom {
    id: number;
    grade: number;
    letter: string;
    language?: string;
    school_name: string;
}

interface CreateSubjectGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: number;
    courseLanguage?: string;
    subjectGroup?: SubjectGroup | null;
    onSuccess: () => void;
}

interface SubjectGroup {
    id: number;
    course: number;
    classroom: number;
    teacher: number | null;
    classroom_display?: string;
    teacher_username?: string;
    teacher_fullname?: string;
}

export default function CreateSubjectGroupModal({
    isOpen,
    onClose,
    courseId,
    courseLanguage,
    subjectGroup,
    onSuccess,
}: CreateSubjectGroupModalProps) {
    const [formData, setFormData] = useState({
        classroom: '',
        teacher: '',
    });
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [loadingTeachers, setLoadingTeachers] = useState(false);
    const [loadingClassrooms, setLoadingClassrooms] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [scheduleSlots, setScheduleSlots] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchTeachers();
            fetchClassrooms();
            // Set form data based on whether we're editing or creating
            if (subjectGroup) {
                setFormData({
                    classroom: subjectGroup.classroom.toString(),
                    teacher: subjectGroup.teacher?.toString() || '',
                });
                fetchScheduleSlots(subjectGroup.id);
            } else {
                setFormData({ classroom: '', teacher: '' });
                setScheduleSlots([]);
            }
            setErrors({});
        }
    }, [isOpen, subjectGroup]);

    const fetchScheduleSlots = async (subjectGroupId: number) => {
        try {
            const response = await axiosInstance.get('/schedule-slots/', {
                params: { subject_group: subjectGroupId },
            });
            const slots = Array.isArray(response.data)
                ? response.data
                : response.data.results || [];
            setScheduleSlots(slots);
        } catch (error) {
            console.error('Error fetching schedule slots:', error);
            setScheduleSlots([]);
        }
    };

    const fetchTeachers = async () => {
        setLoadingTeachers(true);
        try {
            const response = await axiosInstance.get('/users/', {
                params: { role: 'teacher' },
            });
            setTeachers(response.data);
        } catch (error) {
            console.error('Error fetching teachers:', error);
        } finally {
            setLoadingTeachers(false);
        }
    };

    const fetchClassrooms = async () => {
        setLoadingClassrooms(true);
        try {
            const params: Record<string, string> = {};
            // Filter classrooms by course language if provided
            if (courseLanguage) {
                params.language = courseLanguage;
            }
            const response = await axiosInstance.get('/classrooms/', { params });
            setClassrooms(response.data);
        } catch (error) {
            console.error('Error fetching classrooms:', error);
        } finally {
            setLoadingClassrooms(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Validation
        const newErrors: Record<string, string> = {};
        if (!formData.classroom) {
            newErrors.classroom = 'Выберите класс';
        }
        // Teacher is optional, so no validation needed

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setSubmitting(true);
            let createdSubjectGroupId: number;
            
            if (subjectGroup) {
                // Update existing subject group
                await courseService.updateSubjectGroup(subjectGroup.id, {
                    classroom: parseInt(formData.classroom),
                    teacher: formData.teacher ? parseInt(formData.teacher) : null,
                });
                createdSubjectGroupId = subjectGroup.id;
            } else {
                // Create new subject group
                const response = await courseService.createSubjectGroup({
                    course: courseId,
                    classroom: parseInt(formData.classroom),
                    teacher: formData.teacher ? parseInt(formData.teacher) : null,
                });
                createdSubjectGroupId = response.id;
            }

            // Save schedule slots if any
            if (createdSubjectGroupId) {
                // Delete existing slots first (if updating)
                if (subjectGroup) {
                    try {
                        const existingSlots = await axiosInstance.get('/schedule-slots/', {
                            params: { subject_group: createdSubjectGroupId },
                        });
                        const slotsToDelete = Array.isArray(existingSlots.data)
                            ? existingSlots.data
                            : existingSlots.data.results || [];
                        for (const slot of slotsToDelete) {
                            await axiosInstance.delete(`/schedule-slots/${slot.id}/`);
                        }
                    } catch (error) {
                        console.error('Error deleting existing slots:', error);
                    }
                }
                
                // Create new slots
                if (scheduleSlots.length > 0) {
                    for (const slot of scheduleSlots) {
                        try {
                            await axiosInstance.post('/schedule-slots/', {
                                subject_group: createdSubjectGroupId,
                                day_of_week: slot.day_of_week,
                                start_time: slot.start_time,
                                end_time: slot.end_time,
                                room: slot.room || undefined,
                            });
                        } catch (error) {
                            console.error('Error creating schedule slot:', error);
                        }
                    }
                }
            }
            
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error creating subject group:', error);
            if (error.response?.data) {
                const apiErrors = error.response.data;
                if (apiErrors.non_field_errors) {
                    setErrors({
                        general: Array.isArray(apiErrors.non_field_errors)
                            ? apiErrors.non_field_errors[0]
                            : apiErrors.non_field_errors,
                    });
                } else {
                    setErrors({
                        general: subjectGroup
                            ? 'Не удалось обновить связь курса с классом'
                            : 'Не удалось создать связь курса с классом',
                    });
                }
            } else {
                setErrors({
                    general: subjectGroup
                        ? 'Не удалось обновить связь курса с классом'
                        : 'Не удалось создать связь курса с классом',
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
            title={subjectGroup ? 'Редактировать связь курса с классом' : 'Добавить класс к курсу'}
            maxWidth="max-w-7xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {errors.general && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">{errors.general}</p>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Класс <span className="text-red-500">*</span>
                    </label>
                    {loadingClassrooms ? (
                        <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                        </div>
                    ) : (
                        <select
                            value={formData.classroom}
                            onChange={(e) =>
                                setFormData({ ...formData, classroom: e.target.value })
                            }
                            disabled={!!subjectGroup}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                errors.classroom ? 'border-red-500' : 'border-gray-300'
                            } ${subjectGroup ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        >
                            <option value="">Выберите класс</option>
                            {classrooms.map((classroom) => {
                                const languageLabel = classroom.language === 'kazakh' ? 'Қаз' : 
                                                     classroom.language === 'russian' ? 'Рус' : 
                                                     classroom.language === 'english' ? 'Eng' : 
                                                     classroom.language || '';
                                return (
                                    <option key={classroom.id} value={classroom.id}>
                                        {classroom.grade}{classroom.letter} {languageLabel && `[${languageLabel}]`} ({classroom.school_name})
                                    </option>
                                );
                            })}
                        </select>
                    )}
                    {subjectGroup && (
                        <p className="text-xs text-gray-500 mt-1">
                            Класс нельзя изменить после создания
                        </p>
                    )}
                    {errors.classroom && (
                        <p className="text-sm text-red-600 mt-1">{errors.classroom}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Учитель
                    </label>
                    {loadingTeachers ? (
                        <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                        </div>
                    ) : (
                        <select
                            value={formData.teacher}
                            onChange={(e) =>
                                setFormData({ ...formData, teacher: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">Не назначен</option>
                            {teachers.map((teacher) => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.first_name} {teacher.last_name} ({teacher.username})
                                </option>
                            ))}
                        </select>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                        Учитель может быть назначен позже
                    </p>
                </div>

                {/* Schedule Builder - Always Visible */}
                <div className="pt-6 border-t-2 border-purple-200">
                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                                📅 Расписание уроков
                            </h3>
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full font-medium">
                                Новое
                            </span>
                        </div>
                        <p className="text-sm text-gray-600">
                            Укажите время и дни недели для уроков. Нажмите на день недели или кнопку "+" чтобы добавить урок.
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-xl p-6 border-2 border-purple-300 shadow-xl">
                        <ScheduleBuilder
                            subjectGroupId={subjectGroup?.id}
                            initialSlots={scheduleSlots}
                            onChange={setScheduleSlots}
                        />
                    </div>
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
                            ? subjectGroup
                                ? 'Сохранение...'
                                : 'Создание...'
                            : subjectGroup
                              ? 'Сохранить'
                              : 'Создать'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

