'use client';

import { useState, useEffect } from 'react';

interface QuestionData {
    id: string;
    position: number;
    text: string;
    type: 'multiple_choice' | 'open_question' | 'matching';
    options?: Array<{
        id: number;
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

interface QuestionContentProps {
    questionData: QuestionData;
    selectedAnswers: AnswerValue;
    onAnswerChange: (answers: AnswerValue) => void;
}

export default function QuestionContent({
    questionData,
    selectedAnswers,
    onAnswerChange,
}: QuestionContentProps) {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const shuffleArray = <T,>(array: T[]): T[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    useEffect(() => {
        if (
            questionData.type === 'matching' &&
            questionData.matching_pairs_json &&
            questionData.matching_pairs_json.length > 0
        ) {
            const hasAnswer =
                selectedAnswers &&
                Array.isArray(selectedAnswers) &&
                selectedAnswers.length > 0;

            if (!hasAnswer) {
                const matchingPairs = questionData.matching_pairs_json;

                if (matchingPairs.length < 2) {
                    onAnswerChange([matchingPairs[0]]);
                    return;
                }

                const originalIndices = matchingPairs.map((_, index) => index);
                const shuffledIndices = shuffleArray([...originalIndices]);

                const initialAnswer = matchingPairs.map((pair, index) => ({
                    left: pair.left,
                    right: matchingPairs[shuffledIndices[index]].right,
                }));

                onAnswerChange(initialAnswer);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [questionData.id]);

    const handleMultipleChoiceSelect = (optionId: number) => {
        if (questionData.options) {
            onAnswerChange([optionId]);
        }
    };

    const handleOpenQuestionChange = (value: string) => {
        onAnswerChange(value);
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));

        if (
            isNaN(dragIndex) ||
            dragIndex === dropIndex ||
            !selectedAnswers ||
            !Array.isArray(selectedAnswers)
        ) {
            setDraggedIndex(null);
            return;
        }

        const matchingPairs = questionData.matching_pairs_json || [];
        let currentAnswer: Array<{ left: string; right: string }>;

        if (
            selectedAnswers.length > 0 &&
            typeof selectedAnswers[0] === 'object' &&
            'left' in selectedAnswers[0]
        ) {
            currentAnswer = selectedAnswers as Array<{
                left: string;
                right: string;
            }>;
        } else {
            const indices = selectedAnswers as number[];
            currentAnswer = matchingPairs.map((pair, index) => ({
                left: pair.left,
                right: matchingPairs[indices[index] || index].right,
            }));
        }

        if (
            dragIndex < 0 ||
            dropIndex < 0 ||
            dragIndex >= currentAnswer.length ||
            dropIndex >= currentAnswer.length
        ) {
            setDraggedIndex(null);
            return;
        }

        const newAnswer = [...currentAnswer];
        [newAnswer[dragIndex].right, newAnswer[dropIndex].right] = [
            newAnswer[dropIndex].right,
            newAnswer[dragIndex].right,
        ];

        onAnswerChange(newAnswer);
        setDraggedIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    if (questionData.type === 'multiple_choice') {
        console.log(selectedAnswers);
        return (
            <div className="space-y-4">
                {questionData.options?.map((option, index) => (
                    <label
                        key={index}
                        className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                            Array.isArray(selectedAnswers) &&
                            (selectedAnswers as number[]).includes(option.id)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <input
                            type="radio"
                            name="answer"
                            checked={
                                Array.isArray(selectedAnswers) &&
                                (selectedAnswers as number[]).includes(
                                    option.id
                                )
                            }
                            onChange={() =>
                                handleMultipleChoiceSelect(option.id)
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-gray-900">
                            {option.text}
                        </span>
                    </label>
                ))}
            </div>
        );
    }

    if (questionData.type === 'open_question') {
        return (
            <div className="space-y-4">
                <textarea
                    value={
                        typeof selectedAnswers === 'string'
                            ? selectedAnswers
                            : ''
                    }
                    onChange={e => handleOpenQuestionChange(e.target.value)}
                    placeholder="Введите ваш ответ здесь..."
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[120px]"
                />
            </div>
        );
    }

    if (questionData.type === 'matching') {
        const matchingPairs = questionData.matching_pairs_json || [];
        const currentAnswer =
            selectedAnswers &&
            Array.isArray(selectedAnswers) &&
            selectedAnswers.length > 0 &&
            typeof selectedAnswers[0] === 'object' &&
            'left' in selectedAnswers[0]
                ? (selectedAnswers as Array<{ left: string; right: string }>)
                : matchingPairs;

        if (currentAnswer.length === 0) {
            return (
                <div className="flex items-center justify-center py-8">
                    <div className="text-gray-500">Loading...</div>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">
                        Перетащите элементы в правом столбце, чтобы изменить их
                        порядок
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Элементы
                        </h3>
                        <div className="space-y-2">
                            {currentAnswer.map((pair, index) => (
                                <div
                                    key={index}
                                    className="p-3 bg-gray-50 rounded border"
                                >
                                    <span className="font-medium">
                                        {pair.left}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Ответы
                        </h3>
                        <div className="space-y-2">
                            {currentAnswer.map((pair, index) => {
                                const isDragging = draggedIndex === index;

                                return (
                                    <div
                                        key={`${pair.right}-${index}`}
                                        draggable
                                        onDragStart={e =>
                                            handleDragStart(e, index)
                                        }
                                        onDragOver={handleDragOver}
                                        onDrop={e => handleDrop(e, index)}
                                        onDragEnd={handleDragEnd}
                                        className={`p-3 rounded border cursor-move transition-colors ${
                                            isDragging
                                                ? 'bg-yellow-100 border-yellow-400'
                                                : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{pair.right}</span>
                                            <span className="text-sm text-gray-500">
                                                #{index + 1}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Текущий порядок:
                    </h4>
                    <div className="text-sm text-gray-600">
                        {currentAnswer.map((pair, index) => (
                            <span key={`display-${index}`} className="mr-2">
                                {index + 1}. {pair.right}
                                {index < currentAnswer.length - 1 && ', '}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
