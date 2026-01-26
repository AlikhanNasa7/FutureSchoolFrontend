'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
    Users,
    Mail,
    User,
    Clock,
    Search,
} from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { useUserState } from '@/contexts/UserContext';

interface Member {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    role: 'teacher' | 'student';
    last_login: string | null;
}

interface SubjectGroupData {
    teacher: Member | null;
    students: Member[];
    subject_group: {
        id: number;
        course_name: string;
        course_code: string;
        classroom: string;
    };
}

export default function MembersPage() {
    const params = useParams();
    const subjectId = params?.id as string;
    const { user } = useUserState();

    const [data, setData] = useState<SubjectGroupData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | 'teacher' | 'student'>('all');

    useEffect(() => {
        fetchMembers();
    }, [subjectId]);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/subject-groups/${subjectId}/members/`);
            setData(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching members:', err);
            setError('Ошибка при загрузке участников');
        } finally {
            setLoading(false);
        }
    };

    const formatLastLogin = (lastLogin: string | null) => {
        if (!lastLogin) return 'Никогда';
        const date = new Date(lastLogin);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Только что';
        if (minutes < 60) return `${minutes} мин назад`;
        if (hours < 24) return `${hours} часов назад`;
        if (days < 7) return `${days} дней назад`;

        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const isOnline = (lastLogin: string | null) => {
        if (!lastLogin) return false;
        const date = new Date(lastLogin);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        return diff < 300000; // 5 минут
    };

    const allMembers = [
        ...(data?.teacher ? [data.teacher] : []),
        ...(data?.students || []),
    ];

    const filteredMembers = allMembers.filter(member => {
        const matchesSearch =
            `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = filterRole === 'all' || member.role === filterRole;

        return matchesSearch && matchesRole;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <Users className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900">Участники</h1>
                </div>
                {data?.subject_group && (
                    <p className="text-gray-600">
                        {data.subject_group.course_name} ({data.subject_group.course_code}) •{' '}
                        {data.subject_group.classroom}
                    </p>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Поиск по имени, логину или email..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Role Filter */}
                    <div className="flex gap-2">
                        {(['all', 'teacher', 'student'] as const).map(role => (
                            <button
                                key={role}
                                onClick={() => setFilterRole(role)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    filterRole === role
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {role === 'all' && 'Все'}
                                {role === 'teacher' && 'Учителя'}
                                {role === 'student' && 'Студенты'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Members Count */}
            <div className="mb-6 text-sm text-gray-600">
                Найдено: {filteredMembers.length} участников
            </div>

            {/* Members List - Table View */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                    Участник
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                    Роль
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                    Последний вход
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                    Статус
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.map((member, idx) => (
                                <tr
                                    key={`${member.role}-${member.id}`}
                                    className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                    }`}
                                >
                                    {/* Name */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <User className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {member.first_name} {member.last_name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    @{member.username}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Email */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <a
                                                href={`mailto:${member.email}`}
                                                className="hover:text-blue-600 hover:underline"
                                            >
                                                {member.email}
                                            </a>
                                        </div>
                                    </td>

                                    {/* Role */}
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                member.role === 'teacher'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}
                                        >
                                            {member.role === 'teacher' ? 'Учитель' : 'Студент'}
                                        </span>
                                    </td>

                                    {/* Last Login */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            {formatLastLogin(member.last_login)}
                                        </div>
                                    </td>

                                    {/* Online Status */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`w-3 h-3 rounded-full ${
                                                    isOnline(member.last_login)
                                                        ? 'bg-green-500'
                                                        : 'bg-gray-300'
                                                }`}
                                            ></div>
                                            <span className="text-sm text-gray-600">
                                                {isOnline(member.last_login) ? 'Онлайн' : 'Оффлайн'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredMembers.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">Участников не найдено</p>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <p className="text-sm text-gray-600 mb-1">Всего участников</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {filteredMembers.length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <p className="text-sm text-gray-600 mb-1">Онлайн сейчас</p>
                    <p className="text-2xl font-bold text-green-600">
                        {filteredMembers.filter(m => isOnline(m.last_login)).length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <p className="text-sm text-gray-600 mb-1">Никогда не заходили</p>
                    <p className="text-2xl font-bold text-orange-600">
                        {filteredMembers.filter(m => !m.last_login).length}
                    </p>
                </div>
            </div>
        </div>
    );
}
