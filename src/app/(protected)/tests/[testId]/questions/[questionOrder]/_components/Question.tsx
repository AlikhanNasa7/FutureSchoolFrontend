'use client';

import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import QuestionContent from './QuestionContent';

interface QuestionContentProps {
    questionData: QuestionData;
    selectedAnswers: any;
    onAnswerChange: (answer: any) => void;
    onNext: () => void;
    onPrevious: () => void;
    onSubmit: () => void;
    isFirstQuestion: boolean;
    isLastQuestion: boolean;
}

interface QuestionData {
    id: string;
    position: number;
    text: string;
    type: 'multiple_choice' | 'open_question' | 'matching';
    // For multiple_choice - options array is directly on the question
    options?: Array<{
        text: string;
        is_correct: boolean;
        position: number;
    }>;
    // For open_question - correct answer is directly on the question
    correct_answer_text?: string;
    // For matching - matching pairs are directly on the question
    matching_pairs_json?: Array<{
        left: string;
        right: string;
    }>;
}

export default function Question({
    questionData,
    selectedAnswers,
    onAnswerChange,
    onNext,
    onPrevious,
    onSubmit,
    isFirstQuestion,
    isLastQuestion,
}: QuestionContentProps) {
    if (!questionData) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Вопрос не найден
                    </h2>
                    <p className="text-gray-600">
                        Запрашиваемый вопрос не существует.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <QuestionContent
                    questionData={questionData}
                    selectedAnswers={selectedAnswers}
                    onAnswerChange={onAnswerChange}
                />
            </div>

            <div className="flex items-center justify-between">
                <button
                    onClick={onPrevious}
                    disabled={isFirstQuestion}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Предыдущий
                </button>

                <div className="flex items-center gap-4">
                    <button
                        onClick={onSubmit}
                        className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Завершить тест
                    </button>

                    {!isLastQuestion && (
                        <button
                            onClick={onNext}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            Следующий
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
