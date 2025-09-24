'use client';

import { useMemo } from 'react';
import { modalController } from '@/lib/modalController';
import type { EventModalData } from '@/lib/modalController';

interface Assignment {
    id: string;
    title: string;
    start: string;
    subject: string;
    teacher: string;
    time: string;
    description: string;
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    dueDate: string;
    status: 'pending' | 'completed' | 'overdue';
}

interface PendingAssignmentsProps {
    assignments?: Assignment[];
}

const sampleAssignments: Assignment[] = [
    {
        id: '1',
        title: 'Домашнее Задание',
        start: '2025-08-31',
        backgroundColor: 'rgb(255, 237, 213)',
        borderColor: 'rgb(255, 237, 213)',
        textColor: '#374151',
        description: 'Выполнить упражнения 1-10 из учебника по математике',
        subject: 'Математика',
        teacher: 'Иванова А.П.',
        time: '08:00',
        dueDate: '2025-09-02',
        status: 'pending',
    },
    {
        id: '2',
        title: 'Домашнее Задание',
        start: '2025-08-30',
        backgroundColor: 'rgb(255, 237, 213)',
        borderColor: 'rgb(255, 237, 213)',
        textColor: '#374151',
        description: 'Написать сочинение по литературе',
        subject: 'Литература',
        teacher: 'Петрова М.С.',
        time: '10:30',
        dueDate: '2025-09-01',
        status: 'overdue',
    },
    {
        id: '3',
        title: 'Домашнее Задание',
        start: '2025-08-29',
        backgroundColor: 'rgb(255, 237, 213)',
        borderColor: 'rgb(255, 237, 213)',
        textColor: '#374151',
        description: 'Решить задачи по физике',
        subject: 'Физика',
        teacher: 'Сидоров В.К.',
        time: '13:00',
        dueDate: '2025-08-31',
        status: 'pending',
    },
    {
        id: '4',
        title: 'Домашнее Задание',
        start: '2025-08-28',
        backgroundColor: 'rgb(255, 237, 213)',
        borderColor: 'rgb(255, 237, 213)',
        textColor: '#374151',
        description: 'Подготовить доклад по биологии',
        subject: 'Биология',
        teacher: 'Волкова Л.Н.',
        time: '15:30',
        dueDate: '2025-09-03',
        status: 'pending',
    },
    {
        id: '5',
        title: 'Домашнее Задание',
        start: '2025-08-27',
        backgroundColor: 'rgb(255, 237, 213)',
        borderColor: 'rgb(255, 237, 213)',
        textColor: '#374151',
        description: 'Изучить исторические даты',
        subject: 'История',
        teacher: 'Козлова Е.В.',
        time: '17:00',
        dueDate: '2025-08-30',
        status: 'completed',
    },
    {
        id: '6',
        title: 'Домашнее Задание',
        start: '2025-08-26',
        backgroundColor: 'rgb(255, 237, 213)',
        borderColor: 'rgb(255, 237, 213)',
        textColor: '#374151',
        description: 'Выучить новые слова по английскому',
        subject: 'Английский язык',
        teacher: 'Морозова Т.А.',
        time: '14:00',
        dueDate: '2025-08-29',
        status: 'overdue',
    },
];

export default function PendingAssignments({
    assignments = sampleAssignments,
}: PendingAssignmentsProps) {
    const pendingAssignments = useMemo(() => {
        return assignments
            .filter(
                assignment =>
                    assignment.status === 'pending' ||
                    assignment.status === 'overdue'
            )
            .sort((a, b) => {
                // Sort by due date, then by status (overdue first)
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
            start: assignment.start,
            subject: assignment.subject,
            teacher: assignment.teacher,
            time: assignment.time,
            description: assignment.description,
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

    return (
        <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                    Ожидающие задания
                </h2>
            </div>

            {/* Assignments List */}
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
                                    {/* Left side - Subject and Status */}
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

                                    {/* Right side - Due Date */}
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500">
                                            Сдать{' '}
                                            {formatDueDate(assignment.dueDate)}
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Effect */}
                                <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-200 pointer-events-none"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
