'use client';

import { useState, useCallback } from 'react';
import {
    User,
    Mail,
    Phone,
    BookOpen,
    Award,
    Settings,
    Edit,
    CheckCircle,
    Clock,
    LogOut,
    Save,
    X,
} from 'lucide-react';
import { useUserState, useUserActions } from '@/contexts/UserContext';
import { useLocale } from '@/contexts/LocaleContext';
import axiosInstance from '@/lib/axios';

// Список аватарок: '' = первая буква имени, '1'-'8' = эмодзи
const AVATAR_OPTIONS: { key: string; emoji: string }[] = [
    { key: '', emoji: '' },
    { key: '1', emoji: '👤' },
    { key: '2', emoji: '🧑' },
    { key: '3', emoji: '👩' },
    { key: '4', emoji: '👨' },
    { key: '5', emoji: '🧒' },
    { key: '6', emoji: '👴' },
    { key: '7', emoji: '👵' },
    { key: '8', emoji: '🦊' },
];

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
    const { logout, clearError, loginSuccess } = useUserActions();
    const { t } = useLocale();
    const [isEditing, setIsEditing] = useState(false);
    const [editPhone, setEditPhone] = useState('');
    const [editAvatar, setEditAvatar] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [pwCurrent, setPwCurrent] = useState('');
    const [pwNew, setPwNew] = useState('');
    const [pwConfirm, setPwConfirm] = useState('');
    const [pwSaving, setPwSaving] = useState(false);
    const [pwError, setPwError] = useState<string | null>(null);
    const [pwSuccess, setPwSuccess] = useState<string | null>(null);

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
              avatarKey: user.avatar ?? '',
          }
        : null;

    const roleInfo = profileData ? getRoleInfo(profileData.role, t) : null;

    const displayAvatarKey = isEditing ? editAvatar : (profileData?.avatarKey ?? '');
    const firstLetter = profileData?.name?.trim().charAt(0)?.toUpperCase() || '?';
    const avatarOption = AVATAR_OPTIONS.find((o) => o.key === displayAvatarKey);
    const showFirstLetter = !displayAvatarKey || !avatarOption?.emoji;

    const startEditing = useCallback(() => {
        setEditPhone(user?.phone_number ?? '');
        setEditAvatar(user?.avatar ?? '');
        setSaveError(null);
        setIsEditing(true);
    }, [user?.phone_number, user?.avatar]);

    const cancelEditing = useCallback(() => {
        setIsEditing(false);
        setSaveError(null);
    }, []);

    const saveProfile = useCallback(async () => {
        if (!user?.id) return;
        setSaving(true);
        setSaveError(null);
        try {
            const payload: { phone_number?: string; avatar?: string } = {};
            if (editPhone !== (user.phone_number ?? '')) payload.phone_number = editPhone || '';
            if (editAvatar !== (user.avatar ?? '')) payload.avatar = editAvatar || '';
            const { data } = await axiosInstance.patch(`/users/${user.id}/`, payload);
            const merged = { ...user, ...data };
            loginSuccess(merged);
            if (typeof window !== 'undefined') {
                localStorage.setItem('user', JSON.stringify(merged));
            }
            setIsEditing(false);
        } catch (err: any) {
            setSaveError(err?.formattedMessage || t('profile.saveError'));
        } finally {
            setSaving(false);
        }
    }, [user?.id, user?.phone_number, user?.avatar, editPhone, editAvatar, loginSuccess, t]);

    const handleChangePassword = useCallback(async () => {
        if (!pwCurrent || !pwNew) {
            setPwError(t('profile.passwordRequired'));
            setPwSuccess(null);
            return;
        }
        if (pwNew !== pwConfirm) {
            setPwError(t('profile.passwordsMismatch'));
            setPwSuccess(null);
            return;
        }
        setPwSaving(true);
        setPwError(null);
        setPwSuccess(null);
        try {
            await axiosInstance.post('/auth/change-password/', {
                current_password: pwCurrent,
                new_password: pwNew,
            });
            setPwSuccess(t('profile.passwordChanged'));
            setPwCurrent('');
            setPwNew('');
            setPwConfirm('');
            // После смены пароля сразу выходим из системы
            logout();
        } catch (err: any) {
            const data = err?.response?.data;
            let message = t('profile.passwordChangeError');
            if (data) {
                if (typeof data === 'string') {
                    message = data;
                } else if (data.current_password) {
                    message = Array.isArray(data.current_password)
                        ? data.current_password[0]
                        : String(data.current_password);
                } else if (data.non_field_errors) {
                    message = Array.isArray(data.non_field_errors)
                        ? data.non_field_errors[0]
                        : String(data.non_field_errors);
                } else if (data.detail) {
                    message = String(data.detail);
                }
            }
            setPwError(message);
            setPwSuccess(null);
        } finally {
            setPwSaving(false);
        }
    }, [pwCurrent, pwNew, pwConfirm, logout, t]);

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
                                    <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 bg-gray-200 text-4xl">
                                        {showFirstLetter ? (
                                            <span className="font-semibold text-gray-600">
                                                {firstLetter}
                                            </span>
                                        ) : (
                                            <span>{avatarOption?.emoji}</span>
                                        )}
                                    </div>
                                    {!isEditing ? (
                                        <button
                                            type="button"
                                            onClick={startEditing}
                                            className="absolute bottom-4 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                            aria-label={t('profile.edit')}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    ) : null}
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
                                    {roleInfo?.label || t('profile.userBio')}
                                </div>
                            </div>

                            {isEditing ? (
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('profile.phone')}
                                        </label>
                                        <input
                                            type="tel"
                                            value={editPhone}
                                            onChange={(e) => setEditPhone(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                            placeholder={t('profile.phonePlaceholder')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('profile.avatar')}
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {AVATAR_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt.key || 'default'}
                                                    type="button"
                                                    onClick={() => setEditAvatar(opt.key)}
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 transition-colors ${
                                                        editAvatar === opt.key
                                                            ? 'border-blue-600 bg-blue-50'
                                                            : 'border-gray-200 bg-gray-100 hover:border-gray-300'
                                                    }`}
                                                    title={opt.key ? opt.emoji : t('profile.firstLetter')}
                                                >
                                                    {opt.key ? opt.emoji : firstLetter}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {t('profile.firstLetter')}
                                        </p>
                                    </div>
                                    {saveError && (
                                        <p className="text-sm text-red-600">{saveError}</p>
                                    )}
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={saveProfile}
                                            disabled={saving}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                                        >
                                            <Save className="w-4 h-4" />
                                            {saving ? '...' : t('profile.save')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cancelEditing}
                                            disabled={saving}
                                            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                                        >
                                            <X className="w-4 h-4" />
                                            {t('profile.cancel')}
                                        </button>
                                    </div>
                                </div>
                            ) : null}

                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <Mail className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm text-gray-500">
                                            {t('profile.email')}
                                        </p>
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {profileData.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <Phone className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            {t('profile.phone')}
                                        </p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {profileData.phone}
                                        </p>
                                    </div>
                                </div>

                                {profileData.grade && (
                                    <div className="flex items-center">
                                        <BookOpen className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
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
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {t('profile.changePassword')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('profile.currentPassword')}
                                    </label>
                                    <input
                                        type="password"
                                        value={pwCurrent}
                                        onChange={(e) => setPwCurrent(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('profile.newPassword')}
                                    </label>
                                    <input
                                        type="password"
                                        value={pwNew}
                                        onChange={(e) => setPwNew(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('profile.confirmPassword')}
                                    </label>
                                    <input
                                        type="password"
                                        value={pwConfirm}
                                        onChange={(e) => setPwConfirm(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>
                            {pwError && (
                                <p className="mt-3 text-sm text-red-600">{pwError}</p>
                            )}
                            {pwSuccess && (
                                <p className="mt-3 text-sm text-green-600">{pwSuccess}</p>
                            )}
                            <div className="mt-4">
                                <button
                                    type="button"
                                    onClick={handleChangePassword}
                                    disabled={pwSaving}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                                >
                                    {pwSaving ? (
                                        <span>{t('profile.savingPassword') || '...'}</span>
                                    ) : (
                                        <>
                                            <Settings className="w-4 h-4" />
                                            <span>{t('profile.changePasswordButton') || t('profile.changePassword')}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
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
