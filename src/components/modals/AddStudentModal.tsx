'use client';

import { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import axiosInstance from '@/lib/axios';

interface Student {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
}

interface AddStudentModalProps {
    isOpen: boolean;
    classroomId: number;
    classroomName: string;
    onClose: () => void;
    onStudentAdded: () => void;
}

export default function AddStudentModal({
    isOpen,
    classroomId,
    classroomName,
    onClose,
    onStudentAdded,
}: AddStudentModalProps) {
    const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchAvailableStudents();
        }
    }, [isOpen]);

    const fetchAvailableStudents = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(
                '/users?role=student&no_classroom=true'
            );
            setAvailableStudents(response.data);
        } catch (error) {
            console.error('Error fetching available students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = async (studentId: number) => {
        setAdding(true);
        try {
            await axiosInstance.post(
                `/classrooms/${classroomId}/add-student/`,
                {
                    student_id: studentId,
                }
            );
            await fetchAvailableStudents();
            onStudentAdded();
        } catch (error) {
            console.error('Error adding student:', error);
        } finally {
            setAdding(false);
        }
    };

    const filteredStudents = availableStudents.filter(
        student =>
            student.first_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            student.last_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            student.username
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Добавить ученика в класс ${classroomName}`}
            maxWidth="max-w-2xl"
        >
            <div className="flex flex-col max-h-[70vh]">
                {/* Search */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Поиск учеников..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Students List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Загрузка...</p>
                            </div>
                        </div>
                    ) : filteredStudents.length > 0 ? (
                        <div className="space-y-2">
                            {filteredStudents.map(student => (
                                <div
                                    key={student.id}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            {student.first_name}{' '}
                                            {student.last_name}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-1">
                                            <p className="text-sm text-gray-600">
                                                {student.username}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {student.email}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() =>
                                            handleAddStudent(student.id)
                                        }
                                        disabled={adding}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#694CFD] hover:bg-[#5a3fe6] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        <span>Добавить</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <UserPlus className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {searchQuery
                                    ? 'Ученики не найдены'
                                    : 'Нет доступных учеников'}
                            </h3>
                            <p className="text-gray-500">
                                {searchQuery
                                    ? `По запросу "${searchQuery}" ничего не найдено`
                                    : 'Все ученики уже распределены по классам'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                    >
                        Закрыть
                    </button>
                </div>
            </div>
        </Modal>
    );
}
