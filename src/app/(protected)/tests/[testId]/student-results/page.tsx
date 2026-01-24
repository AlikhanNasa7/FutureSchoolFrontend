'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, Check, X, ArrowLeft, AlertCircle } from 'lucide-react';
import { useUserState } from '@/contexts/UserContext';
import axiosInstance from '@/lib/axios';

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
    type: 'multiple_choice' | 'choose_all' | 'open_question' | 'matching';
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
    const router = useRouter();
    const { user } = useUserState();
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
                const attempt = response.data;

                // Check if user can view results
                // For students: check can_view_results
                // For parents: backend will filter by children, so if we get the attempt, it's allowed
                const isParent = user?.role === 'parent';
                
                if (!attempt.can_view_results && !isParent) {
                    setAttemptData(null);
                    setLoading(false);
                    return;
                }

                setAttemptData(attempt);
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

    if (!attemptData && !loading) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Результаты пока недоступны
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Результаты теста будут доступны после того, как преподаватель откроет их для просмотра.
                    </p>
                    <p className="text-sm text-gray-500">
                        Пожалуйста, попробуйте позже или обратитесь к преподавателю.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Назад</span>
                </button>
                <div className="flex items-center gap-4">
                    <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {attemptData.test_title}
                    </h1>
                </div>
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

                                {/* Choose All That Apply Answer */}
                                {answer.question.type === 'choose_all' &&
                                    answer.question.options && (
                                        <div className="space-y-3">
                                            <p className="text-sm text-gray-600 italic mb-4">
                                                Select all that apply
                                            </p>
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

                                                    return (
                                                        <div
                                                            key={option.id}
                                                            className={`p-4 rounded-lg border-2 ${
                                                                isSelected
                                                                    ? isCorrect
                                                                        ? 'border-green-500 bg-green-50'
                                                                        : 'border-red-500 bg-red-50'
                                                                    : isCorrect
                                                                      ? 'border-green-300 bg-green-25'
                                                                      : 'border-gray-200'
                                                            }`}
                                                        >
                                                            <div className="flex items-start">
                                                                <div className="flex items-center flex-1">
                                                                    <div
                                                                        className={`w-5 h-5 rounded mr-3 flex items-center justify-center shrink-0 ${
                                                                            isSelected
                                                                                ? isCorrect
                                                                                    ? 'bg-green-500'
                                                                                    : 'bg-red-500'
                                                                                : isCorrect
                                                                                  ? 'bg-green-300'
                                                                                  : 'bg-gray-300'
                                                                        }`}
                                                                    >
                                                                        {isSelected && (
                                                                            <span className="text-white text-xs font-bold">
                                                                                ✓
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-gray-900 flex-1">
                                                                        {
                                                                            option.text
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="ml-3 flex items-center gap-2">
                                                                    {isCorrect && (
                                                                        <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                                                                            Правильный
                                                                        </span>
                                                                    )}
                                                                    {isSelected &&
                                                                        isCorrect && (
                                                                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                                                        )}
                                                                    {isSelected &&
                                                                        !isCorrect && (
                                                                            <>
                                                                                <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded">
                                                                                    Неправильно
                                                                                </span>
                                                                                <X className="w-5 h-5 text-red-500 shrink-0" />
                                                                            </>
                                                                        )}
                                                                    {!isSelected &&
                                                                        isCorrect && (
                                                                            <span className="text-xs font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded">
                                                                                Не
                                                                                выбрано
                                                                            </span>
                                                                        )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                            {/* Feedback section */}
                                            {(answer.auto_feedback ||
                                                answer.teacher_feedback) && (
                                                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <div className="text-sm font-medium text-blue-900 mb-2">
                                                        Обратная связь:
                                                    </div>
                                                    {answer.teacher_feedback && (
                                                        <div className="text-sm text-blue-800 mb-2">
                                                            <span className="font-medium">
                                                                От учителя:
                                                            </span>{' '}
                                                            {
                                                                answer.teacher_feedback
                                                            }
                                                        </div>
                                                    )}
                                                    {answer.auto_feedback && (
                                                        <div className="text-sm text-blue-700">
                                                            <span className="font-medium">
                                                                Автоматически:
                                                            </span>{' '}
                                                            {
                                                                answer.auto_feedback
                                                            }
                                                        </div>
                                                    )}
                                                </div>
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
                                        {/* Feedback section */}
                                        {(answer.auto_feedback ||
                                            answer.teacher_feedback) && (
                                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                <div className="text-sm font-medium text-blue-900 mb-2">
                                                    Обратная связь:
                                                </div>
                                                {answer.teacher_feedback && (
                                                    <div className="text-sm text-blue-800 mb-2">
                                                        <span className="font-medium">
                                                            От учителя:
                                                        </span>{' '}
                                                        {
                                                            answer.teacher_feedback
                                                        }
                                                    </div>
                                                )}
                                                {answer.auto_feedback && (
                                                    <div className="text-sm text-blue-700">
                                                        <span className="font-medium">
                                                            Автоматически:
                                                        </span>{' '}
                                                        {answer.auto_feedback}
                                                    </div>
                                                )}
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
                                            {/* Feedback section */}
                                            {(answer.auto_feedback ||
                                                answer.teacher_feedback) && (
                                                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <div className="text-sm font-medium text-blue-900 mb-2">
                                                        Обратная связь:
                                                    </div>
                                                    {answer.teacher_feedback && (
                                                        <div className="text-sm text-blue-800 mb-2">
                                                            <span className="font-medium">
                                                                От учителя:
                                                            </span>{' '}
                                                            {
                                                                answer.teacher_feedback
                                                            }
                                                        </div>
                                                    )}
                                                    {answer.auto_feedback && (
                                                        <div className="text-sm text-blue-700">
                                                            <span className="font-medium">
                                                                Автоматически:
                                                            </span>{' '}
                                                            {
                                                                answer.auto_feedback
                                                            }
                                                        </div>
                                                    )}
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
