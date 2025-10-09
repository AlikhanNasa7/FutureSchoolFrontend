'use client';

import { getIconByType, IconType } from './IconUtils';
import { DeleteButton } from './WeekMaterialsPanel.client';
import { modalController } from '@/lib/modalController';
import axiosInstance from '@/lib/axios';
import Image from 'next/image';

interface SharedLinkItemProps {
    item: {
        id: string;
        file?: string;
        url?: string;
        lesson_link?: string;
        document?: string;
        test?: string;
        video?: string;
        image?: string;
        recording?: string;
        title: string;
        type?: string;
    };
    isTeacher: boolean;
    onFileView?: (
        fileData: { file: string; title: string; type: string; id?: string },
        title: string
    ) => void;
    onDelete?: (
        itemId: string,
        itemType: 'resource' | 'assignment' | 'test'
    ) => void;
}

export function SharedLinkItem({
    item,
    isTeacher,
    onFileView,
    onDelete,
}: SharedLinkItemProps) {
    const isLink = item.type === 'link' && item.url;
    const isDirectory = item.type === 'directory';
    const isLessonLink = item.type === 'lesson_link';
    const isDocument = item.type === 'document';
    const isTest = item.type === 'test';
    const isVideo = item.type === 'video';
    const isImage = item.type === 'image';
    const isRecording = item.type === 'recording';
    const isText = item.type === 'text';

    function handleDelete() {
        if (onDelete) {
            onDelete(item.id, 'resource');
        } else {
            // Fallback to old behavior if no onDelete prop
            modalController.open('confirmation', {
                title: 'Delete Confirmation',
                message: `Are you sure you want to delete "${item.title}"? This action cannot be undone.`,
                confirmText: 'Delete',
                cancelText: 'Cancel',
                confirmVariant: 'danger',
                onConfirm: async () => {
                    try {
                        await axiosInstance.delete(`/resources/${item.id}/`);
                        console.log('Resource deleted successfully');
                    } catch (error) {
                        console.error('Error deleting resource:', error);
                    }
                },
            });
        }
    }

    function handleClick() {
        console.log(item, 'item inside handleClick');
        if (item.file && onFileView) {
            onFileView(
                {
                    file: item.file,
                    title: item.title,
                    type: item.type || 'file',
                    id: item.id,
                },
                item.title
            );
        } else if ((isLink || isLessonLink) && item.url) {
            window.open(item.url, '_blank');
        } else if (isDirectory && onFileView) {
            onFileView(
                {
                    file: item.file || '',
                    title: item.title,
                    type: item.type || 'directory',
                    id: item.id,
                },
                item.title
            );
        }
    }

    return (
        <div className="p-2 w-full max-w-full">
            <div className="flex items-start gap-4 py-3 w-full max-w-full">
                <div className="flex-shrink-0 flex items-center justify-center">
                    {getIconByType(item.type as IconType, 32, item.file)}
                </div>

                <div className="flex-1 min-w-0 max-w-full overflow-hidden">
                    {!isText && (
                        <button
                            onClick={handleClick}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full text-left hover:shadow-sm block max-w-full"
                        >
                            <span className="block break-all">
                                {item.title}
                            </span>
                        </button>
                    )}
                    {isText && (
                        <span className="block break-all">{item.title}</span>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {isTeacher && (
                        <DeleteButton
                            onDelete={handleDelete}
                            itemName={item.title}
                        />
                    )}
                </div>
            </div>
            {isImage && (
                <Image
                    src={item.file || ''}
                    alt={item.title}
                    width={240}
                    height={180}
                />
            )}
        </div>
    );
}
