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
        meet?: string;
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
}

export function SharedLinkItem({
    item,
    isTeacher,
    onFileView,
}: SharedLinkItemProps) {
    const isLink = item.type === 'link' && item.url;
    const isDirectory = item.type === 'directory';
    const isMeet = item.type === 'meet';
    const isDocument = item.type === 'document';
    const isTest = item.type === 'test';
    const isVideo = item.type === 'video';
    const isImage = item.type === 'image';
    const isRecording = item.type === 'recording';
    const isText = item.type === 'text';

    function handleDelete() {
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
        } else if (isLink && item.url) {
            window.open(item.url, '_blank');
        } else if (isDirectory && onFileView) {
            // Open directory in modal
            onFileView(
                {
                    file: item.file || '',
                    title: item.title,
                    type: item.type || 'directory',
                    id: item.id,
                },
                item.title
            );
        } else if (isMeet && item.meet) {
            window.open(item.meet, '_blank');
        } else if (isDocument && item.document) {
            window.open(item.document, '_blank');
        } else if (isTest && item.test) {
            window.open(item.test, '_blank');
        } else if (isVideo && item.video) {
            window.open(item.video, '_blank');
        } else if (isImage && item.image) {
            window.open(item.image, '_blank');
        } else if (isRecording && item.recording) {
            window.open(item.recording, '_blank');
        }
    }

    return (
        <div className="p-2">
            <div className="flex items-center gap-4 py-3 w-full overflow-hidden">
                <div className="flex-shrink-0 flex items-center justify-center">
                    {getIconByType(item.type as IconType, 32, item.file)}
                </div>

                <div className="flex-1 min-w-0 overflow-hidden">
                    {!isText && (
                        <button
                            onClick={handleClick}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 inline-flex items-center gap-2 w-full max-w-full text-left hover:shadow-sm"
                        >
                            <span className="truncate block w-full max-w-full overflow-hidden">
                                {item.title}
                            </span>
                        </button>
                    )}
                    {isText && (
                        <span className="truncate block w-full max-w-full overflow-hidden">
                            {item.title}
                        </span>
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
