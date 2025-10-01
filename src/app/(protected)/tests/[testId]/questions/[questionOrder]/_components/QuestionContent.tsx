'use client';

import { useState } from 'react';

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

type AnswerValue = number[] | string | number[][];

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

    const handleMultipleChoiceSelect = (optionId: number) => {
        if (questionData.options) {
            // For multiple choice, only allow one selection
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

        if (dragIndex !== dropIndex) {
            const matchingPairs = questionData.matching_pairs_json || [];

            // Get current order of right items (indices)
            const defaultOrder = matchingPairs.map((_, index) => index);
            const currentOrder =
                selectedAnswers &&
                Array.isArray(selectedAnswers) &&
                selectedAnswers.length > 0 &&
                Array.isArray(selectedAnswers[0])
                    ? (selectedAnswers as number[][])[0] || defaultOrder
                    : defaultOrder;

            const newOrder = [...currentOrder];

            // Swap the items at dragIndex and dropIndex
            if (dragIndex < newOrder.length && dropIndex < newOrder.length) {
                [newOrder[dragIndex], newOrder[dropIndex]] = [
                    newOrder[dropIndex],
                    newOrder[dragIndex],
                ];

                // Store the new order as an array of indices (what backend expects)
                onAnswerChange([newOrder] as AnswerValue);
            }
        }
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
        const leftItems =
            questionData.matching_pairs_json?.map(pair => pair.left) || [];
        const rightItems =
            questionData.matching_pairs_json?.map(pair => pair.right) || [];

        // Get current order or use default
        const defaultOrder = rightItems.map((_, index) => index);
        const currentOrder =
            selectedAnswers &&
            Array.isArray(selectedAnswers) &&
            selectedAnswers.length > 0 &&
            Array.isArray(selectedAnswers[0])
                ? (selectedAnswers as number[][])[0] || defaultOrder
                : defaultOrder;

        console.log('Debug - rightItems:', rightItems);
        console.log('Debug - currentOrder:', currentOrder);
        console.log('Debug - selectedAnswers:', selectedAnswers);

        return (
            <div className="space-y-6">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">
                        Перетащите элементы в правом столбце, чтобы изменить их
                        порядок
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {/* Left column - Fixed items */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Элементы
                        </h3>
                        <div className="space-y-2">
                            {leftItems.map((item, index) => (
                                <div
                                    key={index}
                                    className="p-3 bg-gray-50 rounded border"
                                >
                                    <span className="font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right column - Draggable items */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Ответы
                        </h3>
                        <div className="space-y-2">
                            {currentOrder && currentOrder.length > 0
                                ? currentOrder.map(
                                      (originalIndex, displayIndex) => {
                                          const item =
                                              rightItems[
                                                  originalIndex as number
                                              ];
                                          const isDragging =
                                              draggedIndex === displayIndex;

                                          return (
                                              <div
                                                  key={`${originalIndex}-${displayIndex}`}
                                                  draggable
                                                  onDragStart={e =>
                                                      handleDragStart(
                                                          e,
                                                          displayIndex
                                                      )
                                                  }
                                                  onDragOver={handleDragOver}
                                                  onDrop={e =>
                                                      handleDrop(
                                                          e,
                                                          displayIndex
                                                      )
                                                  }
                                                  onDragEnd={handleDragEnd}
                                                  className={`p-3 rounded border cursor-move transition-colors ${
                                                      isDragging
                                                          ? 'bg-yellow-100 border-yellow-400'
                                                          : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                                                  }`}
                                              >
                                                  <div className="flex items-center justify-between">
                                                      <span>{item}</span>
                                                      <span className="text-sm text-gray-500">
                                                          #{displayIndex + 1}
                                                      </span>
                                                  </div>
                                              </div>
                                          );
                                      }
                                  )
                                : // Fallback: show right items in original order
                                  rightItems.map((item, index) => (
                                      <div
                                          key={`fallback-${item}`}
                                          draggable
                                          onDragStart={e =>
                                              handleDragStart(e, index)
                                          }
                                          onDragOver={handleDragOver}
                                          onDrop={e => handleDrop(e, index)}
                                          onDragEnd={handleDragEnd}
                                          className="p-3 rounded border cursor-move transition-colors bg-blue-50 border-blue-200 hover:bg-blue-100"
                                      >
                                          <div className="flex items-center justify-between">
                                              <span>{item}</span>
                                              <span className="text-sm text-gray-500">
                                                  #{index + 1}
                                              </span>
                                          </div>
                                      </div>
                                  ))}
                        </div>
                    </div>
                </div>

                {/* Show current order */}
                <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Текущий порядок:
                    </h4>
                    <div className="text-sm text-gray-600">
                        {currentOrder && currentOrder.length > 0
                            ? currentOrder.map(
                                  (originalIndex, displayIndex) => (
                                      <span
                                          key={`display-${originalIndex}-${displayIndex}`}
                                          className="mr-2"
                                      >
                                          {displayIndex + 1}.{' '}
                                          {rightItems[originalIndex as number]}
                                          {displayIndex <
                                              currentOrder.length - 1 && ', '}
                                      </span>
                                  )
                              )
                            : rightItems.map((item, index) => (
                                  <span key={index} className="mr-2">
                                      {index + 1}. {item}
                                      {index < rightItems.length - 1 && ', '}
                                  </span>
                              ))}
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
