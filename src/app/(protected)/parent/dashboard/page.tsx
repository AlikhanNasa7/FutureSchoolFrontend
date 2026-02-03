'use client';

import { useState, useEffect } from 'react';
import { useUserState } from '@/contexts/UserContext';
import { Users, FileText, Award, Calendar, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';

interface Child {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
}

export default function ParentDashboardPage() {
    const { user } = useUserState();
    const router = useRouter();
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChildren = async () => {
            if (!user) return;

            try {
                // Get current user data which includes children
                const response = await axiosInstance.get(`/users/${user.id}/`);
                const userData = response.data;
                
                if (userData.children && userData.children.length > 0) {
                    setChildren(userData.children);
                    // Auto-select first child if only one
                    if (userData.children.length === 1) {
                        setSelectedChildId(userData.children[0].id);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch children:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChildren();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (children.length === 0) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Нет привязанных детей
                    </h2>
                    <p className="text-gray-600">
                        Обратитесь к администратору для привязки детей к вашему аккаунту.
                    </p>
                </div>
            </div>
        );
    }

    const selectedChild = children.find(c => c.id === selectedChildId);

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Родительский кабинет
                </h1>
                <p className="text-gray-600">
                    Выберите ребенка для просмотра его успеваемости и заданий
                </p>
            </div>

            {/* Children Selection */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Выберите ребенка
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {children.map((child) => (
                        <button
                            key={child.id}
                            onClick={() => setSelectedChildId(child.id)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                                selectedChildId === child.id
                                    ? 'border-blue-600 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    selectedChildId === child.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-600'
                                }`}>
                                    <Users className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900">
                                        {child.first_name} {child.last_name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {child.username}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Actions for Selected Child */}
            {selectedChild && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <button
                        onClick={() => router.push(`/parent/child/${selectedChild.id}/overview`)}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-gray-900">Обзор</p>
                                <p className="text-sm text-gray-600">Общий прогресс и посещаемость</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => router.push(`/parent/child/${selectedChild.id}/assignments`)}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-gray-900">Задания</p>
                                <p className="text-sm text-gray-600">Просмотр заданий</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => router.push(`/parent/child/${selectedChild.id}/tests`)}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Award className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-gray-900">Тесты</p>
                                <p className="text-sm text-gray-600">Результаты тестов</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => router.push(`/parent/child/${selectedChild.id}/diary`)}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-gray-900">Дневник</p>
                                <p className="text-sm text-gray-600">Расписание и оценки</p>
                            </div>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
}
