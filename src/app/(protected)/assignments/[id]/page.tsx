'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { XCircle } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';
import { handleFileView } from '../../subjects/[id]/_components/SubjectOverviewPanel.client';
import { modalController } from '@/lib/modalController';
import { useUserState } from '@/contexts/UserContext';
import { useLocale } from '@/contexts/LocaleContext';
import SubmissionsTable from '@/components/assignments/SubmissionsTable';
import AssignmentHeader from './_components/AssignmentHeader';
import AssignmentMetadata from './_components/AssignmentMetadata';
import AssignmentAttachmentsList from './_components/AssignmentAttachmentsList';
import StudentFileUpload from './_components/StudentFileUpload';
import StudentSubmissionDisplay from './_components/StudentSubmissionDisplay';
import { Assignment } from './_components/types';

export default function AssignmentPage() {
    const params = useParams();
    const assignmentId = params.id as string;

    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { user } = useUserState();
    const { t } = useLocale();

    // Helper function to download a file
    const downloadFile = async (fileUrl: string, filename: string) => {
        try {
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
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

    const handleSubmit = async () => {
        if (!selectedFile || !assignment) return;

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('student', user?.id.toString() || '');
            formData.append('assignment', assignmentId.toString());
            formData.append('file', selectedFile);

            await axiosInstance.post('submissions/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setSelectedFile(null);
            await fetchAssignment();
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
            title: t('assignmentPage.attachFile'),
            onFileSelect: (file: File) => {
                setSelectedFile(file);
            },
        });
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
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
        );
    }

    if (error || !assignment) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {t('assignmentPage.loadingError')}
                    </h2>
                    <p className="text-gray-600">
                        {error || t('assignmentPage.assignmentNotFound')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
                {/* Assignment Meta Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <AssignmentHeader
                        assignment={assignment}
                        userRole={user?.role}
                        onSubmit={handleSubmit}
                        isSubmitting={submitting}
                        hasSelectedFile={!!selectedFile}
                    />

                    <AssignmentMetadata assignment={assignment} />

                    <AssignmentAttachmentsList
                        attachments={assignment.attachments}
                        file={assignment.file}
                        onFileView={handleFileView}
                    />
                </div>

                {/* File Upload Section - Only show for students if not submitted */}
                {user?.role === 'student' && !assignment.is_submitted && (
                    <StudentFileUpload
                        selectedFile={selectedFile}
                        onFileSelect={handleOpenUploadModal}
                        onFileRemove={() => setSelectedFile(null)}
                    />
                )}

                {/* Submitted Work - Only show for students if submitted */}
                {user?.role === 'student' &&
                    assignment.is_submitted &&
                    assignment.student_submission && (
                        <StudentSubmissionDisplay
                            submission={assignment.student_submission}
                            maxGrade={assignment.max_grade}
                            onFileView={handleFileView}
                            onDownload={downloadFile}
                        />
                    )}

                {/* Student Submissions - Only show for teachers */}
                {user?.role === 'teacher' && assignment.all_submissions && (
                    <SubmissionsTable
                        submissions={assignment.all_submissions}
                        maxGrade={assignment.max_grade}
                        onGradeUpdate={fetchAssignment}
                    />
                )}
            </div>
        </div>
    );
}
