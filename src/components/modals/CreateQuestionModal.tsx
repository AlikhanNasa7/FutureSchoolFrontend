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
    teacher_username: string;
}

interface CreateQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onQuestionCreated: () => void;
    defaultSubjectGroupId?: string | number;
}

export default function CreateQuestionModal({
    isOpen,
    onClose,
    onQuestionCreated,
    defaultSubjectGroupId,
}: CreateQuestionModalProps) {
    const { user } = useUserState();
    const { t } = useLocale();
    const [subjectGroups, setSubjectGroups] = useState<SubjectGroup[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        is_public: true,
        subject_group: defaultSubjectGroupId
            ? String(defaultSubjectGroupId)
            : '',
    });

    useEffect(() => {
        if (isOpen && user?.role === 'student') {
            fetchSubjectGroups();
        }
    }, [isOpen, user]);

    useEffect(() => {
        if (defaultSubjectGroupId && isOpen) {
            setFormData(prev => ({
                ...prev,
                subject_group: String(defaultSubjectGroupId),
            }));
        }
    }, [defaultSubjectGroupId, isOpen]);

    const fetchSubjectGroups = async () => {
        setLoadingSubjects(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const userClassroom = (user as any).student_data?.classrooms?.[0]
                ?.id;
            if (userClassroom) {
                const response = await axiosInstance.get(
                    `/subject-groups/?classroom=${userClassroom}`
                );
                setSubjectGroups(response.data);
            }
        } catch (error) {
            console.error('Error fetching subject groups:', error);
        } finally {
            setLoadingSubjects(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.content || !formData.subject_group) {
            return;
        }

        setSubmitting(true);
        try {
            await axiosInstance.post('/forum/threads/', {
                title: formData.title,
                initial_content: formData.content,
                is_public: formData.is_public,
                subject_group: parseInt(formData.subject_group),
                type: 'question',
            });
            setFormData({
                title: '',
                content: '',
                is_public: true,
                subject_group: '',
            });
            onQuestionCreated();
            onClose();
        } catch (err: unknown) {
            const errorMessage =
                err && typeof err === 'object' && 'response' in err
                    ? (err as { response?: { data?: { message?: string } } })
                          .response?.data?.message ||
                      t('qa.createQuestionFailed')
                    : t('qa.createQuestionFailed');
            alert(errorMessage);
            console.error('Error creating thread:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            setFormData({
                title: '',
                content: '',
                is_public: true,
                subject_group: '',
            });
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={t('qa.createQuestion')}
            maxWidth="max-w-2xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Subject Group Dropdown - Hidden if defaultSubjectGroupId is provided */}
                {!defaultSubjectGroupId && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('qa.subjectGroup')} *
                        </label>
                        {loadingSubjects ? (
                            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                            </div>
                        ) : (
                            <select
                                value={formData.subject_group}
                                onChange={e =>
                                    setFormData({
                                        ...formData,
                                        subject_group: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                                required
                            >
                                <option value="">
                                    {t('qa.selectSubjectGroup')}
                                </option>
                                {subjectGroups.map(group => (
                                    <option key={group.id} value={group.id}>
                                        {group.course_name} ({group.course_code}
                                        )
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                )}

                {/* Question Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('qa.questionTitle')} *
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={e =>
                            setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder={t('qa.questionTitlePlaceholder')}
                        required
                    />
                </div>

                {/* Question Content */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('qa.questionContent')} *
                    </label>
                    <textarea
                        value={formData.content}
                        onChange={e =>
                            setFormData({
                                ...formData,
                                content: e.target.value,
                            })
                        }
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        placeholder={t('qa.questionContentPlaceholder')}
                        required
                    />
                </div>

                {/* Public Checkbox */}
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id="is_public"
                            type="checkbox"
                            checked={formData.is_public}
                            onChange={e =>
                                setFormData({
                                    ...formData,
                                    is_public: e.target.checked,
                                })
                            }
                            className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label
                            htmlFor="is_public"
                            className="font-medium text-gray-700 cursor-pointer"
                        >
                            {t('qa.makePublic')}
                        </label>
                        <p className="text-gray-500 mt-1">
                            {t('qa.makePublicDescription')}
                        </p>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={submitting}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('actions.cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={
                            submitting ||
                            !formData.title ||
                            !formData.content ||
                            !formData.subject_group
                        }
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    >
                        {submitting ? t('qa.posting') : t('qa.postQuestion')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
