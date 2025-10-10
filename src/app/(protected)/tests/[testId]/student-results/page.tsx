'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import { CheckCircle, ArrowRight, Check, X } from 'lucide-react';

interface QuestionOption {
    id: number;
    text: string;
    is_correct: boolean;
    position: number;
    image_url: string | null;
}

interface Question {
    id: number;
    test: number;
    type: 'multiple_choice' | 'open_question' | 'matching';
    text: string;
    points: number;
    position: number;
    options?: QuestionOption[];
    options_count?: number;
    correct_answer_text: string | null;
    matching_pairs_json: Array<{ left: string; right: string }> | null;
    key_words: string | null;
    sample_answer: string | null;
}

interface AnswerResult {
    id: number;
    attempt: number;
    question: Question;
    score: number;
    max_score: number;
    is_correct: boolean;
    selected_options?: QuestionOption[];
    text_answer: string | null;
    matching_answers_json: Array<{ left: string; right: string }> | null;
    auto_feedback: string | null;
    teacher_feedback: string | null;
    student_id: number;
    student_username: string;
    student_email: string;
    student_first_name: string;
    student_last_name: string;
    created_at: string;
    updated_at: string;
}

interface AttemptResult {
    id: number;
    test: number;
    test_title: string;
    score: number;
    max_score: number;
    percentage: number;
    submitted_at: string;
    started_at: string;
    time_spent_minutes: number;
    is_completed: boolean;
    is_graded: boolean;
    can_view_results: boolean;
    attempt_number: number;
    graded_at: string | null;
    results_viewed_at: string | null;
    student: number;
    student_username: string;
    student_email: string;
    student_first_name: string;
    student_last_name: string;
    answers: AnswerResult[];
}

export default function StudentResultsPage() {
    const searchParams = useSearchParams();
    const attemptId = searchParams.get('attempt');

    const [attemptData, setAttemptData] = useState<AttemptResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttemptData = async () => {
            if (!attemptId) return;

            setLoading(true);
            try {
                const response = await axiosInstance.get(
                    `/attempts/${attemptId}`
                );
                setAttemptData(response.data);
            } catch (error) {
                console.error('Failed to fetch attempt data:', error);
                setAttemptData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchAttemptData();
    }, [attemptId]);

    const getQuestionStatus = (answer: AnswerResult) => {
        if (answer.is_correct) {
            return {
                status: 'correct',
                label: `Правильно (${answer.score}/${answer.max_score})`,
                bgColor: 'bg-green-100',
                textColor: 'text-green-800',
                borderColor: 'border-green-600',
            };
        } else if (answer.score > 0) {
            return {
                status: 'partial',
                label: `Частично правильно (${answer.score}/${answer.max_score})`,
                bgColor: 'bg-yellow-100',
                textColor: 'text-yellow-800',
                borderColor: 'border-yellow-600',
            };
        } else {
            return {
                status: 'incorrect',
                label: `Неправильно (${answer.score || 0}/${answer.max_score})`,
                bgColor: 'bg-red-100',
                textColor: 'text-red-800',
                borderColor: 'border-red-600',
            };
        }
    };

    const getNavButtonColor = (answer: AnswerResult) => {
        if (answer.is_correct) {
            return 'bg-green-100 border-green-600 text-green-800';
        } else if (answer.score > 0) {
            return 'bg-yellow-100 border-yellow-600 text-yellow-800';
        } else {
            return 'bg-red-100 border-red-600 text-red-800';
        }
    };

    const isMatchCorrect = (
        studentPair: { left: string; right: string },
        correctPairs: Array<{ left: string; right: string }>
    ): boolean => {
        return correctPairs.some(
            correctPair =>
                correctPair.left === studentPair.left &&
                correctPair.right === studentPair.right
        );
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!attemptData) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <p className="text-red-600">
                        Не удалось загрузить результаты теста
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
                <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-semibold text-gray-900">
                    {attemptData.test_title}
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {attemptData.answers.map((answer, index) => {
                        const status = getQuestionStatus(answer);

                        return (
                            <div
                                id={`question-${index}`}
                                key={answer.id}
                                className="bg-white rounded-lg p-6 shadow-sm"
                            >
                                {/* Question Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        Вопрос {index + 1}
                                    </h3>
                                    <div
                                        className={`px-4 py-2 rounded-lg ${status.bgColor} ${status.textColor} border-2 ${status.borderColor}`}
                                    >
                                        {status.label}
                                    </div>
                                </div>

                                {/* Question Text */}
                                <p className="text-lg text-gray-900 mb-6">
                                    {answer.question.text}
                                </p>

                                {/* Multiple Choice Answer */}
                                {answer.question.type === 'multiple_choice' &&
                                    answer.question.options && (
                                        <div className="space-y-3">
                                            {answer.question.options.map(
                                                option => {
                                                    const isSelected =
                                                        answer.selected_options?.some(
                                                            opt =>
                                                                opt.id ===
                                                                option.id
                                                        );
                                                    const isCorrect =
                                                        option.is_correct;

                                                    let optionClass =
                                                        'border-gray-300';
                                                    let textClass =
                                                        'text-gray-900';

                                                    if (
                                                        isSelected &&
                                                        isCorrect
                                                    ) {
                                                        optionClass =
                                                            'border-green-600 bg-green-50';
                                                        textClass =
                                                            'text-green-800';
                                                    } else if (
                                                        isSelected &&
                                                        !isCorrect
                                                    ) {
                                                        optionClass =
                                                            'border-red-600 bg-red-50';
                                                        textClass =
                                                            'text-red-800';
                                                    } else if (
                                                        !isSelected &&
                                                        isCorrect
                                                    ) {
                                                        optionClass =
                                                            'border-green-300 bg-green-50';
                                                        textClass =
                                                            'text-green-700';
                                                    }

                                                    return (
                                                        <div
                                                            key={option.id}
                                                            className={`flex items-center gap-3 p-4 border-2 rounded-lg ${optionClass}`}
                                                        >
                                                            <div
                                                                className={`w-5 h-5 border-2 rounded ${isSelected ? 'bg-current border-current' : 'border-gray-400'}`}
                                                            >
                                                                {isSelected && (
                                                                    <div className="w-3 h-3 bg-white rounded m-0.5"></div>
                                                                )}
                                                            </div>
                                                            <span
                                                                className={`text-base font-medium ${textClass}`}
                                                            >
                                                                {option.text}
                                                            </span>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )}

                                {/* Open Question Answer */}
                                {answer.question.type === 'open_question' && (
                                    <div className="space-y-4">
                                        <div
                                            className={`p-4 border-2 rounded-lg ${answer.is_correct ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50'}`}
                                        >
                                            <p className="text-sm text-gray-600 mb-2">
                                                Ваш ответ:
                                            </p>
                                            <p
                                                className={`text-lg font-semibold ${answer.is_correct ? 'text-green-800' : 'text-red-800'}`}
                                            >
                                                {answer.text_answer ||
                                                    'Нет ответа'}
                                            </p>
                                        </div>
                                        {!answer.is_correct &&
                                            answer.question
                                                .correct_answer_text && (
                                                <div className="p-4 border-2 border-green-300 bg-green-50 rounded-lg">
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        Правильный ответ:
                                                    </p>
                                                    <p className="text-lg font-semibold text-green-800">
                                                        {
                                                            answer.question
                                                                .correct_answer_text
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                    </div>
                                )}

                                {answer.question.type === 'matching' &&
                                    answer.question.matching_pairs_json &&
                                    answer.matching_answers_json && (
                                        <div className="space-y-4">
                                            <div className="mb-4">
                                                <p className="text-sm font-medium text-gray-600 mb-3">
                                                    Ваши ответы:
                                                </p>
                                                <div className="space-y-2">
                                                    {answer.matching_answers_json.map(
                                                        (
                                                            studentPair,
                                                            pairIndex
                                                        ) => {
                                                            const isCorrect =
                                                                isMatchCorrect(
                                                                    studentPair,
                                                                    answer
                                                                        .question
                                                                        .matching_pairs_json!
                                                                );

                                                            return (
                                                                <div
                                                                    key={
                                                                        pairIndex
                                                                    }
                                                                    className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                                                                        isCorrect
                                                                            ? 'bg-green-50 border-green-500'
                                                                            : 'bg-red-50 border-red-500'
                                                                    }`}
                                                                >
                                                                    <div
                                                                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                                            isCorrect
                                                                                ? 'bg-green-500'
                                                                                : 'bg-red-500'
                                                                        }`}
                                                                    >
                                                                        {isCorrect ? (
                                                                            <Check className="w-4 h-4 text-white" />
                                                                        ) : (
                                                                            <X className="w-4 h-4 text-white" />
                                                                        )}
                                                                    </div>
                                                                    <span className="font-medium text-gray-900">
                                                                        {
                                                                            studentPair.left
                                                                        }
                                                                    </span>
                                                                    <ArrowRight
                                                                        className={`w-4 h-4 flex-shrink-0 ${
                                                                            isCorrect
                                                                                ? 'text-green-600'
                                                                                : 'text-red-600'
                                                                        }`}
                                                                    />
                                                                    <span
                                                                        className={`font-medium ${
                                                                            isCorrect
                                                                                ? 'text-green-800'
                                                                                : 'text-red-800'
                                                                        }`}
                                                                    >
                                                                        {
                                                                            studentPair.right
                                                                        }
                                                                    </span>
                                                                </div>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            </div>

                                            {!answer.is_correct && (
                                                <div className="mt-4">
                                                    <p className="text-sm font-medium text-gray-600 mb-3">
                                                        Правильные ответы:
                                                    </p>
                                                    <div className="space-y-2">
                                                        {answer.question.matching_pairs_json.map(
                                                            (
                                                                correctPair,
                                                                pairIndex
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        pairIndex
                                                                    }
                                                                    className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border-2 border-green-300"
                                                                >
                                                                    <span className="font-medium text-gray-900">
                                                                        {
                                                                            correctPair.left
                                                                        }
                                                                    </span>
                                                                    <ArrowRight className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                                    <span className="font-medium text-green-800">
                                                                        {
                                                                            correctPair.right
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                            </div>
                        );
                    })}
                </div>

                {/* Sidebar - Navigation */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg p-6 shadow-sm sticky top-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            Навигация
                        </h3>
                        <div className="grid grid-cols-6 gap-2">
                            {attemptData.answers.map((answer, index) => {
                                const navColor = getNavButtonColor(answer);
                                return (
                                    <button
                                        key={answer.id}
                                        onClick={() => {
                                            const element =
                                                document.getElementById(
                                                    `question-${index}`
                                                );
                                            element?.scrollIntoView({
                                                behavior: 'smooth',
                                                block: 'center',
                                            });
                                        }}
                                        className={`w-11 h-11 rounded-lg border-2 font-medium text-lg ${navColor} hover:opacity-80 transition-opacity`}
                                    >
                                        {index + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
