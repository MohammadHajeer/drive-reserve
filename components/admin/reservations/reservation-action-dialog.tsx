"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AdminReservation } from "@/features/admin/reservations/admin-reservation.types";
import { ADMIN_RESERVATION_TRANSITION_LABELS } from "@/features/admin/reservations/admin-reservation.types";
import type { ReservationStatus } from "@/types/domain";

export function ReservationActionDialog({
  reservation,
  targetStatus,
  open,
  busy,
  onOpenChange,
  onConfirm,
}: {
  reservation?: AdminReservation;
  targetStatus: Exclude<ReservationStatus, "pending">;
  open: boolean;
  busy: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason?: string) => void;
}) {
  const [reason, setReason] = useState("");
  const requiresReason =
    targetStatus === "rejected" || targetStatus === "cancelled";
  const actionLabel = ADMIN_RESERVATION_TRANSITION_LABELS[targetStatus];
  const destructive = requiresReason;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (busy) return;
        if (!nextOpen) setReason("");
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{actionLabel} reservation</DialogTitle>
          <DialogDescription>
            Change reservation {reservation?.id ?? ""} from {reservation?.status}
            {" to "}
            {targetStatus}. This must follow the reservation lifecycle rules.
          </DialogDescription>
        </DialogHeader>

        {requiresReason && (
          <div className="space-y-2">
            <Label htmlFor="reservation-status-reason">
              {targetStatus === "rejected" ? "Rejection" : "Cancellation"}{" "}
              reason
            </Label>
            <Textarea
              id="reservation-status-reason"
              maxLength={1000}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Enter a clear reason for the customer..."
              className="min-h-28"
            />
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Keep current status
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            disabled={busy || (requiresReason && !reason.trim())}
            onClick={() => onConfirm(reason.trim() || undefined)}
          >
            {busy && <Loader2 className="animate-spin" />}
            {actionLabel} reservation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
