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
} from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { useUserState } from '@/contexts/UserContext';

interface TestInfo {
    id: number;
    title: string;
    total_points: number;
    total_questions: number;
    total_students: number;
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
}

interface QuestionData {
    question_id: number;
    question_text: string;
    question_type: string;
    question_points: number;
    correct_answer: string;
    student_answers: QuestionStudentAnswer[];
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">
                                    {data.test.title}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    {data.test.total_students} students •{' '}
                                    {data.test.total_questions} questions •{' '}
                                    {data.test.total_points} points
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Mode Toggle */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg w-fit">
                        <button
                            onClick={() => setViewMode('students')}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                                viewMode === 'students'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Users className="w-4 h-4" />
                            <span>By Student</span>
                        </button>
                        <button
                            onClick={() => setViewMode('questions')}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                                viewMode === 'questions'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <FileText className="w-4 h-4" />
                            <span>By Question</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Panel - List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-4 border-b">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {viewMode === 'students'
                                        ? 'Students'
                                        : 'Questions'}
                                </h3>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
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
                        <div className="bg-white rounded-lg shadow-sm border">
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
                                <div className="p-8 text-center text-gray-500">
                                    Select a{' '}
                                    {viewMode === 'students'
                                        ? 'student'
                                        : 'question'}{' '}
                                    to view details
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
    return (
        <div className="divide-y divide-gray-200">
            {students.map(student => (
                <button
                    key={student.student_id}
                    onClick={() => onSelectStudent(student.student_id)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedStudentId === student.student_id
                            ? 'bg-blue-50 border-r-2 border-blue-600'
                            : ''
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900">
                                {student.student_name}
                            </p>
                            <p className="text-sm text-gray-500">
                                @{student.student_username}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                                {student.total_score}/{student.max_score}
                            </p>
                            <p className="text-xs text-gray-500">
                                {student.percentage.toFixed(1)}%
                            </p>
                        </div>
                    </div>
                    {student.time_spent_minutes && (
                        <div className="mt-2 flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {student.time_spent_minutes.toFixed(1)} min
                        </div>
                    )}
                </button>
            ))}
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
    return (
        <div className="divide-y divide-gray-200">
            {questions.map((question, index) => (
                <button
                    key={question.question_id}
                    onClick={() => onSelectQuestion(question.question_id)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedQuestionId === question.question_id
                            ? 'bg-blue-50 border-r-2 border-blue-600'
                            : ''
                    }`}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                                Q{index + 1}:{' '}
                                {question.question_text.substring(0, 60)}
                                {question.question_text.length > 60
                                    ? '...'
                                    : ''}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {question.question_points} points •{' '}
                                {question.student_answers.length} answers
                            </p>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                            <div
                                className={`w-3 h-3 rounded-full ${
                                    question.student_answers.every(
                                        answer =>
                                            (answer.score ?? 0) ===
                                            answer.max_score
                                    )
                                        ? 'bg-green-500'
                                        : question.student_answers.some(
                                                answer =>
                                                    (answer.score ?? 0) > 0
                                            )
                                          ? 'bg-yellow-500'
                                          : 'bg-red-500'
                                }`}
                            />
                        </div>
                    </div>
                </button>
            ))}
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
    return (
        <div>
            <div className="p-6 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {student.student_name}
                        </h2>
                        <p className="text-gray-500">
                            @{student.student_username}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                            {student.total_score}/{student.max_score}
                        </div>
                        <div className="text-sm text-gray-500">
                            {student.percentage.toFixed(1)}%
                        </div>
                    </div>
                </div>
                {student.time_spent_minutes && (
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        Time spent: {student.time_spent_minutes.toFixed(1)}{' '}
                        minutes
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
    return (
        <div>
            <div className="p-6 border-b bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {question.question_text}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{question.question_points} points</span>
                    <span>
                        {question.student_answers.length} students answered
                    </span>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                        Correct Answer:
                    </p>
                    <p className="text-sm text-blue-800">
                        {question.correct_answer}
                    </p>
                </div>
            </div>

            <div className="divide-y divide-gray-200">
                {question.student_answers.map(studentAnswer => (
                    <StudentAnswerItem
                        key={
                            studentAnswer.answer_id ||
                            `student-${studentAnswer.student_id}`
                        }
                        studentAnswer={studentAnswer}
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

    return (
        <div className="p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Question {questionNumber}
                    </h3>
                    <p className="text-gray-700 mb-4">{answer.question_text}</p>

                    <div className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">
                                Student Answer:
                            </p>
                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                {answer.student_answer}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">
                                Correct Answer:
                            </p>
                            <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
                                {answer.correct_answer}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="ml-6 flex-shrink-0">
                    {editing ? (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Score
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max={answer.max_score}
                                    step="0.1"
                                    value={scoreInput}
                                    onChange={e =>
                                        setScoreInput(e.target.value)
                                    }
                                    className="w-20 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isUpdating}
                                />
                                <span className="text-sm text-gray-500 ml-1">
                                    / {answer.max_score}
                                </span>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Feedback
                                </label>
                                <textarea
                                    value={feedbackInput}
                                    onChange={e =>
                                        setFeedbackInput(e.target.value)
                                    }
                                    className="w-64 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    disabled={isUpdating}
                                />
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={handleSave}
                                    disabled={isUpdating}
                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isUpdating ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={isUpdating}
                                    className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                                {answer.score ?? 0}/{answer.max_score}
                            </div>
                            <div className="flex items-center space-x-2">
                                {answer.is_correct ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-500" />
                                )}
                                <button
                                    onClick={() => setEditing(true)}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                    disabled={!answer.answer_id}
                                >
                                    Edit Score
                                </button>
                            </div>
                            {answer.teacher_feedback && (
                                <p className="text-xs text-gray-500 mt-2 max-w-xs">
                                    {answer.teacher_feedback}
                                </p>
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
    onUpdateScore,
    isUpdating,
}: {
    studentAnswer: QuestionStudentAnswer;
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

    return (
        <div className="p-6">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {studentAnswer.student_name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                        @{studentAnswer.student_username}
                    </p>

                    <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                            Answer:
                        </p>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {studentAnswer.student_answer}
                        </p>
                    </div>
                </div>

                <div className="ml-6 flex-shrink-0">
                    {editing ? (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Score
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max={studentAnswer.max_score}
                                    step="0.1"
                                    value={scoreInput}
                                    onChange={e =>
                                        setScoreInput(e.target.value)
                                    }
                                    className="w-20 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isUpdating}
                                />
                                <span className="text-sm text-gray-500 ml-1">
                                    / {studentAnswer.max_score}
                                </span>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Feedback
                                </label>
                                <textarea
                                    value={feedbackInput}
                                    onChange={e =>
                                        setFeedbackInput(e.target.value)
                                    }
                                    className="w-64 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    disabled={isUpdating}
                                />
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={handleSave}
                                    disabled={isUpdating}
                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isUpdating ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={isUpdating}
                                    className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                                {studentAnswer.score ?? 0}/
                                {studentAnswer.max_score}
                            </div>
                            <div className="flex items-center space-x-2">
                                {studentAnswer.is_correct ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-500" />
                                )}
                                <button
                                    onClick={() => setEditing(true)}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                    disabled={!studentAnswer.answer_id}
                                >
                                    Edit Score
                                </button>
                            </div>
                            {studentAnswer.teacher_feedback && (
                                <p className="text-xs text-gray-500 mt-2 max-w-xs">
                                    {studentAnswer.teacher_feedback}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
