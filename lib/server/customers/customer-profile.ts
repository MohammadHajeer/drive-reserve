import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  CustomerProfile,
  CustomerProfileStats,
  EditableCustomerProfile,
} from "@/features/customer/profile/customer-profile.schema";
import type { Database } from "@/types/database.types";

type CustomerSupabaseClient = SupabaseClient<Database>;

export async function getCustomerProfile(
  supabase: CustomerSupabaseClient,
  userId: string,
): Promise<CustomerProfile | null> {
  const [profileResult, userResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, phone, created_at, updated_at")
      .eq("id", userId)
      .maybeSingle(),
    supabase.auth.getUser(),
  ]);

  if (profileResult.error) throw profileResult.error;
  if (userResult.error) throw userResult.error;
  if (!profileResult.data || !userResult.data.user) return null;

  return {
    fullName: profileResult.data.full_name,
    phone: profileResult.data.phone ?? "",
    email: userResult.data.user.email ?? "",
    createdAt: profileResult.data.created_at,
    updatedAt: profileResult.data.updated_at,
    emailVerified: Boolean(userResult.data.user.email_confirmed_at),
  };
}

export async function updateCustomerProfile(
  supabase: CustomerSupabaseClient,
  userId: string,
  input: EditableCustomerProfile,
): Promise<CustomerProfile | null> {
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: input.fullName,
      phone: input.phone || null,
    })
    .eq("id", userId);

  if (error) throw error;

  return getCustomerProfile(supabase, userId);
}

export async function getCustomerProfileStats(
  supabase: CustomerSupabaseClient,
  userId: string,
): Promise<CustomerProfileStats> {
  const baseCount = () =>
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", userId);

  const [totalResult, activeResult, completedResult] = await Promise.all([
    baseCount(),
    baseCount().eq("status", "active"),
    baseCount().eq("status", "completed"),
  ]);

  const error =
    totalResult.error ?? activeResult.error ?? completedResult.error;

  if (error) throw error;

  return {
    totalRentals: totalResult.count ?? 0,
    activeRentals: activeResult.count ?? 0,
    completedRentals: completedResult.count ?? 0,
  };
}

