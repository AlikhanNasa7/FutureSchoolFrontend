'use client';

import { useState } from 'react';
import { Clock, User, ChevronDown, ChevronRight } from 'lucide-react';

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

interface ForumPostItemProps {
    post: ForumPost;
    depth?: number;
    canAnswer: boolean;
    onReplyClick: (postId: number, authorUsername: string, content: string) => void;
    formatDate: (dateString: string) => string;
}

const MAX_DEPTH = 10; // Максимальная глубина вложенности

export default function ForumPostItem({
    post,
    depth = 0,
    canAnswer,
    onReplyClick,
    formatDate,
}: ForumPostItemProps) {
    const [isExpanded, setIsExpanded] = useState(depth === 0); // Только первый уровень раскрыт по умолчанию
    const hasReplies = post.replies && post.replies.length > 0;
    const marginLeft = Math.min(depth * 16, 256); // Максимум 256px отступа

    return (
        <div className="space-y-3">
            <div className="flex gap-0">
                {/* Vertical line and expand/collapse button */}
                <div className="flex flex-col items-center">
                    {depth > 0 && (
                        <div
                            className="w-[2px] bg-gray-300 flex-shrink-0"
                            style={{ height: '28px', marginBottom: '8px' }}
                        ></div>
                    )}
                    {hasReplies && depth < MAX_DEPTH && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0 mb-2"
                            title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                            {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                            )}
                        </button>
                    )}
                    {hasReplies && depth < MAX_DEPTH && isExpanded && (
                        <div
                            className="w-[2px] bg-gray-300 flex-shrink-0 flex-1"
                            style={{ minHeight: '100px' }}
                        ></div>
                    )}
                </div>

                {/* Post content */}
                <div className="flex-1 ml-3">
                    <div
                        className={`bg-white rounded-lg shadow-sm border p-4 transition-all ${
                            post.is_answer
                                ? 'border-green-200 bg-green-50'
                                : depth === 0
                                  ? 'border-gray-200'
                                  : 'border-gray-200 bg-gray-50'
                        }`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                <span className="font-medium text-gray-900">
                                    {post.author_first_name || post.author_last_name
                                        ? `${post.author_first_name} ${post.author_last_name}`.trim()
                                        : post.author_username}
                                </span>
                                {(post.author_first_name || post.author_last_name) && (
                                    <span className="text-xs text-gray-500">
                                        (@{post.author_username})
                                    </span>
                                )}
                                {post.is_answer && (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                                        Ответ преподавателя
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-gray-500 flex items-center gap-1 flex-shrink-0 ml-2">
                                <Clock className="w-3 h-3" />
                                {formatDate(post.created_at)}
                            </span>
                        </div>
                        <p className="text-gray-800 whitespace-pre-wrap text-sm mb-3">
                            {post.content}
                        </p>
                        <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                            {canAnswer && depth < MAX_DEPTH && (
                                <button
                                    onClick={() =>
                                        onReplyClick(post.id, post.author_username, post.content)
                                    }
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    💬 Ответить
                                </button>
                            )}
                            {hasReplies && !isExpanded && (
                                <span className="text-xs text-gray-500 ml-auto">
                                    +{post.replies!.length} ответов
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Рекурсивное отображение replies */}
                    {hasReplies && isExpanded && (
                        <div className="space-y-3 mt-3">
                            {post.replies!.map(reply => (
                                <ForumPostItem
                                    key={reply.id}
                                    post={reply}
                                    depth={depth + 1}
                                    canAnswer={canAnswer}
                                    onReplyClick={onReplyClick}
                                    formatDate={formatDate}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
