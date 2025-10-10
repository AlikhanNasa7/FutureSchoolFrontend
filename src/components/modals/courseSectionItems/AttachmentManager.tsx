'use client';

import { useLocale } from '@/contexts/LocaleContext';
import { AssignmentAttachment } from './types';

interface AttachmentManagerProps {
    attachments: AssignmentAttachment[];
    onChange: (attachments: AssignmentAttachment[]) => void;
    attemptedSubmit: boolean;
    onErrorClear: () => void;
}

export default function AttachmentManager({
    attachments,
    onChange,
    attemptedSubmit,
    onErrorClear,
}: AttachmentManagerProps) {
    const { t } = useLocale();

    const handleAddAttachment = () => {
        onChange([
            ...attachments,
            {
                type: 'file',
                title: '',
                file: null,
                file_url: '',
            },
        ]);
    };

    const handleRemoveAttachment = (index: number) => {
        onChange(attachments.filter((_, i) => i !== index));
    };

    const handleUpdateAttachment = (
        index: number,
        updates: Partial<AssignmentAttachment>
    ) => {
        const newAttachments = [...attachments];
        newAttachments[index] = { ...newAttachments[index], ...updates };
        onChange(newAttachments);
    };

    const handleTypeChange = (index: number, type: 'file' | 'link') => {
        handleUpdateAttachment(index, {
            type,
            file: null,
            file_url: '',
        });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        {t('courseSectionModal.attachments')}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                        {t('courseSectionModal.attachmentRequirement')}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleAddAttachment}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                    {t('courseSectionModal.addAttachment')}
                </button>
            </div>

            {attachments.length > 0 && (
                <div className="space-y-3">
                    {attachments.map((attachment, index) => (
                        <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-3 space-y-2"
                        >
                            {/* Header: Type selector and Remove button */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <select
                                        value={attachment.type}
                                        onChange={e =>
                                            handleTypeChange(
                                                index,
                                                e.target.value as
                                                    | 'file'
                                                    | 'link'
                                            )
                                        }
                                        className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="file">
                                            {t('courseSectionModal.file')}
                                        </option>
                                        <option value="link">
                                            {t('courseSectionModal.link')}
                                        </option>
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleRemoveAttachment(index)
                                    }
                                    className="text-red-500 hover:text-red-700 text-sm"
                                >
                                    {t('courseSectionModal.remove')}
                                </button>
                            </div>

                            {/* Title input */}
                            <input
                                type="text"
                                value={attachment.title}
                                onChange={e => {
                                    handleUpdateAttachment(index, {
                                        title: e.target.value,
                                    });
                                    onErrorClear();
                                }}
                                placeholder={t(
                                    'courseSectionModal.attachmentTitle'
                                )}
                                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
                                    attemptedSubmit && !attachment.title?.trim()
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            />

                            {/* File or URL input based on type */}
                            {attachment.type === 'file' ? (
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">
                                        {t('courseSectionModal.selectFile')}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md border border-blue-200 hover:bg-blue-100 transition-colors text-sm font-medium">
                                            <input
                                                type="file"
                                                onChange={e => {
                                                    handleUpdateAttachment(
                                                        index,
                                                        {
                                                            file:
                                                                e.target
                                                                    .files?.[0] ||
                                                                null,
                                                        }
                                                    );
                                                    onErrorClear();
                                                }}
                                                className="hidden"
                                            />
                                            {t('courseSectionModal.chooseFile')}
                                        </label>
                                        <span className="text-sm text-gray-600">
                                            {attachment.file
                                                ? attachment.file.name
                                                : t(
                                                      'courseSectionModal.noFileChosen'
                                                  )}
                                        </span>
                                    </div>
                                    {attemptedSubmit && !attachment.file && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {t(
                                                'courseSectionModal.noFileSelected'
                                            )}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">
                                        {t('courseSectionModal.urlLabel')}
                                    </label>
                                    <input
                                        type="url"
                                        value={attachment.file_url || ''}
                                        onChange={e => {
                                            handleUpdateAttachment(index, {
                                                file_url: e.target.value,
                                            });
                                            onErrorClear();
                                        }}
                                        placeholder={t(
                                            'courseSectionModal.urlPlaceholder'
                                        )}
                                        className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
                                            attemptedSubmit &&
                                            !attachment.file_url?.trim()
                                                ? 'border-red-300 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    />
                                    {attemptedSubmit &&
                                        !attachment.file_url?.trim() && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {t(
                                                    'courseSectionModal.urlRequired'
                                                )}
                                            </p>
                                        )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
