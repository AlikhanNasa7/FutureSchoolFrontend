'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen } from 'lucide-react';
import axiosInstance from '@/lib/axios';

interface SubjectGroup {
    id: number;
    course_name: string;
    course_code: string;
    classroom_name: string;
}

export default function ParentChildSubjectsPage() {
    const params = useParams();
    const router = useRouter();
    const childId = params.childId as string;
    const [subjects, setSubjects] = useState<SubjectGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [childName, setChildName] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Get child info
                const childResponse = await axiosInstance.get(`/users/${childId}/`);
                setChildName(`${childResponse.data.first_name} ${childResponse.data.last_name}`);

                // Get subject groups for the child
                const response = await axiosInstance.get('/subject-groups/', {
                    params: { student: childId }
                });
                setSubjects(response.data.results || response.data);
            } catch (error) {
                console.error('Failed to fetch subjects:', error);
            } finally {
                setLoading(false);
            }
        };

        if (childId) {
            fetchData();
        }
    }, [childId]);

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
                    Предметы {childName}
                </h1>
                <p className="text-gray-600">
                    Просмотр предметов и материалов
                </p>
            </div>

            {subjects.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Нет доступных предметов</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((subject) => (
                        <button
                            key={subject.id}
                            onClick={() => router.push(`/parent/child/${childId}/subjects/${subject.id}`)}
                            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <BookOpen className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {subject.course_name}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {subject.course_code}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {subject.classroom_name}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
