export default function WeekMaterialsSkeleton() {
    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gray-200 rounded-md w-32 animate-pulse" />
                <div className="w-10 h-10 bg-gray-200 rounded-md animate-pulse" />
            </div>

            {/* Content Skeleton */}
            <div className="space-y-0">
                {/* First Item Row */}
                <div className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
                        <div className="h-4 bg-gray-200 rounded-md w-48 animate-pulse flex-1" />
                    </div>
                    <div className="w-20 h-8 bg-gray-200 rounded-xl animate-pulse flex-shrink-0" />
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100" />

                {/* Second Item Row */}
                <div className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
                        <div className="h-4 bg-gray-200 rounded-md w-40 animate-pulse flex-1" />
                    </div>
                    <div className="w-16 h-8 bg-gray-200 rounded-xl animate-pulse flex-shrink-0" />
                </div>
            </div>
        </section>
    );
}
