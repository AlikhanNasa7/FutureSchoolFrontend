import { Suspense } from 'react';
import TestContent from './_components/TestContent';
import TestSkeleton from './_components/TestSkeleton';

interface TestPageProps {
    params: Promise<{ testId: string }>;
}

export default async function TestPage({ params }: TestPageProps) {
    const { testId } = await params;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto">
                <Suspense fallback={<TestSkeleton />}>
                    <TestContent testId={testId} />
                </Suspense>
            </div>
        </div>
    );
}
