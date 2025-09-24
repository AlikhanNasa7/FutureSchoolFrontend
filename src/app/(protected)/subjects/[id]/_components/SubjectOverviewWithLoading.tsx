'use client';

import { useState, useEffect } from 'react';
import SubjectOverviewCard, {
    SubjectOverviewData,
} from './SubjectOverviewCard';
import SubjectOverviewSkeleton from './SubjectOverview.skeleton';

interface SubjectOverviewWithLoadingProps {
    data: SubjectOverviewData;
    courseSectionId?: number;
    loadingTime?: number; // Simulate loading time in milliseconds
}

export default function SubjectOverviewWithLoading({
    data,
    courseSectionId,
    loadingTime = 2000,
}: SubjectOverviewWithLoadingProps) {
    const [loading, setLoading] = useState(true);
    const [loadedData, setLoadedData] = useState<SubjectOverviewData | null>(
        null
    );

    useEffect(() => {
        // Simulate API call
        const timer = setTimeout(() => {
            setLoadedData(data);
            setLoading(false);
        }, loadingTime);

        return () => clearTimeout(timer);
    }, [data, loadingTime]);

    if (loading) {
        return <SubjectOverviewSkeleton />;
    }

    return (
        <SubjectOverviewCard
            data={loadedData!}
            courseSectionId={courseSectionId}
        />
    );
}
