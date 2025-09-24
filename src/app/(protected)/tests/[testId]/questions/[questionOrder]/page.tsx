import { Suspense } from 'react';
import QuestionContent from './_components/QuestionContent';
import QuestionSkeleton from './_components/QuestionSkeleton';

interface QuestionPageProps {
    params: Promise<{
        testId: string;
        questionOrder: string;
    }>;
}

export default async function QuestionPage({ params }: QuestionPageProps) {
    const { testId, questionOrder } = await params;
    const questionNumber = parseInt(questionOrder, 10);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <Suspense fallback={<QuestionSkeleton />}>
                    <QuestionContent
                        testId={testId}
                        questionNumber={questionNumber}
                    />
                </Suspense>
            </div>
        </div>
    );
}
