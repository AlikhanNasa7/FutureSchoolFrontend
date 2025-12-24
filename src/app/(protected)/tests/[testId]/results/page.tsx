'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ChevronLeft,
    Users,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    ArrowRight,
    Check,
    X,
    Eye,
    Unlock,
    Lock,
} from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { useUserState } from '@/contexts/UserContext';

interface TestInfo {
    id: number;
    title: string;
    total_points: number;
    total_questions: number;
    total_students: number;
    can_see_results?: boolean;
    reveal_results_at?: string | null;
    show_score_immediately?: boolean;
    is_opened_to_review?: boolean;
}

interface QuestionOption {
    id: number;
    text: string;
    is_correct: boolean;
    position: number;
}

interface StudentAnswer {
    answer_id: number | null;
    question_id: number;
    question_text: string;
    question_type: string;
    question_points: number;
    student_answer: string;
    correct_answer: string;
    score: number;
    max_score: number;
    teacher_feedback: string;
    is_correct: boolean;
    // Structured data for different question types
    question_options?: QuestionOption[];
    selected_option_ids?: number[];
    selected_option_id?: number | null;
    matching_pairs?: Array<{ left: string; right: string }>;
    student_matching_answers?: Array<{ left: string; right: string }>;
}

interface StudentData {
    student_id: number;
    student_name: string;
    student_username: string;
    attempt_id: number;
    attempt_number: number;
    total_score: number;
    max_score: number;
    percentage: number;
    submitted_at: string;
    time_spent_minutes: number | null;
    answers: StudentAnswer[];
}

interface QuestionStudentAnswer {
    student_id: number;
    student_name: string;
    student_username: string;
    attempt_id: number;
    answer_id: number | null;
    student_answer: string;
    score: number;
    max_score: number;
    teacher_feedback: string;
    is_correct: boolean;
    // Structured data for different question types
    selected_option_ids?: number[];
    selected_option_id?: number | null;
    student_matching_answers?: Array<{ left: string; right: string }>;
}

interface QuestionData {
    question_id: number;
    question_text: string;
    question_type: string;
    question_points: number;
    correct_answer: string;
    student_answers: QuestionStudentAnswer[];
    // Structured data for different question types
    question_options?: QuestionOption[];
    matching_pairs?: Array<{ left: string; right: string }>;
}

interface TestResultsData {
    test: TestInfo;
    per_student_view: StudentData[];
    per_question_view: QuestionData[];
}

type ViewMode = 'students' | 'questions';

export default function TeacherTestResultsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useUserState();
    const testId = params.testId as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<TestResultsData | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('students');
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
        null
    );
    const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(
        null
    );
    const [updatingScores, setUpdatingScores] = useState<Set<number>>(
        new Set()
    );

    const fetchTestResults = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get(
                `/tests/${testId}/teacher-results/`
            );
            setData(response.data);

            // Debug: Log data structure in development
            if (process.env.NODE_ENV === 'development') {
                console.log('Test results data:', response.data);
                if (response.data.per_student_view.length > 0) {
                    const firstAnswer =
                        response.data.per_student_view[0].answers.find(
                            (a: StudentAnswer) =>
                                a.question_type === 'choose_all'
                        );
                    if (firstAnswer) {
                        console.log('Choose all answer sample:', {
                            type: firstAnswer.question_type,
                            has_options: !!firstAnswer.question_options,
                            options_count:
                                firstAnswer.question_options?.length || 0,
                            selected_ids: firstAnswer.selected_option_ids,
                            student_answer: firstAnswer.student_answer,
                        });
                    }
                }
            }

            // Auto-select first student/question if available
            if (response.data.per_student_view.length > 0) {
                setSelectedStudentId(
                    response.data.per_student_view[0].student_id
                );
            }
            if (response.data.per_question_view.length > 0) {
                setSelectedQuestionId(
                    response.data.per_question_view[0].question_id
                );
            }
        } catch (error: unknown) {
            console.error('Error fetching test results:', error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Failed to fetch test results';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [testId]);

    const [openingToReview, setOpeningToReview] = useState(false);
    const [closingToReview, setClosingToReview] = useState(false);

    const openToReview = async () => {
        try {
            setOpeningToReview(true);
            const response = await axiosInstance.post(
                `/tests/${testId}/open-to-review/`
            );

            // Update local state with new test data
            if (data) {
                setData({
                    ...data,
                    test: {
                        ...data.test,
                        can_see_results: response.data.can_see_results,
                        reveal_results_at: response.data.reveal_results_at,
                        is_opened_to_review: true,
                    },
                });
            }
        } catch (error: unknown) {
            console.error('Error opening results to review:', error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Failed to open results for review';
            alert(errorMessage);
        } finally {
            setOpeningToReview(false);
        }
    };

    const closeToReview = async () => {
        try {
            setClosingToReview(true);
            const response = await axiosInstance.post(
                `/tests/${testId}/close-to-review/`
            );

            // Update local state with new test data
            if (data) {
                setData({
                    ...data,
                    test: {
                        ...data.test,
                        can_see_results: response.data.can_see_results,
                        reveal_results_at: response.data.reveal_results_at,
                        is_opened_to_review: false,
                    },
                });
            }
        } catch (error: unknown) {
            console.error('Error closing results to review:', error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Failed to close results for review';
            alert(errorMessage);
        } finally {
            setClosingToReview(false);
        }
    };

    const updateAnswerScore = async (
        answerId: number,
        newScore: number,
        teacherFeedback: string = ''
    ) => {
        if (!answerId) return;

        try {
            setUpdatingScores(prev => new Set([...prev, answerId]));

            const response = await axiosInstance.patch(
                `/tests/${testId}/update-answer-score/`,
                {
                    answer_id: answerId,
                    score: newScore,
                    teacher_feedback: teacherFeedback,
                }
            );

            // Update the data with new scores
            setData(prevData => {
                if (!prevData) return prevData;

                const updatedData = { ...prevData };

                // Update in per_student_view
                updatedData.per_student_view = prevData.per_student_view.map(
                    student => ({
                        ...student,
                        answers: student.answers.map(answer =>
                            answer.answer_id === answerId
                                ? {
                                      ...answer,
                                      score: response.data.new_score,
                                      teacher_feedback:
                                          response.data.teacher_feedback,
                                      is_correct: response.data.is_correct,
                                  }
                                : answer
                        ),
                    })
                );

                // Update in per_question_view
                updatedData.per_question_view = prevData.per_question_view.map(
                    question => ({
                        ...question,
                        student_answers: question.student_answers.map(
                            studentAnswer =>
                                studentAnswer.answer_id === answerId
                                    ? {
                                          ...studentAnswer,
                                          score: response.data.new_score,
                                          teacher_feedback:
                                              response.data.teacher_feedback,
                                          is_correct: response.data.is_correct,
                                      }
                                    : studentAnswer
                        ),
                    })
                );

                return updatedData;
            });
        } catch (error: unknown) {
            console.error('Error updating score:', error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Failed to update score';
            alert(errorMessage);
        } finally {
            setUpdatingScores(prev => {
                const newSet = new Set(prev);
                newSet.delete(answerId);
                return newSet;
            });
        }
    };

    useEffect(() => {
        if (testId) {
            fetchTestResults();
        }
    }, [testId, fetchTestResults]);

    // Check if user is a teacher
    if (user?.role !== 'teacher') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Access Denied
                    </h2>
                    <p className="text-gray-600">
                        Only teachers can view test results.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading test results...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Error Loading Results
                    </h2>
                    <p className="text-gray-600 mb-4">
                        {error || 'Failed to load test results'}
                    </p>
                    <button
                        onClick={fetchTestResults}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const selectedStudent = data.per_student_view.find(
        s => s.student_id === selectedStudentId
    );
    const selectedQuestion = data.per_question_view.find(
        q => q.question_id === selectedQuestionId
    );

    // Calculate statistics
    const averageScore =
        data.per_student_view.reduce((sum, s) => sum + s.percentage, 0) /
            data.per_student_view.length || 0;
    const averageTime =
        data.per_student_view.reduce(
            (sum, s) => sum + (s.time_spent_minutes || 0),
            0
        ) / data.per_student_view.length || 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-white shadow-lg border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => router.back()}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                        {data.test.title}
                                    </h1>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            {data.test.total_students} students
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FileText className="w-4 h-4" />
                                            {data.test.total_questions}{' '}
                                            questions
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4" />
                                            {data.test.total_points} points
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Open/Close to Review Button */}
                            {!data.test.show_score_immediately && (
                                <div className="flex items-center gap-3">
                                    {data.test.is_opened_to_review ? (
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                                                <Eye className="w-5 h-5 text-green-600" />
                                                <span className="text-sm font-medium text-green-700">
                                                    Результаты открыты для
                                                    просмотра
                                                </span>
                                            </div>
                                            <button
                                                onClick={closeToReview}
                                                disabled={closingToReview}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                            >
                                                {closingToReview ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        <span className="text-sm font-medium">
                                                            Закрытие...
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock className="w-5 h-5" />
                                                        <span className="text-sm font-medium">
                                                            Закрыть просмотр
                                                        </span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={openToReview}
                                            disabled={openingToReview}
                                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                        >
                                            {openingToReview ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    <span className="text-sm font-medium">
                                                        Открытие...
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <Unlock className="w-5 h-5" />
                                                    <span className="text-sm font-medium">
                                                        Открыть для просмотра
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Statistics Cards */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                                <div className="text-sm font-medium text-blue-700 mb-1">
                                    Средний балл
                                </div>
                                <div className="text-2xl font-bold text-blue-900">
                                    {averageScore.toFixed(1)}%
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                                <div className="text-sm font-medium text-green-700 mb-1">
                                    Среднее время
                                </div>
                                <div className="text-2xl font-bold text-green-900">
                                    {averageTime.toFixed(1)} мин
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                                <div className="text-sm font-medium text-purple-700 mb-1">
                                    Завершено попыток
                                </div>
                                <div className="text-2xl font-bold text-purple-900">
                                    {data.per_student_view.length}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Mode Toggle */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setViewMode('students')}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                                viewMode === 'students'
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <Users className="w-5 h-5" />
                            <span>По студентам</span>
                        </button>
                        <button
                            onClick={() => setViewMode('questions')}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                                viewMode === 'questions'
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <FileText className="w-5 h-5" />
                            <span>По вопросам</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Panel - List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                                <h3 className="text-lg font-semibold text-white">
                                    {viewMode === 'students'
                                        ? 'Студенты'
                                        : 'Вопросы'}
                                </h3>
                                <p className="text-sm text-blue-100 mt-1">
                                    {viewMode === 'students'
                                        ? `${data.per_student_view.length} студентов`
                                        : `${data.per_question_view.length} вопросов`}
                                </p>
                            </div>
                            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                                {viewMode === 'students' ? (
                                    <StudentList
                                        students={data.per_student_view}
                                        selectedStudentId={selectedStudentId}
                                        onSelectStudent={setSelectedStudentId}
                                    />
                                ) : (
                                    <QuestionList
                                        questions={data.per_question_view}
                                        selectedQuestionId={selectedQuestionId}
                                        onSelectQuestion={setSelectedQuestionId}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Details */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                            {viewMode === 'students' && selectedStudent ? (
                                <StudentDetails
                                    student={selectedStudent}
                                    onUpdateScore={updateAnswerScore}
                                    updatingScores={updatingScores}
                                />
                            ) : viewMode === 'questions' && selectedQuestion ? (
                                <QuestionDetails
                                    question={selectedQuestion}
                                    onUpdateScore={updateAnswerScore}
                                    updatingScores={updatingScores}
                                />
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                        {viewMode === 'students' ? (
                                            <Users className="w-8 h-8 text-gray-400" />
                                        ) : (
                                            <FileText className="w-8 h-8 text-gray-400" />
                                        )}
                                    </div>
                                    <p className="text-lg font-medium text-gray-900 mb-2">
                                        Выберите{' '}
                                        {viewMode === 'students'
                                            ? 'студента'
                                            : 'вопрос'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        для просмотра деталей
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Student List Component
function StudentList({
    students,
    selectedStudentId,
    onSelectStudent,
}: {
    students: StudentData[];
    selectedStudentId: number | null;
    onSelectStudent: (id: number) => void;
}) {
    const getScoreColor = (percentage: number) => {
        if (percentage >= 80)
            return 'text-green-600 bg-green-50 border-green-200';
        if (percentage >= 60)
            return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    return (
        <div className="divide-y divide-gray-100">
            {students.map(student => {
                const isSelected = selectedStudentId === student.student_id;
                const scoreColor = getScoreColor(student.percentage);

                return (
                    <button
                        key={student.student_id}
                        onClick={() => onSelectStudent(student.student_id)}
                        className={`w-full p-4 text-left transition-all ${
                            isSelected
                                ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-r-4 border-blue-600 shadow-sm'
                                : 'hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                                <p
                                    className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}
                                >
                                    {student.student_name}
                                </p>
                                <p
                                    className={`text-xs ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}
                                >
                                    @{student.student_username}
                                </p>
                            </div>
                            <div
                                className={`px-3 py-1 rounded-lg border text-sm font-bold ${scoreColor}`}
                            >
                                {student.percentage.toFixed(0)}%
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                                {student.total_score}/{student.max_score} баллов
                            </div>
                            {student.time_spent_minutes && (
                                <div className="flex items-center text-xs text-gray-500">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {student.time_spent_minutes.toFixed(1)} мин
                                </div>
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

// Question List Component
function QuestionList({
    questions,
    selectedQuestionId,
    onSelectQuestion,
}: {
    questions: QuestionData[];
    selectedQuestionId: number | null;
    onSelectQuestion: (id: number) => void;
}) {
    const getQuestionStatus = (question: QuestionData) => {
        const allCorrect = question.student_answers.every(
            answer => (answer.score ?? 0) === answer.max_score
        );
        const someCorrect = question.student_answers.some(
            answer => (answer.score ?? 0) > 0
        );

        if (allCorrect)
            return {
                color: 'bg-green-500',
                text: 'text-green-700',
                bg: 'bg-green-50',
            };
        if (someCorrect)
            return {
                color: 'bg-yellow-500',
                text: 'text-yellow-700',
                bg: 'bg-yellow-50',
            };
        return { color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' };
    };

    return (
        <div className="divide-y divide-gray-100">
            {questions.map((question, index) => {
                const isSelected = selectedQuestionId === question.question_id;
                const status = getQuestionStatus(question);
                const avgScore =
                    question.student_answers.length > 0
                        ? question.student_answers.reduce(
                              (sum, a) => sum + (a.score ?? 0),
                              0
                          ) / question.student_answers.length
                        : 0;

                return (
                    <button
                        key={question.question_id}
                        onClick={() => onSelectQuestion(question.question_id)}
                        className={`w-full p-4 text-left transition-all ${
                            isSelected
                                ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-r-4 border-blue-600 shadow-sm'
                                : 'hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span
                                        className={`px-2 py-0.5 rounded text-xs font-bold ${status.text} ${status.bg}`}
                                    >
                                        Q{index + 1}
                                    </span>
                                    <span
                                        className={`w-2 h-2 rounded-full ${status.color}`}
                                    ></span>
                                </div>
                                <p
                                    className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'} line-clamp-2`}
                                >
                                    {question.question_text}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">
                                {question.question_points} баллов
                            </span>
                            <span className="text-gray-500">
                                {question.student_answers.length} ответов •
                                Средний: {avgScore.toFixed(1)}
                            </span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

// Student Details Component
function StudentDetails({
    student,
    onUpdateScore,
    updatingScores,
}: {
    student: StudentData;
    onUpdateScore: (
        answerId: number,
        score: number,
        feedback: string
    ) => Promise<void>;
    updatingScores: Set<number>;
}) {
    const getPercentageColor = (percentage: number) => {
        if (percentage >= 80) return 'from-green-500 to-green-600';
        if (percentage >= 60) return 'from-yellow-500 to-yellow-600';
        return 'from-red-500 to-red-600';
    };

    return (
        <div>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">
                            {student.student_name}
                        </h2>
                        <p className="text-blue-100">
                            @{student.student_username}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold mb-1">
                            {student.total_score}/{student.max_score}
                        </div>
                        <div
                            className={`inline-block px-3 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-sm font-semibold`}
                        >
                            {student.percentage.toFixed(1)}%
                        </div>
                    </div>
                </div>
                {student.time_spent_minutes && (
                    <div className="flex items-center text-blue-100 text-sm">
                        <Clock className="w-4 h-4 mr-2" />
                        Время: {student.time_spent_minutes.toFixed(1)} минут
                    </div>
                )}
            </div>

            <div className="divide-y divide-gray-200">
                {student.answers.map((answer, index) => (
                    <AnswerItem
                        key={answer.question_id}
                        answer={answer}
                        questionNumber={index + 1}
                        onUpdateScore={onUpdateScore}
                        isUpdating={updatingScores.has(answer.answer_id || 0)}
                    />
                ))}
            </div>
        </div>
    );
}

// Question Details Component
function QuestionDetails({
    question,
    onUpdateScore,
    updatingScores,
}: {
    question: QuestionData;
    onUpdateScore: (
        answerId: number,
        score: number,
        feedback: string
    ) => Promise<void>;
    updatingScores: Set<number>;
}) {
    const avgScore =
        question.student_answers.length > 0
            ? question.student_answers.reduce(
                  (sum, a) => sum + (a.score ?? 0),
                  0
              ) / question.student_answers.length
            : 0;
    const correctCount = question.student_answers.filter(
        a => a.is_correct
    ).length;

    return (
        <div>
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
                <h2 className="text-xl font-bold mb-3">
                    {question.question_text}
                </h2>
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <div className="text-xs text-purple-100 mb-1">
                            Баллов
                        </div>
                        <div className="text-lg font-bold">
                            {question.question_points}
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <div className="text-xs text-purple-100 mb-1">
                            Ответов
                        </div>
                        <div className="text-lg font-bold">
                            {question.student_answers.length}
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <div className="text-xs text-purple-100 mb-1">
                            Правильных
                        </div>
                        <div className="text-lg font-bold">{correctCount}</div>
                    </div>
                </div>
                {/* Show correct answer only for non-structured question types */}
                {question.question_type !== 'choose_all' &&
                    question.question_type !== 'matching' &&
                    question.question_type !== 'multiple_choice' && (
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                            <p className="text-sm font-medium text-purple-100 mb-1">
                                Правильный ответ:
                            </p>
                            <p className="text-sm font-semibold">
                                {question.correct_answer}
                            </p>
                        </div>
                    )}
                {/* Show options for choose_all and multiple_choice */}
                {question.question_type === 'choose_all' &&
                    question.question_options && (
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                            <p className="text-sm font-medium text-purple-100 mb-2">
                                Правильные варианты:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {question.question_options
                                    .filter(opt => opt.is_correct)
                                    .map(opt => (
                                        <span
                                            key={opt.id}
                                            className="px-2 py-1 bg-white/30 rounded text-xs font-medium"
                                        >
                                            {opt.text}
                                        </span>
                                    ))}
                            </div>
                        </div>
                    )}
                {question.question_type === 'multiple_choice' &&
                    question.question_options && (
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                            <p className="text-sm font-medium text-purple-100 mb-1">
                                Правильный ответ:
                            </p>
                            <p className="text-sm font-semibold">
                                {question.question_options.find(
                                    opt => opt.is_correct
                                )?.text || question.correct_answer}
                            </p>
                        </div>
                    )}
                {question.question_type === 'matching' &&
                    question.matching_pairs && (
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                            <p className="text-sm font-medium text-purple-100 mb-2">
                                Правильные пары:
                            </p>
                            <div className="space-y-1">
                                {question.matching_pairs.map((pair, idx) => (
                                    <div
                                        key={idx}
                                        className="text-xs flex items-center gap-2"
                                    >
                                        <span className="font-medium">
                                            {pair.left}
                                        </span>
                                        <ArrowRight className="w-3 h-3" />
                                        <span>{pair.right}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
            </div>

            <div className="divide-y divide-gray-200">
                {question.student_answers.map(studentAnswer => (
                    <StudentAnswerItem
                        key={
                            studentAnswer.answer_id ||
                            `student-${studentAnswer.student_id}`
                        }
                        studentAnswer={studentAnswer}
                        questionType={question.question_type}
                        questionOptions={question.question_options}
                        matchingPairs={question.matching_pairs}
                        onUpdateScore={onUpdateScore}
                        isUpdating={updatingScores.has(
                            studentAnswer.answer_id || 0
                        )}
                    />
                ))}
            </div>
        </div>
    );
}

// Answer Item Component (for student view)
function AnswerItem({
    answer,
    questionNumber,
    onUpdateScore,
    isUpdating,
}: {
    answer: StudentAnswer;
    questionNumber: number;
    onUpdateScore: (
        answerId: number,
        score: number,
        feedback: string
    ) => Promise<void>;
    isUpdating: boolean;
}) {
    const [editing, setEditing] = useState(false);
    const [scoreInput, setScoreInput] = useState(
        (answer.score ?? 0).toString()
    );
    const [feedbackInput, setFeedbackInput] = useState(answer.teacher_feedback);

    const handleSave = async () => {
        if (!answer.answer_id) return;

        const newScore = parseFloat(scoreInput);
        if (isNaN(newScore) || newScore < 0 || newScore > answer.max_score) {
            alert(`Score must be between 0 and ${answer.max_score}`);
            return;
        }

        await onUpdateScore(answer.answer_id, newScore, feedbackInput);
        setEditing(false);
    };

    const handleCancel = () => {
        setScoreInput((answer.score ?? 0).toString());
        setFeedbackInput(answer.teacher_feedback);
        setEditing(false);
    };

    const getScoreColor = () => {
        const percentage = ((answer.score ?? 0) / answer.max_score) * 100;
        if (percentage >= 80)
            return 'text-green-600 bg-green-50 border-green-200';
        if (percentage >= 60)
            return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    return (
        <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm">
                            Вопрос {questionNumber}
                        </span>
                        <span
                            className={`px-2 py-1 rounded text-xs font-bold border ${getScoreColor()}`}
                        >
                            {answer.score ?? 0}/{answer.max_score}
                        </span>
                        {answer.is_correct ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                        )}
                    </div>
                    <p className="text-gray-900 font-medium mb-4">
                        {answer.question_text}
                    </p>

                    {/* Choose All Question Display */}
                    {answer.question_type === 'choose_all' &&
                    answer.question_options &&
                    answer.question_options.length > 0 ? (
                        <ChooseAllAnswerDisplay
                            options={answer.question_options}
                            selectedIds={answer.selected_option_ids || []}
                        />
                    ) : answer.question_type === 'matching' &&
                      answer.matching_pairs &&
                      answer.matching_pairs.length > 0 ? (
                        <MatchingAnswerDisplay
                            pairs={answer.matching_pairs}
                            studentAnswers={
                                answer.student_matching_answers || []
                            }
                        />
                    ) : answer.question_type === 'multiple_choice' &&
                      answer.question_options &&
                      answer.question_options.length > 0 ? (
                        <MultipleChoiceAnswerDisplay
                            options={answer.question_options}
                            selectedId={answer.selected_option_id ?? null}
                        />
                    ) : (
                        <div className="space-y-3">
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                                    Ответ студента:
                                </p>
                                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                    {answer.student_answer || 'Нет ответа'}
                                </p>
                            </div>

                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <p className="text-xs font-semibold text-green-700 mb-2 uppercase tracking-wide">
                                    Правильный ответ:
                                </p>
                                <p className="text-sm text-green-900">
                                    {answer.correct_answer}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-shrink-0 w-72">
                    {editing ? (
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Балл
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        max={answer.max_score}
                                        step="0.1"
                                        value={scoreInput}
                                        onChange={e =>
                                            setScoreInput(e.target.value)
                                        }
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={isUpdating}
                                    />
                                    <span className="text-sm text-gray-500 font-medium">
                                        / {answer.max_score}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Обратная связь
                                </label>
                                <textarea
                                    value={feedbackInput}
                                    onChange={e =>
                                        setFeedbackInput(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows={4}
                                    placeholder="Введите комментарий..."
                                    disabled={isUpdating}
                                />
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={handleSave}
                                    disabled={isUpdating}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all shadow-sm"
                                >
                                    {isUpdating ? 'Сохранение...' : 'Сохранить'}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={isUpdating}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 text-center">
                            <div
                                className={`text-3xl font-bold mb-2 ${getScoreColor().split(' ')[0]}`}
                            >
                                {answer.score ?? 0}
                            </div>
                            <div className="text-sm text-gray-600 mb-4">
                                из {answer.max_score} баллов
                            </div>
                            <button
                                onClick={() => setEditing(true)}
                                disabled={!answer.answer_id}
                                className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                Редактировать
                            </button>
                            {answer.teacher_feedback && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-xs font-semibold text-gray-600 mb-1">
                                        Комментарий:
                                    </p>
                                    <p className="text-xs text-gray-700">
                                        {answer.teacher_feedback}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Student Answer Item Component (for question view)
function StudentAnswerItem({
    studentAnswer,
    questionType,
    questionOptions,
    matchingPairs,
    onUpdateScore,
    isUpdating,
}: {
    studentAnswer: QuestionStudentAnswer;
    questionType: string;
    questionOptions?: QuestionOption[];
    matchingPairs?: Array<{ left: string; right: string }>;
    onUpdateScore: (
        answerId: number,
        score: number,
        feedback: string
    ) => Promise<void>;
    isUpdating: boolean;
}) {
    const [editing, setEditing] = useState(false);
    const [scoreInput, setScoreInput] = useState(
        (studentAnswer.score ?? 0).toString()
    );
    const [feedbackInput, setFeedbackInput] = useState(
        studentAnswer.teacher_feedback
    );

    const handleSave = async () => {
        if (!studentAnswer.answer_id) return;

        const newScore = parseFloat(scoreInput);
        if (
            isNaN(newScore) ||
            newScore < 0 ||
            newScore > studentAnswer.max_score
        ) {
            alert(`Score must be between 0 and ${studentAnswer.max_score}`);
            return;
        }

        await onUpdateScore(studentAnswer.answer_id, newScore, feedbackInput);
        setEditing(false);
    };

    const handleCancel = () => {
        setScoreInput((studentAnswer.score ?? 0).toString());
        setFeedbackInput(studentAnswer.teacher_feedback);
        setEditing(false);
    };

    const getScoreColor = () => {
        const percentage =
            ((studentAnswer.score ?? 0) / studentAnswer.max_score) * 100;
        if (percentage >= 80)
            return 'text-green-600 bg-green-50 border-green-200';
        if (percentage >= 60)
            return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    return (
        <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {studentAnswer.student_name}
                            </h3>
                            <p className="text-sm text-gray-500">
                                @{studentAnswer.student_username}
                            </p>
                        </div>
                        <span
                            className={`px-2 py-1 rounded text-xs font-bold border ${getScoreColor()}`}
                        >
                            {studentAnswer.score ?? 0}/{studentAnswer.max_score}
                        </span>
                        {studentAnswer.is_correct ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                        )}
                    </div>

                    {/* Choose All Question Display */}
                    {questionType === 'choose_all' &&
                    questionOptions &&
                    questionOptions.length > 0 ? (
                        <ChooseAllAnswerDisplay
                            options={questionOptions}
                            selectedIds={
                                studentAnswer.selected_option_ids || []
                            }
                        />
                    ) : questionType === 'matching' &&
                      matchingPairs &&
                      matchingPairs.length > 0 ? (
                        <MatchingAnswerDisplay
                            pairs={matchingPairs}
                            studentAnswers={
                                studentAnswer.student_matching_answers || []
                            }
                        />
                    ) : questionType === 'multiple_choice' &&
                      questionOptions &&
                      questionOptions.length > 0 ? (
                        <MultipleChoiceAnswerDisplay
                            options={questionOptions}
                            selectedId={studentAnswer.selected_option_id}
                        />
                    ) : (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                                Ответ:
                            </p>
                            <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                {studentAnswer.student_answer || 'Нет ответа'}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex-shrink-0 w-72">
                    {editing ? (
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Балл
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        max={studentAnswer.max_score}
                                        step="0.1"
                                        value={scoreInput}
                                        onChange={e =>
                                            setScoreInput(e.target.value)
                                        }
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={isUpdating}
                                    />
                                    <span className="text-sm text-gray-500 font-medium">
                                        / {studentAnswer.max_score}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Обратная связь
                                </label>
                                <textarea
                                    value={feedbackInput}
                                    onChange={e =>
                                        setFeedbackInput(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows={4}
                                    placeholder="Введите комментарий..."
                                    disabled={isUpdating}
                                />
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={handleSave}
                                    disabled={isUpdating}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all shadow-sm"
                                >
                                    {isUpdating ? 'Сохранение...' : 'Сохранить'}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={isUpdating}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 text-center">
                            <div
                                className={`text-3xl font-bold mb-2 ${getScoreColor().split(' ')[0]}`}
                            >
                                {studentAnswer.score ?? 0}
                            </div>
                            <div className="text-sm text-gray-600 mb-4">
                                из {studentAnswer.max_score} баллов
                            </div>
                            <button
                                onClick={() => setEditing(true)}
                                disabled={!studentAnswer.answer_id}
                                className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                Редактировать
                            </button>
                            {studentAnswer.teacher_feedback && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-xs font-semibold text-gray-600 mb-1">
                                        Комментарий:
                                    </p>
                                    <p className="text-xs text-gray-700">
                                        {studentAnswer.teacher_feedback}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Choose All Answer Display Component
function ChooseAllAnswerDisplay({
    options,
    selectedIds,
}: {
    options: QuestionOption[];
    selectedIds: number[];
}) {
    return (
        <div className="space-y-3">
            <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">
                    Выберите все подходящие варианты:
                </p>
            </div>
            <div className="space-y-2">
                {options.map(option => {
                    const isSelected = selectedIds.includes(option.id);
                    const isCorrect = option.is_correct;

                    return (
                        <div
                            key={option.id}
                            className={`relative p-4 rounded-lg border-2 transition-all ${
                                isSelected
                                    ? isCorrect
                                        ? 'border-green-500 bg-green-50 shadow-sm'
                                        : 'border-red-500 bg-red-50 shadow-sm'
                                    : isCorrect
                                      ? 'border-green-300 bg-green-25 border-dashed'
                                      : 'border-gray-200 bg-white'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center mt-0.5 ${
                                        isSelected
                                            ? isCorrect
                                                ? 'bg-green-500 border-green-600'
                                                : 'bg-red-500 border-red-600'
                                            : 'bg-white border-gray-300'
                                    }`}
                                >
                                    {isSelected && (
                                        <Check className="w-4 h-4 text-white" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        {option.text}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {isCorrect && (
                                        <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded">
                                            Правильный
                                        </span>
                                    )}
                                    {isSelected && isCorrect && (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    )}
                                    {isSelected && !isCorrect && (
                                        <>
                                            <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded">
                                                Неправильно
                                            </span>
                                            <XCircle className="w-5 h-5 text-red-500" />
                                        </>
                                    )}
                                    {!isSelected && isCorrect && (
                                        <span className="px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-700 rounded">
                                            Не выбрано
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Matching Answer Display Component
function MatchingAnswerDisplay({
    pairs,
    studentAnswers,
}: {
    pairs: Array<{ left: string; right: string }>;
    studentAnswers: Array<{ left: string; right: string }>;
}) {
    const isMatchCorrect = (
        studentPair: { left: string; right: string },
        correctPairs: Array<{ left: string; right: string }>
    ): boolean => {
        return correctPairs.some(
            correctPair =>
                correctPair.left === studentPair.left &&
                correctPair.right === studentPair.right
        );
    };

    const getStudentAnswer = (left: string) => {
        return studentAnswers.find(pair => pair.left === left);
    };

    return (
        <div className="space-y-4">
            <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">
                    Соедините выражения с правильными ответами:
                </p>
            </div>
            <div className="space-y-3">
                {pairs.map((correctPair, index) => {
                    const studentPair = getStudentAnswer(correctPair.left);
                    const isCorrect =
                        studentPair &&
                        isMatchCorrect(studentPair, [correctPair]);

                    return (
                        <div
                            key={index}
                            className="bg-white rounded-lg border-2 border-gray-200 p-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex-1 bg-blue-50 rounded-lg p-3 border border-blue-200">
                                    <p className="text-sm font-semibold text-blue-900">
                                        {correctPair.left}
                                    </p>
                                </div>
                                <ArrowRight
                                    className={`w-5 h-5 flex-shrink-0 ${
                                        isCorrect
                                            ? 'text-green-600'
                                            : studentPair
                                              ? 'text-red-600'
                                              : 'text-gray-400'
                                    }`}
                                />
                                <div
                                    className={`flex-1 rounded-lg p-3 border-2 ${
                                        isCorrect
                                            ? 'bg-green-50 border-green-500'
                                            : studentPair
                                              ? 'bg-red-50 border-red-500'
                                              : 'bg-gray-50 border-gray-300'
                                    }`}
                                >
                                    <p
                                        className={`text-sm font-medium ${
                                            isCorrect
                                                ? 'text-green-900'
                                                : studentPair
                                                  ? 'text-red-900'
                                                  : 'text-gray-500'
                                        }`}
                                    >
                                        {studentPair?.right || 'Не выбрано'}
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    {isCorrect ? (
                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                    ) : studentPair ? (
                                        <XCircle className="w-6 h-6 text-red-500" />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                                    )}
                                </div>
                            </div>
                            {!isCorrect && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="font-medium">
                                            Правильный ответ:
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-green-50 rounded p-2 border border-green-200">
                                            <p className="text-sm font-medium text-green-900">
                                                {correctPair.right}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Multiple Choice Answer Display Component
function MultipleChoiceAnswerDisplay({
    options,
    selectedId,
}: {
    options: QuestionOption[];
    selectedId: number | null | undefined;
}) {
    return (
        <div className="space-y-2">
            {options.map(option => {
                const isSelected = option.id === (selectedId ?? null);
                const isCorrect = option.is_correct;

                return (
                    <div
                        key={option.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                            isSelected
                                ? isCorrect
                                    ? 'border-green-500 bg-green-50 shadow-sm'
                                    : 'border-red-500 bg-red-50 shadow-sm'
                                : isCorrect
                                  ? 'border-green-300 bg-green-25 border-dashed'
                                  : 'border-gray-200 bg-white'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    isSelected
                                        ? isCorrect
                                            ? 'bg-green-500 border-green-600'
                                            : 'bg-red-500 border-red-600'
                                        : 'bg-white border-gray-300'
                                }`}
                            >
                                {isSelected && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    {option.text}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {isCorrect && (
                                    <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded">
                                        Правильный
                                    </span>
                                )}
                                {isSelected && isCorrect && (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                )}
                                {isSelected && !isCorrect && (
                                    <XCircle className="w-5 h-5 text-red-500" />
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
