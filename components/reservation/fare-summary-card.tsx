"use client";

import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type FareSummaryCardProps = {
  dailyPrice: number;
  days: number;
  totalPrice: number;
  agreeToTerms: boolean;
  onAgreeChange: (agreed: boolean) => void;
  onConfirm: () => void;
  disabled: boolean;
  isLoading: boolean;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function FareSummaryCard({
  dailyPrice,
  days,
  totalPrice,
  agreeToTerms,
  onAgreeChange,
  onConfirm,
  disabled,
  isLoading,
}: FareSummaryCardProps) {
  return (
    <div className="sticky top-24 space-y-6 rounded-4xl bg-card p-6 text-card-foreground shadow-md ring-1 ring-foreground/5">
      <h2 className="border-b pb-3 text-lg font-semibold">Fare summary</h2>

      <dl className="space-y-3 text-sm">
        <div className="flex justify-between gap-4 text-muted-foreground">
          <dt>
            {currency.format(dailyPrice)} × {days} {days === 1 ? "day" : "days"}
          </dt>
          <dd className="font-medium text-foreground">
            {currency.format(totalPrice)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 border-t pt-3 text-base font-bold">
          <dt>Total price</dt>
          <dd className="text-xl text-primary">{currency.format(totalPrice)}</dd>
        </div>
      </dl>

      <div className="space-y-4 pt-2">
        <label className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-muted-foreground">
          <Checkbox
            checked={agreeToTerms}
            onCheckedChange={(checked) => onAgreeChange(checked === true)}
            disabled={disabled}
            aria-label="Acknowledge reservation policy"
          />
          <span>
            I understand that this request starts as pending and that cancelling
            an eligible reservation requires a reason.
          </span>
        </label>

        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={onConfirm}
          disabled={disabled}
        >
          {isLoading ? (
            <>
              <LoaderCircle className="animate-spin" aria-hidden="true" />
              Submitting...
            </>
          ) : (
            "Confirm and reserve"
          )}
        </Button>
      </div>
    </div>
  );
}
