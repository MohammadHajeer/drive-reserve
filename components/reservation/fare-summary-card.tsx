"use client";

import { LoaderCircle } from "lucide-react";

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
    <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm sticky top-24 space-y-6">
      <h3 className="text-lg font-semibold border-b pb-3">Fare Summary</h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>
            Vehicle Rental (${dailyPrice.toFixed(2)} × {days}{" "}
            {days === 1 ? "day" : "days"})
          </span>
          <span className="font-medium text-foreground">
            ${totalPrice.toFixed(2)}
          </span>
        </div>

        <div className="border-t pt-3 flex justify-between items-center font-bold text-base">
          <span>Total Amount</span>
          <span className="text-primary text-xl">
            ${totalPrice.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <label className="flex items-start gap-2 cursor-pointer text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={agreeToTerms}
            onChange={(event) => onAgreeChange(event.target.checked)}
            disabled={disabled}
            className="mt-0.5 rounded text-primary focus:ring-primary accent-primary"
          />
          <span>
            I agree to the{" "}
            <a href="#" className="text-primary hover:underline">
              Rental Terms
            </a>
            ,{" "}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
            , and cancellation rules.
          </span>
        </label>

        <button
          type="button"
          onClick={onConfirm}
          disabled={disabled}
          className="flex w-full items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-xl shadow transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              Submitting...
            </>
          ) : (
            "Confirm & Reserve"
          )}
        </button>
      </div>
    </div>
  );
}
