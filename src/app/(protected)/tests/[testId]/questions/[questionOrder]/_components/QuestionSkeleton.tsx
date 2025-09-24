export default function QuestionSkeleton() {
    return (
        <div className="max-w-4xl mx-auto">
            {/* Header Skeleton */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
            </div>

            {/* Question Skeleton */}
            <div className="bg-white rounded-lg shadow-md p-8">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-8 animate-pulse"></div>

                {/* Options Skeleton */}
                <div className="space-y-4 mb-8">
                    <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                </div>

                {/* Navigation Skeleton */}
                <div className="flex items-center justify-between">
                    <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="flex items-center gap-4">
                        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
                        <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
