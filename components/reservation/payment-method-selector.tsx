'use client';

import { CreditCard, Banknote, ShieldCheck } from 'lucide-react';

interface PaymentMethodSelectorProps {
  paymentMethod?: 'card' | 'onsite';
  onMethodChange?: (method: 'card' | 'onsite') => void;
}

export function PaymentMethodSelector({
  paymentMethod = 'card',
  onMethodChange,
}: PaymentMethodSelectorProps) {
  return (
    <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm space-y-6">
      <h3 className="text-lg font-semibold">Payment Method</h3>

      <div className="space-y-4">
       
        <label
          className={`block border rounded-xl p-4 cursor-pointer transition-all ${
            paymentMethod === 'card'
              ? 'border-primary bg-primary/5 ring-1 ring-primary'
              : 'border-border hover:bg-muted/30'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={() => onMethodChange?.('card')}
                className="w-4 h-4 text-primary accent-primary"
              />
              <div>
                <span className="font-semibold text-sm sm:text-base block">
                  Credit or Debit Card
                </span>
                <span className="text-xs text-muted-foreground">
                  Pay securely online now. Visa and Mastercard accepted.
                </span>
              </div>
            </div>
            <CreditCard className="w-5 h-5 text-muted-foreground" />
          </div>

          {paymentMethod === 'card' && (
            <div className="mt-4 pt-4 border-t space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="XXXX XXXX XXXX XXXX"
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM / YY"
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    CVC / CVV
                  </label>
                  <input
                    type="text"
                    placeholder="CVC"
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          )}
        </label>

    
        <label
          className={`block border rounded-xl p-4 cursor-pointer transition-all ${
            paymentMethod === 'onsite'
              ? 'border-primary bg-primary/5 ring-1 ring-primary'
              : 'border-border hover:bg-muted/30'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="paymentMethod"
                value="onsite"
                checked={paymentMethod === 'onsite'}
                onChange={() => onMethodChange?.('onsite')}
                className="w-4 h-4 text-primary accent-primary"
              />
              <div>
                <span className="font-semibold text-sm sm:text-base block">
                  Pay at Pick-up (On-Site)
                </span>
                <span className="text-xs text-muted-foreground">
                  Pay with cash (USD) or card directly when receiving your vehicle key at the desk.
                </span>
              </div>
            </div>
            <Banknote className="w-5 h-5 text-muted-foreground" />
          </div>
        </label>
      </div>

      <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 pt-1">
        <ShieldCheck className="w-4 h-4" />
        <span>Encrypted and secure booking process. No hidden fees.</span>
      </div>
    </div>
  );
}