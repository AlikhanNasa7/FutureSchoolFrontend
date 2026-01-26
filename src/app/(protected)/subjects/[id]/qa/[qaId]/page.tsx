'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ArrowLeft,
    CheckCircle2,
    Lock,
    Clock,
    Send,
    User,
    MessageSquare,
    BookOpen,
} from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { useUserState } from '@/contexts/UserContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useSubject } from '../../layout';
import ForumPostItem from '@/components/ForumPostItem';

interface ForumPost {
    id: number;
    thread: number;
    author: number;
    author_username: string;
    author_first_name: string;
    author_last_name: string;
    content: string;
    is_answer: boolean;
    parent_post?: number | null;
    replies?: ForumPost[];
    created_at: string;
    updated_at: string;
}

interface ForumThread {
    id: number;
    subject_group: number;
    subject_group_course_name?: string;
    subject_group_classroom_display?: string;
    created_by: number;
    created_by_username: string;
    created_by_first_name?: string;
    created_by_last_name?: string;
    title: string;
    type: string;
    is_public: boolean;
    is_resolved: boolean;
    allow_replies: boolean;
    created_at: string;
    updated_at: string;
    posts: ForumPost[];
}

export default function SubjectQADetailPage() {
    const router = useRouter();
    const params = useParams();
    const subjectId = params?.id as string;
    const qaId = params?.qaId as string;
    const { user } = useUserState();
    const { subject } = useSubject();
    const { t } = useLocale();
    const [thread, setThread] = useState<ForumThread | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [answerContent, setAnswerContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [replyingToPostId, setReplyingToPostId] = useState<number | null>(null);
    const [replyingToAuthor, setReplyingToAuthor] = useState<string>('');
    const [replyingToContent, setReplyingToContent] = useState<string>('');

    useEffect(() => {
        if (qaId) {
            fetchThread();
        }
    }, [qaId]);

    const fetchThread = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/forum/threads/${qaId}/`);
            setThread(response.data);
            setError(null);
        } catch (err: unknown) {
            const errorMessage =
                err && typeof err === 'object' && 'response' in err
                    ? (err as { response?: { data?: { message?: string } } })
                          .response?.data?.message || t('qa.failedToLoad')
                    : t('qa.failedToLoad');
            setError(errorMessage);
            console.error('Error fetching thread:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAnswer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!answerContent.trim()) {
            return;
        }

        try {
            setSubmitting(true);
            await axiosInstance.post('/forum/posts/', {
                thread: parseInt(qaId),
                content: answerContent,
                is_answer: user?.role === 'teacher',
                parent_post: replyingToPostId || undefined,
            });
            setAnswerContent('');
            setReplyingToPostId(null);
            setReplyingToAuthor('');
            setReplyingToContent('');
            fetchThread();
        } catch (err: unknown) {
            const errorMessage =
                err && typeof err === 'object' && 'response' in err
                    ? (err as { response?: { data?: { message?: string } } })
                          .response?.data?.message || t('qa.failedToPostAnswer')
                    : t('qa.failedToPostAnswer');
            alert(errorMessage);
            console.error('Error posting answer:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleMarkResolved = async () => {
        if (!thread) return;
        try {
            await axiosInstance.post(`/forum/threads/${qaId}/mark-resolved/`);
            fetchThread();
        } catch (err: unknown) {
            const errorMessage =
                err && typeof err === 'object' && 'response' in err
                    ? (err as { response?: { data?: { message?: string } } })
                          .response?.data?.message ||
                      t('qa.failedToMarkResolved')
                    : t('qa.failedToMarkResolved');
            alert(errorMessage);
            console.error('Error marking resolved:', err);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleReplyClick = (postId: number, authorUsername: string, content: string) => {
        setReplyingToPostId(postId);
        setReplyingToAuthor(authorUsername);
        setReplyingToContent(content);
    };

    const isTeacher = user?.role === 'teacher';
    const isStudent = user?.role === 'student';
    const canAnswer = isTeacher || isStudent;
    const isAuthor = thread?.created_by === parseInt(user?.id || '0');

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            </div>
        );
    }

    if (error || !thread) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <button
                    onClick={() => router.push(`/subjects/${subjectId}/qa`)}
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    {t('qa.backToQA')}
                </button>
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error || t('qa.questionNotFound')}
                </div>
            </div>
        );
    }

    const questionPost = thread.posts[0];
    const answerPosts = thread.posts.slice(1);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() =>
                        router.push(`/subjects/${subjectId}/contents`)
                    }
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <BookOpen className="w-5 h-5" />
                    {subject?.course_name || t('subject.contents')}
                </button>
                <button
                    onClick={() => router.push(`/subjects/${subjectId}/qa`)}
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    {t('qa.backToQA')}
                </button>
            </div>

            {/* Question Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {thread.title}
                            </h1>
                            {thread.is_resolved && (
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            )}
                            {!thread.is_public && (
                                <Lock className="w-6 h-6 text-gray-400" />
                            )}
                        </div>
                        {(thread.subject_group_course_name || thread.subject_group_classroom_display) && (
                            <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
                                <BookOpen className="w-4 h-4" />
                                {thread.subject_group_course_name && thread.subject_group_classroom_display && (
                                    <span>
                                        {thread.subject_group_course_name} • {thread.subject_group_classroom_display}
                                    </span>
                                )}
                                {thread.subject_group_course_name && !thread.subject_group_classroom_display && (
                                    <span>{thread.subject_group_course_name}</span>
                                )}
                                {!thread.subject_group_course_name && thread.subject_group_classroom_display && (
                                    <span>{thread.subject_group_classroom_display}</span>
                                )}
                            </div>
                        )}
                    </div>
                    {isTeacher && !thread.is_resolved && (
                        <button
                            onClick={handleMarkResolved}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            {t('qa.markAsResolved')}
                        </button>
                    )}
                </div>

                <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">
                            {thread.created_by_username}
                        </span>
                        <span>•</span>
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(thread.created_at)}</span>
                    </div>
                </div>

                {questionPost && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-gray-800 whitespace-pre-wrap">
                            {questionPost.content}
                        </p>
                    </div>
                )}
            </div>

            {/* Answers Section */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    {t('qa.answers')} ({answerPosts.length})
                </h2>

                {answerPosts.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">{t('qa.noAnswers')}</p>
                        {canAnswer && (
                            <p className="text-gray-500 text-sm mt-2">
                                {t('qa.beFirstToAnswer')}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {answerPosts.map(post => (
                            <ForumPostItem
                                key={post.id}
                                post={post}
                                depth={0}
                                canAnswer={canAnswer}
                                onReplyClick={handleReplyClick}
                                formatDate={formatDate}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Answer Form */}
            {canAnswer && thread.allow_replies && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {t('qa.yourAnswer')}
                    </h3>
                    {thread.is_resolved && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                {t('qa.questionResolvedNote')}
                            </p>
                        </div>
                    )}
                    <form onSubmit={handleSubmitAnswer}>
                        {replyingToPostId && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-blue-800">
                                        Ты отвечаешь на пост от <strong>{replyingToAuthor}</strong>
                                    </p>
                                    <p className="text-xs text-blue-700 mt-1 line-clamp-2">
                                        "{replyingToContent}"
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setReplyingToPostId(null);
                                        setReplyingToAuthor('');
                                        setReplyingToContent('');
                                    }}
                                    className="text-blue-600 hover:text-blue-700 font-bold ml-2"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                        <textarea
                            value={answerContent}
                            onChange={e => setAnswerContent(e.target.value)}
                            rows={6}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
                            placeholder={t('qa.answerPlaceholder')}
                            required
                        />
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting || !answerContent.trim()}
                                className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                            >
                                <Send className="w-5 h-5" />
                                {submitting
                                    ? t('qa.posting')
                                    : t('qa.postAnswer')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
