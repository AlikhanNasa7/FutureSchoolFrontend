'use client';

import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface QuestionData {
    id: string;
    position: number;
    text: string;
    type: 'multiple_choice' | 'choose_all' | 'open_question' | 'matching';
    options?: Array<{
        text: string;
        is_correct: boolean;
        position: number;
    }>;
    correct_answer_text?: string;
    matching_pairs_json?: Array<{
        left: string;
        right: string;
    }>;
}

type AnswerValue = number[] | string | Array<{ left: string; right: string }>;

interface TestReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    questions: QuestionData[];
    answers: Record<number, AnswerValue>;
    timeRemaining: number | null;
}

export default function TestReviewModal({
    isOpen,
    onClose,
    onConfirm,
    questions,
    answers,
    timeRemaining,
}: TestReviewModalProps) {
    if (!isOpen) return null;

    const formatTimeRemaining = (ms: number | null): string => {
        if (ms === null) return '--:--';

        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getAnswerDisplay = (question: QuestionData, answer: AnswerValue | undefined): string => {
        if (!answer) return 'Не отвечено';

        if (question.type === 'multiple_choice' || question.type === 'choose_all') {
            if (Array.isArray(answer) && answer.length > 0) {
                const optionIds = answer as number[];
                // Options are indexed from 1, so we need to check position
                const selectedOptions = question.options?.filter((opt, idx) => {
                    // Check if this option's position matches any selected option ID
                    return optionIds.includes(opt.position) || optionIds.includes(idx + 1);
                });
                if (selectedOptions && selectedOptions.length > 0) {
                    return selectedOptions.map(opt => opt.text || 'Без текста').join(', ');
                }
            }
            return 'Не отвечено';
        }

        if (question.type === 'open_question') {
            return (answer as string) || 'Не отвечено';
        }

        if (question.type === 'matching') {
            const pairs = answer as Array<{ left: string; right: string }>;
            if (pairs && pairs.length > 0) {
                return pairs.map(p => `${p.left} → ${p.right}`).join(', ');
            }
            return 'Не отвечено';
        }

        return 'Не отвечено';
    };

    const hasAnswer = (questionIndex: number): boolean => {
        const answer = answers[questionIndex];
        if (!answer) return false;
        if (Array.isArray(answer)) {
            return answer.length > 0;
        }
        if (typeof answer === 'string') {
            return answer.trim().length > 0;
        }
        return false;
    };

    const answeredCount = questions.filter((_, idx) => hasAnswer(idx)).length;
    const unansweredCount = questions.length - answeredCount;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Обзор ответов
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Проверьте свои ответы перед завершением теста
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Stats */}
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-gray-700">
                                Отвечено: <span className="text-green-600 font-bold">{answeredCount}</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-orange-600" />
                            <span className="text-sm font-medium text-gray-700">
                                Не отвечено: <span className="text-orange-600 font-bold">{unansweredCount}</span>
                            </span>
                        </div>
                        {timeRemaining !== null && (
                            <div className="flex items-center gap-2 ml-auto">
                                <span className="text-sm font-medium text-gray-700">
                                    Осталось времени: <span className="text-blue-600 font-bold font-mono">
                                        {formatTimeRemaining(timeRemaining)}
                                    </span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Questions List */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        {questions.map((question, index) => {
                            const answer = answers[index];
                            const hasAnswerValue = hasAnswer(index);

                            return (
                                <div
                                    key={question.id}
                                    className={`border rounded-lg p-4 ${
                                        hasAnswerValue
                                            ? 'border-green-200 bg-green-50'
                                            : 'border-orange-200 bg-orange-50'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                            hasAnswerValue
                                                ? 'bg-green-600 text-white'
                                                : 'bg-orange-600 text-white'
                                        }`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-gray-900">
                                                    Вопрос {index + 1}
                                                </h3>
                                                {hasAnswerValue ? (
                                                    <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                                                        Отвечено
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-orange-600 text-white text-xs rounded-full">
                                                        Не отвечено
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-700 mb-2">{question.text}</p>
                                            <div className="mt-2">
                                                <p className="text-sm font-medium text-gray-600 mb-1">
                                                    Ваш ответ:
                                                </p>
                                                <p className={`text-sm ${
                                                    hasAnswerValue ? 'text-gray-900' : 'text-orange-700 italic'
                                                }`}>
                                                    {getAnswerDisplay(question, answer)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        Вернуться к тесту
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                        Завершить тест
                    </button>
                </div>
            </div>
        </div>
    );
}
