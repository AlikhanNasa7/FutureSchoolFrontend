'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, BookOpen, Users, FileText, Search, Filter, Edit, Trash2 } from 'lucide-react';
import { useUserState } from '@/contexts/UserContext';
import { courseService } from '@/services/courseService';
import type { CourseWithStats, Course } from '@/types/course';
import { useLocale } from '@/contexts/LocaleContext';
import CreateCourseModal from './_components/CreateCourseModal';

export default function CoursesPage() {
    const router = useRouter();
    const { user } = useUserState();
    const { t } = useLocale();
    const [courses, setCourses] = useState<CourseWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [gradeFilter, setGradeFilter] = useState<number | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    // Check if user is SuperAdmin
    useEffect(() => {
        if (user && user.role !== 'superadmin') {
            router.push('/');
        }
    }, [user, router]);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await courseService.getAllCoursesWithStats();
            setCourses(data);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('Не удалось загрузить курсы');
        } finally {
            setLoading(false);
        }
    };

    const handleCourseCreated = () => {
        setIsCreateModalOpen(false);
        setEditingCourse(null);
        fetchCourses();
    };

    const handleEdit = (e: React.MouseEvent, course: CourseWithStats) => {
        e.stopPropagation();
        setEditingCourse(course);
    };

    const handleDelete = async (e: React.MouseEvent, course: CourseWithStats) => {
        e.stopPropagation();
        
        const confirmed = window.confirm(
            `Вы уверены, что хотите удалить курс "${course.name}"?\n\nЭто действие нельзя отменить. Все шаблонные секции и связанные данные будут удалены.`
        );
        
        if (!confirmed) {
            return;
        }
        
        try {
            await courseService.deleteCourse(course.id);
            fetchCourses();
        } catch (error: any) {
            console.error('Error deleting course:', error);
            const errorMessage = error?.formattedMessage || 'Не удалось удалить курс';
            alert(errorMessage);
        }
    };

    const filteredCourses = courses.filter((course) => {
        const matchesSearch =
            course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.course_code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGrade = gradeFilter === null || course.grade === gradeFilter;
        return matchesSearch && matchesGrade;
    });

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

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Управление курсами
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Создавайте и управляйте шаблонами курсов
                            </p>
                        </div>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Создать курс</span>
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Поиск по названию или коду курса..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <select
                                value={gradeFilter || ''}
                                onChange={(e) =>
                                    setGradeFilter(
                                        e.target.value ? parseInt(e.target.value) : null
                                    )
                                }
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">Все классы</option>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                                    <option key={grade} value={grade}>
                                        {grade} класс
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Courses List */}
                {filteredCourses.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Курсы не найдены
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {searchQuery || gradeFilter
                                ? 'Попробуйте изменить параметры поиска'
                                : 'Создайте первый курс, чтобы начать'}
                        </p>
                        {!searchQuery && !gradeFilter && (
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Создать курс
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course) => (
                            <div
                                key={course.id}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        onClick={() => router.push(`/admin/courses/${course.id}`)}
                                        className="flex-1 cursor-pointer"
                                    >
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            {course.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {course.course_code}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-2">
                                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                                            {course.grade} класс
                                        </span>
                                        <button
                                            onClick={(e) => handleEdit(e, course)}
                                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            title="Редактировать курс"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, course)}
                                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Удалить курс"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {course.description && (
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {course.description}
                                    </p>
                                )}

                                <div
                                    onClick={() => router.push(`/admin/courses/${course.id}`)}
                                    className="flex items-center gap-4 text-sm text-gray-600 cursor-pointer"
                                >
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        <span>
                                            {course.subject_groups_count || 0} классов
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FileText className="w-4 h-4" />
                                        <span>
                                            {course.template_sections_count || 0} секций
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Course Modal */}
            <CreateCourseModal
                isOpen={isCreateModalOpen || !!editingCourse}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditingCourse(null);
                }}
                onSuccess={handleCourseCreated}
                course={editingCourse}
            />
        </div>
    );
}

