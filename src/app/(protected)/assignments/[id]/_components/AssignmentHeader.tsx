'use client';

import { Upload } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { Assignment } from './types';

interface AssignmentHeaderProps {
    assignment: Assignment;
    userRole?: string;
    onSubmit: () => void;
    isSubmitting: boolean;
    hasSelectedFile: boolean;
}

export default function AssignmentHeader({
    assignment,
    userRole,
    onSubmit,
    isSubmitting,
    hasSelectedFile,
}: AssignmentHeaderProps) {
    const { t } = useLocale();

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
            return t('assignmentPage.submitted');
        } else if (assignment.is_deadline_passed === true) {
            return t('assignmentPage.overdue');
        } else {
            return t('assignmentPage.pending');
        }
    };

    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {assignment.title}
                    </h1>
                    {userRole === 'student' && (
                        <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(assignment)}`}
                        >
                            {getStatusText(assignment)}
                        </span>
                    )}
                </div>
            </div>
            {userRole === 'student' && !assignment.is_submitted && (
                <button
                    onClick={onSubmit}
                    disabled={!hasSelectedFile || isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSubmitting
                        ? t('assignmentPage.submitting')
                        : t('assignmentPage.submit')}
                </button>
            )}
        </div>
    );
}
