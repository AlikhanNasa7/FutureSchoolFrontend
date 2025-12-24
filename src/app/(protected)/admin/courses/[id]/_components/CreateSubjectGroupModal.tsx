'use client';

import { useState, useEffect } from 'react';
import { courseService } from '@/services/courseService';
import Modal from '@/components/ui/Modal';
import axiosInstance from '@/lib/axios';

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
    school_name: string;
}

interface CreateSubjectGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: number;
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
            } else {
                setFormData({ classroom: '', teacher: '' });
            }
            setErrors({});
        }
    }, [isOpen, subjectGroup]);

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
            const response = await axiosInstance.get('/classrooms/');
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
            if (subjectGroup) {
                // Update existing subject group
                await courseService.updateSubjectGroup(subjectGroup.id, {
                    classroom: parseInt(formData.classroom),
                    teacher: formData.teacher ? parseInt(formData.teacher) : null,
                });
            } else {
                // Create new subject group
                await courseService.createSubjectGroup({
                    course: courseId,
                    classroom: parseInt(formData.classroom),
                    teacher: formData.teacher ? parseInt(formData.teacher) : null,
                });
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
                            {classrooms.map((classroom) => (
                                <option key={classroom.id} value={classroom.id}>
                                    {classroom.grade}
                                    {classroom.letter} ({classroom.school_name})
                                </option>
                            ))}
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

