'use client';

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
    LogOut,
} from 'lucide-react';
import { useUserState, useUserActions } from '@/contexts/UserContext';
import { useLocale } from '@/contexts/LocaleContext';

const getRoleInfo = (role: string, t: (key: string) => string) => {
    switch (role) {
        case 'student':
            return {
                label: t('profile.student'),
                color: 'bg-blue-100 text-blue-800',
                icon: BookOpen,
            };
        case 'teacher':
            return {
                label: t('profile.teacher'),
                color: 'bg-green-100 text-green-800',
                icon: Award,
            };
        case 'admin':
            return {
                label: t('profile.admin'),
                color: 'bg-purple-100 text-purple-800',
                icon: Settings,
            };
        case 'superadmin':
            return {
                label: t('profile.superadmin'),
                color: 'bg-red-100 text-red-800',
                icon: Settings,
            };
        default:
            return {
                label: t('profile.userBio'),
                color: 'bg-gray-100 text-gray-800',
                icon: User,
            };
    }
};

export default function ProfilePage() {
    const { user, isAuthenticated, isLoading, error } = useUserState();
    const { logout, clearError } = useUserActions();
    const { t } = useLocale();

    const profileData = user
        ? {
              id: user.id,
              name:
                  user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user.name,
              username: user.username,
              email: user.email,
              phone: user.phone_number || t('profile.notSpecified'),
              role: user.role as 'student' | 'teacher' | 'admin' | 'superadmin',
              ...(user.role === 'student' && {
                  grade:
                      user.student_data?.classrooms?.[0]?.grade ||
                      t('profile.notSpecified'),
                  class:
                      user.student_data?.classrooms?.[0]?.letter ||
                      t('profile.notSpecified'),
                  subjects: user.student_data?.subjects || [],
                  bio: `${t('profile.studentBio')} ${user.student_data?.classrooms?.[0]?.grade || ''} ${t('profile.class').toLowerCase()}`,
              }),
              ...(user.role === 'teacher' && {
                  subjects: [],
                  bio: t('profile.teacherBio'),
              }),
              ...(user.role === 'admin' && {
                  bio: t('profile.adminBio'),
              }),
              ...(user.role === 'superadmin' && {
                  bio: t('profile.superadminBio'),
              }),
              avatar: user.avatar || '/avatars/default.jpg',
          }
        : null;

    const roleInfo = profileData ? getRoleInfo(profileData.role, t) : null;

    if (isLoading) {
        return (
            <div className="mx-auto px-4 pb-8">
                <div className="max-w-6xl mx-auto">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-blue-600">{t('profile.loading')}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto px-4 pb-8">
                <div className="max-w-6xl mx-auto">
                    <div className="p-4 bg-red-50 rounded-lg">
                        <p className="text-red-600 mb-2">
                            {t('profile.error')}: {error}
                        </p>
                        <button
                            onClick={clearError}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                            {t('profile.clearError')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user || !profileData) {
        return (
            <div className="mx-auto px-4 pb-8">
                <div className="max-w-6xl mx-auto">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">
                            {t('profile.notAuthenticated')}
                        </p>
                        <button
                            onClick={logout}
                            className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            {t('profile.logout')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto px-4 pb-8">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${roleInfo?.color || 'bg-gray-100 text-gray-800'}`}
                                >
                                    {roleInfo?.icon && (
                                        <roleInfo.icon className="w-4 h-4 mr-2" />
                                    )}
                                    {roleInfo?.label || 'Пользователь'}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            {t('profile.email')}
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
                                            {t('profile.phone')}
                                        </p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {profileData.phone}
                                        </p>
                                    </div>
                                </div>

                                {/* <div className="flex items-center">
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
                                </div> */}

                                {profileData.grade && (
                                    <div className="flex items-center">
                                        <BookOpen className="w-5 h-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                {t('profile.class')}
                                            </p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {profileData.grade}{' '}
                                                {t(
                                                    'profile.class'
                                                ).toLowerCase()}{' '}
                                                ({profileData.class})
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h3 className="text-sm font-medium text-gray-900 mb-3">
                                    {t('profile.aboutMe')}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {profileData.bio}
                                </p>
                            </div>

                            {/* Logout Button - Mobile Only */}
                            <div className="mt-6 pt-6 border-t border-gray-200 block min-[576px]:hidden">
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                >
                                    <LogOut className="w-5 h-5 mr-2" />
                                    {t('profile.logout')}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        {profileData?.role === 'student' &&
                            profileData.subjects &&
                            profileData.subjects.length > 0 && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        {t('profile.subjects')}
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {profileData.subjects.map(
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

                        {profileData?.role === 'student' && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {t('profile.tasks')}
                                    </h3>
                                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                        {t('profile.viewAll')}
                                    </button>
                                </div>

                                <div className="text-center py-8 text-gray-500">
                                    <p>{t('profile.loadingAssignments')}</p>
                                    <p className="text-sm mt-2">
                                        {t('profile.assignmentsWillAppear')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {profileData?.role === 'student' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <BookOpen className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">
                                                {t('profile.totalSubjects')}
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {profileData.subjects?.length ||
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
                                                {t('profile.completedTasks')}
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                0
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
                                                {t('profile.pendingTasks')}
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                0
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
