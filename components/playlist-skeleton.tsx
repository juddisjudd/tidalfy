import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function PlaylistSkeleton() {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="relative">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
              <Skeleton className="w-12 h-12 rounded flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-3">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
