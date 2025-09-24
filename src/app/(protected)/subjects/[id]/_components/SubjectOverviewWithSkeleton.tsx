import { Suspense } from 'react';
import SubjectOverviewCard, {
    SubjectOverviewData,
} from './SubjectOverviewCard';
import SubjectOverviewSkeleton from './SubjectOverview.skeleton';

interface SubjectOverviewWithSkeletonProps {
    data: SubjectOverviewData;
}

export default function SubjectOverviewWithSkeleton({
    data,
}: SubjectOverviewWithSkeletonProps) {
    return (
        <Suspense fallback={<SubjectOverviewSkeleton />}>
            <SubjectOverviewCard data={data} />
        </Suspense>
    );
}
