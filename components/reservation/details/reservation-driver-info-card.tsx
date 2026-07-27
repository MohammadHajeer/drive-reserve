"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ReservationDriverInfoCard() {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-foreground">Driver Information</h3>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl border bg-muted/20">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User className="size-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Sarah Jenkins</p>
            <p className="text-xs text-muted-foreground">Primary Driver</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="text-muted-foreground uppercase tracking-wider block text-[10px] font-semibold">Email Address</span>
            <p className="font-medium text-foreground">s.jenkins@example.com</p>
          </div>
          <div>
            <span className="text-muted-foreground uppercase tracking-wider block text-[10px] font-semibold">Phone Number</span>
            <p className="font-medium text-foreground">+1 (555) 214-8890</p>
          </div>
          <div>
            <span className="text-muted-foreground uppercase tracking-wider block text-[10px] font-semibold">Driving License</span>
            <p className="font-medium text-foreground">VA-9918273 <span className="text-emerald-600 font-semibold">(Verified)</span></p>
          </div>
        </div>

        <Link href="/profile" className="block">
          <Button
            variant="outline"
            className="w-full h-12 justify-between px-5 text-sm font-semibold rounded-xl"
          >
            Manage Driver Details
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
