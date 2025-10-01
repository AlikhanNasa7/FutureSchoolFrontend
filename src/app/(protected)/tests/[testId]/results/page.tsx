import { Suspense } from 'react';
import TestResults from './_components/TestResults';
import TestResultsSkeleton from './_components/TestResultsSkeleton';

interface TestResultsPageProps {
    params: Promise<{ testId: string }>;
    searchParams: Promise<{ attempt?: string }>;
}

export default async function TestResultsPage({
    params,
    searchParams,
}: TestResultsPageProps) {
    const { testId } = await params;
    const { attempt } = await searchParams;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto">
                <Suspense fallback={<TestResultsSkeleton />}>
                    <TestResults testId={testId} attemptId={attempt} />
                </Suspense>
            </div>
        </div>
    );
}
