'use client';

import { useState, useCallback } from 'react';
import {
    ChevronDown,
    FileText,
    CheckCircle,
    Clock,
    AlertCircle,
    Plus,
    Info,
    Trash2,
} from 'lucide-react';
import type { WeekMaterialsData, WeekItem } from './WeekMaterialsSection';
import { getIconByType } from './IconUtils';
import { useUserState } from '@/contexts/UserContext';
import { modalController } from '@/lib/modalController';
import axiosInstance from '@/lib/axios';
import { SharedLinkItem } from './SharedLinkItem';

interface WeekMaterialsPanelProps {
    data: WeekMaterialsData;
    courseSectionId?: number;
}

interface DeleteButtonProps {
    onDelete: () => void;
    itemName: string;
    loading?: boolean;
}

export function DeleteButton({
    onDelete,
    itemName,
    loading = false,
}: DeleteButtonProps) {
    return (
        <button
            onClick={onDelete}
            disabled={loading}
            className={`flex items-center justify-center w-8 h-8 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors hover:bg-gray-100 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label={`Delete ${itemName}`}
            title={`Delete ${itemName}`}
        >
            <Trash2 className="w-4 h-4 text-gray-500" />
        </button>
    );
}

function getStatusIcon(
    status: 'not_started' | 'in_progress' | 'submitted' | 'graded'
) {
    switch (status) {
        case 'not_started':
            return <AlertCircle className="w-4 h-4 text-gray-400" />;
        case 'in_progress':
            return <Clock className="w-4 h-4 text-yellow-500" />;
        case 'submitted':
            return <CheckCircle className="w-4 h-4 text-blue-500" />;
        case 'graded':
            return <CheckCircle className="w-4 h-4 text-green-500" />;
        default:
            return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
}

function getStatusText(
    status: 'not_started' | 'in_progress' | 'submitted' | 'graded'
) {
    switch (status) {
        case 'not_started':
            return 'Не начато';
        case 'in_progress':
            return 'В процессе';
        case 'submitted':
            return 'Отправлено';
        case 'graded':
            return 'Оценено';
        default:
            return 'Не начато';
    }
}

interface Resource {
    href: string;
    title: string;
    type?: string;
    size?: number;
}

function handleFileView(resource: Resource, filename: string) {
    console.log(resource, filename, 'resource', 'filename');
    const fileUrl = resource.file;

    console.log('Opening file in modal:', { resource, fileUrl, filename });

    modalController.open('file-viewer', {
        file: {
            url: fileUrl,
            title: filename,
            type: resource.type,
            size: resource.size,
        },
    });
}

function TaskItem({
    item,
    isTeacher,
    onDelete,
}: {
    item: Extract<WeekItem, { kind: 'task' }>;
    isTeacher: boolean;
    onDelete?: (itemId: string, itemType: 'resource' | 'assignment') => void;
}) {
    return (
        <div className="flex items-center justify-between gap-3 py-3">
            {/* Left side - Icon, label, and status */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex-shrink-0 flex items-center justify-center">
                    {item.icon ||
                        getIconByType(
                            item.type === 'info' ? 'text' : item.type,
                            32
                        ) || <FileText className="w-8 h-8 text-gray-500" />}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-900 truncate">
                            {item.label}
                        </span>
                        {item.status && (
                            <div className="flex items-center gap-1">
                                {getStatusIcon(item.status)}
                                <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                                    {getStatusText(item.status)}
                                </span>
                                {item.score && (
                                    <span className="text-xs px-2 py-0.5 rounded-md bg-green-100 text-green-600">
                                        {item.score}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
                <a
                    href={item.actionHref}
                    target="_blank"
                    className="px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-colors"
                    aria-label={item.actionLabel}
                >
                    {item.actionLabel}
                </a>

                {/* Delete Button */}
                {isTeacher && onDelete && (
                    <DeleteButton
                        onDelete={() => onDelete(item.id, 'assignment')}
                        itemName={item.title}
                    />
                )}
            </div>
        </div>
    );
}

export default function WeekMaterialsPanel({
    data,
    courseSectionId,
}: WeekMaterialsPanelProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const { user } = useUserState();
    const isTeacher = user?.role === 'teacher';

    const toggleExpanded = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    console.log(data, 'data');

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleExpanded();
            }
        },
        [toggleExpanded]
    );

    const handleAddItem = useCallback(() => {
        if (courseSectionId) {
            modalController.open('course-section-add-item', {
                courseSectionId,
            });
        }
    }, [courseSectionId]);

    const handleDeleteSection = useCallback(async () => {
        console.log(data, 'data inside handleDeleteSection');
        if (data.id) {
            setDeleteLoading(true);
            try {
                await axiosInstance.delete(`/course-sections/${data.id}/`);
                console.log('Section deleted successfully');
            } catch (error) {
                console.error('Error deleting section:', error);
            } finally {
                setDeleteLoading(false);
            }
        }
    }, [data.id]);

    const handleDeleteSectionClick = useCallback(() => {
        modalController.open('confirmation', {
            title: 'Delete Section',
            message: `Are you sure you want to delete the section "${data.title}"? This will permanently remove all resources and assignments in this section. This action cannot be undone.`,
            confirmText: 'Delete Section',
            cancelText: 'Cancel',
            confirmVariant: 'danger',
            onConfirm: handleDeleteSection,
            loading: deleteLoading,
        });
    }, [data.id, handleDeleteSection, deleteLoading]);

    console.log(data, 'data');

    return (
        <section
            className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm w-full max-w-full overflow-hidden"
            aria-labelledby="week-title"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2
                    id="week-title"
                    className="text-lg md:text-xl font-semibold text-gray-900"
                >
                    {data.title}
                </h2>

                <div className="flex items-center justify-center gap-2">
                    {isTeacher && (
                        <>
                            <button
                                onClick={handleAddItem}
                                className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                                title="Add Resource or Assignment"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                            <DeleteButton
                                onDelete={handleDeleteSectionClick}
                                itemName={data.title}
                                loading={deleteLoading}
                            />
                        </>
                    )}
                    <button
                        onClick={toggleExpanded}
                        onKeyDown={handleKeyDown}
                        className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                        aria-expanded={isExpanded}
                    >
                        <ChevronDown
                            className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : ''
                            }`}
                        />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div
                className={`overflow-x-hidden overflow-y-auto transition-all duration-300 ease-in-out ${
                    isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                {data.resources.length > 0 && (
                    <div className="space-y-0 w-full overflow-hidden">
                        {data.resources.map((item, index) => {

                            return (
                                <div key={item.id}>
                                    {index > 0 && (
                                        <div className="border-t border-gray-100" />
                                    )}
                                    <SharedLinkItem
                                        item={item}
                                        isTeacher={isTeacher}
                                        onFileView={handleFileView}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
                {data.assignments.length > 0 && (
                    <div className="space-y-0 w-full overflow-hidden">
                        {data.assignments.map((item, index) => (
                            <div key={item.id}>
                                {index > 0 && (
                                    <div className="border-t border-gray-100" />
                                )}
                                <TaskItem
                                    item={
                                        item as Extract<
                                            WeekItem,
                                            { kind: 'task' }
                                        >
                                    }
                                    isTeacher={isTeacher}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
