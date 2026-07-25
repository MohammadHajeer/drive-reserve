'use client';

interface FareSummaryCardProps {
  dailyPrice?: number;
  days?: number;
  serviceFee?: number;
  taxRate?: number;
  agreeToTerms?: boolean;
  onAgreeChange?: (agreed: boolean) => void;
  onConfirm?: () => void;
}

export function FareSummaryCard({
  dailyPrice = 149,
  days = 3,
  serviceFee = 45,
  taxRate = 0.08,
  agreeToTerms = false,
  onAgreeChange,
  onConfirm,
}: FareSummaryCardProps) {
  const rentalTotal = dailyPrice * days;
  const estimatedTax = Math.round((rentalTotal + serviceFee) * taxRate);
  const totalAmount = rentalTotal + serviceFee + estimatedTax;

  return (
    <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm sticky top-24 space-y-6">
      <h3 className="text-lg font-semibold border-b pb-3">Fare Summary</h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>
            Vehicle Rental (${dailyPrice} × {days} days)
          </span>
          <span className="font-medium text-foreground">${rentalTotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-muted-foreground">
          <span>Service & Facility Fee</span>
          <span className="font-medium text-foreground">${serviceFee.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-muted-foreground">
          <span>Estimated Taxes</span>
          <span className="font-medium text-foreground">${estimatedTax.toFixed(2)}</span>
        </div>

        <div className="border-t pt-3 flex justify-between items-center font-bold text-base">
          <span>Total Amount</span>
          <span className="text-primary text-xl">${totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <label className="flex items-start gap-2 cursor-pointer text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={agreeToTerms}
            onChange={(e) => onAgreeChange?.(e.target.checked)}
            className="mt-0.5 rounded text-primary focus:ring-primary accent-primary"
          />
          <span>
            I agree to the{' '}
            <a href="#" className="text-primary hover:underline">
              Rental Terms
            </a>
            ,{' '}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
            , and cancellation rules.
          </span>
        </label>

        <button
          type="button"
          onClick={onConfirm}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-xl shadow transition-colors"
        >
          Confirm & Reserve
        </button>
      </div>
    </div>
  );
}