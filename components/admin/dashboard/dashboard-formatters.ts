const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const wholeCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 0,
});

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function formatWholeCurrency(value: number) {
  return wholeCurrencyFormatter.format(value);
}

export function formatCompactCurrency(value: number) {
  return compactCurrencyFormatter.format(value);
}

export function formatMonth(value: string) {
  return monthFormatter.format(new Date(`${value}T00:00:00Z`));
}

export function formatDateOnly(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

export function formatReservationReference(id: string) {
  return `#${id.slice(0, 8).toUpperCase()}`;
}
