'use client';

import { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
import SubjectSearch from '@/components/subjects/SubjectSearch';
import TeacherPicker from '@/components/subjects/TeacherPicker';
import SubjectList from '@/components/subjects/SubjectList';
import SubjectModal from '@/components/subjects/SubjectModal';
import { useUserState } from '@/contexts/UserContext';
import axiosInstance from '@/lib/axios';

interface SubjectData {
    id: string;
    name: string;
    professor: string;
    bgId: string;
    urlPath: string;
    grade: number;
    type: string;
    course_code: string;
    description: string;
    course_name?: string;
    classroom_display?: string;
    teacher_email?: string;
}

// Helper function to extract subject type from course_code
const getSubjectTypeFromCourseCode = (courseCode: string): string => {
    const code = courseCode.toUpperCase();

    if (code.includes('MATH')) return 'Mathematics';
    if (code.includes('ENG')) return 'English';
    if (code.includes('PHYS')) return 'Physics';
    if (code.includes('CHEM')) return 'Chemistry';
    if (code.includes('BIO')) return 'Biology';
    if (code.includes('KAZ')) return 'Kazakh';
    if (code.includes('LIT')) return 'Literature';
    if (code.includes('GEO')) return 'Geography';
    if (code.includes('HIST')) return 'History';
    if (code.includes('CS') || code.includes('COMP')) return 'Computer Science';
    if (code.includes('ART')) return 'Art';
    if (code.includes('MUS')) return 'Music';
    if (code.includes('PE') || code.includes('SPORT'))
        return 'Physical Education';
    if (code.includes('RUS')) return 'Russian';

    return 'Other';
};

const sampleSubjects: SubjectData[] = [
    {
        id: '1',
        name: 'Математика',
        urlPath: 'math',
        professor: 'Толегенова М.',
        bgId: 'math-bg.png',
        grade: 11,
        type: 'Mathematics',
        course_code: 'MATH-101',
        description: 'Углубленное изучение математики для 11 класса',
    },
    {
        id: '2',
        name: 'Физика',
        urlPath: 'physics',
        professor: 'Иванов А.',
        bgId: 'physics-bg.png',
        grade: 11,
        type: 'Physics',
        course_code: 'PHYS-101',
        description: 'Основы физики и экспериментальная работа',
    },
    {
        id: '3',
        name: 'Химия',
        urlPath: 'chemistry',
        professor: 'Петрова Е.',
        bgId: 'chemistry-bg.png',
        grade: 11,
        type: 'Chemistry',
        course_code: 'CHEM-101',
        description: 'Органическая и неорганическая химия',
    },
    {
        id: '4',
        name: 'Биология',
        urlPath: 'biology',
        professor: 'Сидоров В.',
        bgId: 'biology-bg.png',
        grade: 11,
        type: 'Biology',
        course_code: 'BIO-101',
        description: 'Изучение живых организмов и их взаимодействий',
    },
    {
        id: '5',
        name: 'Казахский язык',
        urlPath: 'kazakh-language',
        professor: 'Акишева А.',
        bgId: 'kazakh-language-bg.png',
        grade: 11,
        type: 'Foreign Language',
        course_code: 'KAZ-101',
        description: 'Изучение казахского языка и литературы',
    },
    {
        id: '6',
        name: 'Литература',
        urlPath: 'literature',
        professor: 'Морозова О.',
        bgId: 'literature-bg.png',
        grade: 11,
        type: 'Literature',
        course_code: 'LIT-101',
        description: 'Изучение мировой и казахской литературы',
    },
    {
        id: '7',
        name: 'География',
        urlPath: 'geography',
        professor: 'Волков Д.',
        bgId: 'geography-bg.png',
        grade: 11,
        type: 'Geography',
        course_code: 'GEO-101',
        description: 'Физическая и экономическая география',
    },
    {
        id: '8',
        name: 'Английский язык',
        urlPath: 'english',
        professor: 'Толегенова М.',
        bgId: 'english-bg.png',
        grade: 11,
        type: 'English',
        course_code: 'ENG-101',
        description: 'Изучение английского языка и литературы',
    },
];

export default function SubjectsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [subjects, setSubjects] = useState<SubjectData[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState<SubjectData | null>(
        null
    );
    const { user } = useUserState();

    // Check if user can perform CRUD operations (only superadmin and schooladmin)
    const canEdit = user?.role === 'superadmin' || user?.role === 'schooladmin';

    // Transform backend data to frontend format
    const transformSubjectData = (backendData: unknown[]): SubjectData[] => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return backendData.map((item: any) => {
            const subjectType = getSubjectTypeFromCourseCode(item.course_code);
            // Map subject type to background image
            const bgIdMap: Record<string, string> = {
                Mathematics: 'math-bg.png',
                English: 'english-bg.png',
                Physics: 'physics-bg.png',
                Chemistry: 'chemistry-bg.png',
                Biology: 'biology-bg.png',
                Kazakh: 'kazakh-language-bg.png',
                Literature: 'literature-bg.png',
                Geography: 'geography-bg.png',
                History: 'history-bg.png',
                'Computer Science': 'cs-bg.png',
                Art: 'art-bg.png',
                Music: 'music-bg.png',
                'Physical Education': 'pe-bg.png',
                Russian: 'russian-bg.png',
            };

            return {
                id: item.id.toString(),
                name: item.course_name,
                professor: item.teacher_username || 'Unknown',
                bgId: bgIdMap[subjectType] || 'default-bg.png',
                urlPath: item.id.toString(),
                grade: parseInt(item.course_code.match(/\d+/)?.[0] || '0'),
                type: subjectType,
                course_code: item.course_code,
                description: item.course_name,
                course_name: item.course_name,
                classroom_display: item.classroom_display,
                teacher_email: item.teacher_email,
            };
        });
    };

    // Fetch subjects from API based on user role
    const fetchSubjects = async () => {
        setFetchLoading(true);
        try {
            let response;

            if (user?.role === 'superadmin') {
                response = await axiosInstance.get('/subject-groups/');
                setSubjects(transformSubjectData(response.data));
            } else if (user?.role === 'teacher') {
                response = await axiosInstance.get(
                    `/subject-groups/?teacher=${user.id}`
                );
                setSubjects(transformSubjectData(response.data));
            } else if (user?.role === 'student') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const userClassroom = (user as any).student_data
                    ?.classrooms?.[0]?.id; // Get from user data or default
                response = await axiosInstance.get(
                    `/subject-groups/?classroom=${userClassroom}`
                );
                setSubjects(transformSubjectData(response.data));
            } else {
                // Default fallback
                setSubjects(sampleSubjects);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
            // Fallback to sample data on error
            setSubjects(sampleSubjects);
        } finally {
            setFetchLoading(false);
        }
    };

    // Fetch subjects on component mount and when user changes
    useEffect(() => {
        if (user) {
            fetchSubjects();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const teachers = useMemo(() => {
        const uniqueTeachers = [
            ...new Set(subjects.map(subject => subject.professor)),
        ];
        return uniqueTeachers.sort();
    }, [subjects]);

    // CRUD Functions (only for superadmin/schooladmin)
    const handleCreateSubject = async (
        subjectData: Omit<SubjectData, 'id'>
    ) => {
        if (!canEdit) return;

        setLoading(true);
        try {
            const response = await axiosInstance.post('/courses/', {
                name: subjectData.name,
                description: subjectData.description,
                subject: subjectData.type,
                grade_level: subjectData.grade,
                course_code: subjectData.course_code,
            });
            const newSubject = {
                id: response.data.id.toString(),
                ...subjectData,
            };
            console.log(response);
            setSubjects(prev => [...prev, newSubject]);
            setShowCreateModal(false);
            // Refresh the list to get the latest data
            fetchSubjects();
        } catch (error) {
            console.error('Error creating subject:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSubject = async (
        id: string,
        subjectData: Partial<SubjectData>
    ) => {
        if (!canEdit) return;

        setLoading(true);
        try {
            await axiosInstance.put(`/courses/${id}/`, {
                name: subjectData.name,
                description: subjectData.description,
                subject: subjectData.type,
                grade_level: subjectData.grade,
                course_code: subjectData.course_code,
            });
            setSubjects(prev =>
                prev.map(subject =>
                    subject.id === id ? { ...subject, ...subjectData } : subject
                )
            );
            setEditingSubject(null);
            // Refresh the list to get the latest data
            fetchSubjects();
        } catch (error) {
            console.error('Error updating subject:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSubject = async (id: string) => {
        if (!canEdit) return;
        if (!confirm('Are you sure you want to delete this subject?')) return;

        setLoading(true);
        try {
            await axiosInstance.delete(`/courses/${id}/`);
            setSubjects(prev => prev.filter(subject => subject.id !== id));
            // Refresh the list to get the latest data
            fetchSubjects();
        } catch (error) {
            console.error('Error deleting subject:', error);
        } finally {
            setLoading(false);
        }
    };

    console.log(subjects);

    const filteredSubjects = useMemo(() => {
        return subjects.filter(subject => {
            const matchesSearch = (subject.course_name || subject.name)
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            const matchesTeacher =
                !selectedTeacher || subject.professor === selectedTeacher;
            return matchesSearch && matchesTeacher;
        });
    }, [subjects, searchQuery, selectedTeacher]);

    // Show loading state while fetching subjects
    if (fetchLoading) {
        return (
            <div className="container mx-auto px-4 pb-8">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading subjects...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 pb-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4 md:flex-row flex-col">
                    <SubjectSearch onSearchChange={setSearchQuery} />
                    <TeacherPicker
                        teachers={teachers}
                        selectedTeacher={selectedTeacher}
                        onTeacherChange={setSelectedTeacher}
                    />
                </div>
                {canEdit && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Subject
                    </button>
                )}
            </div>
            <SubjectList
                subjects={filteredSubjects}
                searchQuery={searchQuery}
                canEdit={canEdit}
                onEdit={setEditingSubject}
                onDelete={handleDeleteSubject}
                loading={loading}
            />

            {/* Create/Edit Modal */}
            <SubjectModal
                isOpen={showCreateModal || !!editingSubject}
                subject={editingSubject}
                onSave={
                    editingSubject
                        ? data => handleUpdateSubject(editingSubject.id, data)
                        : handleCreateSubject
                }
                onClose={() => {
                    setShowCreateModal(false);
                    setEditingSubject(null);
                }}
                loading={loading}
            />
        </div>
    );
}
