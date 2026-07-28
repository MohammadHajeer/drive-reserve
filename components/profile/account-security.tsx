"use client";

import { useState } from "react";
import { KeyRound, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/client";

export function AccountSecurity({ email }: { email: string }) {
  const [isSending, setIsSending] = useState(false);

  async function sendPasswordReset() {
    if (isSending) return;

    setIsSending(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password?next=${APP_ROUTES.customerProfile}`,
      });

      if (error) throw error;

      toast.success("Password reset link sent. Check your email.");
    } catch (error) {
      console.error("Password reset request failed:", error);
      toast.error("Unable to send a reset link. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="size-5 text-primary" aria-hidden="true" />
          Password &amp; security
        </CardTitle>
        <CardDescription>
          Send a secure password reset link to {email}.
        </CardDescription>
        <CardAction>
          <Button
            type="button"
            variant="outline"
            disabled={isSending}
            onClick={() => void sendPasswordReset()}
          >
            {isSending && (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            )}
            {isSending ? "Sending..." : "Change password"}
          </Button>
        </CardAction>
      </CardHeader>
    </Card>
  );
}
