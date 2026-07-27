"use client";

import { useQuery } from "@tanstack/react-query";

import { adminDashboardQueryKeys } from "../admin-dashboard-query-keys";
import { getAdminDashboard } from "../services/admin-dashboard.service";

export function useAdminDashboard() {
  return useQuery({
    queryKey: adminDashboardQueryKeys.overview(),
    queryFn: ({ signal }) => getAdminDashboard(signal),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
