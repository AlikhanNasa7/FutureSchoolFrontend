'use client';

import { useState, useCallback } from 'react';
import { ChevronDown, Info, Plus, MessageCircle } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import type { SubjectOverviewData } from './SubjectOverviewCard';
import { useUserState } from '@/contexts/UserContext';
import { modalController } from '@/lib/modalController';
import { SharedLinkItem } from './SharedLinkItem';
import axiosInstance from '@/lib/axios';
import { useLocale } from '@/contexts/LocaleContext';

interface SubjectOverviewPanelProps {
    data: SubjectOverviewData;
    courseSectionId?: number;
    onRefresh?: () => void;
}

export function handleFileView(
    fileData: {
        file: string;
        title: string;
        type: string;
        id?: number | string;
    },
    filename: string,
    courseSectionId?: number
) {
    console.log(fileData, filename, 'fileData', 'filename');

    // Check if this is a directory
    if (fileData.type === 'directory') {
        console.log('Opening directory in modal:', { fileData, filename });

        // Fetch directory contents from API
        const resourceId =
            typeof fileData.id === 'string'
                ? parseInt(fileData.id)
                : fileData.id || 0;
        fetchDirectoryContents(resourceId, filename, courseSectionId);
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

async function fetchDirectoryContents(
    resourceId: number,
    directoryTitle: string,
    courseSectionId?: number
) {
    // Validate resourceId
    if (!resourceId || resourceId === 0) {
        console.error('Invalid resource ID for directory:', resourceId);
        modalController.open('directory-viewer', {
            directory: {
                title: directoryTitle,
                files: [],
                parent_id: resourceId,
            },
            onFileClick: (file: {
                id: number;
                title: string;
                type: string;
                file_url?: string;
                file?: string;
                is_directory?: boolean;
            }) => {
                handleFileView(
                    {
                        file: file.file_url || file.file || '',
                        title: file.title,
                        type: file.is_directory ? 'directory' : 'file',
                        id: file.id,
                    },
                    file.title
                );
            },
            onAddFile: (parentId: number) => {
                console.log('Add file to directory:', parentId);
            },
            onDownloadFolder: () => {
                console.log('Download entire folder');
            },
        });
        return;
    }

    try {
        const response = await axiosInstance.get(`/resources/${resourceId}/`);
        const resource = response.data;

        // Transform children data to match DirectoryModal format
        const files =
            resource.children?.map(
                (child: {
                    id: number;
                    title: string;
                    type: string;
                    file?: string;
                    size?: number;
                }) => ({
                    id: child.id,
                    title: child.title,
                    type: child.type,
                    file_url: child.file,
                    file: child.file,
                    size: child.size,
                    is_directory: child.type === 'directory',
                })
            ) || [];

        const directoryData = {
            title: directoryTitle,
            files: files,
            parent_id: resourceId,
        };

        modalController.open('directory-viewer', {
            directory: directoryData,
            onFileClick: (file: {
                id: number;
                title: string;
                type: string;
                file_url?: string;
                file?: string;
                is_directory?: boolean;
            }) => {
                // Handle individual file clicks within directory
                handleFileView(
                    {
                        file: file.file_url || file.file || '',
                        title: file.title,
                        type: file.is_directory ? 'directory' : 'file',
                        id: file.id,
                    },
                    file.title,
                    courseSectionId
                );
            },
            onAddFile: (parentId: number) => {
                console.log('Add file to directory:', parentId);
                if (courseSectionId) {
                    handleAddFileToDirectory(
                        parentId,
                        directoryTitle,
                        courseSectionId,
                        () => {
                            // Refresh directory contents after adding files
                            fetchDirectoryContents(
                                resourceId,
                                directoryTitle,
                                courseSectionId
                            );
                        }
                    );
                }
            },
            onDownloadFolder: () => {
                console.log('Download entire folder');
                handleDownloadFolder(resourceId, directoryTitle);
            },
        });
    } catch (error) {
        console.error('Error fetching directory contents:', error);
        // Fallback to empty directory
        modalController.open('directory-viewer', {
            directory: {
                title: directoryTitle,
                files: [],
                parent_id: resourceId,
            },
            onFileClick: (file: {
                id: number;
                title: string;
                type: string;
                file_url?: string;
                file?: string;
                is_directory?: boolean;
            }) => {
                handleFileView(
                    {
                        file: file.file_url || file.file || '',
                        title: file.title,
                        type: file.is_directory ? 'directory' : 'file',
                        id: file.id,
                    },
                    file.title,
                    courseSectionId
                );
            },
            onAddFile: (parentId: number) => {
                console.log('Add file to directory:', parentId);
                if (courseSectionId) {
                    handleAddFileToDirectory(
                        parentId,
                        directoryTitle,
                        courseSectionId,
                        () => {
                            // Refresh directory contents after adding files
                            fetchDirectoryContents(
                                resourceId,
                                directoryTitle,
                                courseSectionId
                            );
                        }
                    );
                }
            },
            onDownloadFolder: () => {
                console.log('Download entire folder');
                handleDownloadFolder(resourceId, directoryTitle);
            },
        });
    }
}

export function handleDirectoryView(
    directoryData: {
        title: string;
        files: Array<{
            id: number;
            title: string;
            type: string;
            file_url?: string;
            file?: string;
            size?: number;
            is_directory?: boolean;
        }>;
        parent_id?: number;
    },
    onFileClick?: (file: {
        id: number;
        title: string;
        type: string;
        file_url?: string;
        file?: string;
        is_directory?: boolean;
    }) => void,
    onAddFile?: (parentId: number) => void,
    onDownloadFolder?: () => void
) {
    console.log('Opening directory in modal:', directoryData);

    modalController.open('directory-viewer', {
        directory: directoryData,
        onFileClick,
        onAddFile,
        onDownloadFolder,
    });
}

export function handleAddFileToDirectory(
    directoryId: number,
    directoryTitle: string,
    courseSectionId: number,
    onSuccess?: () => void
) {
    console.log('Opening add file to directory modal:', {
        directoryId,
        directoryTitle,
        courseSectionId,
    });

    modalController.open('add-file-to-directory', {
        directoryId,
        directoryTitle,
        courseSectionId,
        onSuccess,
    });
}

export async function handleDownloadFolder(
    directoryId: number,
    directoryTitle: string
) {
    console.log('Downloading folder as ZIP:', { directoryId, directoryTitle });

    try {
        const { default: axiosInstance } = await import('@/lib/axios');

        // Make request to download ZIP
        const response = await axiosInstance.get(
            `/resources/${directoryId}/download-zip/`,
            {
                responseType: 'blob', // Important for binary data
            }
        );

        // Create blob URL and trigger download
        const blob = new Blob([response.data], { type: 'application/zip' });
        const url = window.URL.createObjectURL(blob);

        // Create temporary link element to trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = `${directoryTitle}.zip`;
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log('Folder download completed successfully');
    } catch (error) {
        console.error('Error downloading folder:', error);

        // Show user-friendly error message
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'Failed to download folder';
        alert(`Error downloading folder: ${errorMessage}`);
    }
}

export default function SubjectOverviewPanel({
    data,
    courseSectionId,
    onRefresh,
}: SubjectOverviewPanelProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const { user } = useUserState();
    const router = useRouter();
    const params = useParams();
    const { t } = useLocale();
    const isTeacher = user?.role === 'teacher';
    const subjectId = params?.id as string;

    const handleForumClick = () => {
        router.push(`/subjects/${subjectId}/qa`);
    };

    const toggleExpanded = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

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
                    console.log(
                        `${itemType} created in overview, refreshing...`
                    );
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
                    ? 'задание'
                    : itemType === 'test'
                      ? 'тест'
                      : 'ресурс';

            modalController.open('confirmation', {
                title: 'Подтверждение удаления',
                message: `Вы уверены, что хотите удалить этот ${itemTypeLabel}? Это действие нельзя отменить.`,
                confirmText: 'Удалить',
                cancelText: 'Отмена',
                confirmVariant: 'danger',
                onConfirm: async () => {
                    const endpoint =
                        itemType === 'assignment'
                            ? `/assignments/${itemId}/`
                            : itemType === 'test'
                              ? `/tests/${itemId}/`
                              : `/resources/${itemId}/`;
                    await axiosInstance.delete(endpoint);
                    console.log(
                        `${itemType} deleted successfully from overview`
                    );
                },
                onSuccess: () => {
                    console.log(
                        `${itemType} deleted from overview, refreshing...`
                    );
                    onRefresh?.();
                },
            });
        },
        [onRefresh]
    );

    console.log(data, 'data');

    return (
        <section
            className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm w-full max-w-full overflow-hidden"
            aria-labelledby="subject-overview-title"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2
                    id="subject-overview-title"
                    className="text-lg md:text-xl font-semibold text-gray-900"
                >
                    {data.title}
                </h2>

                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={handleForumClick}
                        className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                        title={t('qa.title')}
                    >
                        <MessageCircle className="w-5 h-5 text-purple-600" />
                    </button>
                    {isTeacher && (
                        <button
                            onClick={handleAddItem}
                            className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                            title="Add Resource or Assignment"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={toggleExpanded}
                        onKeyDown={handleKeyDown}
                        className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? 'Hide' : 'Show'}
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
                {/* Description */}
                {data.description && (
                    <div className="flex items-start gap-3 mb-4 w-full overflow-hidden">
                        <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm md:text-base text-gray-700 leading-relaxed break-words min-w-0 flex-1">
                            {data.description}
                        </p>
                    </div>
                )}

                {data.resources && data.resources.length > 0 && (
                    <div className="space-y-0 w-full overflow-hidden">
                        {data.resources.map((resource, index) => (
                            <div key={resource.id}>
                                {index > 0 && (
                                    <div className="border-t border-gray-100" />
                                )}
                                <SharedLinkItem
                                    item={resource}
                                    isTeacher={isTeacher}
                                    onFileView={(fileData, filename) =>
                                        handleFileView(
                                            fileData,
                                            filename,
                                            courseSectionId
                                        )
                                    }
                                    onDelete={handleDeleteItem}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
