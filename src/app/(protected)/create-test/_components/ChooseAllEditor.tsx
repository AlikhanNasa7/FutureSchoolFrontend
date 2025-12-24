import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

interface ChooseAllOption {
    text: string;
    is_correct: boolean;
    position: number;
}

interface ChooseAllData {
    options: ChooseAllOption[];
}

interface ChooseAllEditorProps {
    data: ChooseAllData;
    onChange: (data: ChooseAllData) => void;
    questionId: string;
}

export function ChooseAllEditor({
    data,
    onChange,
    questionId,
}: ChooseAllEditorProps) {
    const { t } = useLocale();
    const updateOption = (index: number, value: string) => {
        const newOptions = [...data.options];
        newOptions[index] = { ...newOptions[index], text: value };
        onChange({ ...data, options: newOptions });
    };

    const addOption = () => {
        const newOptions = [
            ...data.options,
            {
                text: '',
                is_correct: false,
                position: data.options.length + 1,
            },
        ];
        onChange({ ...data, options: newOptions });
    };

    const removeOption = (index: number) => {
        if (data.options.length <= 2) return; // Keep at least 2 options

        const newOptions = data.options.filter((_, i) => i !== index);
        // Update positions
        const updatedOptions = newOptions.map((option, i) => ({
            ...option,
            position: i + 1,
        }));

        onChange({ options: updatedOptions });
    };

    const toggleCorrectAnswer = (index: number) => {
        const newOptions = data.options.map((option, i) => ({
            ...option,
            is_correct: i === index ? !option.is_correct : option.is_correct,
        }));
        onChange({ ...data, options: newOptions });
    };

    return (
        <div className="space-y-4">
            <p className="block text-sm font-medium text-gray-700">
                {t('questionEditor.chooseAll.answerOptionsLabel')}
            </p>
            <p className="text-sm text-gray-500 italic">
                {t('questionEditor.chooseAll.selectAllHint')}
            </p>

            <div className="space-y-3">
                {data.options.map((option, index) => (
                    <div
                        key={`${questionId}-${index}`}
                        className="flex items-center gap-3"
                    >
                        <input
                            type="checkbox"
                            id={`${questionId}-${index}`}
                            checked={option.is_correct}
                            onChange={() => toggleCorrectAnswer(index)}
                            className="w-4 h-4 text-[#694CFD] border-gray-300 rounded focus:ring-[#694CFD] shrink-0"
                        />
                        <div className="flex-1 flex items-center gap-2">
                            <label className="sr-only">
                                {t('questionEditor.chooseAll.optionLabel', {
                                    number: index + 1,
                                })}
                            </label>
                            <input
                                type="text"
                                placeholder={t(
                                    'questionEditor.chooseAll.optionPlaceholder',
                                    { number: index + 1 }
                                )}
                                value={option.text}
                                onChange={e =>
                                    updateOption(index, e.target.value)
                                }
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent"
                            />
                            {data.options.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() => removeOption(index)}
                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={addOption}
                    className="flex items-center gap-2 px-3 py-2 border border-[#694CFD]/30 text-[#694CFD] rounded-md hover:bg-[#694CFD]/10 text-sm"
                >
                    <Plus className="w-4 h-4" />
                    {t('questionEditor.chooseAll.addOption')}
                </button>
                <span className="text-sm text-slate-600">
                    {t('questionEditor.chooseAll.selectCorrectHint')}
                </span>
            </div>
        </div>
    );
}
