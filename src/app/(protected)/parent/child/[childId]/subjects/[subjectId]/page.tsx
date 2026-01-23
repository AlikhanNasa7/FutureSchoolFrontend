'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import WeekMaterialsPanel from '@/app/(protected)/subjects/[id]/_components/WeekMaterialsPanel.client';

export default function ParentChildSubjectPage() {
    const params = useParams();
    const router = useRouter();
    const childId = params.childId as string;
    const subjectId = params.subjectId as string;
    const [loading, setLoading] = useState(true);
    const [sections, setSections] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Get sections for the subject group
                const response = await axiosInstance.get('/course-sections/', {
                    params: { subject_group: subjectId }
                });
                setSections(response.data.results || response.data);
            } catch (error) {
                console.error('Failed to fetch sections:', error);
            } finally {
                setLoading(false);
            }
        };

        if (subjectId) {
            fetchData();
        }
    }, [subjectId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Transform sections data for WeekMaterialsPanel
    const weekMaterialsData = sections.map((section) => ({
        id: section.id.toString(),
        title: section.title,
        start_date: section.start_date,
        end_date: section.end_date,
        items: [] // Will be populated by the component
    }));

    return (
        <div className="max-w-7xl mx-auto p-6">
            <button
                onClick={() => router.push(`/parent/child/${childId}/subjects`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Назад</span>
            </button>

            <WeekMaterialsPanel
                data={{ weeks: weekMaterialsData }}
                courseSectionId={parseInt(subjectId)}
                onRefresh={() => {}}
            />
        </div>
    );
}
