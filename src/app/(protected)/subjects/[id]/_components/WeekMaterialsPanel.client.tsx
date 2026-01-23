'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import type { WeekMaterialsData, WeekItem } from './WeekMaterialsSection';
import { useUserState, useUser } from '@/contexts/UserContext';
import { modalController } from '@/lib/modalController';
import { SharedLinkItem } from './SharedLinkItem';
import Image from 'next/image';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import { useLocale } from '@/contexts/LocaleContext';
import TemplateLinkIndicator from '@/components/courseTemplates/TemplateLinkIndicator';
import { assignmentService } from '@/services/assignmentService';
interface WeekMaterialsPanelProps {
    data: WeekMaterialsData;
    courseSectionId?: number;
    onRefresh?: () => void;
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

function getStatusText(
    item: WeekItem,
    isTeacher: boolean,
    t: (key: string) => string
) {
    // For teachers and admins, always show "View Answers"
    if (isTeacher) {
        return t('status.viewAnswers');
    }

    // Debug: Log the actual boolean properties
    console.log(
        'getStatusText - item:',
        item,
        'is_available:',
        'is_available' in item ? item.is_available : 'no is_available',
        'is_deadline_passed:',
        'is_deadline_passed' in item
            ? item.is_deadline_passed
            : 'no is_deadline_passed',
        'is_submitted:',
        'is_submitted' in item ? item.is_submitted : 'no is_submitted',
        'kind:',
        item.kind
    );

    // For students, show status-based text using boolean properties
    if (item.kind === 'task') {
        const isSubmitted = 'is_submitted' in item ? item.is_submitted : false;
        const isDeadlinePassed =
            'is_deadline_passed' in item ? item.is_deadline_passed : false;
        const isAvailable = 'is_available' in item ? item.is_available : false;

        if (isSubmitted) {
            const studentSubmission = item.student_submission;
            const gradeValue =
                studentSubmission && 'grade_value' in studentSubmission
                    ? studentSubmission.grade_value
                    : null;
            const maxGrade = 'max_grade' in item ? item.max_grade : null;

            if (gradeValue !== null && maxGrade !== null) {
                return `${t('status.submitted')} (${gradeValue}/${maxGrade})`;
            }
            return t('status.submitted');
        } else if (isDeadlinePassed && !isSubmitted) {
            return t('status.overdue');
        } else if (isAvailable) {
            return t('status.start');
        } else {
            return t('status.unavailable');
        }
    } else if (item.kind === 'test') {
        const isSubmitted = 'is_submitted' in item ? item.is_submitted : false;
        const isDeadlinePassed =
            'is_deadline_passed' in item ? item.is_deadline_passed : false;
        const isAvailable = 'is_available' in item ? item.is_available : false;

        if (isSubmitted) {
            return t('status.completed');
        } else if (isDeadlinePassed && !isSubmitted) {
            return t('status.overdue');
        } else if (isAvailable) {
            return t('status.start');
        } else {
            return t('status.unavailable');
        }
    }
    return t('status.start');
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
    onRefresh,
    t,
}: {
    item: Extract<WeekItem, { kind: 'task' }>;
    isTeacher: boolean;
    onDelete?: (itemId: string, itemType: 'resource' | 'assignment') => void;
    onRefresh?: () => void;
    t: (key: string) => string;
}) {
    const { state } = useUser();
    const isAdmin = state.user?.role === 'superadmin' || state.user?.role === 'schooladmin';
    const [syncStatus, setSyncStatus] = useState<{
        isOutdated: boolean;
        isLoading: boolean;
    }>({ isOutdated: false, isLoading: false });

    // Load sync status for teachers and admins
    useEffect(() => {
        if ((isTeacher || isAdmin) && item.template_assignment && !item.is_unlinked_from_template) {
            setSyncStatus({ isOutdated: false, isLoading: true });
            assignmentService
                .getSyncStatus(Number(item.id))
                .then((status) => {
                    setSyncStatus({ isOutdated: status.is_outdated, isLoading: false });
                })
                .catch((error) => {
                    console.error('Error loading sync status:', error);
                    setSyncStatus({ isOutdated: false, isLoading: false });
                });
        }
    }, [isTeacher, isAdmin, item.id, item.template_assignment, item.is_unlinked_from_template]);
    console.log(
        'TaskItem - item:',
        item,
        'is_available:',
        'is_available' in item ? item.is_available : 'no is_available',
        'is_deadline_passed:',
        'is_deadline_passed' in item
            ? item.is_deadline_passed
            : 'no is_deadline_passed',
        'is_submitted:',
        'is_submitted' in item ? item.is_submitted : 'no is_submitted',
        'isTeacher:',
        isTeacher
    );

    const getButtonStyling = () => {
        if (isTeacher) {
            return 'px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-colors';
        }

        const isSubmitted = 'is_submitted' in item ? item.is_submitted : false;
        if (isSubmitted) {
            return 'px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors';
        }

        return 'px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-colors';
    };

    async function handleUnlink() {
        if (!item.template_assignment || item.is_unlinked_from_template) {
            return;
        }

        modalController.open('confirmation', {
            title: 'Отвязать от шаблона',
            message: `Вы уверены, что хотите отвязать "${item.title}" от шаблона? После отвязки это задание больше не будет автоматически синхронизироваться с шаблоном.`,
            confirmText: 'Отвязать',
            cancelText: 'Отмена',
            confirmVariant: 'warning',
            onConfirm: async () => {
                try {
                    await assignmentService.unlinkFromTemplate(Number(item.id));
                    setSyncStatus({ isOutdated: false, isLoading: false });
                    onRefresh?.();
                } catch (error: any) {
                    console.error('Error unlinking assignment:', error);
                    const errorMessage = error?.formattedMessage || 'Не удалось отвязать задание от шаблона';
                    alert(errorMessage);
                }
            },
        });
    }

    async function handleRelink() {
        if (!item.template_assignment || !item.is_unlinked_from_template) {
            return;
        }

        modalController.open('confirmation', {
            title: 'Привязать к шаблону',
            message: `Вы уверены, что хотите привязать "${item.title}" к шаблону? После привязки это задание будет автоматически синхронизироваться с шаблоном при следующей синхронизации.`,
            confirmText: 'Привязать',
            cancelText: 'Отмена',
            confirmVariant: 'default',
            onConfirm: async () => {
                try {
                    await assignmentService.relinkToTemplate(Number(item.id));
                    // Reload sync status after relinking
                    if (isTeacher || isAdmin) {
                        const status = await assignmentService.getSyncStatus(Number(item.id));
                        setSyncStatus({ isOutdated: status.is_outdated, isLoading: false });
                    }
                    onRefresh?.();
                } catch (error: any) {
                    console.error('Error relinking assignment:', error);
                    const errorMessage = error?.formattedMessage || 'Не удалось привязать задание к шаблону';
                    alert(errorMessage);
                }
            },
        });
    }

    return (
        <div className="flex items-center justify-between gap-3 p-2">
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
                    <div className="flex flex-col gap-1">
                        <span className="text-gray-900 truncate">
                            {item.title}
                        </span>
                        {(isTeacher || isAdmin) && (
                            <TemplateLinkIndicator
                                isLinked={!!item.template_assignment}
                                isUnlinked={!!item.is_unlinked_from_template}
                                isOutdated={syncStatus.isOutdated}
                                onUnlink={handleUnlink}
                                onRelink={handleRelink}
                                showButton={!!item.template_assignment}
                                type="assignment"
                                itemId={Number(item.id)}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                    target="_blank"
                    href={`/assignments/${item.id}`}
                    className={getButtonStyling()}
                >
                    {getStatusText(item, isTeacher, t)}
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
    t,
}: {
    item: Extract<WeekItem, { kind: 'test' }>;
    isTeacher: boolean;
    onDelete?: (itemId: string, itemType: 'resource' | 'test') => void;
    t: (key: string) => string;
}) {
    console.log(
        'TestItem - item:',
        item,
        'is_available:',
        'is_available' in item ? item.is_available : 'no is_available',
        'is_deadline_passed:',
        'is_deadline_passed' in item
            ? item.is_deadline_passed
            : 'no is_deadline_passed',
        'is_submitted:',
        'is_submitted' in item ? item.is_submitted : 'no is_submitted',
        'isTeacher:',
        isTeacher
    );

    const testHref = isTeacher
        ? `/tests/${item.id}/results`
        : `/tests/${item.id}`;
    const buttonText = isTeacher
        ? t('status.viewAnswers')
        : getStatusText(item, isTeacher, t);

    return (
        <div className="flex items-start justify-between gap-3 p-2 flex-col xs:flex-row xs:items-center">
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

                <div className="flex-1 min-w-0 px-2 py-1">
                    <span className="text-gray-900 truncate">{item.title}</span>
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
    onRefresh,
}: WeekMaterialsPanelProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const { user } = useUserState();
    const { t } = useLocale();
    const isTeacher =
        user?.role === 'teacher' ||
        user?.role === 'superadmin' ||
        user?.role === 'schooladmin';

    const toggleExpanded = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    console.log(data, 'data');
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (data.is_current && sectionRef.current) {
            sectionRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [data.is_current]);

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
                onItemCreated: (
                    itemType: 'resource' | 'assignment' | 'test'
                ) => {
                    console.log(`${itemType} created, refreshing...`);
                    onRefresh?.();
                },
            });
        }
    }, [courseSectionId, onRefresh]);

    const handleDeleteItem = useCallback(
        async (
            itemId: string,
            itemType: 'resource' | 'assignment' | 'test'
        ) => {
            const itemTypeLabel =
                itemType === 'assignment'
                    ? t('common.assignment')
                    : itemType === 'test'
                      ? t('common.testItem')
                      : t('common.resource');

            modalController.open('confirmation', {
                title: t('modal.deleteConfirmation'),
                message: `${t('modal.deleteMessage')} ${itemTypeLabel}? ${t('modal.cannotUndo')}`,
                confirmText: t('actions.delete'),
                cancelText: t('actions.cancel'),
                confirmVariant: 'danger',
                onConfirm: async () => {
                    const endpoint =
                        itemType === 'assignment'
                            ? `/assignments/${itemId}/`
                            : itemType === 'test'
                              ? `/tests/${itemId}/`
                              : `/resources/${itemId}/`;
                    await axiosInstance.delete(endpoint);
                    console.log(`${itemType} deleted successfully`);
                },
                onSuccess: () => {
                    console.log(`${itemType} deleted, refreshing...`);
                    onRefresh?.();
                },
            });
        },
        [onRefresh, t]
    );

    console.log('WeekMaterialsPanel data:', data);
    console.log('Data structure:', JSON.stringify(data, null, 2));
    console.log('Assignments:', data.assignments);
    console.log('Tests:', data.tests);
    console.log('Resources:', data.resources);

    // Check if data has the expected structure
    if (data.assignments && data.assignments.length > 0) {
        console.log('First assignment:', data.assignments[0]);
        console.log('Assignment keys:', Object.keys(data.assignments[0]));
    }
    if (data.tests && data.tests.length > 0) {
        console.log('First test:', data.tests[0]);
        console.log('Test keys:', Object.keys(data.tests[0]));
    }

    return (
        <section
            ref={sectionRef}
            className="relative rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm w-full max-w-full overflow-hidden"
            aria-labelledby="week-title"
        >
            {data.is_current && (
                <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            )}
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
                className={`overflow-x-hidden transition-all duration-300 ease-in-out ${
                    isExpanded
                        ? 'max-h-[720px] opacity-100'
                        : 'max-h-0 opacity-0'
                }`}
            >
                {data.tests && data.tests.length > 0 && (
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
                                        onDelete={handleDeleteItem}
                                        t={t}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
                {data.resources && data.resources.length > 0 && (
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
                                        onDelete={handleDeleteItem}
                                        onRefresh={onRefresh}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
                {data.assignments && data.assignments.length > 0 && (
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
                                    onDelete={handleDeleteItem}
                                    onRefresh={onRefresh}
                                    t={t}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
