'use client';

import { useSubject } from '../../layout';
import WeekMaterialsSection from '../../_components/WeekMaterialsSection';
import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import SubjectOverviewPanel from '../../_components/SubjectOverviewPanel.client';
import { useUserState } from '@/contexts/UserContext';
import { Plus } from 'lucide-react';
import { modalController } from '@/lib/modalController';

export default function SubjectContents() {
    const { subject, loading, error } = useSubject();
    const { user } = useUserState();
    const [overviewData, setOverviewData] = useState(null);
    const [weekMaterialsData, setWeekMaterialsData] = useState(null);

    // Check if user is a teacher
    const isTeacher = user?.role === 'teacher';

    console.log(weekMaterialsData, 'weekMaterialsData');

    useEffect(() => {
        if (!subject) return;

        const fetchSubject = async () => {
            const response = await axiosInstance.get(
                `/course-sections/?subject_group=${subject.id}`
            );
            console.log(response);
            if (response.data.length > 0) {
                setOverviewData(response.data[0]);
                setWeekMaterialsData(response.data.slice(1));
            }
        };
        fetchSubject();
    }, [subject]);

    // Function to add a new resource to a section
    const handleAddResource = async (sectionId: string) => {
        try {
            const resourceData = {
                title: 'New Resource',
                description: 'Resource description',
                resource_type: 'link',
                url: 'https://example.com',
                course_section: sectionId,
            };

            const response = await axiosInstance.post(
                '/resources/',
                resourceData
            );
            console.log('Resource added:', response.data);

            // Refresh the sections data
            if (!subject) return;
            const sectionsResponse = await axiosInstance.get(
                `/course-sections/?subject_group=${subject.id}`
            );
            if (sectionsResponse.data.length > 0) {
                setOverviewData(sectionsResponse.data[0]);
                setWeekMaterialsData(sectionsResponse.data.slice(1));
            }
        } catch (error) {
            console.error('Error adding resource:', error);
        }
    };

    // Function to add a new section
    const handleAddSection = () => {
        if (subject?.id) {
            modalController.open('course-section-create', {
                subjectId: subject.id,
            });
        }
    };

    // Show loading state
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error || !subject) {
        return (
            <div className="space-y-6">
                <div className="mb-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-red-800 mb-2">
                            Error
                        </h3>
                        <p className="text-red-600">
                            {error || 'Subject not found'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Sample data for fallback
    const weekMaterialsDataSample = {
        weekLabel: '6–12 Октября',
        items: [
            {
                id: 'slide-1',
                kind: 'link' as const,
                label: `Презентация "${subject.name} - Урок 1"`,
                href: `/files/${subject.course_code || 'lesson'}-1.pdf`,
                type: 'document' as const,
            },
            {
                id: 'doc-1',
                kind: 'link' as const,
                label: 'Конспект лекции',
                href: 'https://docs.google.com/document/example',
                type: 'link' as const,
            },
            {
                id: 'video-1',
                kind: 'link' as const,
                label: 'Видео лекции',
                href: '/videos/lecture-1.mp4',
                type: 'video' as const,
            },
            {
                id: 'quiz-1',
                kind: 'task' as const,
                label: `Тест по ${subject.name}`,
                actionHref: `/tests/${subject.id}-quiz-1`,
                actionLabel: 'Начать',
                type: 'test' as const,
                status: 'not_started' as const,
            },
            {
                id: 'assignment-1',
                kind: 'task' as const,
                label: `Домашнее задание по ${subject.name} №1`,
                actionHref: `/assignments/${subject.id}-hw-1`,
                actionLabel: 'Открыть',
                type: 'document' as const,
                status: 'in_progress' as const,
            },
            {
                id: 'exam-1',
                kind: 'task' as const,
                label: `Контрольная работа по ${subject.name}`,
                actionHref: `/exams/${subject.id}-exam-1`,
                actionLabel: 'Просмотреть',
                type: 'test' as const,
                status: 'graded' as const,
                score: '85/100',
            },
        ],
        labels: {
            copied: 'Скопировано',
            copy: 'Скопировать',
            expand: 'Показать',
            collapse: 'Скрыть',
            open: 'Открыть',
        },
    } satisfies import('../../_components/WeekMaterialsSection').WeekMaterialsData;

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <div className="relative">
                    {overviewData && (
                        <SubjectOverviewPanel
                            data={overviewData}
                            courseSectionId={overviewData?.id}
                        />
                    )}
                </div>
            </div>

            <div className="mb-8">
                <div className="relative">
                    {weekMaterialsData &&
                        weekMaterialsData.length > 0 &&
                        weekMaterialsData.map(data => (
                            <WeekMaterialsSection 
                                data={data} 
                                key={data.id} 
                                courseSectionId={data?.id}
                            />
                        ))}
                </div>
            </div>

            {/* Add Section Button for Teachers */}
            {isTeacher && (
                <div className="flex justify-center">
                    <button
                        onClick={handleAddSection}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
                        title="Add New Section"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Section
                    </button>
                </div>
            )}
        </div>
    );
}
