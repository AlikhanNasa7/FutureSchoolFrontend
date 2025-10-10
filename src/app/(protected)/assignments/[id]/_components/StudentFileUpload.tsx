'use client';

import { Upload } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

interface StudentFileUploadProps {
    selectedFile: File | null;
    onFileSelect: () => void;
    onFileRemove: () => void;
}

export default function StudentFileUpload({
    selectedFile,
    onFileSelect,
    onFileRemove,
}: StudentFileUploadProps) {
    const { t } = useLocale();

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t('assignmentPage.attachFile')}
            </h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                {selectedFile && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Upload className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="font-medium text-green-900">
                                    {selectedFile.name}
                                </p>
                                <p className="text-sm text-green-700">
                                    {(selectedFile.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onFileRemove}
                            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                            {t('assignmentPage.remove')}
                        </button>
                    </div>
                )}
                {!selectedFile && (
                    <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={onFileSelect}
                    >
                        <div className="flex items-center space-x-3">
                            <Upload className="w-5 h-5 text-green-600" />
                            <p className="font-medium text-green-900">
                                {t('assignmentPage.clickToSelect')}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
