'use client';

import { useState, useEffect } from 'react';
import { X, Plus, CheckCircle2, AlertCircle, Users, BookOpen, GraduationCap } from 'lucide-react';
import axiosInstance from '@/lib/axios';

interface Course {
    id: number;
    course_code: string;
    name: string;
    grade: number;
    language: string;
}

interface Classroom {
    id: number;
    grade: number;
    letter: string;
    school: number;
    school_name?: string;
}

interface Teacher {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
}

interface BulkCreateSubjectGroupsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function BulkCreateSubjectGroupsModal({
    isOpen,
    onClose,
    onSuccess,
}: BulkCreateSubjectGroupsModalProps) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [selectedSchool, setSelectedSchool] = useState<number>(0);
    const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
    const [selectedClassrooms, setSelectedClassrooms] = useState<number[]>([]);
    const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [schools, setSchools] = useState<Array<{ id: number; name: string }>>([]);

    useEffect(() => {
        if (isOpen) {
            fetchData();
            // Reset state
            setSelectedCourses([]);
            setSelectedClassrooms([]);
            setSelectedTeachers([]);
            setResult(null);
            setError(null);
            setSelectedSchool(0);
        }
    }, [isOpen]);

    const fetchData = async () => {
        setLoadingData(true);
        try {
            // Fetch schools
            const schoolsResponse = await axiosInstance.get('/schools/');
            const schoolsData = Array.isArray(schoolsResponse.data)
                ? schoolsResponse.data
                : schoolsResponse.data.results || [];
            setSchools(schoolsData);
            if (schoolsData.length > 0) {
                setSelectedSchool(schoolsData[0].id);
            }

            // Fetch courses
            const coursesResponse = await axiosInstance.get('/courses/');
            const coursesData = Array.isArray(coursesResponse.data)
                ? coursesResponse.data
                : coursesResponse.data.results || [];
            setCourses(coursesData);

            // Fetch all classrooms (will filter by school if selected)
            const classroomsResponse = await axiosInstance.get('/classrooms/');
            const classroomsData = Array.isArray(classroomsResponse.data)
                ? classroomsResponse.data
                : classroomsResponse.data.results || [];
            setClassrooms(classroomsData);

            // Fetch all teachers
            const teachersResponse = await axiosInstance.get('/users/', {
                params: { role: 'teacher' }
            });
            const teachersData = Array.isArray(teachersResponse.data)
                ? teachersResponse.data
                : teachersResponse.data.results || [];
            setTeachers(teachersData);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Не удалось загрузить данные');
        } finally {
            setLoadingData(false);
        }
    };

    const handleSchoolChange = (schoolId: number) => {
        setSelectedSchool(schoolId);
        // Filter classrooms and teachers by school
        // Note: This assumes classrooms and teachers have school field
    };

    const filteredClassrooms = selectedSchool
        ? classrooms.filter(c => c.school === selectedSchool)
        : classrooms;

    const filteredTeachers = selectedSchool
        ? teachers.filter((t: any) => t.school === selectedSchool)
        : teachers;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedCourses.length === 0) {
            setError('Выберите хотя бы один курс');
            return;
        }

        if (selectedClassrooms.length === 0) {
            setError('Выберите хотя бы один класс');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axiosInstance.post('/subject-groups/bulk-create/', {
                course_ids: selectedCourses,
                classroom_ids: selectedClassrooms,
                teacher_ids: selectedTeachers.length > 0 ? selectedTeachers : undefined,
            });

            setResult(response.data);
            if (onSuccess) {
                onSuccess();
            }
        } catch (err: any) {
            console.error('Error creating subject groups:', err);
            const errorMessage =
                err?.response?.data?.error ||
                err?.response?.data?.detail ||
                'Не удалось создать SubjectGroup';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (
        id: number,
        selected: number[],
        setSelected: (ids: number[]) => void
    ) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(i => i !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Массовое создание SubjectGroup
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* School Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Фильтр по школе (опционально)
                        </label>
                        <select
                            value={selectedSchool}
                            onChange={(e) => handleSchoolChange(Number(e.target.value))}
                            disabled={loadingData || loading}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                            <option value={0}>Все школы</option>
                            {schools.map(school => (
                                <option key={school.id} value={school.id}>
                                    {school.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Courses Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Курсы <span className="text-red-500">*</span>
                            <span className="text-sm text-gray-500 ml-2">
                                ({selectedCourses.length} выбрано)
                            </span>
                        </label>
                        <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                            {loadingData ? (
                                <p className="text-gray-500">Загрузка...</p>
                            ) : courses.length === 0 ? (
                                <p className="text-gray-500">Нет доступных курсов</p>
                            ) : (
                                <div className="space-y-2">
                                    {courses.map(course => (
                                        <label
                                            key={course.id}
                                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedCourses.includes(course.id)}
                                                onChange={() =>
                                                    toggleSelection(
                                                        course.id,
                                                        selectedCourses,
                                                        setSelectedCourses
                                                    )
                                                }
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <BookOpen className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm">
                                                {course.course_code} - {course.name} (Класс: {course.grade})
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Classrooms Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Классы <span className="text-red-500">*</span>
                            <span className="text-sm text-gray-500 ml-2">
                                ({selectedClassrooms.length} выбрано)
                            </span>
                        </label>
                        <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                            {loadingData ? (
                                <p className="text-gray-500">Загрузка...</p>
                            ) : filteredClassrooms.length === 0 ? (
                                <p className="text-gray-500">Нет доступных классов</p>
                            ) : (
                                <div className="space-y-2">
                                    {filteredClassrooms.map(classroom => (
                                        <label
                                            key={classroom.id}
                                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedClassrooms.includes(classroom.id)}
                                                onChange={() =>
                                                    toggleSelection(
                                                        classroom.id,
                                                        selectedClassrooms,
                                                        setSelectedClassrooms
                                                    )
                                                }
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <GraduationCap className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm">
                                                {classroom.grade}{classroom.letter}
                                                {classroom.school_name && ` (${classroom.school_name})`}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Teachers Selection (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Учителя (опционально)
                            <span className="text-sm text-gray-500 ml-2">
                                ({selectedTeachers.length} выбрано)
                            </span>
                        </label>
                        <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                            {loadingData ? (
                                <p className="text-gray-500">Загрузка...</p>
                            ) : filteredTeachers.length === 0 ? (
                                <p className="text-gray-500">Нет доступных учителей</p>
                            ) : (
                                <div className="space-y-2">
                                    {filteredTeachers.map(teacher => (
                                        <label
                                            key={teacher.id}
                                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedTeachers.includes(teacher.id)}
                                                onChange={() =>
                                                    toggleSelection(
                                                        teacher.id,
                                                        selectedTeachers,
                                                        setSelectedTeachers
                                                    )
                                                }
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <Users className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm">
                                                {teacher.first_name} {teacher.last_name} ({teacher.username})
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Если учителя не выбраны, SubjectGroup будет создан без привязки к учителю
                        </p>
                    </div>

                    {/* Preview */}
                    {(selectedCourses.length > 0 && selectedClassrooms.length > 0) && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-blue-900 mb-2">
                                Будет создано SubjectGroup:
                            </p>
                            <p className="text-sm text-blue-700">
                                {selectedCourses.length} курс(ов) × {selectedClassrooms.length} класс(ов)
                                {selectedTeachers.length > 0 && ` × ${selectedTeachers.length} учитель(ей)`}
                                {' = '}
                                <span className="font-bold">
                                    {selectedCourses.length *
                                        selectedClassrooms.length *
                                        (selectedTeachers.length > 0 ? selectedTeachers.length : 1)}{' '}
                                    SubjectGroup
                                </span>
                            </p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-red-800">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Success Result */}
                    {result && result.success && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-green-800">
                                        SubjectGroup созданы успешно!
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-gray-600">Создано:</p>
                                        <p className="font-semibold text-gray-900">
                                            {result.summary.created_count}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Пропущено:</p>
                                        <p className="font-semibold text-gray-900">
                                            {result.summary.skipped_count}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Ошибок:</p>
                                        <p className="font-semibold text-gray-900">
                                            {result.summary.errors_count}
                                        </p>
                                    </div>
                                </div>

                                {result.errors && result.errors.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-gray-700 font-medium mb-2">Ошибки:</p>
                                        <div className="max-h-40 overflow-y-auto space-y-1">
                                            {result.errors.map((err: any, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className="text-xs bg-red-100 rounded p-2"
                                                >
                                                    {err.error}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={
                                loading ||
                                loadingData ||
                                selectedCourses.length === 0 ||
                                selectedClassrooms.length === 0
                            }
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Создание...</span>
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    <span>Создать SubjectGroup</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
