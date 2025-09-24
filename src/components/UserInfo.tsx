'use client';

import { useUserState, useUserActions } from '@/contexts/UserContext';

export default function UserInfo() {
    const { user, isAuthenticated, isLoading, error } = useUserState();
    const { logout, clearError } = useUserActions();

    if (isLoading) {
        return (
            <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-600">Loading user data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-red-600 mb-2">Error: {error}</p>
                <button
                    onClick={clearError}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                    Clear Error
                </button>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600">Not authenticated</p>
            </div>
        );
    }

    return (
        <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
                User Info
            </h3>
            <div className="space-y-1 text-sm">
                <p>
                    <strong>Name:</strong> {user.name}
                </p>
                <p>
                    <strong>Username:</strong> {user.username}
                </p>
                <p>
                    <strong>Email:</strong> {user.email}
                </p>
                <p>
                    <strong>Role:</strong> {user.role}
                </p>
            </div>
            <button
                onClick={logout}
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
                Logout
            </button>
        </div>
    );
}
