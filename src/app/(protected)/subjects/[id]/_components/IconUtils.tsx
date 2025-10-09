import Image from 'next/image';

export type IconType =
    | 'lesson_link'
    | 'document'
    | 'directory'
    | 'link'
    | 'text'
    | 'test'
    | 'video'
    | 'image'
    | 'recording'
    | 'file';

// Helper function to determine file type based on extension
function getFileTypeFromExtension(fileUrl: string): IconType {
    if (!fileUrl) return 'file';

    const extension = fileUrl.split('.').pop()?.toLowerCase();

    // Images
    if (
        ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(
            extension || ''
        )
    ) {
        return 'image';
    }

    // Videos
    if (
        ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(
            extension || ''
        )
    ) {
        return 'video';
    }

    // Documents
    if (
        [
            'pdf',
            'doc',
            'docx',
            'xls',
            'xlsx',
            'ppt',
            'pptx',
            'txt',
            'rtf',
        ].includes(extension || '')
    ) {
        return 'document';
    }

    // Audio
    if (['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(extension || '')) {
        return 'recording';
    }

    // Default to file
    return 'file';
}

export function getIconByType(
    type?: IconType,
    size: number = 32,
    file?: string
): React.ReactNode {
    if (!type) return null;

    const iconMap: Record<IconType, string> = {
        lesson_link: '/document-icons/lesson-link.png',
        document: '/document-icons/document.png',
        directory: '/document-icons/folder.png',
        link: '/document-icons/link.png',
        text: '/document-icons/info.png',
        test: '/document-icons/test.png',
        video: '/document-icons/video.png',
        image: '/document-icons/image.png',
        recording: '/document-icons/recording.png',
        file: '/document-icons/document.png',
    };

    const iconPath = iconMap[type];
    if (!iconPath) return null;

    return (
        <Image
            src={iconPath}
            alt={`${type} icon`}
            width={size}
            height={size}
            className="flex-shrink-0"
        />
    );
}
