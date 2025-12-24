import { Suspense } from 'react';
import TestCreator from './_components/TestCreator';

function TestCreatorWrapper() {
    return <TestCreator />;
}

export default function CreateTestPage() {
    return (
        <Suspense fallback={<div className="p-6">Loading...</div>}>
            <TestCreatorWrapper />
        </Suspense>
    );
}
