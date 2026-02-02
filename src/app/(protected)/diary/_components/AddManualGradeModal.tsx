'use client';

import { useState, useMemo } from 'react';
import Modal from '@/components/ui/Modal';
import axiosInstance from '@/lib/axios';
import { useLocale } from '@/contexts/LocaleContext';

interface Student {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
}

interface AddManualGradeModalProps {
    subjectGroupId: number;
    subjectName?: string;
    students: Student[];
    defaultStudentId?: number;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddManualGradeModal({
    subjectGroupId,
    subjectName,
    students,
    defaultStudentId,
    onClose,
    onSuccess,
}: AddManualGradeModalProps) {
    const { t } = useLocale();
    const GRADE_TYPES = useMemo(
        () => [
            { value: 'lesson', label: t('manualGrade.typeLesson') },
            { value: 'offline_test', label: t('manualGrade.typeOfflineTest') },
            { value: 'oral', label: t('manualGrade.typeOral') },
            { value: 'other', label: t('manualGrade.typeOther') },
        ],
        [t]
    );
    const [studentId, setStudentId] = useState<number | ''>(defaultStudentId ?? '');
    const [value, setValue] = useState<string>('5');
    const [maxValue, setMaxValue] = useState<string>('5');
    const [title, setTitle] = useState('');
    const [gradeType, setGradeType] = useState<string>('other');
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const numValue = parseInt(value, 10);
        const numMax = parseInt(maxValue, 10);
        if (!studentId || !numValue || numValue < 0 || !numMax || numMax < 1) {
            setError(t('manualGrade.selectStudentAndScore'));
            return;
        }
        if (numValue > numMax) {
            setError(t('manualGrade.scoreNotGreaterThanMax'));
            return;
        }
        setSubmitting(true);
        try {
            await axiosInstance.post('/manual-grades/', {
                student: studentId,
                subject_group: subjectGroupId,
                value: numValue,
                max_value: numMax,
                title: title.trim() || undefined,
                grade_type: gradeType,
                feedback: feedback.trim() || undefined,
            });
            onSuccess();
        } catch (err: unknown) {
            const msg = (err as { formattedMessage?: string })?.formattedMessage ?? t('manualGrade.saveError');
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={t('manualGrade.title')}>
            {subjectName && (
                <p className="text-sm text-gray-600 mb-4">{t('manualGrade.subjectLabel')}: {subjectName}</p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('manualGrade.studentLabel')}</label>
                    <select
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value ? Number(e.target.value) : '')}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">{t('manualGrade.selectStudent')}</option>
                        {students.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.last_name} {s.first_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('manualGrade.scoreLabel')}</label>
                        <input
                            type="number"
                            min={0}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('manualGrade.maxScoreLabel')}</label>
                        <select
                            value={maxValue}
                            onChange={(e) => setMaxValue(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="5">5</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('manualGrade.gradeTypeLabel')}</label>
                    <select
                        value={gradeType}
                        onChange={(e) => setGradeType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {GRADE_TYPES.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('manualGrade.titleOptional')}</label>
                    <input
                        type="text"
                        placeholder={t('manualGrade.titlePlaceholder')}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('manualGrade.commentOptional')}</label>
                    <textarea
                        rows={2}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        {t('profile.cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {submitting ? t('actions.saving') : t('profile.save')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
