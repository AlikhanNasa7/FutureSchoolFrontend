'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import axiosInstance from '@/lib/axios';
import { useUserState } from '@/contexts/UserContext';
import { useLocale } from '@/contexts/LocaleContext';

interface SubjectGroup {
    id: number;
    course_name: string;
    course_code: string;
    classroom_display: string;
}

interface CreateAnnouncementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAnnouncementCreated: () => void;
    defaultSubjectGroupId?: string | number;
}

export default function CreateAnnouncementModal({
    isOpen,
    onClose,
    onAnnouncementCreated,
    defaultSubjectGroupId,
}: CreateAnnouncementModalProps) {
    const { user } = useUserState();
    const { t } = useLocale();
    const [subjectGroups, setSubjectGroups] = useState<SubjectGroup[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        subject_groups: defaultSubjectGroupId ? [Number(defaultSubjectGroupId)] : [],
        allow_replies: true,
    });

    useEffect(() => {
        if (defaultSubjectGroupId && isOpen) {
            setFormData(prev => ({
                ...prev,
                subject_groups: [Number(defaultSubjectGroupId)],
            }));
        }
    }, [defaultSubjectGroupId, isOpen]);

    useEffect(() => {
        if (isOpen && user?.role === 'teacher') {
            fetchSubjectGroups();
        }
    }, [isOpen, user]);

    const fetchSubjectGroups = async () => {
        setLoadingSubjects(true);
        try {
            // Get all subject groups for this teacher
            const response = await axiosInstance.get('/subject-groups/?teacher=' + user?.id);
            setSubjectGroups(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching subject groups:', error);
        } finally {
            setLoadingSubjects(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.content || formData.subject_groups.length === 0) {
            alert('Пожалуйста, заполните все обязательные поля и выберите хотя бы один класс');
            return;
        }

        setSubmitting(true);
        try {
            // Создать объявление в каждом выбранном subject group
            for (const subjectGroupId of formData.subject_groups) {
                await axiosInstance.post('/forum/threads/', {
                    title: formData.title,
                    initial_content: formData.content,
                    subject_group: subjectGroupId,
                    type: 'announcement',
                    is_public: true,
                    allow_replies: formData.allow_replies,
                });
            }
            setFormData({
                title: '',
                content: '',
                subject_groups: defaultSubjectGroupId ? [Number(defaultSubjectGroupId)] : [],
                allow_replies: true,
            });
            onAnnouncementCreated();
            onClose();
        } catch (err: unknown) {
            const errorMessage =
                err && typeof err === 'object' && 'response' in err
                    ? (err as { response?: { data?: { message?: string } } })
                          .response?.data?.message ||
                      'Ошибка создания объявления'
                    : 'Ошибка создания объявления';
            alert(errorMessage);
            console.error('Error creating announcement:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            setFormData({
                title: '',
                content: '',
                subject_groups: defaultSubjectGroupId ? [Number(defaultSubjectGroupId)] : [],
                allow_replies: true,
            });
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Создать объявление"
            maxWidth="max-w-2xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Subject Group Selection */}
                {!defaultSubjectGroupId && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Предметы/Классы * (можно выбрать несколько)
                        </label>
                        {loadingSubjects ? (
                            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                            </div>
                        ) : (
                            <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                                {subjectGroups.map(sg => (
                                    <label key={sg.id} className="flex items-center gap-2 py-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.subject_groups.includes(sg.id)}
                                            onChange={e => {
                                                if (e.target.checked) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        subject_groups: [...prev.subject_groups, sg.id],
                                                    }));
                                                } else {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        subject_groups: prev.subject_groups.filter(id => id !== sg.id),
                                                    }));
                                                }
                                            }}
                                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                                        />
                                        <span className="text-sm text-gray-700">
                                            {sg.course_name} ({sg.classroom_display})
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                        {formData.subject_groups.length > 0 && (
                            <p className="text-sm text-gray-600 mt-2">
                                Выбрано: {formData.subject_groups.length} {formData.subject_groups.length === 1 ? 'класс' : 'классов'}
                            </p>
                        )}
                    </div>
                )}

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Заголовок *
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={e =>
                            setFormData({
                                ...formData,
                                title: e.target.value,
                            })
                        }
                        placeholder="Введите заголовок объявления"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                    />
                </div>

                {/* Content */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Текст объявления *
                    </label>
                    <textarea
                        value={formData.content}
                        onChange={e =>
                            setFormData({
                                ...formData,
                                content: e.target.value,
                            })
                        }
                        placeholder="Введите текст объявления"
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        required
                    />
                </div>

                {/* Allow Replies Toggle */}
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="allow_replies"
                        checked={formData.allow_replies}
                        onChange={e =>
                            setFormData({
                                ...formData,
                                allow_replies: e.target.checked,
                            })
                        }
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <label htmlFor="allow_replies" className="text-sm font-medium text-gray-700">
                        Разрешить ученикам оставлять комментарии
                    </label>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={submitting}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        disabled={submitting || !formData.title || !formData.content || formData.subject_groups.length === 0}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                        {submitting ? 'Создание...' : 'Создать объявление'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
