export default function SubjectOverviewSkeleton() {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-200 rounded-md w-48 animate-pulse" />
        <div className="w-10 h-10 bg-gray-200 rounded-md animate-pulse" />
      </div>

      {/* Content Skeleton */}
      <div className="space-y-4">
        {/* Description Skeleton */}
        <div className="flex items-start gap-3">
          <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse flex-shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded-md w-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded-md w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded-md w-1/2 animate-pulse" />
          </div>
        </div>

        {/* Resource Rows Skeleton */}
        <div className="space-y-0">
          {/* First Resource Row */}
          <div className="flex items-center gap-3 py-3">
            <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
            <div className="h-4 bg-gray-200 rounded-md w-40 animate-pulse flex-1" />
            <div className="w-8 h-8 bg-gray-200 rounded-md animate-pulse flex-shrink-0" />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Second Resource Row */}
          <div className="flex items-center gap-3 py-3">
            <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
            <div className="h-4 bg-gray-200 rounded-md w-32 animate-pulse flex-1" />
            <div className="w-8 h-8 bg-gray-200 rounded-md animate-pulse flex-shrink-0" />
          </div>
        </div>
      </div>
    </section>
  );
}
