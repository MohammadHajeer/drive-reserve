export const adminDashboardQueryKeys = {
  all: ["admin", "dashboard"] as const,
  overview: () => [...adminDashboardQueryKeys.all, "overview"] as const,
};
