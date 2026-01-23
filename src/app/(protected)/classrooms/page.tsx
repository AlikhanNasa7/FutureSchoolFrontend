'use client';

import { useState, useMemo, useEffect } from 'react';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { useUserState } from '@/contexts/UserContext';
import axiosInstance from '@/lib/axios';
import ClassroomModal from '@/components/classrooms/ClassroomModal';
import { useRouter } from 'next/navigation';

interface ClassroomData {
    id: number;
    school: number;
    grade: number;
    letter: string;
    kundelik_id: string;
    language: string;
    school_name: string;
    total_students: number;
    name?: string; // Computed field: `${grade}${letter}`
}
export default function ClassroomsPage() {
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingClassroom, setEditingClassroom] =
        useState<ClassroomData | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useUserState();
    const router = useRouter();

    const canEdit = user?.role === 'superadmin' || user?.role === 'schooladmin';

    useEffect(() => {
        function fetchClassrooms() {
            axiosInstance.get('/classrooms/').then(response => {
                const classrooms = response.data.map(
                    (classroom: ClassroomData) => ({
                        ...classroom,
                        name: `${classroom.grade}${classroom.letter}`,
                    })
                );
                setClassrooms(classrooms);
            });
        }
        fetchClassrooms();
    }, []);

    useEffect(() => {
        if (user && user.role !== 'superadmin' && user.role !== 'schooladmin') {
            router.push('/dashboard');
        }
    }, [user, router]);

    const handleCreateClassroom = async (
        classroomData: Omit<
            ClassroomData,
            'id' | 'created_at' | 'updated_at' | 'name'
        >
    ) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post(
                '/classrooms/',
                classroomData
            );
            const newClassroom = {
                ...response.data,
                name: `${response.data.grade}${response.data.letter}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            setClassrooms(prev => [...prev, newClassroom]);
            setShowCreateModal(false);
        } catch (error: any) {
            console.error('Error creating classroom:', error);
            // Error message is already logged in axios interceptor
            // You can add a toast notification here if needed
            const errorMessage = error?.formattedMessage || 
                                error?.response?.data?.detail ||
                                'Failed to create classroom. Please check the form data.';
            alert(errorMessage); // TODO: Replace with proper toast notification
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateClassroom = async (
        id: number,
        classroomData: Partial<ClassroomData>
    ) => {
        setLoading(true);
        try {
            const response = await axiosInstance.put(
                `/classrooms/${id}/`,
                classroomData
            );
            setClassrooms(prev =>
                prev.map(classroom =>
                    classroom.id === id
                        ? {
                              ...response.data,
                              name: `${response.data.grade}${response.data.letter}`,
                              updated_at: new Date().toISOString(),
                          }
                        : classroom
                )
            );
            setEditingClassroom(null);
        } catch (error: any) {
            console.error('Error updating classroom:', error);
            const errorMessage = error?.formattedMessage || 
                                error?.response?.data?.detail ||
                                'Failed to update classroom. Please check the form data.';
            alert(errorMessage); // TODO: Replace with proper toast notification
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClassroom = async (id: number) => {
        if (!confirm('Are you sure you want to delete this classroom?')) return;

        setLoading(true);
        try {
            await axiosInstance.delete(`/classrooms/${id}/`);
            setClassrooms(prev =>
                prev.filter(classroom => classroom.id !== id)
            );
        } catch (error: any) {
            console.error('Error deleting classroom:', error);
            const errorMessage = error?.formattedMessage || 
                                error?.response?.data?.detail ||
                                'Failed to delete classroom.';
            alert(errorMessage); // TODO: Replace with proper toast notification
        } finally {
            setLoading(false);
        }
    };

    const filteredClassrooms = useMemo(() => {
        if (!searchQuery) return classrooms;

        const query = searchQuery.toLowerCase();
        return classrooms.filter(classroom => {
            // Use name if available, otherwise construct from grade and letter
            const name =
                classroom.name || `${classroom.grade}${classroom.letter}`;
            const matchesSearch =
                name.toLowerCase().includes(query) ||
                classroom.school_name?.toLowerCase().includes(query) ||
                classroom.letter?.toLowerCase().includes(query);
            return matchesSearch;
        });
    }, [classrooms, searchQuery]);

    return (
        <div className="mx-auto px-4 pb-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search classrooms..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                {canEdit && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Classroom
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClassrooms.map(classroom => (
                    <div
                        key={classroom.id}
                        className="bg-white rounded-2xl overflow-hidden relative group"
                    >
                        <div className="p-6 flex flex-col justify-between">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-2xl font-semibold text-black leading-tight">
                                            {classroom.grade} "{classroom.letter}"
                                        </h3>
                                        {classroom.language && (
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                                classroom.language === 'kazakh' 
                                                    ? 'bg-blue-100 text-blue-700' 
                                                    : classroom.language === 'russian'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-green-100 text-green-700'
                                            }`}>
                                                {classroom.language === 'kazakh' ? 'Қаз' : 
                                                 classroom.language === 'russian' ? 'Рус' : 
                                                 classroom.language === 'english' ? 'Eng' : 
                                                 classroom.language}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-base font-semibold text-black/30 mt-2">
                                        {classroom.total_students} учеников
                                    </p>
                                </div>
                                {canEdit && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() =>
                                                setEditingClassroom(classroom)
                                            }
                                            className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                            disabled={loading}
                                        >
                                            <Edit className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDeleteClassroom(
                                                    classroom.id
                                                )
                                            }
                                            className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                            disabled={loading}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() =>
                                    router.push(`/classrooms/${classroom.id}`)
                                }
                                className="bg-[#694CFD] hover:bg-[#5a3fe6] text-white text-lg font-medium py-3 px-6 rounded-lg transition-colors w-fit self-end"
                            >
                                Посмотреть
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredClassrooms.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchQuery
                            ? 'Classrooms not found'
                            : 'No classrooms available'}
                    </h3>
                    <p className="text-gray-500">
                        {searchQuery
                            ? `No classrooms found matching "${searchQuery}"`
                            : 'Classrooms will appear here after they are created'}
                    </p>
                </div>
            )}

            {/* Create/Edit Modal */}
            <ClassroomModal
                isOpen={showCreateModal || !!editingClassroom}
                classroom={editingClassroom}
                onSave={
                    editingClassroom
                        ? data =>
                              handleUpdateClassroom(editingClassroom.id, data)
                        : handleCreateClassroom
                }
                onClose={() => {
                    setShowCreateModal(false);
                    setEditingClassroom(null);
                }}
                loading={loading}
            />
        </div>
    );
}
