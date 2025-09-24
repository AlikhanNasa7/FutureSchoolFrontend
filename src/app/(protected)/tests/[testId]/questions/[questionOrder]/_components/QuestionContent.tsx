'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Clock, CheckCircle } from 'lucide-react';

interface QuestionContentProps {
    testId: string;
    questionNumber: number;
}

interface QuestionData {
    id: string;
    question: string;
    options: string[];
    type: 'single' | 'multiple';
    correctAnswer?: number | number[];
}

export default function QuestionContent({
    testId,
    questionNumber,
}: QuestionContentProps) {
    const [questionData, setQuestionData] = useState<QuestionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
    const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds

    useEffect(() => {
        const fetchQuestion = async () => {
            setLoading(true);

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // Mock question data
            const mockQuestion: QuestionData = {
                id: `q${questionNumber}`,
                question: `Вопрос ${questionNumber}: Чему равно 2 + 2?`,
                options: ['3', '4', '5', '6'],
                type: 'single',
                correctAnswer: 1, // index of correct answer
            };

            setQuestionData(mockQuestion);
            setLoading(false);
        };

        fetchQuestion();
    }, [testId, questionNumber]);

    // Timer countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    // Time's up - submit test
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerSelect = (optionIndex: number) => {
        if (questionData?.type === 'single') {
            setSelectedAnswers([optionIndex]);
        } else {
            setSelectedAnswers(prev =>
                prev.includes(optionIndex)
                    ? prev.filter(i => i !== optionIndex)
                    : [...prev, optionIndex]
            );
        }
    };

    const handleNext = () => {
        const nextQuestion = questionNumber + 1;
        window.location.href = `/tests/${testId}/questions/${nextQuestion}`;
    };

    const handlePrevious = () => {
        if (questionNumber > 1) {
            const prevQuestion = questionNumber - 1;
            window.location.href = `/tests/${testId}/questions/${prevQuestion}`;
        }
    };

    const handleSubmit = () => {
        // Submit test logic
        console.log('Submitting test:', testId);
        window.location.href = `/tests/${testId}/results`;
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Вопрос {questionNumber}
                        </h1>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {questionData.type === 'single'
                                ? 'Один ответ'
                                : 'Несколько ответов'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-red-600">
                        <Clock className="w-5 h-5" />
                        <span className="text-lg font-semibold">
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Question */}
            <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-8">
                    {questionData.question}
                </h2>

                {/* Options */}
                <div className="space-y-4 mb-8">
                    {questionData.options.map((option, index) => (
                        <label
                            key={index}
                            className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                                selectedAnswers.includes(index)
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <input
                                type={
                                    questionData.type === 'single'
                                        ? 'radio'
                                        : 'checkbox'
                                }
                                name="answer"
                                checked={selectedAnswers.includes(index)}
                                onChange={() => handleAnswerSelect(index)}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="ml-3 text-gray-900">{option}</span>
                        </label>
                    ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={handlePrevious}
                        disabled={questionNumber <= 1}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Предыдущий
                    </button>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSubmit}
                            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Завершить тест
                        </button>

                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            Следующий
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
