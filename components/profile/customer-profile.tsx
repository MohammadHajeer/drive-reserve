"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { 
  Car, 
  Clock, 
  CheckCircle2, 
  Bell, 
  User, 
  Lock, 
  LogOut, 
  AlertTriangle,
  Pencil,
  X,
  Check
} from "lucide-react";

export type ProfileStats = {
  total: number;
  active: number;
  confirmed: number;
  pending: number;
  completed: number;
  cancelled: number;
  rejected: number;
};

export type CustomerProfileProps = {
  user: {
    name: string;
    email: string;
    phone: string;
    memberSince: string;
    role: string;
    status: string;
  };
  stats: ProfileStats;
};

export function CustomerProfileContent({ user: initialUser, stats }: CustomerProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  const [formData, setFormData] = useState({
    name: initialUser.name,
    email: initialUser.email,
    phone: initialUser.phone,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: initialUser.name,
      email: initialUser.email,
      phone: initialUser.phone,
    });
    setIsEditing(false);
  };

  const handleRequestPasswordReset = async () => {
    setIsSendingReset(true);
    try {
      const supabase = createClient();
      
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password?next=/profile`,
      });

      if (error) {
        throw error;
      }

      setResetSent(true);
    } catch (error: any) {
      console.error("Failed to send reset link:", error.message);
      alert(error.message || "Could not send reset email.");
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleSignOutAllDevices = async () => {
    setIsSigningOut(true);
    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signOut({ scope: "global" });

      if (error) {
        throw error;
      }

      window.location.href = "/login";
    } catch (error: any) {
      console.error("Failed to sign out of all devices:", error.message);
      alert("Could not sign out of all devices. Please try again.");
      setIsSigningOut(false);
    }
  };

  const statCards = [
    {
      label: "TOTAL RENTALS",
      value: stats.total,
      icon: Car,
      color: "text-slate-600 bg-slate-100",
      href: "/my-reservations",
    },
    {
      label: "ACTIVE RENTALS",
      value: stats.active,
      icon: Clock,
      color: "text-blue-600 bg-blue-50",
      href: "/my-reservations?status=active",
    },
    {
      label: "COMPLETED",
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-green-600 bg-green-50",
      href: "/my-reservations?status=completed",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-card p-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-primary/20 bg-muted">
            <div className="absolute inset-0 flex items-center justify-center bg-primary/10 text-xl font-bold text-primary">
              {formData.name.charAt(0)}
            </div>
            <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-background bg-emerald-500" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{formData.name}</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account settings and security preferences.
            </p>

            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                📅 Member since {initialUser.memberSince}
              </span>
              
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                Account Status: {initialUser.status}
              </span>
            </div>
          </div>
        </div>

        <button className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">
          <Bell className="h-4 w-4" />
          Notifications
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group flex flex-col items-center justify-center rounded-xl border border-border bg-card p-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
            >
              <div className={`mb-2 rounded-full p-2.5 transition-transform group-hover:scale-110 ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold tracking-wider text-muted-foreground">
                {stat.label}
              </span>
              <span className="mt-1 text-2xl font-extrabold text-foreground">
                {stat.value}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </div>

              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <div className="rounded-lg border border-transparent bg-muted/40 px-3 py-2 text-sm font-medium text-foreground">
                      {formData.name}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <div className="rounded-lg border border-transparent bg-muted/40 px-3 py-2 text-sm font-medium text-foreground">
                      {formData.email}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <div className="rounded-lg border border-transparent bg-muted/40 px-3 py-2 text-sm font-medium text-foreground">
                    {formData.phone || "Not provided"}
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Lock className="h-5 w-5 text-primary" />
              Password & Security
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 p-4">
              <div>
                <h4 className="text-sm font-semibold text-foreground">Update Password</h4>
                <p className="text-xs text-muted-foreground">
                  We will send a secure password reset link to <span className="font-medium text-foreground">{formData.email}</span>.
                </p>
                {resetSent && (
                  <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    ✓ Password reset link sent! Please check your email inbox.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleRequestPasswordReset}
                disabled={isSendingReset}
                className="shrink-0 rounded-lg border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                {isSendingReset ? "Sending Link..." : resetSent ? "Resend Link" : "Change Password"}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-base font-semibold text-foreground">Account Activity</h3>
            <p className="text-xs text-muted-foreground">Recent actions on your account</p>

            <div className="space-y-3 pt-2 text-sm">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Last Login</span>
                <span className="font-medium text-foreground">2 hours ago</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Active Sessions</span>
                <span className="font-medium text-foreground">2 Devices</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOutAllDevices}
              disabled={isSigningOut}
              className="flex w-full items-center justify-center gap-2 rounded-lg text-xs font-semibold text-rose-600 transition-colors hover:text-rose-700 pt-2 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              {isSigningOut ? "Signing out of all devices..." : "Sign out of all devices"}
            </button>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-6 space-y-4 dark:border-rose-900/40 dark:bg-rose-950/20">
            <div className="flex items-center gap-2 text-base font-semibold text-rose-700 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </div>
            <p className="text-xs text-rose-600/80 dark:text-rose-400/80">
              Once you delete your account, there is no going back. Please be certain.
            </p>

            <button className="w-full rounded-lg border border-rose-300 bg-background px-4 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950 dark:hover:bg-rose-900">
              Deactivate Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}