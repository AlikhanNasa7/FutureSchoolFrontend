'use client';
import React, { useState } from 'react';
import {
    Plus,
    Trash2,
    Calendar,
    Clock,
    CheckCircle2,
    Info,
    Settings,
} from 'lucide-react';
import { QuestionEditor } from './QuestionEditor';
import axiosInstance from '@/lib/axios';
import { useLocale } from '@/contexts/LocaleContext';
import { useSearchParams } from 'next/navigation';

export interface Question {
    id: string;
    type: 'multiple_choice' | 'choose_all' | 'open_question' | 'matching';
    text: string;
    position: number;
    points: number;
    test: string;
    // Multiple choice and choose all properties
    options?: { text: string; is_correct: boolean; position: number }[];
    // Open question properties
    correct_answer_text?: string;
    key_words?: string;
    // Matching question properties
    matching_pairs_json?: { left: string; right: string }[];
}

export interface Test {
    title: string;
    description: string;
    start_date: string | null;
    end_date: string | null;
    scheduled_at?: string;
    subject_group?: number;
    // Time settings
    has_time_limit: boolean;
    time_limit_minutes: number | null;
    has_dates: boolean;
    is_published: boolean;
    questions: Question[];
}

export default function TestCreator() {
    const { t, locale } = useLocale();
    const searchParams = useSearchParams();
    const subjectId = searchParams.get('subject');
    const [subject, setSubject] = useState<{
        id: number;
        course_name: string;
        course_code: string;
        classroom_display?: string;
    } | null>(null);
    const [loadingSubject, setLoadingSubject] = useState(true);

    const [test, setTest] = useState<Test>({
        title: '',
        description: '',
        start_date: null,
        end_date: null,
        has_time_limit: false,
        time_limit_minutes: null,
        has_dates: false,
        is_published: true,
        questions: [],
    });

    // Fetch subject information from query params
    React.useEffect(() => {
        const fetchSubject = async () => {
            if (!subjectId) {
                setLoadingSubject(false);
                return;
            }
            try {
                setLoadingSubject(true);
                const response = await axiosInstance.get(
                    `/subject-groups/${subjectId}/`
                );
                setSubject(response.data);
                setTest(prev => ({
                    ...prev,
                    subject_group: response.data.id,
                }));
            } catch (error) {
                console.error('Error fetching subject:', error);
            } finally {
                setLoadingSubject(false);
            }
        };
        fetchSubject();
    }, [subjectId]);

    console.log(test, 'test');

    // Format date/time based on locale
    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);

        if (locale === 'en') {
            // English: 12-hour format with AM/PM
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
        } else {
            // Russian/Kazakh: 24-hour format
            return date.toLocaleString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
        }
    };

    const addQuestion = (type: Question['type']) => {
        const newQuestion: Question = {
            id: Date.now().toString(),
            type,
            text: '',
            position: test.questions.length + 1,
            points: 1,
            test: '',
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
            case 'choose_all':
                return {
                    options: [
                        { text: '', is_correct: true, position: 1 },
                        { text: '', is_correct: true, position: 2 },
                        { text: '', is_correct: false, position: 3 },
                        { text: '', is_correct: false, position: 4 },
                    ],
                };
            case 'open_question':
                return {
                    correct_answer_text: '',
                    key_words: '',
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

    const handleTestUpdate = (
        field: keyof Test,
        value: string | number | boolean | null
    ) => {
        setTest(prev => ({ ...prev, [field]: value }));
    };

    const toggleTimeLimit = () => {
        setTest(prev => ({
            ...prev,
            has_time_limit: !prev.has_time_limit,
            time_limit_minutes: !prev.has_time_limit ? 60 : null,
        }));
    };

    const toggleDates = () => {
        setTest(prev => ({
            ...prev,
            has_dates: !prev.has_dates,
            start_date: !prev.has_dates
                ? new Date().toLocaleString().toString()
                : null,
            end_date: !prev.has_dates
                ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .slice(0, 16)
                : null,
        }));
    };

    const saveTest = async () => {
        if (!test.subject_group) {
            alert(t('test.subjectGroupRequired'));
            return;
        }

        // Create a copy of the test data
        const testData: Record<string, unknown> = {
            title: test.title,
            description: test.description,
            subject_group: test.subject_group,
            is_published: test.is_published,
            questions: test.questions.map(q => ({
                type: q.type,
                text: q.text,
                points: q.points,
                position: q.position,
                options: q.options || [],
                correct_answer_text: q.correct_answer_text,
                key_words: q.key_words,
                matching_pairs_json: q.matching_pairs_json,
            })),
        };

        // Add time limit if enabled
        if (test.has_time_limit && test.time_limit_minutes) {
            testData.time_limit_minutes = test.time_limit_minutes;
        }

        // Add dates if enabled - backend will auto-select course_section based on dates
        // Convert dates to ISO format before sending
        if (test.has_dates) {
            if (test.start_date) {
                // datetime-local input returns format: YYYY-MM-DDTHH:mm
                // Convert to ISO string (UTC)
                const startDate = new Date(test.start_date);
                if (!isNaN(startDate.getTime())) {
                    testData.start_date = startDate.toISOString();
                    testData.scheduled_at = testData.start_date;
                }
            }
            if (test.end_date) {
                // datetime-local input returns format: YYYY-MM-DDTHH:mm
                // Convert to ISO string (UTC)
                const endDate = new Date(test.end_date);
                if (!isNaN(endDate.getTime())) {
                    testData.end_date = endDate.toISOString();
                }
            }
        }

        try {
            const response = await axiosInstance.post(
                'tests/create-full/',
                testData
            );
            console.log(response.data, 'response');
            alert(t('test.testSavedSuccess'));
        } catch (error: unknown) {
            console.error('Error saving test:', error);
            const errorMessage =
                (error as { response?: { data?: { detail?: string } } })
                    ?.response?.data?.detail ||
                (error as { message?: string })?.message ||
                t('test.testSaveError');
            alert(errorMessage);
        }
    };

    const getTotalPoints = () => {
        return test.questions.reduce(
            (total, question) => total + question.points,
            0
        );
    };

    if (loadingSubject) {
        return (
            <div className="mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">{t('test.loading')}</div>
                </div>
            </div>
        );
    }

    if (!subject && subjectId) {
        return (
            <div className="mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-600">{t('test.subjectNotFound')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto p-6">
            <div className="border border-[#694CFD]/20 shadow-lg shadow-[#694CFD]/5 bg-white rounded-lg">
                <div className="bg-gradient-to-r from-[#694CFD]/5 to-[#694CFD]/10 border-b border-[#694CFD]/20 p-6 rounded-t-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="flex items-center gap-2 text-[#694CFD] font-semibold text-xl mb-1">
                                <Calendar className="w-5 h-5" />
                                {t('test.testInformation')}
                            </h2>
                            {subject && (
                                <p className="text-sm text-gray-600 mt-1">
                                    {subject.course_name} ({subject.course_code}
                                    {subject.classroom_display
                                        ? ` - ${subject.classroom_display}`
                                        : ''}
                                    )
                                </p>
                            )}
                        </div>
                    </div>
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

                    {/* Test Settings Section */}
                    <div className="border-t border-gray-200 pt-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Settings className="w-5 h-5 text-[#694CFD]" />
                            <h3 className="text-lg font-semibold text-gray-900">
                                {t('test.testSettings')}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Time Limit Card */}
                            <div className="border border-gray-200 rounded-lg p-4 hover:border-[#694CFD]/30 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-[#694CFD]" />
                                        <label className="text-sm font-medium text-gray-900">
                                            {t('test.timeLimit')}
                                        </label>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={toggleTimeLimit}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            test.has_time_limit
                                                ? 'bg-[#694CFD]'
                                                : 'bg-gray-300'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                test.has_time_limit
                                                    ? 'translate-x-6'
                                                    : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>
                                {test.has_time_limit && (
                                    <div className="mt-3">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="1"
                                                max="1440"
                                                value={
                                                    test.time_limit_minutes ||
                                                    ''
                                                }
                                                onChange={e =>
                                                    handleTestUpdate(
                                                        'time_limit_minutes',
                                                        parseInt(
                                                            e.target.value
                                                        ) || null
                                                    )
                                                }
                                                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent"
                                                placeholder="60"
                                            />
                                            <span className="text-sm text-gray-600">
                                                {t('test.minutes')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            {t('test.timeLimitHint')}
                                        </p>
                                    </div>
                                )}
                                {!test.has_time_limit && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        {t('test.noTimeLimit')}
                                    </p>
                                )}
                            </div>

                            {/* Date Range Card */}
                            <div className="border border-gray-200 rounded-lg p-4 hover:border-[#694CFD]/30 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-[#694CFD]" />
                                        <label className="text-sm font-medium text-gray-900">
                                            {t('test.dateRange')}
                                        </label>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={toggleDates}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            test.has_dates
                                                ? 'bg-[#694CFD]'
                                                : 'bg-gray-300'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                test.has_dates
                                                    ? 'translate-x-6'
                                                    : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>
                                {test.has_dates && (
                                    <div className="mt-3 space-y-3">
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">
                                                {t('test.startDateAndTime')}
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={test.start_date || ''}
                                                onChange={e =>
                                                    handleTestUpdate(
                                                        'start_date',
                                                        e.target.value || null
                                                    )
                                                }
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">
                                                {t('test.endDateAndTime')}
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={test.end_date || ''}
                                                onChange={e =>
                                                    handleTestUpdate(
                                                        'end_date',
                                                        e.target.value || null
                                                    )
                                                }
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                )}
                                {!test.has_dates && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        {t('test.openTest')}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Test Preview Card */}
                        <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Info className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                        {t('test.testPreview')}
                                    </h4>
                                    <div className="space-y-1 text-sm text-gray-700">
                                        {test.has_time_limit &&
                                            test.time_limit_minutes && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    <span>
                                                        {t('test.timeLimit')}:{' '}
                                                        {
                                                            test.time_limit_minutes
                                                        }{' '}
                                                        {t('test.minutes')}
                                                    </span>
                                                </div>
                                            )}
                                        {test.has_dates && (
                                            <>
                                                {test.start_date && (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>
                                                            {t('test.startsAt')}
                                                            :{' '}
                                                            {formatDateTime(
                                                                test.start_date
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                                {test.end_date && (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>
                                                            {t('test.endsAt')}:{' '}
                                                            {formatDateTime(
                                                                test.end_date
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {!test.has_dates &&
                                            !test.has_time_limit && (
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                    <span>
                                                        {t('test.openTest')}
                                                    </span>
                                                </div>
                                            )}
                                    </div>
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
                            onClick={() => addQuestion('choose_all')}
                            className="flex items-center gap-2 px-4 py-2 border border-[#694CFD]/30 text-[#694CFD] rounded-md hover:bg-[#694CFD]/10 hover:border-[#694CFD]/50 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            {t('test.chooseAll')}
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
                        {test.questions.map(question => (
                            <div
                                key={question.id}
                                className="border-l-4 border-l-[#694CFD] shadow-md hover:shadow-lg transition-shadow bg-white rounded-lg border border-gray-200"
                            >
                                <div className="bg-gradient-to-r from-[#694CFD]/5 to-transparent p-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-[#694CFD] font-semibold">
                                                {t(
                                                    'questionEditor.questionLabel'
                                                )}{' '}
                                                {question.position}
                                            </span>
                                            <span className="px-2 py-1 bg-[#694CFD]/10 text-[#694CFD] rounded text-xs border border-[#694CFD]/20 font-medium">
                                                {t(
                                                    `questionEditor.questionTypes.${question.type}`
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
