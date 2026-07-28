import { CheckCircle2, Clock3, MailCheck, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CustomerProfile } from "@/features/customer/profile/customer-profile.schema";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

export function AccountActivity({ profile }: { profile: CustomerProfile }) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
          Account activity
        </CardTitle>
        <CardDescription>Verified details from your account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ActivityRow
          icon={Clock3}
          label="Member since"
          value={dateFormatter.format(new Date(profile.createdAt))}
        />
        <Separator />
        <ActivityRow
          icon={CheckCircle2}
          label="Profile updated"
          value={dateFormatter.format(new Date(profile.updatedAt))}
        />
        <Separator />
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <MailCheck className="size-4" aria-hidden="true" />
            Email
          </span>
          <Badge variant={profile.emailVerified ? "success" : "secondary"}>
            {profile.emailVerified ? "Verified" : "Not verified"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" aria-hidden="true" />
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

