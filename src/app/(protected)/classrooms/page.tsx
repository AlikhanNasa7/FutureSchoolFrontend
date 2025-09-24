'use client';

import { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { useUserState } from '@/contexts/UserContext';
import axiosInstance from '@/lib/axios';
import ClassroomModal from '@/components/classrooms/ClassroomModal';

interface ClassroomData {
    id: number;
    name: string;
    school_id: number;
    grade: number;
    section: string;
    capacity: number;
    created_at: string;
    updated_at: string;
}

const sampleClassrooms: ClassroomData[] = [
    {
        id: 1,
        name: '11A',
        school_id: 1,
        grade: 11,
        section: 'A',
        capacity: 30,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
    },
    {
        id: 2,
        name: '11B',
        school_id: 1,
        grade: 11,
        section: 'B',
        capacity: 25,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
    },
    {
        id: 3,
        name: '10A',
        school_id: 1,
        grade: 10,
        section: 'A',
        capacity: 28,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
    },
];

export default function ClassroomsPage() {
    const [classrooms, setClassrooms] =
        useState<ClassroomData[]>(sampleClassrooms);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingClassroom, setEditingClassroom] =
        useState<ClassroomData | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useUserState();

    // Check if user can perform CRUD operations
    const canEdit =
        user?.role === 'superadmin' ||
        user?.role === 'schooladmin' ||
        user?.role === 'teacher';

    // CRUD Functions
    const handleCreateClassroom = async (
        classroomData: Omit<ClassroomData, 'id' | 'created_at' | 'updated_at'>
    ) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post(
                '/api/classrooms/',
                classroomData
            );
            const newClassroom = {
                ...response.data,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            setClassrooms(prev => [...prev, newClassroom]);
            setShowCreateModal(false);
        } catch (error) {
            console.error('Error creating classroom:', error);
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
            await axiosInstance.put(`/api/classrooms/${id}/`, classroomData);
            setClassrooms(prev =>
                prev.map(classroom =>
                    classroom.id === id
                        ? {
                              ...classroom,
                              ...classroomData,
                              updated_at: new Date().toISOString(),
                          }
                        : classroom
                )
            );
            setEditingClassroom(null);
        } catch (error) {
            console.error('Error updating classroom:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClassroom = async (id: number) => {
        if (!confirm('Are you sure you want to delete this classroom?')) return;

        setLoading(true);
        try {
            await axiosInstance.delete(`/api/classrooms/${id}/`);
            setClassrooms(prev =>
                prev.filter(classroom => classroom.id !== id)
            );
        } catch (error) {
            console.error('Error deleting classroom:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredClassrooms = useMemo(() => {
        return classrooms.filter(classroom => {
            const matchesSearch = classroom.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [classrooms, searchQuery]);

    return (
        <div className="container mx-auto px-4 pb-8">
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
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {classroom.name}
                            </h3>
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
                                            handleDeleteClassroom(classroom.id)
                                        }
                                        className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                        disabled={loading}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                    Grade {classroom.grade} - Section{' '}
                                    {classroom.section}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600">
                                Capacity: {classroom.capacity} students
                            </div>
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
