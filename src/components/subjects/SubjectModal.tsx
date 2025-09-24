'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';

interface SubjectData {
    id: string;
    name: string;
    professor: string;
    bgId: string;
    urlPath: string;
    grade: number;
    type: string;
    course_code: string;
    description: string;
}

interface SubjectModalProps {
    isOpen: boolean;
    subject?: SubjectData | null;
    onSave: (data: Omit<SubjectData, 'id'>) => void;
    onClose: () => void;
    loading?: boolean;
}

export default function SubjectModal({
    isOpen,
    subject,
    onSave,
    onClose,
    loading = false,
}: SubjectModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        professor: '',
        bgId: 'default-bg.png',
        urlPath: '',
        grade: 11,
        type: '',
        course_code: '',
        description: '',
    });

    useEffect(() => {
        if (subject) {
            setFormData({
                name: subject.name,
                professor: subject.professor,
                bgId: subject.bgId,
                urlPath: subject.urlPath,
                grade: subject.grade,
                type: subject.type,
                course_code: subject.course_code,
                description: subject.description,
            });
        }
    }, [subject]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.professor) {
            onSave(formData);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'grade' ? parseInt(value) : value,
            urlPath:
                name === 'name'
                    ? value.toLowerCase().replace(/\s+/g, '-')
                    : prev.urlPath,
        }));
    };

    const subjectTypes = [
        'Mathematics',
        'Physics',
        'Chemistry',
        'Biology',
        'English',
        'History',
        'Geography',
        'Computer Science',
        'Art',
        'Music',
        'Physical Education',
        'Literature',
        'Foreign Language',
        'Economics',
        'Psychology',
        'Philosophy',
        'Other',
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={subject ? 'Edit Subject' : 'Create Subject'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject Name
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
                            required
                        >
                            {Array.from({ length: 11 }, (_, i) => i + 1).map(
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
                            Type
                        </label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select Type</option>
                            {subjectTypes.map(type => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Course Code
                    </label>
                    <input
                        type="text"
                        name="course_code"
                        value={formData.course_code}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Professor
                    </label>
                    <input
                        type="text"
                        name="professor"
                        value={formData.professor}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Background Image
                    </label>
                    <input
                        type="text"
                        name="bgId"
                        value={formData.bgId}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        {loading ? 'Saving...' : subject ? 'Update' : 'Create'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
