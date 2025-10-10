'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, User } from 'lucide-react';
import { z } from 'zod';

const resetPasswordSchema = z.object({
    username: z.string().min(1, 'Username is required'),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errors, setErrors] = useState<{ username?: string }>({});
    const [error, setError] = useState<string | null>(null);

    const validateForm = (): boolean => {
        try {
            resetPasswordSchema.parse({ username });
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: { username?: string } = {};
                error.issues.forEach((err: z.ZodIssue) => {
                    if (err.path[0] === 'username') {
                        newErrors.username = err.message;
                    }
                });
                setErrors(newErrors);
            }
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Simulate API call for password reset
            await new Promise(resolve => setTimeout(resolve, 1000));
            setIsSubmitted(true);
        } catch (error) {
            setError('Failed to send reset message. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 w-full">
            {/* Header */}
            <div className="text-center space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Сброс пароля
                </h2>
                {/* Error Display */}
                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {error}
                        </p>
                    </div>
                )}
            </div>

            {/* Form */}
            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
                {/* Username Field */}
                <div className="space-y-2">
                    <label
                        htmlFor="username"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Имя пользователя
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                            <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        </div>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            required
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className={`block w-full pl-8 sm:pl-10 pr-3 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                errors.username
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 dark:border-gray-600'
                            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                            placeholder="Введите свой логин"
                        />
                    </div>
                    {errors.username && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">
                            {errors.username}
                        </p>
                    )}
                </div>

                {/* Submit Button */}
                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-gradient-to-r main-button to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        {isLoading ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                                Отправка
                            </div>
                        ) : (
                            <div className="flex items-center">Дальше</div>
                        )}
                    </button>
                </div>

                {/* Resend message info (shown after submit) */}
                {isSubmitted && (
                    <div className="text-center mt-4">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            Сообщение сброса пароля было отправлено на почту
                            yeszhan@gmail.com
                        </p>
                    </div>
                )}

                {/* Back to Login */}
                <div className="text-center">
                    <a
                        href="/login"
                        className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                        <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        Назад
                    </a>
                </div>
            </form>
        </div>
    );
}
