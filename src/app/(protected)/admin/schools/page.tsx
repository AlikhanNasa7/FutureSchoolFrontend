'use client';

import { useState, useMemo, useEffect } from 'react';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';
import { useUserState } from '@/contexts/UserContext';
import axiosInstance from '@/lib/axios';
import SchoolModal from '@/components/schools/SchoolModal';
import { useRouter } from 'next/navigation';

interface SchoolData {
    id: number;
    name: string;
    city: string;
    country: string;
    logo_url?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    kundelik_id?: string | null;
}

export default function SchoolsPage() {
    const [schools, setSchools] = useState<SchoolData[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingSchool, setEditingSchool] = useState<SchoolData | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useUserState();
    const router = useRouter();

    const canEdit = user?.role === 'superadmin';

    useEffect(() => {
        function fetchSchools() {
            setLoading(true);
            axiosInstance
                .get('/schools/')
                .then(response => {
                    setSchools(response.data);
                })
                .catch(error => {
                    console.error('Error fetching schools:', error);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
        fetchSchools();
    }, []);

    useEffect(() => {
        if (user && user.role !== 'superadmin') {
            router.push('/dashboard');
        }
    }, [user, router]);

    const handleCreateSchool = async (
        schoolData: Omit<SchoolData, 'id'>
    ) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/schools/', schoolData);
            setSchools(prev => [...prev, response.data]);
            setShowCreateModal(false);
        } catch (error: any) {
            console.error('Error creating school:', error);
            const errorMessage =
                error?.formattedMessage ||
                error?.response?.data?.detail ||
                'Failed to create school. Please check the form data.';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSchool = async (
        id: number,
        schoolData: Partial<SchoolData>
    ) => {
        setLoading(true);
        try {
            const response = await axiosInstance.put(
                `/schools/${id}/`,
                schoolData
            );
            setSchools(prev =>
                prev.map(school =>
                    school.id === id ? response.data : school
                )
            );
            setEditingSchool(null);
        } catch (error: any) {
            console.error('Error updating school:', error);
            const errorMessage =
                error?.formattedMessage ||
                error?.response?.data?.detail ||
                'Failed to update school. Please check the form data.';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSchool = async (id: number) => {
        if (
            !confirm(
                'Are you sure you want to delete this school? This will also delete all associated classrooms and data.'
            )
        )
            return;

        setLoading(true);
        try {
            await axiosInstance.delete(`/schools/${id}/`);
            setSchools(prev => prev.filter(school => school.id !== id));
        } catch (error: any) {
            console.error('Error deleting school:', error);
            const errorMessage =
                error?.formattedMessage ||
                error?.response?.data?.detail ||
                'Failed to delete school.';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const filteredSchools = useMemo(() => {
        if (!searchQuery) return schools;

        const query = searchQuery.toLowerCase();
        return schools.filter(school => {
            return (
                school.name.toLowerCase().includes(query) ||
                school.city.toLowerCase().includes(query) ||
                school.country?.toLowerCase().includes(query)
            );
        });
    }, [schools, searchQuery]);

    if (loading && schools.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="mx-auto px-4 pb-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Школы</h1>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Поиск школ..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    {canEdit && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Добавить школу
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSchools.map(school => (
                    <div
                        key={school.id}
                        className="bg-white rounded-2xl overflow-hidden relative group shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="p-6 flex flex-col justify-between">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2 className="w-5 h-5 text-blue-600" />
                                        <h3 className="text-xl font-semibold text-black leading-tight">
                                            {school.name}
                                        </h3>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">
                                        {school.city}, {school.country}
                                    </p>
                                    {school.contact_email && (
                                        <p className="text-xs text-gray-500">
                                            {school.contact_email}
                                        </p>
                                    )}
                                    {school.contact_phone && (
                                        <p className="text-xs text-gray-500">
                                            {school.contact_phone}
                                        </p>
                                    )}
                                </div>
                                {canEdit && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() =>
                                                setEditingSchool(school)
                                            }
                                            className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                            disabled={loading}
                                        >
                                            <Edit className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDeleteSchool(school.id)
                                            }
                                            className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                            disabled={loading}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredSchools.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchQuery
                            ? 'Школы не найдены'
                            : 'Нет доступных школ'}
                    </h3>
                    <p className="text-gray-500">
                        {searchQuery
                            ? `Не найдено школ по запросу "${searchQuery}"`
                            : 'Школы появятся здесь после их создания'}
                    </p>
                </div>
            )}

            {/* Create/Edit Modal */}
            <SchoolModal
                isOpen={showCreateModal || !!editingSchool}
                school={editingSchool}
                onSave={
                    editingSchool
                        ? data => handleUpdateSchool(editingSchool.id, data)
                        : handleCreateSchool
                }
                onClose={() => {
                    setShowCreateModal(false);
                    setEditingSchool(null);
                }}
                loading={loading}
            />
        </div>
    );
}
