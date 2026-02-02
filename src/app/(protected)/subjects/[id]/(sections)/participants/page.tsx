'use client';

import { useEffect, useState } from 'react';
import {
    Users,
    Mail,
    User,
    Clock,
    Search,
} from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { useLocale } from '@/contexts/LocaleContext';
import { useSubject } from '../../layout';

interface Member {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    role: 'teacher' | 'student';
    last_login: string | null;
}

export default function ParticipantsPage() {
    const { subject } = useSubject();
    const { t } = useLocale();

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | 'teacher' | 'student'>('all');

    useEffect(() => {
        if (subject?.id) {
            fetchMembers();
        }
    }, [subject?.id]);

    const fetchMembers = async () => {
        if (!subject?.id) return;
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/subject-groups/${subject.id}/members/`);
            setData(response.data);
            console.log('Members data:', response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching members:', err);
            setError(t('participantsPage.loadError'));
        } finally {
            setLoading(false);
        }
    };

    const formatLastLogin = (lastLogin: string | null) => {
        if (!lastLogin) return t('participantsPage.lastLoginNever');
        const date = new Date(lastLogin);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return t('participantsPage.lastLoginJustNow');
        if (minutes < 60) return t('participantsPage.lastLoginMinutesAgo', { minutes });
        if (hours < 24) return t('participantsPage.lastLoginHoursAgo', { hours });
        if (days < 7) return t('participantsPage.lastLoginDaysAgo', { days });

        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const allMembers = [
        ...(data?.teacher ? [data.teacher] : []),
        ...(data?.students || []),
    ];

    const filteredMembers = allMembers.filter((member: Member) => {
        const matchesSearch =
            `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = filterRole === 'all' || member.role === filterRole;

        return matchesSearch && matchesRole;
    });

    return (
        <div className="px-4">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <Users className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900">
                        {t('participantsPage.title')}
                    </h1>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('participantsPage.searchPlaceholder')}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex gap-2">
                        {(['all', 'teacher', 'student'] as const).map(role => (
                            <button
                                key={role}
                                onClick={() => setFilterRole(role)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                                    filterRole === role
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {role === 'all' && t('participantsPage.filterAll')}
                                {role === 'teacher' && t('participantsPage.filterTeachers')}
                                {role === 'student' && t('participantsPage.filterStudents')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mb-6 text-sm text-gray-600">
                {t('participantsPage.foundCount', { count: filteredMembers.length })}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                    {t('participantsPage.columnParticipant')}
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                    {t('participantsPage.columnEmail')}
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                    {t('participantsPage.columnRole')}
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                    {t('participantsPage.columnLastLogin')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.map((member: Member, idx: number) => (
                                <tr key={`${member.role}-${member.id}`} className={`border-b border-gray-200 hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <User className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{member.first_name} {member.last_name}</p>
                                                <p className="text-xs text-gray-500">@{member.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <a href={`mailto:${member.email}`} className="hover:text-blue-600">{member.email}</a>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${member.role === 'teacher' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {member.role === 'teacher'
                                                ? t('participantsPage.roleTeacher')
                                                : t('participantsPage.roleStudent')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            {formatLastLogin(member.last_login)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <p className="text-sm text-gray-600 mb-1">
                        {t('participantsPage.cardTotal')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{filteredMembers.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <p className="text-sm text-gray-600 mb-1">
                        {t('participantsPage.cardNeverLoggedIn')}
                    </p>
                    <p className="text-2xl font-bold text-orange-600">{filteredMembers.filter((m: Member) => !m.last_login).length}</p>
                </div>
            </div>
        </div>
    );
}
