import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, Check } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

interface OpenQuestionData {
    correct_answer_text?: string;
    key_words?: string;
}

interface OpenQuestionEditorProps {
    data: OpenQuestionData;
    onChange: (data: OpenQuestionData) => void;
    questionId: string;
}

export function OpenQuestionEditor({
    data,
    onChange,
    questionId,
}: OpenQuestionEditorProps) {
    const { t } = useLocale();
    // Parse key_words string into array for UI
    const [keywords, setKeywords] = useState<string[]>(() => {
        if (data.key_words) {
            return data.key_words
                .split(',')
                .map(kw => kw.trim())
                .filter(kw => kw);
        }
        return [];
    });

    // Sync keywords array to data.key_words string
    useEffect(() => {
        const keywordsString = keywords.filter(kw => kw.trim()).join(',');
        const newKeywords = keywordsString || undefined;

        // Only update if the value actually changed
        if (data.key_words !== newKeywords) {
            onChange({ ...data, key_words: newKeywords });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keywords]);

    const updateCorrectAnswer = (value: string) => {
        onChange({ ...data, correct_answer_text: value });
    };

    const addKeyword = () => {
        setKeywords([...keywords, '']);
    };

    const updateKeyword = (index: number, value: string) => {
        const newKeywords = [...keywords];
        newKeywords[index] = value;
        setKeywords(newKeywords);
    };

    const removeKeyword = (index: number) => {
        const newKeywords = keywords.filter((_, i) => i !== index);
        setKeywords(newKeywords);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-700">
                    {t('questionEditor.openQuestion.infoMessage')}
                </p>
            </div>

            {/* Correct Answer Section */}
            <div className="space-y-2">
                <label
                    htmlFor={`correct-answer-${questionId}`}
                    className="block text-sm font-medium text-gray-700"
                >
                    {t('questionEditor.openQuestion.correctAnswerLabel')}
                </label>
                <textarea
                    id={`correct-answer-${questionId}`}
                    placeholder={t(
                        'questionEditor.openQuestion.correctAnswerPlaceholder'
                    )}
                    value={data.correct_answer_text || ''}
                    onChange={e => updateCorrectAnswer(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent resize-vertical"
                />
            </div>

            {/* Keywords Section */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                        {t('questionEditor.openQuestion.keywordsLabel')}
                    </label>
                    <button
                        type="button"
                        onClick={addKeyword}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#694CFD] hover:bg-[#694CFD]/5 rounded-md transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        {t('questionEditor.openQuestion.addKeyword')}
                    </button>
                </div>

                {keywords.length > 0 ? (
                    <div className="space-y-2">
                        {keywords.map((keyword, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2"
                            >
                                <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white">
                                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                                    <input
                                        type="text"
                                        placeholder={t(
                                            'questionEditor.openQuestion.keywordPlaceholder',
                                            { number: index + 1 }
                                        )}
                                        value={keyword}
                                        onChange={e =>
                                            updateKeyword(index, e.target.value)
                                        }
                                        className="flex-1 outline-none"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeKeyword(index)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    title="Remove keyword"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md border border-gray-200">
                        {t('questionEditor.openQuestion.noKeywordsMessage')}
                    </div>
                )}
            </div>

            {/* Grading Info */}
            <div className="text-sm text-slate-600 p-3 bg-[#694CFD]/5 rounded-md border border-[#694CFD]/10">
                <strong className="text-[#694CFD]">
                    {t('questionEditor.openQuestion.gradingMethodTitle')}
                </strong>
                <ul className="mt-2 ml-4 space-y-1 list-disc">
                    {keywords.length > 0 ? (
                        <li>
                            <strong>
                                {t(
                                    'questionEditor.openQuestion.automaticGrading'
                                )}
                            </strong>{' '}
                            {t(
                                'questionEditor.openQuestion.automaticGradingDesc'
                            )}
                        </li>
                    ) : (
                        <li>
                            <strong>
                                {t('questionEditor.openQuestion.manualGrading')}
                            </strong>{' '}
                            {t('questionEditor.openQuestion.manualGradingDesc')}
                        </li>
                    )}
                    {data.correct_answer_text && (
                        <li>
                            {t('questionEditor.openQuestion.referenceNote')}
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
