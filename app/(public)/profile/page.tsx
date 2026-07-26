import { createClient } from "@/lib/supabase/server";
import { CustomerProfileContent } from "@/components/profile/customer-profile";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createClient();

 
  const { data: { user }, error } = await supabase.auth.getUser();


  if (error || !user) {
    redirect("/login");
  }

 
  const stats = {
    total: 0,
    active: 0,
    confirmed: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    rejected: 0,
  };

  
  const profileUser = {
    name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
    email: user.email || "",
    phone: user.phone || user.user_metadata?.phone || "", 
    memberSince: new Date(user.created_at).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    }),
    role: user.role || "Customer",
    status: "Active",
  };

  return <CustomerProfileContent user={profileUser} stats={stats} />;
}