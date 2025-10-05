'use client';

import { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import axiosInstance from '@/lib/axios';

interface AddFileToDirectoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    directoryId: number;
    directoryTitle: string;
    courseSectionId: number;
    onSuccess?: () => void;
}

export default function AddFileToDirectoryModal({
    isOpen,
    onClose,
    directoryId,
    directoryTitle,
    courseSectionId,
    onSuccess,
}: AddFileToDirectoryModalProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const totalFiles = selectedFiles.length + files.length;

        if (totalFiles > 10) {
            setError('Maximum 10 files allowed');
            return;
        }

        setSelectedFiles(prev => [...prev, ...files]);
        setError(null);
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedFiles.length === 0) {
            setError('Please select at least one file');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('directory_id', directoryId.toString());
            formData.append('course_section', courseSectionId.toString());

            // Append all files
            selectedFiles.forEach(file => {
                formData.append('files', file);
            });

            console.log('Adding files to directory:', {
                directory_id: directoryId,
                course_section: courseSectionId,
                fileCount: selectedFiles.length,
            });

            const response = await axiosInstance.post(
                '/resources/add-files-to-directory/',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            console.log('Files added successfully:', response.data);
            setSuccess(`${selectedFiles.length} file(s) added successfully!`);

            // Reset form and close modal after success
            setTimeout(() => {
                setSelectedFiles([]);
                setSuccess(null);
                onSuccess?.();
                onClose();
            }, 1500);
        } catch (error: unknown) {
            console.error('Error adding files to directory:', error);
            const errorMessage =
                error instanceof Error ? error.message : 'Failed to add files';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setSelectedFiles([]);
        setError(null);
        setSuccess(null);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={`Add Files to "${directoryTitle}"`}
            maxWidth="max-w-2xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Files ({selectedFiles.length}/10)
                    </label>

                    <div className="relative">
                        <input
                            type="file"
                            multiple
                            onChange={handleFileSelect}
                            className="absolute inset-0 w-full h-32 opacity-0 cursor-pointer"
                            accept="*/*"
                        />
                        <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors">
                            <div className="text-center">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">
                                    Click to select files to add to directory
                                </p>
                                <p className="text-xs text-gray-400">
                                    or drag and drop (Max 10 files)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <p className="text-sm text-green-600">{success}</p>
                    </div>
                )}

                {/* Display selected files */}
                {selectedFiles.length > 0 && (
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                            Selected Files:
                        </p>
                        <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                            {selectedFiles.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                                >
                                    <div className="flex items-center space-x-2">
                                        <FileText className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm text-gray-700 truncate max-w-48">
                                            {file.name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className="text-red-500 hover:text-red-700 text-sm"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || selectedFiles.length === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting
                            ? 'Adding Files...'
                            : `Add ${selectedFiles.length} File(s)`}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
