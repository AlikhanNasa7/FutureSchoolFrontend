'use client';

import { useState } from 'react';
import Image from 'next/image';
import Modal from '@/components/ui/Modal';
import z from 'zod';
import Link from 'next/link';
import { useLocale } from '@/contexts/LocaleContext';

interface KundelikIntegrationModalProps {
    onClose: () => void;
}

const kundelikLoginSchema = z.object({
    username: z.string().min(1, 'Username is required').includes('_'),
    password: z.string(),
});

export default function KundelikIntegrationModal({
    onClose,
}: KundelikIntegrationModalProps) {
    const { t } = useLocale();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{
        username?: string;
        password?: string;
    }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // TODO: Implement actual Kundelik.kz integration
        console.log('Integrating with Kundelik.kz:', { username, password });

        setIsLoading(false);
        onClose();
    };

    return (
        <Modal isOpen={true} onClose={onClose}>
            <div className="flex items-center gap-3 mb-6">
                <Image
                    src="/kundelik.png"
                    alt="Kundelik.kz"
                    width={40}
                    height={20}
                />
                <h2 className="text-xl font-bold text-gray-800">
                    {t('modals.kundelik.title')}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label
                            htmlFor="username"
                            className="block text-sm text-gray-700 dark:text-gray-300 font-bold mb-1"
                        >
                            {t('modals.kundelik.username')}
                        </label>
                        <div className="relative">
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className={`block w-full px-4 py-3 rounded-lg shadow-sm placeholder-gray-400 ${
                                    errors.username
                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 dark:border-gray-600'
                                } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                                placeholder="yeszhan_rakhatuly"
                            />
                        </div>
                        {errors.username && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {errors.username}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm text-gray-700 dark:text-gray-300 font-bold mb-1"
                        >
                            {t('modals.kundelik.password')}
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className={`block w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 ${
                                    errors.password
                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 dark:border-gray-600'
                                } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                                placeholder={t(
                                    'modals.kundelik.passwordPlaceholder'
                                )}
                            />
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {errors.password}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading
                            ? t('modals.kundelik.connecting')
                            : t('modals.kundelik.connect')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
