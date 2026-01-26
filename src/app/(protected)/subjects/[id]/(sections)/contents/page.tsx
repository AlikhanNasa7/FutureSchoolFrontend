'use client';

import { useSubject } from '../../layout';
import WeekMaterialsSection from '../../_components/WeekMaterialsSection';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MessageCircle, ChevronDown } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import SubjectOverviewPanel from '../../_components/SubjectOverviewPanel.client';
import { useLocale } from '@/contexts/LocaleContext';

export default function SubjectContents() {
    const { subject, loading, error } = useSubject();
    const router = useRouter();
    const params = useParams();
    const { t } = useLocale();
    const subjectId = params?.id as string;
    const [overviewData, setOverviewData] = useState<any>(null);
    const [weekMaterialsData, setWeekMaterialsData] = useState<any[]>([]);
    const [showArchived, setShowArchived] = useState(false);

    const handleForumClick = () => {
        router.push(`/subjects/${subjectId}/qa`);
    };

    console.log(weekMaterialsData, 'weekMaterialsData');

    const fetchSections = async () => {
        if (!subject) return;

        try {
            const response = await axiosInstance.get(
                `/course-sections/?subject_group=${subject.id}`
            );
            console.log('API Response:', response);
            console.log('Response data structure:', response.data);
            console.log('First item structure:', response.data[0]);
            if (response.data.length > 0) {
                setOverviewData(response.data[0]);

                const transformedData = response.data
                    .slice(1)
                    .map((section: Record<string, any>) => {
                        console.log('Transforming section:', section);

                        const addKindToItems = (
                            items: Record<string, any>[],
                            kind: string
                        ) => {
                            return items.map((item: Record<string, any>) => ({
                                ...item,
                                kind: kind,
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
                                grade_value:
                                    item.grade_value || item.student_grade,
                                max_grade: item.max_grade || item.max_points,
                                // Preserve template fields
                                template_resource: item.template_resource,
                                template_assignment: item.template_assignment,
                                template_test: item.template_test,
                                is_unlinked_from_template: item.is_unlinked_from_template,
                                // Preserve test settings
                                is_published: item.is_published,
                                // Preserve student submission for assignments
                                student_submission: item.student_submission,
                            }));
                        };

                        return {
                            id: section.id || section.section_id || 'unknown',
                            title:
                                section.title ||
                                section.name ||
                                'Untitled Section',
                            start_date: section.start_date,
                            end_date: section.end_date,
                            is_current: section.is_current,
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
        } catch (error) {
            console.error('Error fetching sections:', error);
        }
    };

    useEffect(() => {
        fetchSections();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subject]);

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

    return (
        <div>
            {/* Sticky Header Panel */}
            <div className="sticky top-0 z-40 bg-white shadow-md border-b border-gray-200">
                <div className="p-4">
                    {/* Forum Button */}
                    <div className="mb-3">
                        <button
                            onClick={handleForumClick}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                        >
                            <MessageCircle className="w-5 h-5" />
                            {t('qa.title')}
                        </button>
                    </div>

                    {/* Subject Overview Panel */}
                    {overviewData && (
                        <SubjectOverviewPanel
                            data={overviewData}
                            courseSectionId={overviewData?.id}
                            onRefresh={fetchSections}
                        />
                    )}
                </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-6 p-4">
                <div className="relative flex flex-col gap-4">
                    {weekMaterialsData && weekMaterialsData.length > 0 && (() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        // Separate sections: past, current+future
                        const pastSections = weekMaterialsData.filter((data: any) => {
                            if (data.end_date) {
                                const endDate = new Date(data.end_date);
                                endDate.setHours(0, 0, 0, 0);
                                return endDate < today;
                            }
                            return false;
                        });

                        const currentAndFutureSections = weekMaterialsData.filter((data: any) => {
                            if (data.end_date) {
                                const endDate = new Date(data.end_date);
                                endDate.setHours(0, 0, 0, 0);
                                return endDate >= today;
                            }
                            return true;
                        });

                        return (
                            <>
                    {/* Show/Hide Archived Button */}
                    {pastSections.length > 0 && (
                        <button
                            onClick={() => setShowArchived(!showArchived)}
                            className={`w-full flex items-center justify-center gap-2 px-4 md:px-6 py-3 md:py-4 border-2 border-dashed rounded-lg font-medium transition-all ${
                                showArchived
                                    ? 'bg-gray-100 border-gray-400 text-gray-700 hover:bg-gray-200'
                                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                                        <ChevronDown
                                            className={`w-5 h-5 transition-transform ${
                                                showArchived ? 'rotate-180' : ''
                                            }`}
                                        />
                                        {showArchived
                                            ? '📚 Скрыть предыдущие'
                                            : `🕐 Показать предыдущие (${pastSections.length})`}
                                    </button>
                                )}

                                {/* Past Sections (shown above current when expanded) */}
                                {showArchived &&
                                    pastSections.map((data: any) => (
                                        <WeekMaterialsSection
                                            data={data}
                                            key={data.id}
                                            courseSectionId={data?.id}
                                            onRefresh={fetchSections}
                                        />
                                    ))}

                                {/* Current and Future Sections */}
                                {currentAndFutureSections.map((data: any) => (
                                    <WeekMaterialsSection
                                        data={data}
                                        key={data.id}
                                        courseSectionId={data?.id}
                                        onRefresh={fetchSections}
                                    />
                                ))}
                            </>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}
