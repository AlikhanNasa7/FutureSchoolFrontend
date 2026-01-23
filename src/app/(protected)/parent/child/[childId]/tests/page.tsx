'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Award, CheckCircle, Clock, Eye } from 'lucide-react';
import axiosInstance from '@/lib/axios';

interface Test {
    id: number;
    title: string;
    description: string;
    total_points: number;
    course_section_title: string;
    course_name: string;
    start_date: string | null;
    end_date: string | null;
    has_attempted: boolean;
    last_submitted_attempt_id: number | null;
    my_latest_attempt_can_view_results: boolean;
}

export default function ParentChildTestsPage() {
    const params = useParams();
    const router = useRouter();
    const childId = params.childId as string;
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [childName, setChildName] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Get child info
                const childResponse = await axiosInstance.get(`/users/${childId}/`);
                setChildName(`${childResponse.data.first_name} ${childResponse.data.last_name}`);

                // Get tests for the child's classrooms
                // Get subject groups for the child
                const subjectGroupsResponse = await axiosInstance.get('/subject-groups/', {
                    params: { student: childId }
                });
                const subjectGroups = subjectGroupsResponse.data.results || subjectGroupsResponse.data;
                
                // Get course sections for all subject groups
                const allSections: any[] = [];
                for (const sg of subjectGroups) {
                    try {
                        const sectionsResponse = await axiosInstance.get('/course-sections/', {
                            params: { subject_group: sg.id }
                        });
                        const sections = sectionsResponse.data.results || sectionsResponse.data;
                        allSections.push(...sections);
                    } catch (error) {
                        console.error(`Failed to fetch sections for subject group ${sg.id}:`, error);
                    }
                }
                
                // Get tests for all sections
                const allTests: any[] = [];
                for (const section of allSections) {
                    try {
                        const testsResponse = await axiosInstance.get('/tests/', {
                            params: { course_section: section.id }
                        });
                        const tests = testsResponse.data.results || testsResponse.data;
                        allTests.push(...tests);
                    } catch (error) {
                        console.error(`Failed to fetch tests for section ${section.id}:`, error);
                    }
                }
                
                // Get attempts to check status
                const attemptsResponse = await axiosInstance.get('/attempts/', {
                    params: { student: childId }
                });
                const attempts = attemptsResponse.data.results || attemptsResponse.data;
                const attemptsMap = new Map(attempts.map((a: any) => [a.test, a]));
                
                // Merge test data with attempt data
                const testsWithStatus = allTests.map(test => {
                    const attempt = attemptsMap.get(test.id);
                    return {
                        ...test,
                        has_attempted: !!attempt,
                        last_submitted_attempt_id: attempt?.id || null,
                        my_latest_attempt_can_view_results: attempt?.can_view_results || false,
                    };
                });
                
                setTests(testsWithStatus);
            } catch (error) {
                console.error('Failed to fetch tests:', error);
            } finally {
                setLoading(false);
            }
        };

        if (childId) {
            fetchData();
        }
    }, [childId]);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Не указано';
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
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
                    Тесты {childName}
                </h1>
                <p className="text-gray-600">
                    Просмотр тестов и результатов
                </p>
            </div>

            {tests.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Нет доступных тестов</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tests.map((test) => (
                        <div
                            key={test.id}
                            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {test.title}
                                    </h3>
                                    {test.description && (
                                        <p className="text-gray-600 mb-4">
                                            {test.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                                        <div className="flex items-center gap-2">
                                            <span>Макс. балл: {test.total_points}</span>
                                        </div>
                                        {test.start_date && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                <span>Начало: {formatDate(test.start_date)}</span>
                                            </div>
                                        )}
                                        {test.end_date && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                <span>Окончание: {formatDate(test.end_date)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {test.has_attempted && test.last_submitted_attempt_id && (
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                <span className="text-green-600 font-medium">
                                                    Тест пройден
                                                </span>
                                            </div>
                                        )}
                                        {test.has_attempted && test.my_latest_attempt_can_view_results && test.last_submitted_attempt_id && (
                                            <button
                                                onClick={() => router.push(`/tests/${test.id}/student-results?attempt=${test.last_submitted_attempt_id}`)}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span>Посмотреть результаты</span>
                                            </button>
                                        )}
                                    </div>
                                    <div className="mt-2 text-sm text-gray-500">
                                        {test.course_name} • {test.course_section_title}
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
