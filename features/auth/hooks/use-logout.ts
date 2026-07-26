"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { APP_ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/client";

export function useLogout() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function logout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      toast.success("Signed out successfully.");
      router.replace(APP_ROUTES.home);
      router.refresh();
    } catch (error) {
      console.error("Failed to sign out:", error);
      toast.error("Unable to sign out. Please try again.");
      setIsLoggingOut(false);
    }
  }

  return { logout, isLoggingOut };
}

