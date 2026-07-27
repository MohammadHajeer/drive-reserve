import { adminDashboardMock } from "../mock/admin-dashboard.mock";
import type { AdminDashboardData } from "../admin-dashboard.types";

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  await wait(500);

  return structuredClone(adminDashboardMock);
}