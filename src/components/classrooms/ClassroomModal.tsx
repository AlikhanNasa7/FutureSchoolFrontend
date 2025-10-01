'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';

interface ClassroomData {
    id: number;
    grade: number;
    letter: string;
    school: number;
    school_name: string;
    language: string;
    kundelik_id: number | null;
}

interface ClassroomModalProps {
    isOpen: boolean;
    classroom?: ClassroomData | null;
    onSave: (
        data: Omit<ClassroomData, 'id' | 'created_at' | 'updated_at'>
    ) => void;
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
        grade: 1,
        letter: '',
        school: 1,
        language: 'KZ',
    });

    useEffect(() => {
        if (classroom) {
            setFormData({
                grade: classroom.grade,
                letter: classroom.letter,
                school: classroom.school,
                language: classroom.language,
            });
        }
    }, [classroom]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.grade && formData.letter) {
            onSave(formData);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'grade' ? parseInt(value) : value,
        }));
    };

    const isEditing = !!classroom;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Edit Classroom' : 'Create Classroom'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Only show Grade and Letter fields - these are the only editable fields */}
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
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(
                                grade => (
                                    <option key={grade} value={grade}>
                                        {grade}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Letter
                        </label>
                        <input
                            type="text"
                            name="letter"
                            value={formData.letter}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            maxLength={1}
                            required
                            placeholder="A"
                        />
                    </div>
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
                        {loading
                            ? 'Saving...'
                            : isEditing
                              ? 'Update'
                              : 'Create'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
