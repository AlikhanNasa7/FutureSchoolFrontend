'use client';

import { Eye, Info } from 'lucide-react';
import { getIconByType, IconType } from './IconUtils';
import { DeleteButton } from './WeekMaterialsPanel.client';

interface SharedLinkItemProps {
    item: {
        id: string;
        file?: string;
        title: string;
        type: string;
    };
    isTeacher: boolean;
    onDelete?: (itemId: string) => void;
    onFileView?: (
        fileData: { file: string; title: string; type: string },
        title: string
    ) => void;
}

export function SharedLinkItem({
    item,
    isTeacher,
    onDelete,
    onFileView,
}: SharedLinkItemProps) {
    const isFile = item.type === 'file' && item.file;
    const isLink = item.type === 'link' && item.url;
    const isDirectory = item.type === 'directory';
    const isMeet = item.type === 'meet';
    const isDocument = item.type === 'document';
    const isTest = item.type === 'test';
    const isVideo = item.type === 'video';
    const isImage = item.type === 'image';
    const isRecording = item.type === 'recording';
    const isText = item.type === 'text';

    function handleClick() {
        if (isFile) {
            onFileView(
                {
                    file: item.file,
                    title: item.title,
                    type: item.type,
                },
                item.title
            );
        } else if (isLink) {
            window.open(item.url, '_blank');
        } else if (isDirectory) {
            router.push(`/subjects/${item.id}`);
        } else if (isMeet) {
            window.open(item.meet, '_blank');
        } else if (isDocument) {
            window.open(item.document, '_blank');
        } else if (isTest) {
            window.open(item.test, '_blank');
        } else if (isVideo) {
            window.open(item.video, '_blank');
        } else if (isImage) {
            window.open(item.image, '_blank');
        } else if (isRecording) {
            window.open(item.recording, '_blank');
        }
    }

    return (
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
                {isTeacher && onDelete && (
                    <DeleteButton
                        onDelete={() => onDelete(item.id)}
                        itemName={item.title}
                    />
                )}
            </div>
        </div>
    );
}
