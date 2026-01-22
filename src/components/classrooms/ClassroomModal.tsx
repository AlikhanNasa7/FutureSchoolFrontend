'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { useLocale } from '@/contexts/LocaleContext';
import { useUserState } from '@/contexts/UserContext';
import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';

interface ClassroomData {
    id: number;
    grade: number;
    letter: string;
    school: number;
    school_name: string;
    language: string;
    kundelik_id: number | null;
}

interface School {
    id: number;
    name: string;
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
    const { t } = useLocale();
    const { user } = useUserState();
    const [schools, setSchools] = useState<School[]>([]);
    const [loadingSchools, setLoadingSchools] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        grade: 1,
        letter: '',
        school: 0,
        language: 'KZ',
    });

    // Fetch schools when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchSchools();
        }
    }, [isOpen]);

    const fetchSchools = async () => {
        setLoadingSchools(true);
        setError(null);
        try {
            const response = await axiosInstance.get('/schools/');
            const schoolsData = response.data;
            setSchools(schoolsData);
            
            // Set default school: user's school if schooladmin, or first school
            if (!classroom && schoolsData.length > 0) {
                const defaultSchool = (user as any)?.school || schoolsData[0]?.id;
                setFormData(prev => ({
                    ...prev,
                    school: defaultSchool || 0,
                }));
            }
        } catch (err) {
            const axiosError = err as AxiosError;
            const errorMessage = (axiosError as any)?.formattedMessage || 
                                axiosError.response?.data?.detail ||
                                'Failed to load schools';
            setError(errorMessage);
            console.error('Error fetching schools:', err);
        } finally {
            setLoadingSchools(false);
        }
    };

    useEffect(() => {
        if (classroom) {
            setFormData({
                grade: classroom.grade,
                letter: classroom.letter,
                school: classroom.school,
                language: classroom.language,
            });
        } else if (isOpen && schools.length > 0) {
            // Reset form when creating new classroom
            const defaultSchool = (user as any)?.school || schools[0]?.id;
            setFormData({
                grade: 1,
                letter: '',
                school: defaultSchool || 0,
                language: 'KZ',
            });
        }
    }, [classroom, isOpen, schools, user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        // Validation
        if (!formData.grade || !formData.letter || !formData.school) {
            setError('Please fill in all required fields');
            return;
        }
        
        if (!formData.letter.trim()) {
            setError('Letter is required');
            return;
        }
        
        onSave(formData);
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
            title={
                isEditing
                    ? t('modals.classroom.editTitle')
                    : t('modals.classroom.createTitle')
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        School {formData.school === 0 && <span className="text-red-500">*</span>}
                    </label>
                    <select
                        name="school"
                        value={formData.school}
                        onChange={handleChange}
                        disabled={loadingSchools || !!classroom}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        required
                    >
                        {loadingSchools ? (
                            <option>Loading schools...</option>
                        ) : schools.length === 0 ? (
                            <option value={0}>No schools available</option>
                        ) : (
                            <>
                                <option value={0}>Select a school</option>
                                {schools.map(school => (
                                    <option key={school.id} value={school.id}>
                                        {school.name}
                                    </option>
                                ))}
                            </>
                        )}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('modals.classroom.grade')}
                        </label>
                        <select
                            name="grade"
                            value={formData.grade}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
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
                            {t('modals.classroom.letter')}
                        </label>
                        <input
                            type="text"
                            name="letter"
                            value={formData.letter}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            maxLength={1}
                            required
                            placeholder={t(
                                'modals.classroom.letterPlaceholder'
                            )}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Language
                    </label>
                    <select
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="KZ">Kazakh</option>
                        <option value="RU">Russian</option>
                        <option value="EN">English</option>
                    </select>
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                        {t('modals.classroom.cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading
                            ? t('modals.classroom.saving')
                            : isEditing
                              ? t('modals.classroom.update')
                              : t('modals.classroom.create')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
