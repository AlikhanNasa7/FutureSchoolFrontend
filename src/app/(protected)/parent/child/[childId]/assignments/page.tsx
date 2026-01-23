'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Calendar, CheckCircle, Clock } from 'lucide-react';
import axiosInstance from '@/lib/axios';

interface Assignment {
    id: number;
    title: string;
    description: string;
    due_at: string;
    max_grade: number;
    course_section_title: string;
    course_name: string;
    is_submitted: boolean;
    grade_value?: number;
}

export default function ParentChildAssignmentsPage() {
    const params = useParams();
    const router = useRouter();
    const childId = params.childId as string;
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [childName, setChildName] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Get child info
                const childResponse = await axiosInstance.get(`/users/${childId}/`);
                setChildName(`${childResponse.data.first_name} ${childResponse.data.last_name}`);

                // Get assignments for the child's classrooms
                // Get subject groups for the child
                const subjectGroupsResponse = await axiosInstance.get('/subject-groups/', {
                    params: { student: childId }
                });
                const subjectGroups = subjectGroupsResponse.data.results || subjectGroupsResponse.data;
                
                // Get assignments for all subject groups
                const allAssignments: any[] = [];
                for (const sg of subjectGroups) {
                    try {
                        const assignmentsResponse = await axiosInstance.get('/assignments/', {
                            params: { subject_group: sg.id }
                        });
                        const assignments = assignmentsResponse.data.results || assignmentsResponse.data;
                        allAssignments.push(...assignments);
                    } catch (error) {
                        console.error(`Failed to fetch assignments for subject group ${sg.id}:`, error);
                    }
                }
                
                // Get submissions to check status
                const submissionsResponse = await axiosInstance.get('/submissions/', {
                    params: { student: childId }
                });
                const submissions = submissionsResponse.data.results || submissionsResponse.data;
                const submissionsMap = new Map(submissions.map((s: any) => [s.assignment, s]));
                
                // Merge assignment data with submission data
                const assignmentsWithStatus = allAssignments.map(assignment => ({
                    ...assignment,
                    is_submitted: submissionsMap.has(assignment.id),
                    grade_value: submissionsMap.get(assignment.id)?.grade_value,
                }));
                
                setAssignments(assignmentsWithStatus);
            } catch (error) {
                console.error('Failed to fetch assignments:', error);
            } finally {
                setLoading(false);
            }
        };

        if (childId) {
            fetchData();
        }
    }, [childId]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isOverdue = (dueAt: string) => {
        return new Date(dueAt) < new Date();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <button
                onClick={() => router.push('/parent/dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Назад</span>
            </button>

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Задания {childName}
                </h1>
                <p className="text-gray-600">
                    Просмотр заданий и их статуса
                </p>
            </div>

            {assignments.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Нет доступных заданий</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {assignments.map((assignment) => (
                        <div
                            key={assignment.id}
                            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {assignment.title}
                                    </h3>
                                    {assignment.description && (
                                        <p className="text-gray-600 mb-4">
                                            {assignment.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-6 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                Срок: {formatDate(assignment.due_at)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span>Макс. балл: {assignment.max_grade}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {assignment.is_submitted ? (
                                                <>
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                    <span className="text-green-600">Сдано</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Clock className={`w-4 h-4 ${isOverdue(assignment.due_at) ? 'text-red-600' : 'text-yellow-600'}`} />
                                                    <span className={isOverdue(assignment.due_at) ? 'text-red-600' : 'text-yellow-600'}>
                                                        {isOverdue(assignment.due_at) ? 'Просрочено' : 'В процессе'}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        {assignment.grade_value !== undefined && (
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">
                                                    Оценка: {assignment.grade_value}/{assignment.max_grade}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-2 text-sm text-gray-500">
                                        {assignment.course_name} • {assignment.course_section_title}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
