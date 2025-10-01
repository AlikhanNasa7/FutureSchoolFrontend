export default function TestResultsSkeleton() {
    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="animate-pulse">
                {/* Header Skeleton */}
                <div className="mb-8">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                    <div className="flex gap-4">
                        <div className="bg-gray-200 rounded-lg p-4 w-32 h-16"></div>
                        <div className="bg-gray-200 rounded-lg p-4 w-32 h-16"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Content Skeleton */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
                            <div className="space-y-3">
                                <div className="h-12 bg-gray-200 rounded"></div>
                                <div className="h-12 bg-gray-200 rounded"></div>
                                <div className="h-12 bg-gray-200 rounded"></div>
                                <div className="h-12 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Skeleton */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="grid grid-cols-5 gap-2">
                                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
