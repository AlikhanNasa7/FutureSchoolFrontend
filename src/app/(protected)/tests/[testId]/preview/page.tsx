import { Suspense } from 'react';
import TestPreviewContent from './_components/TestPreviewContent';
import TestSkeleton from '../_components/TestSkeleton';

interface TestPreviewPageProps {
    params: Promise<{ testId: string }>;
}

export default async function TestPreviewPage({ params }: TestPreviewPageProps) {
    const { testId } = await params;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto">
                <Suspense fallback={<TestSkeleton />}>
                    <TestPreviewContent testId={testId} />
                </Suspense>
            </div>
        </div>
    );
}
