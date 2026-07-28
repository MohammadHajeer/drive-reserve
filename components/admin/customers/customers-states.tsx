import { AlertCircle, RefreshCw, SearchX, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CustomersLoadingSkeleton() {
  return (
    <div
      aria-label="Loading customers"
      className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function CustomerDetailsLoadingSkeleton() {
  return (
    <div aria-label="Loading customer details" className="space-y-6">
      <Skeleton className="h-9 w-40" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_1.8fr]">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}

function State({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
}: {
  icon: typeof Users;
  title: string;
  description: string;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <Card>
      <CardContent
        className={cn(
          "flex flex-col items-center justify-center text-center",
          compact ? "min-h-0 py-6" : "min-h-64",
        )}
      >
        <Icon className="mb-4 size-10 text-muted-foreground" />
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
        {action && <div className="mt-4">{action}</div>}
      </CardContent>
    </Card>
  );
}

export function CustomersEmptyState() {
  return (
    <State
      icon={Users}
      title="No customers yet"
      description="Customer accounts will appear here after people register."
    />
  );
}

export function CustomersNoResultsState({
  onReset,
}: {
  onReset: () => void;
}) {
  return (
    <State
      icon={SearchX}
      title="No matching customers"
      description="Try changing or resetting your filters."
      action={
        <Button variant="outline" onClick={onReset}>
          Reset filters
        </Button>
      }
    />
  );
}

export function CustomerNotFoundState() {
  return (
    <State
      icon={SearchX}
      title="Customer not found"
      description="This customer does not exist or is not a customer account."
    />
  );
}

export function CustomersErrorState({
  message,
  onRetry,
  compact = false,
}: {
  message: string;
  onRetry: () => void;
  compact?: boolean;
}) {
  return (
    <State
      icon={AlertCircle}
      title="Unable to load customers"
      description={message}
      compact={compact}
      action={
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw /> Try again
        </Button>
      }
    />
  );
}
