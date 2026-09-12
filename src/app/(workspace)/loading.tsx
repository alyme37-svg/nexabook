import { PageContainer } from "@/components/layout/page-container";
import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function WorkspaceLoading() {
  return (
    <PageContainer>
      <div className="mb-6" role="status" aria-label="Loading page">
        <Skeleton className="mb-2 h-7 w-40" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </PageContainer>
  );
}
