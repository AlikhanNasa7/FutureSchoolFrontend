'use client';

import { useState, useEffect } from 'react';
import { useUsers } from '@/hooks/useApi';
import { User } from '@/contexts/UserContext';

export default function UserList() {
    const [users, setUsers] = useState<User[]>([]);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        role: 'user',
    });
    const {
        getAll,
        create,
        update,
        delete: deleteUser,
        loading,
        error,
    } = useUsers();

    // Load users on component mount
    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        const result = await getAll();
        if (result) {
            setUsers(result);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await create(newUser);
        if (result) {
            setNewUser({ name: '', email: '', role: 'user' });
            loadUsers(); // Reload the list
        }
    };

    const handleUpdateUser = async (id: string, updatedData: Partial<User>) => {
        const result = await update(id, updatedData);
        if (result) {
            loadUsers(); // Reload the list
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            const success = await deleteUser(id);
            if (success) {
                loadUsers(); // Reload the list
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading users...</span>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">User Management</h1>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">Error: {error}</p>
                </div>
            )}

            {/* Create User Form */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Add New User</h2>
                <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="text"
                            placeholder="Name"
                            value={newUser.name}
                            onChange={e =>
                                setNewUser({ ...newUser, name: e.target.value })
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={newUser.email}
                            onChange={e =>
                                setNewUser({
                                    ...newUser,
                                    email: e.target.value,
                                })
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <select
                            value={newUser.role}
                            onChange={e =>
                                setNewUser({ ...newUser, role: e.target.value })
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="moderator">Moderator</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Adding...' : 'Add User'}
                    </button>
                </form>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold">
                        Users ({users.length})
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {user.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {user.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                user.role === 'admin'
                                                    ? 'bg-red-100 text-red-800'
                                                    : user.role === 'moderator'
                                                      ? 'bg-yellow-100 text-yellow-800'
                                                      : 'bg-green-100 text-green-800'
                                            }`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() =>
                                                handleUpdateUser(user.id, {
                                                    role:
                                                        user.role === 'admin'
                                                            ? 'user'
                                                            : 'admin',
                                                })
                                            }
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            Toggle Admin
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDeleteUser(user.id)
                                            }
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
