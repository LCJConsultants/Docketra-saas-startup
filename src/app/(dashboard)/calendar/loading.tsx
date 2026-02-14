import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Calendar grid skeleton */}
      <Skeleton className="h-[600px] w-full rounded-lg" />
    </div>
  );
}
