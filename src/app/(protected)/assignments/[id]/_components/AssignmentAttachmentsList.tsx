'use client';

import { FileText } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { AssignmentAttachment } from './types';

interface AssignmentAttachmentsListProps {
    attachments: AssignmentAttachment[];
    file?: string;
    onFileView: (
        attachment: { file: string; title: string; type: string },
        fileUrl: string
    ) => void;
}

export default function AssignmentAttachmentsList({
    attachments,
    file,
    onFileView,
}: AssignmentAttachmentsListProps) {
    const { t } = useLocale();

    const hasContent = file || (attachments && attachments.length > 0);

    if (!hasContent) return null;

    return (
        <div>
            {file && (
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="text-gray-500" />
                    <button
                        onClick={() =>
                            onFileView(
                                {
                                    file: file,
                                    title: file,
                                    type: 'file',
                                },
                                file
                            )
                        }
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 inline-flex items-center gap-2 w-full max-w-full text-left hover:shadow-sm"
                    >
                        <span className="truncate block w-full max-w-full overflow-hidden">
                            {file.length > 60
                                ? file.slice(0, 60) + '...'
                                : file}
                        </span>
                    </button>
                </div>
            )}

            {attachments && attachments.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-md font-semibold text-gray-900 mb-3">
                        {t('assignmentPage.attachments')}
                    </h3>
                    <div className="space-y-2">
                        {attachments.map(attachment => (
                            <div
                                key={attachment.id}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                            >
                                <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">
                                        {attachment.title}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {attachment.type === 'file'
                                            ? t('assignmentPage.fileType')
                                            : t('assignmentPage.linkType')}
                                    </p>
                                </div>
                                {attachment.type === 'file' &&
                                attachment.file ? (
                                    <button
                                        onClick={() =>
                                            onFileView(
                                                {
                                                    file: attachment.file,
                                                    title: attachment.title,
                                                    type: 'file',
                                                },
                                                attachment.file
                                            )
                                        }
                                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    >
                                        {t('assignmentPage.open')}
                                    </button>
                                ) : attachment.type === 'link' &&
                                  attachment.file_url ? (
                                    <a
                                        href={attachment.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    >
                                        {t('assignmentPage.open')}
                                    </a>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
