import React from 'react';
import { Question } from './TestCreator';
import { MultipleChoiceEditor } from './MultipleChoiceEditor';
import { OpenQuestionEditor } from './OpenQuestionEditor';
import { MatchingEditor } from './MatchingEditor';
import { useLocale } from '@/contexts/LocaleContext';

interface QuestionEditorProps {
    question: Question;
    onUpdate: (updates: Partial<Question>) => void;
}

export function QuestionEditor({ question, onUpdate }: QuestionEditorProps) {
    const { t } = useLocale();

    const handleTextChange = (text: string) => {
        onUpdate({ text });
    };

    const handlePointsChange = (points: number) => {
        onUpdate({ points });
    };

    const handleDataChange = (data: Partial<Question>) => {
        onUpdate(data);
    };

    return (
        <div className="space-y-4">
            {/* Question Title and Points */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2 md:col-span-3">
                    <label
                        htmlFor={`question-text-${question.id}`}
                        className="block text-sm font-medium text-gray-700"
                    >
                        {t('questionEditor.questionTextLabel')}
                    </label>
                    <input
                        id={`question-text-${question.id}`}
                        type="text"
                        placeholder={t(
                            'questionEditor.questionTextPlaceholder'
                        )}
                        value={question.text}
                        onChange={e => handleTextChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent"
                    />
                </div>
                <div className="space-y-2">
                    <label
                        htmlFor={`question-points-${question.id}`}
                        className="block text-sm font-medium text-gray-700"
                    >
                        {t('questionEditor.pointsLabel')}
                    </label>
                    <input
                        id={`question-points-${question.id}`}
                        type="number"
                        min="1"
                        max="100"
                        value={question.points}
                        onChange={e =>
                            handlePointsChange(parseInt(e.target.value) || 1)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent"
                    />
                </div>
            </div>

            {/* Question Type Specific Editor */}
            {question.type === 'multiple_choice' && question.options && (
                <MultipleChoiceEditor
                    data={{ options: question.options }}
                    questionId={question.id}
                    onChange={handleDataChange}
                />
            )}

            {question.type === 'open_question' && (
                <OpenQuestionEditor
                    data={{
                        correct_answer_text: question.correct_answer_text,
                        key_words: question.key_words,
                    }}
                    questionId={question.id}
                    onChange={handleDataChange}
                />
            )}

            {question.type === 'matching' && question.matching_pairs_json && (
                <MatchingEditor
                    data={{ matching_pairs_json: question.matching_pairs_json }}
                    onChange={handleDataChange}
                />
            )}
        </div>
    );
}
