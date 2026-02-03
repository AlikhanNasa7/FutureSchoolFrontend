'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, FileText, Award, BarChart3 } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import WeekMaterialsPanel from '@/app/(protected)/subjects/[id]/_components/WeekMaterialsPanel.client';

interface SubjectGroupInfo {
    id: number;
    course_name: string;
    course_code: string;
    classroom_display?: string;
}

interface SummaryItem {
    subject_group_id: number;
    course_name: string;
    average: number | null;
    manual_count: number;
    assignment_grades_count: number;
    test_attempts_count: number;
}

export default function ParentChildSubjectPage() {
    const params = useParams();
    const router = useRouter();
    const childId = params.childId as string;
    const subjectId = params.subjectId as string;
    const [loading, setLoading] = useState(true);
    const [sections, setSections] = useState<any[]>([]);
    const [subjectInfo, setSubjectInfo] = useState<SubjectGroupInfo | null>(null);
    const [childName, setChildName] = useState<string>('');
    const [subjectSummary, setSubjectSummary] = useState<SummaryItem | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!subjectId || !childId) return;
            try {
                setLoading(true);
                const [sgRes, sectionsRes, childRes, summaryRes] = await Promise.all([
                    axiosInstance.get<SubjectGroupInfo>(`/subject-groups/${subjectId}/`),
                    axiosInstance.get('/course-sections/', { params: { subject_group: subjectId } }),
                    axiosInstance.get<{ first_name: string; last_name: string }>(`/users/${childId}/`),
                    axiosInstance.get<{ results: SummaryItem[] }>('/manual-grades/student-summary/', {
                        params: { student_id: childId },
                    }),
                ]);
                setSubjectInfo(sgRes.data);
                setSections(sectionsRes.data.results || sectionsRes.data);
                setChildName(`${childRes.data.first_name} ${childRes.data.last_name}`);
                const list = summaryRes.data.results || [];
                const item = list.find((s) => s.subject_group_id === parseInt(subjectId, 10));
                setSubjectSummary(item ?? null);
            } catch (error) {
                console.error('Failed to fetch subject page:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [subjectId, childId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    const weekMaterialsData = sections.map((section) => ({
        id: section.id.toString(),
        title: section.title,
        start_date: section.start_date,
        end_date: section.end_date,
        items: [],
    }));

    const totalGrades =
        subjectSummary == null
            ? 0
            : subjectSummary.manual_count +
              subjectSummary.assignment_grades_count +
              subjectSummary.test_attempts_count;

    return (
        <div className="max-w-7xl mx-auto p-6">
            <button
                onClick={() => router.push(`/parent/child/${childId}/subjects`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Назад</span>
            </button>

            {/* Header: subject + child */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    {subjectInfo?.course_name ?? 'Предмет'} — {childName}
                </h1>
                <p className="text-gray-600 mt-1">
                    {subjectInfo?.course_code}
                    {subjectInfo?.classroom_display ? ` · ${subjectInfo.classroom_display}` : ''}
                </p>
            </div>

            {/* Quick stats + links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {/* Успеваемость по предмету */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                        <span className="font-medium">Успеваемость по предмету</span>
                    </div>
                    {subjectSummary?.average != null ? (
                        <p className="text-2xl font-bold text-gray-900">
                            {Math.round(subjectSummary.average)}%
                        </p>
                    ) : (
                        <p className="text-gray-500">Нет оценок</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                        Оценок: {totalGrades} (домашка: {subjectSummary?.assignment_grades_count ?? 0},{' '}
                        тесты: {subjectSummary?.test_attempts_count ?? 0}, ручные: {subjectSummary?.manual_count ?? 0})
                    </p>
                    <button
                        onClick={() => router.push(`/parent/child/${childId}/grades`)}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Подробнее →
                    </button>
                </div>

                {/* Задания по предмету */}
                <button
                    onClick={() =>
                        router.push(`/parent/child/${childId}/assignments?subject_group=${subjectId}`)
                    }
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow text-left"
                >
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Задания по предмету</span>
                    </div>
                    <p className="text-sm text-gray-500">Список заданий и статусы сдачи</p>
                </button>

                {/* Тесты по предмету */}
                <button
                    onClick={() =>
                        router.push(`/parent/child/${childId}/tests?subject_group=${subjectId}`)
                    }
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow text-left"
                >
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <Award className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">Тесты по предмету</span>
                    </div>
                    <p className="text-sm text-gray-500">Тесты и результаты попыток</p>
                </button>
            </div>

            {/* Materials */}
            <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Материалы и темы
                </h2>
                <WeekMaterialsPanel
                    data={{ weeks: weekMaterialsData }}
                    courseSectionId={parseInt(subjectId)}
                    onRefresh={() => {}}
                />
            </div>
        </div>
    );
}
