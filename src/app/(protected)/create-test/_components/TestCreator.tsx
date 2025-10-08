'use client';
import React, { useState } from 'react';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { QuestionEditor } from './QuestionEditor';
import axiosInstance from '@/lib/axios';
import { useLocale } from '@/contexts/LocaleContext';

export interface Question {
    id: string;
    type: 'multiple_choice' | 'open_question' | 'matching';
    text: string;
    position: number;
    points: number;
    data: any;
    test: string;
}

export interface Test {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    scheduled_at?: string;
    course_section?: number;
    questions: Question[];
}

export default function TestCreator() {
    const { t } = useLocale();
    const [test, setTest] = useState<Test>({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        questions: [],
    });

    console.log(test, 'test');

    const addQuestion = (type: Question['type']) => {
        const newQuestion: Question = {
            id: Date.now().toString(),
            type,
            text: '',
            position: test.questions.length + 1,
            points: 1,
            ...getDefaultQuestionData(type),
        };

        setTest(prev => ({
            ...prev,
            questions: [...prev.questions, newQuestion],
        }));
    };

    const getDefaultQuestionData = (type: Question['type']) => {
        switch (type) {
            case 'multiple_choice':
                return {
                    options: [
                        { text: '', is_correct: true, position: 1 },
                        { text: '', is_correct: false, position: 2 },
                        { text: '', is_correct: false, position: 3 },
                        { text: '', is_correct: false, position: 4 },
                    ],
                };
            case 'open_question':
                return {
                    correct_answer_text: '',
                };
            case 'matching':
                return {
                    matching_pairs_json: [
                        { left: '', right: '' },
                        { left: '', right: '' },
                    ],
                };
            default:
                return {};
        }
    };

    const updateQuestion = (questionId: string, updates: Partial<Question>) => {
        console.log(questionId, updates, 'questionId, updates');
        setTest(prev => ({
            ...prev,
            questions: prev.questions.map(q =>
                q.id === questionId ? { ...q, ...updates } : q
            ),
        }));
    };

    const removeQuestion = (questionId: string) => {
        setTest(prev => {
            const filteredQuestions = prev.questions.filter(
                q => q.id !== questionId
            );
            // Update positions after removal
            const updatedQuestions = filteredQuestions.map((q, index) => ({
                ...q,
                position: index + 1,
            }));
            return {
                ...prev,
                questions: updatedQuestions,
            };
        });
    };

    const handleTestUpdate = (field: keyof Test, value: string | number) => {
        setTest(prev => ({ ...prev, [field]: value }));
    };

    const saveTest = async () => {
        // Create a copy of the test data
        const testData = { ...test };

        // Subtract 5 hours from start_date and end_date for backend
        if (testData.start_date) {
            const startDate = new Date(testData.start_date);
            testData.start_date = startDate.toISOString();
            testData.scheduled_at = testData.start_date;
        }

        if (testData.end_date) {
            const endDate = new Date(testData.end_date);
            testData.end_date = endDate.toISOString();
        }

        const response = await axiosInstance.post(
            'tests/create-full/',
            testData
        );
        console.log(response.data, 'response');
        alert(t('test.testSavedSuccess'));
    };

    const getTotalPoints = () => {
        return test.questions.reduce(
            (total, question) => total + question.points,
            0
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="border border-[#694CFD]/20 shadow-lg shadow-[#694CFD]/5 bg-white rounded-lg">
                <div className="bg-gradient-to-r from-[#694CFD]/5 to-[#694CFD]/10 border-b border-[#694CFD]/20 p-6 rounded-t-lg">
                    <h2 className="flex items-center gap-2 text-[#694CFD] font-semibold text-xl">
                        <Calendar className="w-5 h-5" />
                        {t('test.testInformation')}
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="title"
                                className="block text-sm font-medium text-gray-700"
                            >
                                {t('test.testTitle')}
                            </label>
                            <input
                                id="title"
                                type="text"
                                placeholder={t('forms.enterTitle')}
                                value={test.title}
                                onChange={e =>
                                    handleTestUpdate('title', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent"
                            />
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="total-points"
                                className="block text-sm font-medium text-gray-700"
                            >
                                {t('test.totalPoints')}
                            </label>
                            <input
                                id="total-points"
                                type="number"
                                value={getTotalPoints()}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="start-date"
                                className="block text-sm font-medium text-gray-700"
                            >
                                {t('test.startDateAndTime')}
                            </label>
                            <input
                                id="start-date"
                                type="datetime-local"
                                value={test.start_date}
                                onChange={e =>
                                    handleTestUpdate(
                                        'start_date',
                                        e.target.value
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent"
                            />
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="end-date"
                                className="block text-sm font-medium text-gray-700"
                            >
                                {t('test.endDateAndTime')}
                            </label>
                            <input
                                id="end-date"
                                type="datetime-local"
                                value={test.end_date}
                                onChange={e =>
                                    handleTestUpdate('end_date', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                {t('test.testInfo')}
                            </label>
                            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                                <div className="space-y-1">
                                    {test.start_date && (
                                        <div>
                                            • {t('test.startsAt')}:{' '}
                                            {new Date(
                                                test.start_date
                                            ).toLocaleString()}
                                        </div>
                                    )}
                                    {test.end_date && (
                                        <div>
                                            • {t('test.endsAt')}:{' '}
                                            {new Date(
                                                test.end_date
                                            ).toLocaleString()}
                                        </div>
                                    )}
                                    {test.start_date && test.end_date && (
                                        <div>
                                            • {t('test.duration')}:{' '}
                                            {Math.round(
                                                (new Date(
                                                    test.end_date
                                                ).getTime() -
                                                    new Date(
                                                        test.start_date
                                                    ).getTime()) /
                                                    60000
                                            )}{' '}
                                            {t('test.minutes')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-700"
                        >
                            {t('test.description')}
                        </label>
                        <textarea
                            id="description"
                            placeholder={t('forms.description')}
                            value={test.description}
                            onChange={e =>
                                handleTestUpdate('description', e.target.value)
                            }
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent resize-vertical"
                        />
                    </div>
                </div>
            </div>

            <div className="border border-[#694CFD]/20 shadow-lg shadow-[#694CFD]/5 bg-white rounded-lg mb-2">
                <div className="bg-gradient-to-r from-[#694CFD]/5 to-[#694CFD]/10 border-b border-[#694CFD]/20 p-6 rounded-t-lg">
                    <h2 className="text-[#694CFD] font-semibold text-xl">
                        {t('test.question')} ({test.questions.length})
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => addQuestion('multiple_choice')}
                            className="flex items-center gap-2 px-4 py-2 border border-[#694CFD]/30 text-[#694CFD] rounded-md hover:bg-[#694CFD]/10 hover:border-[#694CFD]/50 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            {t('test.multipleChoice')}
                        </button>
                        <button
                            onClick={() => addQuestion('open_question')}
                            className="flex items-center gap-2 px-4 py-2 border border-[#694CFD]/30 text-[#694CFD] rounded-md hover:bg-[#694CFD]/10 hover:border-[#694CFD]/50 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            {t('test.openQuestion')}
                        </button>
                        <button
                            onClick={() => addQuestion('matching')}
                            className="flex items-center gap-2 px-4 py-2 border border-[#694CFD]/30 text-[#694CFD] rounded-md hover:bg-[#694CFD]/10 hover:border-[#694CFD]/50 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            {t('test.matching')}
                        </button>
                    </div>

                    <div className="space-y-4">
                        {test.questions.map((question, index) => (
                            <div
                                key={question.id}
                                className="border-l-4 border-l-[#694CFD] shadow-md hover:shadow-lg transition-shadow bg-white rounded-lg border border-gray-200"
                            >
                                <div className="bg-gradient-to-r from-[#694CFD]/5 to-transparent p-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-[#694CFD] font-semibold">
                                                Question {question.position}
                                            </span>
                                            <span className="px-2 py-1 bg-[#694CFD]/10 text-[#694CFD] rounded text-xs capitalize border border-[#694CFD]/20 font-medium">
                                                {question.type.replace(
                                                    '-',
                                                    ' '
                                                )}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() =>
                                                removeQuestion(question.id)
                                            }
                                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <QuestionEditor
                                        question={question}
                                        onUpdate={updates =>
                                            updateQuestion(question.id, updates)
                                        }
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {test.questions.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                            <p>{t('test.noQuestionsYet')}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <button
                    onClick={saveTest}
                    className="px-4 py-2 bg-gradient-to-r from-[#694CFD] to-[#694CFD]/90 hover:from-[#694CFD]/90 hover:to-[#694CFD] shadow-lg shadow-[#694CFD]/25 text-white rounded-md transition-all"
                >
                    {t('test.saveTest')}
                </button>
            </div>
        </div>
    );
}
