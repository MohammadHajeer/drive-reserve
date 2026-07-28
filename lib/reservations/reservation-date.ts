export const RESERVATION_TIME_ZONE = "Asia/Beirut";
export const MILLISECONDS_PER_DAY = 86_400_000;

const beirutDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: RESERVATION_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function isValidDateOnly(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function parseDateOnly(value: string): Date | null {
  if (!isValidDateOnly(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getBeirutDateOnly(date = new Date()): string {
  const parts = beirutDateFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Unable to determine the current date in Beirut.");
  }

  return `${year}-${month}-${day}`;
}

export function addDaysToDateOnly(value: string, days: number): string {
  if (!isValidDateOnly(value) || !Number.isInteger(days)) {
    throw new Error("A valid calendar date and whole number of days are required.");
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));

  return [
    String(date.getUTCFullYear()).padStart(4, "0"),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export function getEarliestPickupDateOnly(date = new Date()): string {
  return addDaysToDateOnly(getBeirutDateOnly(date), 1);
}

export function dateDifferenceInDays(from: string, to: string): number {
  if (!isValidDateOnly(from) || !isValidDateOnly(to)) {
    return Number.NaN;
  }

  const [fromYear, fromMonth, fromDay] = from.split("-").map(Number);
  const [toYear, toMonth, toDay] = to.split("-").map(Number);

  return (
    (Date.UTC(toYear, toMonth - 1, toDay) -
      Date.UTC(fromYear, fromMonth - 1, fromDay)) /
    MILLISECONDS_PER_DAY
  );
}
