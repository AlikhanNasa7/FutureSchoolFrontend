'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { useLocale } from '@/contexts/LocaleContext';
import { AxiosError } from 'axios';

interface SchoolData {
    id: number;
    name: string;
    city: string;
    country: string;
    logo_url?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    kundelik_id?: string | null;
}

interface SchoolModalProps {
    isOpen: boolean;
    school?: SchoolData | null;
    onSave: (data: Omit<SchoolData, 'id'>) => void;
    onClose: () => void;
    loading?: boolean;
}

export default function SchoolModal({
    isOpen,
    school,
    onSave,
    onClose,
    loading = false,
}: SchoolModalProps) {
    const { t } = useLocale();
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        city: '',
        country: 'Kazakhstan',
        logo_url: '',
        contact_email: '',
        contact_phone: '',
        kundelik_id: '',
    });

    useEffect(() => {
        if (school) {
            setFormData({
                name: school.name || '',
                city: school.city || '',
                country: school.country || 'Kazakhstan',
                logo_url: school.logo_url || '',
                contact_email: school.contact_email || '',
                contact_phone: school.contact_phone || '',
                kundelik_id: school.kundelik_id || '',
            });
        } else if (isOpen) {
            // Reset form when creating new school
            setFormData({
                name: '',
                city: '',
                country: 'Kazakhstan',
                logo_url: '',
                contact_email: '',
                contact_phone: '',
                kundelik_id: '',
            });
        }
    }, [school, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.name.trim()) {
            setError('Название школы обязательно');
            return;
        }

        if (!formData.city.trim()) {
            setError('Город обязателен');
            return;
        }

        // Prepare data - only send non-empty optional fields
        const submitData: any = {
            name: formData.name.trim(),
            city: formData.city.trim(),
            country: formData.country || 'Kazakhstan',
        };

        if (formData.logo_url.trim()) {
            submitData.logo_url = formData.logo_url.trim();
        }

        if (formData.contact_email.trim()) {
            submitData.contact_email = formData.contact_email.trim();
        }

        if (formData.contact_phone.trim()) {
            submitData.contact_phone = formData.contact_phone.trim();
        }

        if (formData.kundelik_id.trim()) {
            submitData.kundelik_id = formData.kundelik_id.trim();
        }

        onSave(submitData);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const isEditing = !!school;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Редактировать школу' : 'Создать школу'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Название школы <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        placeholder="Название школы"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Город <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            placeholder="Город"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Страна
                        </label>
                        <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Страна"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL логотипа
                    </label>
                    <input
                        type="url"
                        name="logo_url"
                        value={formData.logo_url}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com/logo.png"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email для связи
                    </label>
                    <input
                        type="email"
                        name="contact_email"
                        value={formData.contact_email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="school@example.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Телефон для связи
                    </label>
                    <input
                        type="tel"
                        name="contact_phone"
                        value={formData.contact_phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+7 (XXX) XXX-XX-XX"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kundelik ID
                    </label>
                    <input
                        type="text"
                        name="kundelik_id"
                        value={formData.kundelik_id}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Kundelik ID"
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading
                            ? 'Сохранение...'
                            : isEditing
                              ? 'Обновить'
                              : 'Создать'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
