'use client';

import { useState } from 'react';
import { X, Edit3, FileText, Download, Check } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { handleFileView } from '../../app/(protected)/subjects/[id]/_components/SubjectOverviewPanel.client';
import { useUserState } from '@/contexts/UserContext';

interface Submission {
    id: number;
    submitted_at: string;
    text: string;
    file: string;
    student_username: string;
    student_first_name: string;
    student_last_name: string;
    grade_id?: number;
    grade_value?: number;
    grade_feedback?: string;
    graded_at?: string;
    attachments: {
        id: number;
        type: string;
        title: string;
        content: string;
        file_url: string;
        file: string;
        position: number;
    }[];
}

interface SubmissionsTableProps {
    submissions: Submission[];
    maxGrade: number;
    onGradeUpdate: () => void;
}

export default function SubmissionsTable({
    submissions,
    maxGrade,
    onGradeUpdate,
}: SubmissionsTableProps) {
    const { user } = useUserState();
    const [editingGrade, setEditingGrade] = useState<number | null>(null);
    const [gradeValues, setGradeValues] = useState<{ [key: number]: number }>(
        {}
    );
    const [gradeFeedback, setGradeFeedback] = useState<{
        [key: number]: string;
    }>({});
    const [updating, setUpdating] = useState<number | null>(null);

    // Helper function to download a file
    const downloadFile = async (fileUrl: string, filename: string) => {
        try {
            // Fetch the file as a blob
            const response = await fetch(fileUrl);
            const blob = await response.blob();

            // Create a temporary URL for the blob
            const url = window.URL.createObjectURL(blob);

            // Create a temporary download link
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;

            // Trigger the download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the blob URL
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback: open in new tab if download fails
            window.open(fileUrl, '_blank');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStudentName = (submission: Submission) => {
        return (
            `${submission.student_first_name} ${submission.student_last_name}`.trim() ||
            submission.student_username
        );
    };

    const handleGradeClick = (
        submissionId: number,
        currentGrade?: number,
        currentFeedback?: string
    ) => {
        setEditingGrade(submissionId);
        setGradeValues(prev => ({
            ...prev,
            [submissionId]: currentGrade || 0,
        }));
        setGradeFeedback(prev => ({
            ...prev,
            [submissionId]: currentFeedback || '',
        }));
    };

    const handleGradeChange = (submissionId: number, value: string) => {
        const numericValue = parseInt(value) || 0;
        setGradeValues(prev => ({
            ...prev,
            [submissionId]: Math.max(0, Math.min(maxGrade, numericValue)),
        }));
    };

    const handleFeedbackChange = (submissionId: number, value: string) => {
        setGradeFeedback(prev => ({
            ...prev,
            [submissionId]: value,
        }));
    };

    const handleGradeSave = async (submissionId: number) => {
        const gradeValue = gradeValues[submissionId];
        const feedback = gradeFeedback[submissionId] || '';
        if (gradeValue === undefined) return;

        try {
            setUpdating(submissionId);

            // Find the submission to check if grade already exists
            const submission = submissions.find(s => s.id === submissionId);
            const gradeExists =
                submission &&
                submission.grade_id !== null &&
                submission.grade_id !== undefined;

            if (gradeExists) {
                // Update existing grade using the grade_id from submission data
                await axiosInstance.patch(`/grades/${submission.grade_id}/`, {
                    grade_value: gradeValue,
                    feedback: feedback,
                });
            } else {
                // Create new grade
                await axiosInstance.post('/grades/', {
                    submission: submissionId,
                    grade_value: gradeValue,
                    feedback: feedback,
                    graded_by: user?.id,
                });
            }

            setEditingGrade(null);
            setGradeValues({});
            setGradeFeedback({});
            onGradeUpdate();
        } catch (error) {
            console.error('Error updating grade:', error);
        } finally {
            setUpdating(null);
        }
    };

    const handleGradeCancel = () => {
        setEditingGrade(null);
        setGradeValues({});
        setGradeFeedback({});
    };

    if (!submissions || submissions.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Студенческие работы
                </h2>
                <div className="text-center py-8 text-gray-500">
                    Пока нет сданных работ
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Студенческие работы ({submissions.length})
            </h2>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Студент
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Файл
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Оценка
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Комментарий
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Время сдачи
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Действия
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {submissions.map(submission => (
                            <tr
                                key={submission.id}
                                className="hover:bg-gray-50"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {getStudentName(submission)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        @{submission.student_username}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {submission.file ? (
                                        <div className="flex items-center space-x-2">
                                            <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                            <button
                                                onClick={() => {
                                                    const filename =
                                                        submission.file
                                                            .split('/')
                                                            .pop() ||
                                                        'submission';
                                                    handleFileView(
                                                        {
                                                            file: submission.file,
                                                            title: filename,
                                                            type: 'file',
                                                        },
                                                        submission.file
                                                    );
                                                }}
                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 inline-flex items-center gap-2 text-sm"
                                            >
                                                <span className="truncate max-w-32">
                                                    {submission.file
                                                        .split('/')
                                                        .pop()}
                                                </span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const filename =
                                                        submission.file
                                                            .split('/')
                                                            .pop() ||
                                                        'submission';
                                                    downloadFile(
                                                        submission.file,
                                                        filename
                                                    );
                                                }}
                                                className="text-gray-500 hover:text-gray-700 p-1 rounded transition-colors flex-shrink-0"
                                                title="Скачать файл"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : submission.text ? (
                                        <div className="text-sm text-gray-500 italic">
                                            Текстовая работа
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-400">
                                            Нет файла
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {editingGrade === submission.id ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={maxGrade}
                                                    value={
                                                        gradeValues[
                                                            submission.id
                                                        ] ?? ''
                                                    }
                                                    onChange={e =>
                                                        handleGradeChange(
                                                            submission.id,
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                                                    placeholder="0"
                                                    autoFocus
                                                />
                                            </div>
                                            <span className="text-sm text-gray-500 font-medium">
                                                / {maxGrade}
                                            </span>
                                        </div>
                                    ) : (
                                        <div
                                            className="flex items-center space-x-2 cursor-pointer hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors group"
                                            onClick={() =>
                                                handleGradeClick(
                                                    submission.id,
                                                    submission.grade_value,
                                                    submission.grade_feedback
                                                )
                                            }
                                        >
                                            <span
                                                className={`text-sm font-semibold ${
                                                    submission.grade_value !==
                                                        null &&
                                                    submission.grade_value !==
                                                        undefined
                                                        ? 'text-green-700'
                                                        : 'text-gray-900'
                                                }`}
                                            >
                                                {submission.grade_value ?? '—'}
                                            </span>
                                            <span className="text-sm text-gray-400">
                                                / {maxGrade}
                                            </span>
                                            {submission.grade_value !== null &&
                                                submission.grade_value !==
                                                    undefined && (
                                                    <span className="text-xs text-green-600 font-medium">
                                                        (изменено)
                                                    </span>
                                                )}
                                            <Edit3 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {editingGrade === submission.id ? (
                                        <textarea
                                            placeholder="Добавить комментарий..."
                                            value={
                                                gradeFeedback[submission.id] ||
                                                ''
                                            }
                                            onChange={e =>
                                                handleFeedbackChange(
                                                    submission.id,
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none shadow-sm"
                                            rows={2}
                                        />
                                    ) : (
                                        <div className="text-sm text-gray-600">
                                            {submission.grade_feedback ? (
                                                <div className="space-y-1">
                                                    <div className="text-gray-800">
                                                        {
                                                            submission.grade_feedback
                                                        }
                                                    </div>
                                                    <div className="text-xs text-green-600 font-medium">
                                                        (изменено)
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">
                                                    Нет комментария
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(submission.submitted_at)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {editingGrade === submission.id ? (
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() =>
                                                    handleGradeSave(
                                                        submission.id
                                                    )
                                                }
                                                disabled={
                                                    updating === submission.id
                                                }
                                                className="inline-flex items-center justify-center w-8 h-8 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                                title="Сохранить"
                                            >
                                                {updating === submission.id ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Check className="w-4 h-4" />
                                                )}
                                            </button>
                                            <button
                                                onClick={handleGradeCancel}
                                                className="inline-flex items-center justify-center w-8 h-8 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                                title="Отмена"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-gray-400">—</div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
