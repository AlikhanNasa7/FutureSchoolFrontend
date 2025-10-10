'use client';

import { useState } from 'react';
import { Download, FileText, Folder, Plus, X, FolderOpen } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useUserState } from '@/contexts/UserContext';
import { useLocale } from '@/contexts/LocaleContext';

interface DirectoryFile {
    id: number;
    title: string;
    type: string;
    file_url?: string;
    file?: string;
    size?: number;
    is_directory?: boolean;
}

interface DirectoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    directory: {
        title: string;
        files: DirectoryFile[];
        parent_id?: number;
    };
    onFileClick?: (file: DirectoryFile) => void;
    onAddFile?: (parentId: number) => void;
    onDownloadFolder?: () => void;
}

export default function DirectoryModal({
    isOpen,
    onClose,
    directory,
    onFileClick,
    onAddFile,
    onDownloadFolder,
}: DirectoryModalProps) {
    const { user } = useUserState();
    const { t } = useLocale();
    const [isDownloading, setIsDownloading] = useState(false);

    const handleFileClick = (file: DirectoryFile) => {
        if (file.is_directory) {
            // Handle directory click - could open subdirectory
            console.log('Directory clicked:', file);
        } else {
            // Handle file click
            if (onFileClick) {
                onFileClick(file);
            }
        }
    };

    const handleDownloadFile = async (file: DirectoryFile) => {
        if (!file.file_url && !file.file) return;

        setIsDownloading(true);
        try {
            const fileUrl = file.file_url || file.file || '';
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = file.title;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback: direct download
            const fileUrl = file.file_url || file.file || '';
            window.open(fileUrl, '_blank');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadFolder = async () => {
        if (onDownloadFolder) {
            onDownloadFolder();
        }
    };

    const getFileIcon = (file: DirectoryFile) => {
        if (file.is_directory) {
            return <FolderOpen className="w-5 h-5 text-blue-500" />;
        }

        const extension = file.title.split('.').pop()?.toLowerCase();
        if (
            ['jpg', 'jpeg', 'png', 'gif', 'webm', 'svg', 'bmp'].includes(
                extension || ''
            )
        ) {
            return <FileText className="w-5 h-5 text-green-500" />;
        }
        if (extension === 'pdf') {
            return <FileText className="w-5 h-5 text-red-500" />;
        }
        return <FileText className="w-5 h-5 text-gray-500" />;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={directory.title}
            maxWidth="max-w-2xl"
        >
            <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Folder className="w-6 h-6 text-green-500" />
                    <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                            {directory.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {directory.files.length === 1
                                ? t('modals.directory.filesCount', {
                                      count: directory.files.length,
                                  })
                                : t('modals.directory.filesCountPlural', {
                                      count: directory.files.length,
                                  })}
                        </p>
                    </div>
                    {user?.role === 'teacher' && (
                        <button
                            onClick={() =>
                                onAddFile && onAddFile(directory.parent_id || 0)
                            }
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            {t('modals.directory.addFile')}
                        </button>
                    )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {directory.files.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Folder className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>{t('modals.directory.emptyFolder')}</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {directory.files.map((file, index) => (
                                <div
                                    key={file.id}
                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                                >
                                    {/* Vertical line for hierarchy */}
                                    {index === 0 && (
                                        <div className="absolute left-8 top-16 bottom-0 w-px bg-gray-200" />
                                    )}

                                    <div className="flex items-center gap-3 flex-1">
                                        {getFileIcon(file)}
                                        <button
                                            onClick={() =>
                                                handleFileClick(file)
                                            }
                                            className="text-blue-600 hover:text-blue-700 hover:underline text-left"
                                        >
                                            {file.title}
                                        </button>
                                    </div>

                                    {(file.file_url || file.file) && (
                                        <button
                                            onClick={() =>
                                                handleDownloadFile(file)
                                            }
                                            disabled={isDownloading}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-gray-700 transition-all"
                                            title={t(
                                                'modals.directory.downloadFile'
                                            )}
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {directory.files.length > 0 && (
                    <div className="flex justify-end pt-4 border-t">
                        <button
                            onClick={handleDownloadFolder}
                            disabled={isDownloading}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                        >
                            {isDownloading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            {t('modals.directory.downloadFolder')}
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
}
