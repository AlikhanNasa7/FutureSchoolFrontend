export default function TestSkeleton() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
                {/* Header Skeleton */}
                <div className="mb-8">
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>

                {/* Info Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                            <div>
                                <div className="h-4 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
                                <div className="h-6 bg-gray-200 rounded w-12 animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                            <div>
                                <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                                <div className="h-6 bg-gray-200 rounded w-8 animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                            <div>
                                <div className="h-4 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
                                <div className="h-6 bg-gray-200 rounded w-10 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Area Skeleton */}
                <div className="text-center">
                    <div className="mb-6">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded w-64 mx-auto mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
                    </div>

                    <div className="h-12 bg-gray-200 rounded-lg w-48 mx-auto animate-pulse"></div>
                </div>

                {/* Additional Info Skeleton */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-3 animate-pulse"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
