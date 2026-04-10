import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function NutritionSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
      {/* Summary Card Skeleton */}
      <Card className="lg:col-span-1 shadow-sm border-zinc-200 dark:border-zinc-800 overflow-hidden h-fit">
        <Skeleton className="h-48 w-full" />
        <CardHeader className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-3 w-full" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-12 mx-auto" />
                <Skeleton className="h-6 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Breakdown Card Skeleton */}
      <Card className="lg:col-span-2 shadow-sm border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-9 w-20 rounded-md" />
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="border rounded-md p-4 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
