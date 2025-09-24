'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface TestContentProps {
    testId: string;
}

interface TestData {
    id: string;
    title: string;
    description: string;
    deadline: string;
    status: 0 | 1 | 2; // 0 = not started, 1 = in progress, 2 = finished
    grade?: string; // only if test was finished (status = 2)
    currentQuestion?: number; // only if test is in progress (status = 1)
}

export default function TestContent({ testId }: TestContentProps) {
    const [testData, setTestData] = useState<TestData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch test data from backend API
        const fetchTestData = async () => {
            setLoading(true);

            try {
                // In real app, this would be an API call:
                // const response = await fetch(`/api/tests/${testId}`);
                // const testData = await response.json();

                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Mock test data - in real app this would come from API
                const mockTestData: TestData = {
                    id: testId,
                    title: 'Тест по Математике - Арифметика',
                    description:
                        'Проверьте свои знания основ арифметики. Тест включает вопросы по сложению, вычитанию, умножению и делению.',
                    deadline: '2024-12-31 23:59',
                    status: 0, // This would come from backend API
                    // status: 1, currentQuestion: 3, // Example for in-progress
                    // status: 2, grade: '85/100', // Example for finished
                };

                setTestData(mockTestData);
            } catch (error) {
                console.error('Failed to fetch test data:', error);
                setTestData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchTestData();
    }, [testId]);

    const handleStartTest = () => {
        // Logic to start the test - redirect to first question
        console.log('Starting test:', testId);
        window.location.href = `/tests/${testId}/questions/1`;
    };

    const handleContinueTest = () => {
        // Logic to continue the test from current question
        console.log('Continuing test:', testId);
        if (testData?.currentQuestion) {
            window.location.href = `/tests/${testId}/questions/${testData.currentQuestion}`;
        }
    };

    const handleViewResults = () => {
        // Logic to view test results
        console.log('Viewing results for test:', testId);
        window.location.href = `/tests/${testId}/results`;
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!testData) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Тест не найден
                    </h2>
                    <p className="text-gray-600">
                        Запрашиваемый тест не существует или был удален.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {testData.title}
                    </h1>
                    <p className="text-lg text-gray-600">
                        {testData.description}
                    </p>
                </div>

                {/* Test Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-red-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <Clock className="w-6 h-6 text-red-600" />
                            <div>
                                <p className="text-sm text-gray-600">Дедлайн</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {testData.deadline}
                                </p>
                            </div>
                        </div>
                    </div>

                    {testData.status === 2 && testData.grade && (
                        <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Оценка
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {testData.grade}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {testData.status === 1 && testData.currentQuestion && (
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <Clock className="w-6 h-6 text-blue-600" />
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Текущий вопрос
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {testData.currentQuestion}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action */}
                <div className="text-center">
                    {testData.status === 0 && (
                        <>
                            <div className="mb-6">
                                <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                    Тест еще не начат
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    Нажмите кнопку ниже, чтобы начать
                                    прохождение теста.
                                </p>
                            </div>
                            <button
                                onClick={handleStartTest}
                                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                                Начать тест
                            </button>
                        </>
                    )}

                    {testData.status === 1 && (
                        <>
                            <div className="mb-6">
                                <Clock className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                    Тест в процессе
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    Вы уже начали этот тест. Можете продолжить с
                                    вопроса {testData.currentQuestion}.
                                </p>
                            </div>
                            <button
                                onClick={handleContinueTest}
                                className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                            >
                                Продолжить тест
                            </button>
                        </>
                    )}

                    {testData.status === 2 && (
                        <>
                            <div className="mb-6">
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                    Тест завершен
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    Вы успешно прошли тест. Можете посмотреть
                                    результаты.
                                </p>
                            </div>
                            <button
                                onClick={handleViewResults}
                                className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                            >
                                Посмотреть результаты
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
