"use client";

import { AlertCircle } from "lucide-react";

import { AccountActivity } from "@/components/profile/account-activity";
import { AccountSecurity } from "@/components/profile/account-security";
import { CustomerProfileForm } from "@/components/profile/customer-profile-form";
import { CustomerProfileHeader } from "@/components/profile/customer-profile-header";
import { CustomerProfileStats } from "@/components/profile/customer-profile-stats";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomerProfile } from "@/features/customer/profile/hooks/use-customer-profile";

export function CustomerProfileContent() {
  const profileQuery = useCustomerProfile();

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {profileQuery.isPending ? (
        <ProfileHeaderSkeleton />
      ) : profileQuery.isError ? (
        <ProfileError onRetry={() => void profileQuery.refetch()} />
      ) : (
        <CustomerProfileHeader profile={profileQuery.data} />
      )}

      <CustomerProfileStats />

      {profileQuery.isPending ? (
        <ProfileDetailsSkeleton />
      ) : profileQuery.isError ? null : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-6">
            <CustomerProfileForm profile={profileQuery.data} />
            <AccountSecurity email={profileQuery.data.email} />
          </div>
          <AccountActivity profile={profileQuery.data} />
        </div>
      )}
    </div>
  );
}

function ProfileError({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="border-destructive/20 bg-destructive/[0.03]">
      <CardContent className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div>
            <p className="font-medium">We couldn&apos;t load your profile.</p>
            <p className="text-sm text-muted-foreground">
              Check your connection and try again.
            </p>
          </div>
        </div>
        <Button type="button" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}

function ProfileHeaderSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <Skeleton className="size-16 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-full max-w-sm" />
        </div>
        <Skeleton className="hidden h-9 w-24 sm:block" />
      </CardContent>
    </Card>
  );
}

function ProfileDetailsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <Skeleton className="h-96" />
      <Skeleton className="h-72" />
    </div>
  );
}
