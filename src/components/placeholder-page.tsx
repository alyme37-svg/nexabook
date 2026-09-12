import { Layers3 } from "lucide-react";

import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <PageContainer>
      <PageHeader title={title} description={description} />
      <Card className="overflow-hidden">
        <div className="h-1 bg-[linear-gradient(90deg,#4f46e5,#7c3aed_65%,transparent)]" />
        <CardHeader>
          <div className="mb-2 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground">
              <Layers3 className="size-5" aria-hidden="true" />
            </div>
            <Badge variant="brand">Foundation ready</Badge>
          </div>
          <CardTitle>{title} workspace</CardTitle>
          <CardDescription>This route is intentionally reserved for a future product phase.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3" aria-hidden="true">
            <div className="h-20 rounded-lg border bg-muted/45" />
            <div className="h-20 rounded-lg border bg-muted/45" />
            <div className="h-20 rounded-lg border bg-muted/45" />
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
