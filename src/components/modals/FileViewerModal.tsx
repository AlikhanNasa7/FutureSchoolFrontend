'use client';

import { useState } from 'react';
import {
    Download,
    ExternalLink,
    FileText,
    Image as ImageIcon,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Image from 'next/image';

interface FileViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: {
        url: string;
        title: string;
        type?: string;
        size?: number;
    };
}

export default function FileViewerModal({
    isOpen,
    onClose,
    file,
}: FileViewerModalProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch(file.url);
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
            const link = document.createElement('a');
            link.href = file.url;
            link.download = file.title;
            link.click();
        } finally {
            setIsDownloading(false);
        }
    };

    const handleOpenInNewTab = () => {
        window.open(file.url, '_blank', 'noopener,noreferrer');
    };

    const getFileType = () => {
        const extension = file.url.split('.').pop()?.toLowerCase();
        return extension || 'unknown';
    };

    const fileType = getFileType();
    const isImage = [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'webp',
        'svg',
        'bmp',
    ].includes(fileType);
    const isPdf = fileType === 'pdf';
    const isVideo = ['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(fileType);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={file?.title || 'Document Viewer'}
            maxWidth="max-w-4xl"
        >
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                        {isImage ? (
                            <ImageIcon className="w-6 h-6 text-blue-500" />
                        ) : (
                            <FileText className="w-6 h-6 text-blue-500" />
                        )}
                        <div>
                            <h3 className="font-medium text-gray-900">
                                {file?.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {fileType.toUpperCase()} file
                                {file?.size &&
                                    ` • ${(file.size / 1024 / 1024).toFixed(1)} MB`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleOpenInNewTab}
                            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Open
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDownloading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            {isDownloading ? 'Downloading...' : 'Download'}
                        </button>
                    </div>
                </div>

                <div
                    className="bg-white rounded-lg border flex flex-col overflow-auto"
                    style={{ height: '500px' }}
                >
                    {isImage ? (
                        <img
                            src={file.url}
                            alt={file.title}
                            className="w-full h-auto object-contain mx-auto block"
                            onError={e => {
                                console.error('Image failed to load:', e);
                                // Show fallback
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : isPdf ? (
                        <iframe
                            src={file.url}
                            className="w-full h-full border-0 rounded-lg"
                            title={file.title}
                        />
                    ) : isVideo ? (
                        <video
                            src={file.url}
                            controls
                            className="w-full h-auto max-h-96 mx-auto block"
                            title={file.title}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-96 text-gray-500">
                            <div className="text-center">
                                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <p className="text-lg font-medium">
                                    Preview not available
                                </p>
                                <p className="text-sm">
                                    This file type cannot be previewed
                                </p>
                                <div className="mt-4 space-x-2">
                                    <button
                                        onClick={handleOpenInNewTab}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Open in new tab
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                    >
                                        Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
}
