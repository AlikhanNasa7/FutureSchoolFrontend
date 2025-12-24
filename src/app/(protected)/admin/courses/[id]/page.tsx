'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ChevronLeft,
    BookOpen,
    FileText,
    Users,
    Settings,
    Plus,
    Calendar,
} from 'lucide-react';
import { useUserState } from '@/contexts/UserContext';
import { courseService } from '@/services/courseService';
import type { Course, CourseSection, SubjectGroup } from '@/types/course';
import TemplateSectionsTab from './_components/TemplateSectionsTab';
import SubjectGroupsTab from './_components/SubjectGroupsTab';

type Tab = 'sections' | 'subjectGroups' | 'settings';

export default function CourseDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useUserState();
    const courseId = parseInt(params.id as string);

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('sections');
    const [templateSections, setTemplateSections] = useState<CourseSection[]>([]);
    const [subjectGroups, setSubjectGroups] = useState<SubjectGroup[]>([]);

    useEffect(() => {
        if (user && user.role !== 'superadmin') {
            router.push('/');
        }
    }, [user, router]);

    useEffect(() => {
        if (courseId) {
            fetchCourseData();
        }
    }, [courseId]);

    const fetchCourseData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [courseData, sectionsData, groupsData] = await Promise.all([
                courseService.getCourseById(courseId),
                courseService.getTemplateSections(courseId),
                courseService.getSubjectGroupsForCourse(courseId),
            ]);

            setCourse(courseData);
            setTemplateSections(sectionsData);
            setSubjectGroups(groupsData);
        } catch (err) {
            console.error('Error fetching course data:', err);
            setError('Не удалось загрузить данные курса');
        } finally {
            setLoading(false);
        }
    };


    if (user?.role !== 'superadmin') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Доступ запрещен
                    </h2>
                    <p className="text-gray-600">
                        Только супер-администратор может просматривать эту страницу.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{error || 'Курс не найден'}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/admin/courses')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span>Назад к списку курсов</span>
                    </button>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {course.name}
                                </h1>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="font-medium">{course.course_code}</span>
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                                        {course.grade} класс
                                    </span>
                                </div>
                            </div>
                        </div>

                        {course.description && (
                            <p className="text-gray-700">{course.description}</p>
                        )}

                        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FileText className="w-4 h-4" />
                                <span>
                                    {templateSections.length} шаблонных секций
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="w-4 h-4" />
                                <span>{subjectGroups.length} классов</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('sections')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'sections'
                                        ? 'border-purple-600 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    <span>Шаблонные секции</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('subjectGroups')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'subjectGroups'
                                        ? 'border-purple-600 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    <span>Классы ({subjectGroups.length})</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'settings'
                                        ? 'border-purple-600 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Settings className="w-4 h-4" />
                                    <span>Настройки</span>
                                </div>
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'sections' && (
                            <TemplateSectionsTab
                                courseId={courseId}
                                sections={templateSections}
                                onSectionsChange={fetchCourseData}
                            />
                        )}
                        {activeTab === 'subjectGroups' && (
                            <SubjectGroupsTab
                                courseId={courseId}
                                subjectGroups={subjectGroups}
                                onSubjectGroupsChange={fetchCourseData}
                            />
                        )}
                        {activeTab === 'settings' && (
                            <div className="text-center py-12 text-gray-500">
                                <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p>Настройки курса будут доступны позже</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

