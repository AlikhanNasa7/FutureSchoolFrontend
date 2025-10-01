'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserPlus, ArrowLeft, Trash2 } from 'lucide-react';
import { useUserState } from '@/contexts/UserContext';
import axiosInstance from '@/lib/axios';
import { modalController } from '@/lib/modalController';

interface Student {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
}

interface ClassroomData {
    id: number;
    school: number;
    grade: number;
    letter: string;
    kundelik_id: string;
    language: string;
    school_name: string;
    students: Student[];
}

export default function ClassroomDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useUserState();
    const [classroom, setClassroom] = useState<ClassroomData | null>(null);
    const [loading, setLoading] = useState(true);

    const canEdit = user?.role === 'superadmin' || user?.role === 'schooladmin';

    const fetchClassroom = async () => {
        try {
            const response = await axiosInstance.get(
                `/classrooms/${params.id}/`
            );
            setClassroom(response.data);
        } catch (error) {
            console.error('Error fetching classroom:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchClassroom();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    const handleOpenAddStudentModal = () => {
        if (!classroom) return;

        modalController.open('add-student', {
            classroomId: classroom.id,
            classroomName: `${classroom.grade} "${classroom.letter}"`,
            onStudentAdded: fetchClassroom,
        });
    };

    const handleRemoveStudent = async (studentId: number) => {
        if (!classroom) return;

        const confirmed = confirm(
            'Вы уверены, что хотите удалить этого ученика из класса?'
        );
        if (!confirmed) return;

        try {
            await axiosInstance.post(
                `/classrooms/${classroom.id}/remove-student/`,
                {
                    student_id: studentId,
                }
            );
            // Refresh classroom data after removing student
            fetchClassroom();
        } catch (error) {
            console.error('Error removing student:', error);
            alert('Ошибка при удалении ученика');
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading classroom...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!classroom) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Classroom not found
                    </h3>
                    <button
                        onClick={() => router.push('/classrooms')}
                        className="text-blue-600 hover:text-blue-700"
                    >
                        Back to Classrooms
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Back Button */}
            <button
                onClick={() => router.push('/classrooms')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Classrooms</span>
            </button>

            {/* Header Card */}
            <div className="bg-white rounded-2xl overflow-hidden relative mb-6">
                {/* Decorative Image/Pattern */}
                <div className="w-full h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-md"></div>

                <div className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-semibold text-black leading-tight">
                                    {classroom.grade} &quot;{classroom.letter}
                                    &quot;
                                </h1>
                                {/* Class Supervisor Badge - commented out for now */}
                                {/* <div className="px-2 py-1 bg-[#0FAEF6] rounded">
                                    <span className="text-white text-base font-semibold">
                                        Толегенова М.
                                    </span>
                                </div> */}
                            </div>
                            <p className="text-base font-semibold text-black/30 mt-2">
                                {classroom.students?.length || 0} учеников
                            </p>
                        </div>

                        {canEdit && (
                            <button
                                onClick={handleOpenAddStudentModal}
                                className="flex items-center gap-4 bg-[#694CFD] hover:bg-[#5a3fe6] text-white text-lg font-medium py-3 px-4 rounded-lg transition-colors"
                            >
                                <UserPlus className="w-6 h-6" />
                                <span>Добавить ученика</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                    №
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                    Имя
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                    Фамилия
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                    Username
                                </th>
                                {canEdit && (
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Действия
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {classroom.students &&
                            classroom.students.length > 0 ? (
                                classroom.students.map((student, index) => (
                                    <tr
                                        key={student.id}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {student.first_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {student.last_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {student.email}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {student.username}
                                        </td>
                                        {canEdit && (
                                            <td className="px-6 py-4 text-sm">
                                                <button
                                                    onClick={() =>
                                                        handleRemoveStudent(
                                                            student.id
                                                        )
                                                    }
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Удалить из класса"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={canEdit ? 6 : 5}
                                        className="px-6 py-12 text-center text-gray-500"
                                    >
                                        Нет учеников в этом классе
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
