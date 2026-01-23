'use client';
import axiosInstance from '@/lib/axios';
import { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

interface TestPreviewContentProps {
    testId: string;
}

interface QuestionData {
    id: string;
    position: number;
    text: string;
    type: 'multiple_choice' | 'choose_all' | 'open_question' | 'matching';
    points: number;
    options?: Array<{
        id: number;
        text: string;
        image_url?: string | null;
        is_correct: boolean;
        position: number;
    }>;
    correct_answer_text?: string;
    key_words?: string;
    matching_pairs_json?: Array<{
        left: string;
        right: string;
    }>;
}

interface TestData {
    id: number;
    title: string;
    description: string;
    time_limit_minutes: number | null;
    total_points: number;
    questions: QuestionData[];
}

export default function TestPreviewContent({ testId }: TestPreviewContentProps) {
    const [testData, setTestData] = useState<TestData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { state } = useUser();

    useEffect(() => {
        const fetchTestData = async () => {
            setLoading(true);

            try {
                const response = await axiosInstance.get(`/tests/${testId}/`);
                const data = response.data;

                setTestData({
                    id: data.id,
                    title: data.title,
                    description: data.description,
                    time_limit_minutes: data.time_limit_minutes,
                    total_points: data.total_points,
                    questions: data.questions || [],
                });
            } catch (error) {
                console.error('Failed to fetch test data:', error);
                setTestData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchTestData();
    }, [testId]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-32 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!testData) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Не удалось загрузить тест
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Тест не найден или у вас нет доступа к нему.
                    </p>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Назад
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-md p-8">
                {/* Header */}
                <div className="mb-8 pb-6 border-b border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Eye className="w-6 h-6 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">
                            Предпросмотр теста
                        </h1>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                        {testData.title}
                    </h2>
                    {testData.description && (
                        <p className="text-gray-600 mb-4">{testData.description}</p>
                    )}
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>{testData.questions.length} вопросов</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                                {testData.time_limit_minutes
                                    ? `${testData.time_limit_minutes} минут`
                                    : 'Без ограничения времени'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">
                                Всего баллов: {testData.total_points}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Questions */}
                <div className="space-y-8">
                    {testData.questions.map((question, index) => (
                        <div
                            key={question.id}
                            className="border border-gray-200 rounded-lg p-6"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-lg font-semibold text-gray-900">
                                            Вопрос {index + 1}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            ({question.points} {question.points === 1 ? 'балл' : 'баллов'})
                                        </span>
                                    </div>
                                    <p className="text-gray-800 text-lg mb-4">
                                        {question.text}
                                    </p>
                                </div>
                            </div>

                            {/* Question Content */}
                            <div className="ml-4">
                                {question.type === 'multiple_choice' && (
                                    <div className="space-y-2">
                                        {question.options?.map((option, optIndex) => (
                                            <div
                                                key={optIndex}
                                                className={`p-3 rounded-lg border-2 ${
                                                    option.is_correct
                                                        ? 'border-green-500 bg-green-50'
                                                        : 'border-gray-200 bg-gray-50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        checked={option.is_correct}
                                                        readOnly
                                                        className="w-4 h-4"
                                                    />
                                                    <span
                                                        className={
                                                            option.is_correct
                                                                ? 'font-medium text-green-700'
                                                                : 'text-gray-700'
                                                        }
                                                    >
                                                        {option.text || '(Без текста)'}
                                                    </span>
                                                    {option.is_correct && (
                                                        <span className="ml-auto text-xs text-green-600 font-medium">
                                                            Правильный ответ
                                                        </span>
                                                    )}
                                                </div>
                                                {option.image_url && (
                                                    <img
                                                        src={option.image_url}
                                                        alt="Option"
                                                        className="mt-2 max-w-xs rounded"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {question.type === 'choose_all' && (
                                    <div className="space-y-2">
                                        {question.options?.map((option, optIndex) => (
                                            <div
                                                key={optIndex}
                                                className={`p-3 rounded-lg border-2 ${
                                                    option.is_correct
                                                        ? 'border-green-500 bg-green-50'
                                                        : 'border-gray-200 bg-gray-50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={option.is_correct}
                                                        readOnly
                                                        className="w-4 h-4"
                                                    />
                                                    <span
                                                        className={
                                                            option.is_correct
                                                                ? 'font-medium text-green-700'
                                                                : 'text-gray-700'
                                                        }
                                                    >
                                                        {option.text || '(Без текста)'}
                                                    </span>
                                                    {option.is_correct && (
                                                        <span className="ml-auto text-xs text-green-600 font-medium">
                                                            Правильный ответ
                                                        </span>
                                                    )}
                                                </div>
                                                {option.image_url && (
                                                    <img
                                                        src={option.image_url}
                                                        alt="Option"
                                                        className="mt-2 max-w-xs rounded"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {question.type === 'open_question' && (
                                    <div className="space-y-3">
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <p className="text-sm font-medium text-gray-700 mb-2">
                                                Правильный ответ:
                                            </p>
                                            <p className="text-gray-800">
                                                {question.correct_answer_text || 'Не указан'}
                                            </p>
                                        </div>
                                        {question.key_words && (
                                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <p className="text-sm font-medium text-blue-700 mb-2">
                                                    Ключевые слова:
                                                </p>
                                                <p className="text-blue-800">
                                                    {question.key_words}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {question.type === 'matching' && (
                                    <div className="space-y-3">
                                        {question.matching_pairs_json?.map((pair, pairIndex) => (
                                            <div
                                                key={pairIndex}
                                                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className="font-medium text-gray-800">
                                                        {pair.left}
                                                    </span>
                                                    <span className="text-gray-400">→</span>
                                                    <span className="text-gray-800">
                                                        {pair.right}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-4">
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        Назад
                    </button>
                </div>
            </div>
        </div>
    );
}
