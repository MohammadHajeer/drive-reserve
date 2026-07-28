"use client";

import { useState } from "react";
import { LoaderCircle, TriangleAlert } from "lucide-react";

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

type CustomerReservationCancelDialogProps = {
  carName: string;
  isPending: boolean;
  onCancel: (reason: string) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function CustomerReservationCancelDialog({
  carName,
  isPending,
  onCancel,
  onOpenChange,
  open,
}: CustomerReservationCancelDialogProps) {
  const [reason, setReason] = useState("");
  const trimmedReason = reason.trim();

  function changeOpen(nextOpen: boolean) {
    if (isPending) return;

    if (!nextOpen) setReason("");
    onOpenChange(nextOpen);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isPending && trimmedReason) onCancel(trimmedReason);
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent showCloseButton={!isPending}>
        <form onSubmit={submit} className="grid gap-6">
          <DialogHeader>
            <span className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <TriangleAlert aria-hidden="true" />
            </span>
            <DialogTitle>Cancel this reservation?</DialogTitle>
            <DialogDescription>
              Cancelling your reservation for {carName} is irreversible. The
              dates will be released for other customers.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="cancellation-reason">Reason for cancellation</Label>
            <Textarea
              id="cancellation-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Tell us why you need to cancel"
              maxLength={1000}
              disabled={isPending}
              required
              aria-describedby="cancellation-reason-help"
            />
            <p
              id="cancellation-reason-help"
              className="flex justify-between text-xs text-muted-foreground"
            >
              <span>A reason is required by the reservation policy.</span>
              <span>{reason.length}/1000</span>
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => changeOpen(false)}
            >
              Keep reservation
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isPending || !trimmedReason}
            >
              {isPending ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                  Cancelling...
                </>
              ) : (
                "Cancel reservation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
