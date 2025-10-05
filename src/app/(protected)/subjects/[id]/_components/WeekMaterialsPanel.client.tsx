'use client';

import { useState, useCallback } from 'react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import type { WeekMaterialsData, WeekItem } from './WeekMaterialsSection';
import { useUserState } from '@/contexts/UserContext';
import { modalController } from '@/lib/modalController';
import { SharedLinkItem } from './SharedLinkItem';
import Image from 'next/image';
import Link from 'next/link';
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

function getStatusText(item: WeekItem) {
    if (item.kind === 'task') {
        if (item.status === 'submitted') {
            return 'Сдано';
        } else if (item.status === 'in_progress') {
            return 'В процессе';
        } else {
            return 'Начать';
        }
    } else if (item.kind === 'test') {
        if (item.status === 'completed') {
            return 'Завершено';
        } else if (item.status === 'in_progress') {
            return 'В процессе';
        } else {
            return 'Начать';
        }
    }
    return 'Начать';
}

function handleFileView(
    fileData: { file: string; title: string; type: string; id?: string },
    filename: string,
    courseSectionId?: number
) {
    console.log(fileData, filename, 'fileData', 'filename');

    // Check if this is a directory
    if (fileData.type === 'directory') {
        console.log('Opening directory in modal:', { fileData, filename });

        // Import the handleFileView from SubjectOverviewPanel to use the directory logic
        import('./SubjectOverviewPanel.client').then(
            ({ handleFileView: handleFileViewFromOverview }) => {
                handleFileViewFromOverview(
                    {
                        file: fileData.file || '',
                        title: filename,
                        type: fileData.type || 'file',
                        id: fileData.id ? parseInt(fileData.id) : undefined,
                    },
                    filename,
                    courseSectionId
                );
            }
        );
    } else {
        // Regular file - open in file viewer
        const fileUrl = fileData.file;
        console.log('Opening file in modal:', { fileData, fileUrl, filename });

        modalController.open('file-viewer', {
            file: {
                url: fileUrl,
                title: filename,
                type: fileData.type,
            },
        });
    }
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
    console.log(item, 'item inside TaskItem');
    return (
        <div className="flex items-center justify-between gap-3 py-3">
            {/* Left side - Icon, label, and status */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex-shrink-0 flex items-center justify-center">
                    <Image
                        src={'/document-icons/assignment.png'}
                        alt={item.title}
                        width={32}
                        height={32}
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-900 truncate">
                            {item.title}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                    target="_blank"
                    href={`/assignments/${item.id}`}
                    className="px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-colors"
                >
                    {getStatusText(item)}
                </Link>

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

function TestItem({
    item,
    isTeacher,
    onDelete,
}: {
    item: Extract<WeekItem, { kind: 'test' }>;
    isTeacher: boolean;
    onDelete?: (itemId: string, itemType: 'resource' | 'test') => void;
}) {
    console.log(item, 'item inside TestItem');

    // Determine navigation path based on user role
    const testHref = isTeacher
        ? `/tests/${item.id}/results`
        : `/tests/${item.id}`;
    const buttonText = isTeacher ? 'Результаты' : 'Пройти тест';

    return (
        <div className="flex items-center justify-between gap-3 py-3">
            {/* Left side - Icon, label, and status */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex-shrink-0 flex items-center justify-center">
                    <Image
                        src={'/document-icons/test.png'}
                        alt={item.title}
                        width={32}
                        height={32}
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-900 truncate">
                            {item.title}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                    href={testHref}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                    {buttonText}
                </Link>

                {isTeacher && onDelete && (
                    <DeleteButton
                        onDelete={() => onDelete(item.id, 'test')}
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
                {data.tests.length > 0 && (
                    <div className="space-y-0 w-full overflow-hidden">
                        {data.tests.map((item, index) => {
                            return (
                                <div key={item.id}>
                                    {index > 0 && (
                                        <div className="border-t border-gray-100" />
                                    )}
                                    <TestItem
                                        item={
                                            item as Extract<
                                                WeekItem,
                                                { kind: 'test' }
                                            >
                                        }
                                        isTeacher={isTeacher}
                                        onDelete={undefined}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
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
                                        onFileView={(fileData, filename) =>
                                            handleFileView(
                                                fileData,
                                                filename,
                                                courseSectionId
                                            )
                                        }
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
                                    onDelete={undefined}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
