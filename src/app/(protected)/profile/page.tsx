'use client';

import { useState } from 'react';
import {
    User,
    Mail,
    Phone,
    Calendar,
    BookOpen,
    Award,
    Settings,
    Edit,
    CheckCircle,
    Clock,
    AlertCircle,
} from 'lucide-react';
import { useUserState, useUserActions } from '@/contexts/UserContext';

interface UserProfile {
    id: string;
    name: string;
    username: string;
    email: string;
    phone: string;
    role: 'student' | 'teacher' | 'admin' | 'superadmin';
    grade?: string;
    class?: string;
    subjects?: string[];
    joinDate: string;
    avatar: string;
    bio: string;
}

interface Task {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    status: 'pending' | 'completed' | 'overdue';
    priority: 'low' | 'medium' | 'high';
    subject: string;
}

const sampleProfile: UserProfile = {
    id: '1',
    name: 'Есжан Рахатұлы',
    username: 'yeszhan_rakhatuly',
    email: 'yeszhan.rakhatuly@example.com',
    phone: '+7 (777) 123-45-67',
    role: 'student',
    grade: '11',
    class: '11А',
    subjects: [
        'Математика',
        'Физика',
        'Химия',
        'Биология',
        'История',
        'Литература',
    ],
    joinDate: '2023-09-01',
    avatar: '/avatars/student.jpg',
    bio: 'Активный ученик, увлекаюсь точными науками и программированием.',
};

const sampleTasks: Task[] = [
    {
        id: '1',
        title: 'Домашнее задание по математике',
        description: 'Решить задачи 1-10 из учебника',
        dueDate: '2024-01-15',
        status: 'pending',
        priority: 'high',
        subject: 'Математика',
    },
    {
        id: '2',
        title: 'Подготовка к экзамену по физике',
        description: 'Повторить главы 5-8',
        dueDate: '2024-01-20',
        status: 'pending',
        priority: 'medium',
        subject: 'Физика',
    },
    {
        id: '3',
        title: 'Лабораторная работа по химии',
        description: 'Провести эксперимент и написать отчет',
        dueDate: '2024-01-12',
        status: 'completed',
        priority: 'low',
        subject: 'Химия',
    },
    {
        id: '4',
        title: 'Сочинение по литературе',
        description: 'Написать сочинение на тему "Образ главного героя"',
        dueDate: '2024-01-10',
        status: 'overdue',
        priority: 'high',
        subject: 'Литература',
    },
];

const getRoleInfo = (role: string) => {
    switch (role) {
        case 'student':
            return {
                label: 'Ученик',
                color: 'bg-blue-100 text-blue-800',
                icon: BookOpen,
            };
        case 'teacher':
            return {
                label: 'Учитель',
                color: 'bg-green-100 text-green-800',
                icon: Award,
            };
        case 'admin':
            return {
                label: 'Администратор',
                color: 'bg-purple-100 text-purple-800',
                icon: Settings,
            };
        case 'superadmin':
            return {
                label: 'Супер Администратор',
                color: 'bg-red-100 text-red-800',
                icon: Settings,
            };
        default:
            return {
                label: 'Пользователь',
                color: 'bg-gray-100 text-gray-800',
                icon: User,
            };
    }
};

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'high':
            return 'text-red-600 bg-red-50';
        case 'medium':
            return 'text-yellow-600 bg-yellow-50';
        case 'low':
            return 'text-green-600 bg-green-50';
        default:
            return 'text-gray-600 bg-gray-50';
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'completed':
            return <CheckCircle className="w-4 h-4 text-green-500" />;
        case 'overdue':
            return <AlertCircle className="w-4 h-4 text-red-500" />;
        case 'pending':
            return <Clock className="w-4 h-4 text-yellow-500" />;
        default:
            return <Clock className="w-4 h-4 text-gray-500" />;
    }
};

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const { user, isAuthenticated, isLoading, error } = useUserState();
    const { logout, clearError } = useUserActions();

    // Use user data from context or fallback to sample data
    const profileData = user
        ? {
              id: user.id,
              name: user.name,
              username: user.username,
              email: user.email,
              phone: '+7 (777) 123-45-67', // Default phone since not in user context
              role: user.role as 'student' | 'teacher' | 'admin' | 'superadmin',
              // Role-specific data
              ...(user.role === 'student' && {
                  grade: '11',
                  class: '11A',
                  subjects: ['Математика', 'Физика', 'Химия'],
                  bio: 'Студент 11 класса, увлекаюсь точными науками',
              }),
              ...(user.role === 'teacher' && {
                  subjects: ['Математика', 'Физика'],
                  bio: 'Преподаватель точных наук',
              }),
              ...(user.role === 'admin' && {
                  bio: 'Администратор системы',
              }),
              ...(user.role === 'superadmin' && {
                  bio: 'Супер администратор системы',
              }),
              // Common fields
              joinDate: '2023-09-01', // Default join date
              avatar: '/avatars/default.jpg', // Default avatar
          }
        : sampleProfile;

    const roleInfo = getRoleInfo(profileData.role);

    // Show loading state
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 pb-8">
                <div className="max-w-6xl mx-auto">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-blue-600">Loading profile data...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="container mx-auto px-4 pb-8">
                <div className="max-w-6xl mx-auto">
                    <div className="p-4 bg-red-50 rounded-lg">
                        <p className="text-red-600 mb-2">Error: {error}</p>
                        <button
                            onClick={clearError}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                            Clear Error
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Show not authenticated state
    if (!isAuthenticated || !user) {
        return (
            <div className="container mx-auto px-4 pb-8">
                <div className="max-w-6xl mx-auto">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">Not authenticated</p>
                        <button
                            onClick={logout}
                            className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 pb-8">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="text-center mb-6">
                                <div className="relative inline-block">
                                    <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <div className="w-16 h-16 bg-gray-400 rounded-full"></div>
                                    </div>
                                    <button className="absolute bottom-4 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                </div>

                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    {profileData.name}
                                </h2>

                                <div
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${roleInfo.color}`}
                                >
                                    <roleInfo.icon className="w-4 h-4 mr-2" />
                                    {roleInfo.label}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Email
                                        </p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {profileData.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Телефон
                                        </p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {profileData.phone}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Дата регистрации
                                        </p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {new Date(
                                                profileData.joinDate
                                            ).toLocaleDateString('ru-RU')}
                                        </p>
                                    </div>
                                </div>

                                {profileData.grade && (
                                    <div className="flex items-center">
                                        <BookOpen className="w-5 h-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Класс
                                            </p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {profileData.grade} класс (
                                                {profileData.class})
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h3 className="text-sm font-medium text-gray-900 mb-3">
                                    О себе
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {profileData.bio}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Subjects */}
                        {sampleProfile.subjects && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Предметы
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {sampleProfile.subjects.map(
                                        (subject, index) => (
                                            <div
                                                key={index}
                                                className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                                            >
                                                {subject}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tasks */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Задачи
                                </h3>
                                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                    Посмотреть все
                                </button>
                            </div>

                            <div className="space-y-4">
                                {sampleTasks.map(task => (
                                    <div
                                        key={task.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {getStatusIcon(task.status)}
                                                    <h4 className="font-medium text-gray-900">
                                                        {task.title}
                                                    </h4>
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}
                                                    >
                                                        {task.priority ===
                                                        'high'
                                                            ? 'Высокий'
                                                            : task.priority ===
                                                                'medium'
                                                              ? 'Средний'
                                                              : 'Низкий'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {task.description}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span>
                                                        Предмет: {task.subject}
                                                    </span>
                                                    <span>
                                                        Сдать до:{' '}
                                                        {new Date(
                                                            task.dueDate
                                                        ).toLocaleDateString(
                                                            'ru-RU'
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <BookOpen className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">
                                            Всего предметов
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {sampleProfile.subjects?.length ||
                                                0}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">
                                            Выполнено задач
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {
                                                sampleTasks.filter(
                                                    task =>
                                                        task.status ===
                                                        'completed'
                                                ).length
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <Clock className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">
                                            В ожидании
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {
                                                sampleTasks.filter(
                                                    task =>
                                                        task.status ===
                                                        'pending'
                                                ).length
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
