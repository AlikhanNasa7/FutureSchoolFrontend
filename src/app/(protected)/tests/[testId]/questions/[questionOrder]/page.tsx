import { Suspense } from 'react';
import Question from './_components/Question';
import QuestionSkeleton from './_components/QuestionSkeleton';

interface QuestionPageProps {
    params: Promise<{
        testId: string;
        questionOrder: string;
    }>;
}

export default async function QuestionPage({ params }: QuestionPageProps) {
    const { testId, questionOrder } = await params;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <Suspense fallback={<QuestionSkeleton />}>
                    <Question testId={testId} questionOrder={questionOrder} />
                </Suspense>
            </div>
        </div>
    );
}
