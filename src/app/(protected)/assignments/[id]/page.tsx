'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Upload, Clock, BarChart3, FileText, XCircle } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';
import { handleFileView } from '../../subjects/[id]/_components/SubjectOverviewPanel.client';
import { modalController } from '@/lib/modalController';
import { useUserState } from '@/contexts/UserContext';

interface Assignment {
    id: number;
    course_section: number;
    teacher: number;
    title: string;
    description: string;
    due_at: string;
    max_grade: number;
    file: string;
    course_section_title: string;
    subject_group_course_name: string;
    subject_group_course_code: string;
    teacher_username: string;
    submission_count: string;
    attachments: {
        id: number;
        type: string;
        title: string;
        content: string;
        file_url: string;
        file: string;
        position: number;
        assignment: number;
    }[];
    is_available: string;
    is_deadline_passed: boolean;
    is_submitted: boolean;
    student_submission?: {
        id: number;
        submitted_at: string;
        text: string;
        file: string;
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
    } | null;
}

export default function AssignmentPage() {
    const params = useParams();
    const assignmentId = params.id as string;

    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { user } = useUserState();

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

    const fetchAssignment = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(
                `/assignments/${assignmentId}/`
            );
            setAssignment(response.data);
        } catch (error) {
            console.error('Error fetching assignment:', error);
            const errorMessage =
                error instanceof AxiosError
                    ? error.response?.data?.message || error.message
                    : 'Failed to fetch assignment';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [assignmentId]);

    useEffect(() => {
        if (assignmentId) {
            fetchAssignment();
        }
    }, [assignmentId, fetchAssignment]);

    console.log(assignment, 'assignment');

    const handleSubmit = async () => {
        if (!selectedFile || !assignment) return;

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('student', user.id.toString());
            formData.append('assignment', assignmentId.toString());
            formData.append('file', selectedFile);

            const response = await axiosInstance.post(
                'submissions/',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            console.log(response.data, 'response');

            setSelectedFile(null);
        } catch (error) {
            console.error('Error submitting assignment:', error);
            const errorMessage =
                error instanceof AxiosError
                    ? error.response?.data?.message || error.message
                    : 'Failed to submit assignment';
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenUploadModal = () => {
        modalController.open('file-upload', {
            title: 'Прикрепить файл к заданию',
            onFileSelect: (file: File) => {
                setSelectedFile(file);
            },
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const getStatusColor = (assignment: Assignment) => {
        if (assignment.is_submitted === true) {
            return 'bg-green-100 text-green-800 border-green-200';
        } else if (assignment.is_deadline_passed === true) {
            return 'bg-red-100 text-red-800 border-red-200';
        } else {
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    const getStatusText = (assignment: Assignment) => {
        if (assignment.is_submitted === true) {
            return 'Сдано';
        } else if (assignment.is_deadline_passed === true) {
            return 'Просрочено';
        } else {
            return 'В ожидании';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse">
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !assignment) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Ошибка загрузки
                        </h2>
                        <p className="text-gray-600">
                            {error || 'Задание не найдено'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Upload className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {assignment.title}
                                </h1>
                                <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(assignment)}`}
                                >
                                    {getStatusText(assignment)}
                                </span>
                            </div>
                        </div>
                        {!assignment.is_submitted && (
                            <button
                                onClick={handleSubmit}
                                disabled={!selectedFile || submitting}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {submitting ? 'Отправка...' : 'Сдать'}
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                                <Clock className="w-5 h-5 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Срок сдачи
                                    </p>
                                    <p className="font-medium text-gray-900">
                                        {formatDate(assignment.due_at)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                                <BarChart3 className="w-5 h-5 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Максимальная оценка
                                    </p>
                                    <p className="font-medium text-gray-900">
                                        {assignment.max_grade} баллов
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* File Upload Section - Only show if not submitted */}
                    {!assignment.is_submitted && (
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Прикрепить файл
                            </h2>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                {selectedFile && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <Upload className="w-5 h-5 text-green-600" />
                                            <div>
                                                <p className="font-medium text-green-900">
                                                    {selectedFile.name}
                                                </p>
                                                <p className="text-sm text-green-700">
                                                    {(
                                                        selectedFile.size / 1024
                                                    ).toFixed(1)}{' '}
                                                    KB
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() =>
                                                setSelectedFile(null)
                                            }
                                            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                )}
                                {!selectedFile && (
                                    <div
                                        className="flex items-center justify-between cursor-pointer"
                                        onClick={handleOpenUploadModal}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Upload className="w-5 h-5 text-green-600" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Submitted File Section - Show if assignment is submitted */}
                    {assignment.is_submitted &&
                        assignment.student_submission && (
                            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Сданная работа
                                </h2>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                            <div>
                                                <p className="font-medium text-blue-900">
                                                    {assignment
                                                        .student_submission.file
                                                        ? assignment.student_submission.file
                                                              .split('/')
                                                              .pop()
                                                        : 'Текстовая работа'}
                                                </p>
                                                <p className="text-sm text-blue-700">
                                                    Сдано:{' '}
                                                    {new Date(
                                                        assignment.student_submission.submitted_at
                                                    ).toLocaleDateString(
                                                        'ru-RU'
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        {assignment.student_submission.file && (
                                            <button
                                                onClick={() => {
                                                    const filename =
                                                        assignment.student_submission.file
                                                            .split('/')
                                                            .pop() ||
                                                        'submission';
                                                    downloadFile(
                                                        assignment
                                                            .student_submission
                                                            .file,
                                                        filename
                                                    );
                                                }}
                                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                            >
                                                Скачать
                                            </button>
                                        )}
                                    </div>

                                    {/* Render image if the submitted file is an image */}
                                    {assignment.student_submission.file &&
                                        assignment.student_submission.file.match(
                                            /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i
                                        ) && (
                                            <div className="mt-4">
                                                <img
                                                    src={
                                                        assignment
                                                            .student_submission
                                                            .file
                                                    }
                                                    alt="Submitted work"
                                                    className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                                                    style={{
                                                        maxHeight: '400px',
                                                    }}
                                                    onError={e => {
                                                        // Hide the image if it fails to load
                                                        e.currentTarget.style.display =
                                                            'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                    {assignment.student_submission.text && (
                                        <div className="mt-3 p-3 bg-white rounded border">
                                            <p className="text-sm text-gray-700">
                                                <strong>
                                                    Текстовая часть:
                                                </strong>
                                            </p>
                                            <p className="mt-1 text-gray-900">
                                                {
                                                    assignment
                                                        .student_submission.text
                                                }
                                            </p>
                                        </div>
                                    )}
                                    {assignment.student_submission
                                        .grade_value !== null && (
                                        <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                                            <p className="text-sm font-medium text-yellow-800">
                                                Оценка:{' '}
                                                {
                                                    assignment
                                                        .student_submission
                                                        .grade_value
                                                }{' '}
                                                / {assignment.max_grade}
                                            </p>
                                            {assignment.student_submission
                                                .grade_feedback && (
                                                <p className="mt-1 text-sm text-yellow-700">
                                                    {
                                                        assignment
                                                            .student_submission
                                                            .grade_feedback
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    <div>
                        <p>Учитель: {assignment.teacher_username}</p>
                        <p>Неделя: {assignment.course_section_title}</p>
                        <p>
                            Предмет: {assignment.subject_group_course_name} (
                            {assignment.subject_group_course_code})
                        </p>
                    </div>
                    {assignment.description && (
                        <div className=" rounded-lg p-4 mb-6">
                            <p>{assignment.description}</p>
                        </div>
                    )}
                    {assignment.file && (
                        <div className="flex items-center gap-2">
                            <FileText className="text-gray-500" />
                            <button
                                onClick={() =>
                                    handleFileView(
                                        {
                                            file: assignment.file,
                                            title: assignment.file,
                                            type: 'file',
                                        },
                                        assignment.file
                                    )
                                }
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 inline-flex items-center gap-2 w-full max-w-full text-left hover:shadow-sm"
                            >
                                <span className="truncate block w-full max-w-full overflow-hidden">
                                    {assignment.file}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
