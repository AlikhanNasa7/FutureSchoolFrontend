'use client';

import { useState, useCallback } from 'react';
import { ChevronDown, Info, Plus } from 'lucide-react';
import type { SubjectOverviewData } from './SubjectOverviewCard';
import { useUserState } from '@/contexts/UserContext';
import { modalController } from '@/lib/modalController';
import { SharedLinkItem } from './SharedLinkItem';

interface SubjectOverviewPanelProps {
    data: SubjectOverviewData;
    courseSectionId?: number;
}

export function handleFileView(
    fileData: { file: string; title: string; type: string },
    filename: string
) {
    console.log(fileData, filename, 'fileData', 'filename');
    const fileUrl = fileData.file;

    console.log('Opening file in modal:', { fileData, fileUrl, filename });

    modalController.open('file-viewer', {
        file: {
            url: fileUrl,
            title: filename,
            type: fileData.type,
        },
    });
}

export default function SubjectOverviewPanel({
    data,
    courseSectionId,
}: SubjectOverviewPanelProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const { user } = useUserState();
    const isTeacher = user?.role === 'teacher';

    const toggleExpanded = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleExpanded();
            }
        },
        [toggleExpanded]
    );

    const handleAddItem = useCallback(() => {
        if (courseSectionId) {
            modalController.open('course-section-add-item', {
                courseSectionId,
            });
        }
    }, [courseSectionId]);

    console.log(data, 'data');

    return (
        <section
            className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm w-full max-w-full overflow-hidden"
            aria-labelledby="subject-overview-title"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2
                    id="subject-overview-title"
                    className="text-lg md:text-xl font-semibold text-gray-900"
                >
                    {data.title}
                </h2>

                <div className="flex items-center justify-center">
                    {isTeacher && (
                        <button
                            onClick={handleAddItem}
                            className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                            title="Add Resource or Assignment"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={toggleExpanded}
                        onKeyDown={handleKeyDown}
                        className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? 'Hide' : 'Show'}
                    >
                        <ChevronDown
                            className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : ''
                            }`}
                        />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div
                className={`overflow-x-hidden overflow-y-auto transition-all duration-300 ease-in-out ${
                    isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                {/* Description */}
                {data.description && (
                    <div className="flex items-start gap-3 mb-4 w-full overflow-hidden">
                        <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm md:text-base text-gray-700 leading-relaxed break-words min-w-0 flex-1">
                            {data.description}
                        </p>
                    </div>
                )}

                {data.resources && data.resources.length > 0 && (
                    <div className="space-y-0 w-full overflow-hidden">
                        {data.resources.map((resource, index) => (
                            <div key={resource.id}>
                                {index > 0 && (
                                    <div className="border-t border-gray-100" />
                                )}
                                <SharedLinkItem
                                    item={resource}
                                    isTeacher={isTeacher}
                                    onFileView={handleFileView}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
