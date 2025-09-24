'use client';

import { useState, useEffect } from 'react';
import SubjectOverviewCard, {
    SubjectOverviewData,
} from './SubjectOverviewCard';
import SubjectOverviewSkeleton from './SubjectOverview.skeleton';

interface SubjectListWithSkeletonsProps {
    subjects: SubjectOverviewData[];
    loadingTime?: number;
}

export default function SubjectListWithSkeletons({
    subjects,
    loadingTime = 3000,
}: SubjectListWithSkeletonsProps) {
    const [loading, setLoading] = useState(true);
    const [loadedSubjects, setLoadedSubjects] = useState<SubjectOverviewData[]>(
        []
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoadedSubjects(subjects);
            setLoading(false);
        }, loadingTime);

        return () => clearTimeout(timer);
    }, [subjects, loadingTime]);

    if (loading) {
        return (
            <div className="space-y-4">
                {/* Show multiple skeletons while loading */}
                <SubjectOverviewSkeleton />
                <SubjectOverviewSkeleton />
                <SubjectOverviewSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {loadedSubjects.map((subject, index) => (
                <SubjectOverviewCard key={index} data={subject} />
            ))}
        </div>
    );
}
