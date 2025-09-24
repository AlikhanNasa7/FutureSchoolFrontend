'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';

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

interface ClassroomModalProps {
    isOpen: boolean;
    classroom?: ClassroomData | null;
    onSave: (data: Omit<ClassroomData, 'id' | 'created_at' | 'updated_at'>) => void;
    onClose: () => void;
    loading?: boolean;
}

export default function ClassroomModal({
    isOpen,
    classroom,
    onSave,
    onClose,
    loading = false,
}: ClassroomModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        school_id: 1,
        grade: 11,
        section: '',
        capacity: 30,
    });

    useEffect(() => {
        if (classroom) {
            setFormData({
                name: classroom.name,
                school_id: classroom.school_id,
                grade: classroom.grade,
                section: classroom.section,
                capacity: classroom.capacity,
            });
        }
    }, [classroom]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.section) {
            onSave(formData);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'grade' || name === 'capacity' ? parseInt(value) : value
        }));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={classroom ? 'Edit Classroom' : 'Create Classroom'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Classroom Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Grade
                        </label>
                        <select
                            name="grade"
                            value={formData.grade}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(grade => (
                                <option key={grade} value={grade}>{grade}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Section
                        </label>
                        <input
                            type="text"
                            name="section"
                            value={formData.section}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capacity
                    </label>
                    <input
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        max="50"
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : (classroom ? 'Update' : 'Create')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
