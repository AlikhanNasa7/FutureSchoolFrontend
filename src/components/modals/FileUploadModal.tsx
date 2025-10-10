'use client';

import { useState, useRef } from 'react';
import { Upload, Cloud, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useLocale } from '@/contexts/LocaleContext';

interface FileUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFileSelect: (file: File) => void;
    title?: string;
}

export default function FileUploadModal({
    isOpen,
    onClose,
    onFileSelect,
    title,
}: FileUploadModalProps) {
    const { t } = useLocale();
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            setSelectedFile(file);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
        }
    };

    const handleSelectFile = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = () => {
        if (selectedFile) {
            onFileSelect(selectedFile);
            setSelectedFile(null);
            onClose();
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        onClose();
    };

    const modalTitle = title || t('modals.fileUpload.defaultTitle');

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={modalTitle}
            maxWidth="max-w-md"
        >
            <div className="space-y-6">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Upload className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        {modalTitle}
                    </h3>
                </div>

                <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive
                            ? 'border-purple-400 bg-purple-50'
                            : 'border-purple-300 bg-purple-25'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileInput}
                        className="hidden"
                        accept="*/*"
                    />

                    {selectedFile ? (
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                                <Cloud className="w-8 h-8 text-purple-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">
                                    {selectedFile.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {(selectedFile.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedFile(null)}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                {t('modals.fileUpload.selectAnotherFile')}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                                <Cloud className="w-8 h-8 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-purple-600 font-medium">
                                    {t('modals.fileUpload.dragFilesHere')}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {t(
                                        'modals.fileUpload.orSelectFromComputer'
                                    )}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={handleSelectFile}
                        className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                        {t('modals.fileUpload.selectFromComputer')}
                    </button>
                    {selectedFile && (
                        <button
                            onClick={handleSubmit}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                            {t('modals.fileUpload.upload')}
                        </button>
                    )}
                </div>

                <div className="text-center">
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                        {t('modals.fileUpload.cancel')}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
