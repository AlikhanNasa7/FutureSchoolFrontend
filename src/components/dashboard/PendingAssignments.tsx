'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { modalController } from '@/lib/modalController';
import type { EventModalData } from '@/lib/modalController';
import axiosInstance from '@/lib/axios';

interface ApiAssignment {
    id: number;
    title: string;
    description: string;
    due_at: string;
    course_name: string;
    teacher_username: string;
    is_submitted?: boolean;
}

interface Assignment {
    id: number;
    title: string;
    description: string;
    dueDate: string;
    subject: string;
    teacher: string;
    status: 'pending' | 'completed' | 'overdue';
    backgroundColor: string;
    borderColor: string;
    textColor: string;
}

interface PendingAssignmentsProps {
    assignments?: Assignment[];
}

export default function PendingAssignments({
    assignments: propAssignments,
}: PendingAssignmentsProps) {
    const [rawAssignments, setRawAssignments] = useState<ApiAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAssignments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get('/assignments/');
            setRawAssignments(response.data.results || response.data);
        } catch (err) {
            console.error('Error fetching assignments:', err);
            setError('Failed to load assignments');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    const transformedAssignments = useMemo(() => {
        return rawAssignments.map((assignment): Assignment => {
            const dueDate = new Date(assignment.due_at);
            const now = new Date();
            const isOverdue = dueDate < now && !assignment.is_submitted;
            const isCompleted = assignment.is_submitted || false;

            let status: 'pending' | 'completed' | 'overdue';
            if (isCompleted) {
                status = 'completed';
            } else if (isOverdue) {
                status = 'overdue';
            } else {
                status = 'pending';
            }

            return {
                id: assignment.id,
                title: assignment.title,
                description: assignment.description || '',
                dueDate: assignment.due_at,
                subject: assignment.course_name,
                teacher: assignment.teacher_username,
                status,
                backgroundColor: 'rgb(255, 237, 213)',
                borderColor: 'rgb(255, 237, 213)',
                textColor: '#374151',
            };
        });
    }, [rawAssignments]);

    const assignments = propAssignments || transformedAssignments;

    const pendingAssignments = useMemo(() => {
        return assignments
            .filter(
                assignment =>
                    assignment.status === 'pending' ||
                    assignment.status === 'overdue'
            )
            .sort((a, b) => {
                const dateA = new Date(a.dueDate);
                const dateB = new Date(b.dueDate);
                if (dateA.getTime() !== dateB.getTime()) {
                    return dateA.getTime() - dateB.getTime();
                }
                return a.status === 'overdue' ? -1 : 1;
            });
    }, [assignments]);

    const handleAssignmentClick = (assignment: Assignment) => {
        const eventData: EventModalData = {
            title: assignment.title,
            start: assignment.dueDate,
            subject: assignment.subject,
            teacher: assignment.teacher,
            time: new Date(assignment.dueDate).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
            }),
            description: assignment.description,
            url: `/assignments/${assignment.id}`,
            type: 'assignment',
        };
        modalController.open('event-modal', eventData);
    };

    const getStatusColor = (status: string) => {
        if (status === 'overdue') return 'text-red-600';
        if (status === 'completed') return 'text-green-600';
        return 'text-yellow-600';
    };

    const getStatusText = (status: string) => {
        if (status === 'overdue') return 'Просрочено';
        if (status === 'completed') return 'Выполнено';
        return 'В ожидании';
    };

    const formatDueDate = (dueDate: string) => {
        const date = new Date(dueDate);
        const today = new Date();
        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return `${Math.abs(diffDays)} дн. назад`;
        } else if (diffDays === 0) {
            return 'Сегодня';
        } else if (diffDays === 1) {
            return 'Завтра';
        } else {
            return `через ${diffDays} дн.`;
        }
    };

    if (loading) {
        return (
            <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Ожидающие задания
                    </h2>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-center h-32">
                        <div className="text-gray-500">Загрузка заданий...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Ожидающие задания
                    </h2>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-center h-32">
                        <div className="text-red-500">{error}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                    Ожидающие задания
                </h2>
            </div>

            <div className="p-4 sm:max-h-72 overflow-y-auto h-auto">
                {pendingAssignments.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Нет заданий
                        </h3>
                        <p className="text-gray-500">Все задания выполнены</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {pendingAssignments.map(assignment => (
                            <div
                                key={assignment.id}
                                onClick={() =>
                                    handleAssignmentClick(assignment)
                                }
                                className="group relative p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:border-blue-300"
                                tabIndex={0}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleAssignmentClick(assignment);
                                    }
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="text-sm font-semibold text-gray-900 min-w-[60px]">
                                            {assignment.subject}
                                        </div>
                                        <div
                                            className={`text-xs font-medium ${getStatusColor(assignment.status)}`}
                                        >
                                            {getStatusText(assignment.status)}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-xs text-gray-500">
                                            Сдать{' '}
                                            {formatDueDate(assignment.dueDate)}
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-200 pointer-events-none"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
