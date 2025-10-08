'use client';

import { useSubject } from '../../layout';
import WeekMaterialsSection from '../../_components/WeekMaterialsSection';
import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import SubjectOverviewPanel from '../../_components/SubjectOverviewPanel.client';
// Removed unused imports

export default function SubjectContents() {
    const { subject, loading, error } = useSubject();
    // Removed unused user variable
    const [overviewData, setOverviewData] = useState<any>(null);
    const [weekMaterialsData, setWeekMaterialsData] = useState<any[]>([]);

    // Removed unused variable

    console.log(weekMaterialsData, 'weekMaterialsData');

    useEffect(() => {
        if (!subject) return;

        const fetchSubject = async () => {
            const response = await axiosInstance.get(
                `/course-sections/?subject_group=${subject.id}`
            );
            console.log('API Response:', response);
            console.log('Response data structure:', response.data);
            console.log('First item structure:', response.data[0]);
            if (response.data.length > 0) {
                setOverviewData(response.data[0]);

                // Transform API data to match expected format
                const transformedData = response.data
                    .slice(1)
                    .map((section: Record<string, any>) => {
                        console.log('Transforming section:', section);

                        // Helper function to add kind attribute to items
                        const addKindToItems = (
                            items: Record<string, any>[],
                            kind: string
                        ) => {
                            return items.map((item: Record<string, any>) => ({
                                ...item,
                                kind: kind,
                                // Ensure required properties exist
                                id:
                                    item.id ||
                                    item.item_id ||
                                    Math.random().toString(),
                                title:
                                    item.title ||
                                    item.name ||
                                    item.label ||
                                    'Untitled',
                                actionHref:
                                    item.actionHref ||
                                    item.href ||
                                    `/${kind}s/${item.id}`,
                                actionLabel: item.actionLabel || 'Открыть',
                                // Include grade information for assignments
                                grade_value:
                                    item.grade_value || item.student_grade,
                                max_grade: item.max_grade || item.max_points,
                            }));
                        };

                        return {
                            id: section.id || section.section_id || 'unknown',
                            title:
                                section.title ||
                                section.name ||
                                'Untitled Section',
                            resources: addKindToItems(
                                section.resources || section.materials || [],
                                'link'
                            ),
                            assignments: addKindToItems(
                                section.assignments || section.tasks || [],
                                'task'
                            ),
                            tests: addKindToItems(
                                section.tests || section.quizzes || [],
                                'test'
                            ),
                        };
                    });

                console.log('Transformed data:', transformedData);
                setWeekMaterialsData(transformedData);
            }
        };
        fetchSubject();
    }, [subject]);

    // Removed unused functions

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

    // Removed unused sample data

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
                <div className="relative flex flex-col gap-4">
                    {weekMaterialsData &&
                        weekMaterialsData.length > 0 &&
                        weekMaterialsData.map((data: any) => (
                            <WeekMaterialsSection
                                data={data}
                                key={data.id}
                                courseSectionId={data?.id}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
}
