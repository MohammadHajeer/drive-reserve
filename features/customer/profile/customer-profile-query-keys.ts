export const customerProfileQueryKeys = {
  all: ["customer", "profile"] as const,
  detail: () => [...customerProfileQueryKeys.all, "detail"] as const,
  stats: () => [...customerProfileQueryKeys.all, "stats"] as const,
};

