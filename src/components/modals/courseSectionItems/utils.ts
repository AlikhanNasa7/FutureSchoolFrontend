import { AssignmentAttachment, ResourceType } from './types';

export const fileTypes: ResourceType[] = [
    'image',
    'video',
    'file',
    'directory',
];

/**
 * Get accepted file types for file input based on resource type
 */
export function getFileAcceptTypes(type: ResourceType): string {
    switch (type) {
        case 'image':
            return 'image/*';
        case 'video':
            return 'video/*';
        case 'file':
            return '*/*';
        case 'directory':
            return '*/*';
        case 'document':
            return '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf';
        default:
            return '*/*';
    }
}

/**
 * Validate if an attachment has all required fields
 */
export function isAttachmentValid(attachment: AssignmentAttachment): boolean {
    if (!attachment.title?.trim()) {
        return false;
    }

    if (attachment.type === 'file') {
        return !!attachment.file;
    }

    if (attachment.type === 'link') {
        return !!attachment.file_url?.trim();
    }

    return false;
}
