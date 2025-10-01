'use client';
import React, { useState } from 'react';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { QuestionEditor } from './QuestionEditor';
import axiosInstance from '@/lib/axios';

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
    time_limit_minutes: number;
    scheduled_at: string;
    questions: Question[];
}

export default function TestCreator() {
    const [test, setTest] = useState<Test>({
        title: '',
        description: '',
        time_limit_minutes: 60,
        scheduled_at: '',
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
        const response = await axiosInstance.post('tests/create-full/', {
            ...test,
        });
        console.log(response.data, 'response');
        alert('Test saved successfully!');
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
                        Test Information
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="title"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Test Title
                            </label>
                            <input
                                id="title"
                                type="text"
                                placeholder="Enter test title"
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
                                Total Points
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
                                htmlFor="time-limit"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Time Limit (minutes)
                            </label>
                            <input
                                id="time-limit"
                                type="number"
                                min="1"
                                max="480"
                                value={test.time_limit_minutes}
                                onChange={e =>
                                    handleTestUpdate(
                                        'time_limit_minutes',
                                        parseInt(e.target.value) || 60
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent"
                            />
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="scheduled-at"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Scheduled Date & Time
                            </label>
                            <input
                                id="scheduled-at"
                                type="datetime-local"
                                value={test.scheduled_at}
                                onChange={e =>
                                    handleTestUpdate(
                                        'scheduled_at',
                                        e.target.value
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Test Information
                            </label>
                            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                                <div className="space-y-1">
                                    <div>
                                        • Students will have{' '}
                                        {test.time_limit_minutes} minutes to
                                        complete this test once they start.
                                    </div>
                                    {test.scheduled_at && (
                                        <div>
                                            • Test is scheduled for:{' '}
                                            {new Date(
                                                test.scheduled_at
                                            ).toLocaleString()}
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
                            Description
                        </label>
                        <textarea
                            id="description"
                            placeholder="Enter test description and instructions"
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
                        Questions ({test.questions.length})
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => addQuestion('multiple_choice')}
                            className="flex items-center gap-2 px-4 py-2 border border-[#694CFD]/30 text-[#694CFD] rounded-md hover:bg-[#694CFD]/10 hover:border-[#694CFD]/50 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Multiple Choice
                        </button>
                        <button
                            onClick={() => addQuestion('open_question')}
                            className="flex items-center gap-2 px-4 py-2 border border-[#694CFD]/30 text-[#694CFD] rounded-md hover:bg-[#694CFD]/10 hover:border-[#694CFD]/50 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Open Question
                        </button>
                        <button
                            onClick={() => addQuestion('matching')}
                            className="flex items-center gap-2 px-4 py-2 border border-[#694CFD]/30 text-[#694CFD] rounded-md hover:bg-[#694CFD]/10 hover:border-[#694CFD]/50 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Matching
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
                            <p>
                                No questions added yet. Click the buttons above
                                to add questions.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <button
                    onClick={saveTest}
                    className="px-4 py-2 bg-gradient-to-r from-[#694CFD] to-[#694CFD]/90 hover:from-[#694CFD]/90 hover:to-[#694CFD] shadow-lg shadow-[#694CFD]/25 text-white rounded-md transition-all"
                >
                    Publish Test
                </button>
            </div>
        </div>
    );
}
