import type { DateRange } from "react-day-picker";

import type { CalendarDateSpan } from "./reservation-calendar.utils";

export type CalendarLoadState =
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; message: string };

export type RentalCalendarProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  displayedMonth: Date;
  onMonthChange: (month: Date) => void;
  isDesktop: boolean;
  selectedRange: DateRange | undefined;
  calendarSelectedRange: DateRange | undefined;
  onRangeSelect: (range: DateRange | undefined, triggerDate: Date) => void;
  earliestPickupDate: Date;
  latestPickupDate: Date;
  loadState: CalendarLoadState;
  onRetryUnavailableRanges: () => void;
  isDateDisabled: (date: Date) => boolean;
  allUnavailableRanges: CalendarDateSpan[];
  myReservationRanges: CalendarDateSpan[];
  otherReservationRanges: CalendarDateSpan[];
  returnBoundaryDates: Date[];
  maxRentalDays: number;
  selectionError: string | null;
  onClear: () => void;
  onDone: () => void;
  canDone: boolean;
};

export type RentalCalendarContentProps = Omit<
  RentalCalendarProps,
  "open" | "onOpenChange" | "isDesktop"
> & {
  variant: "desktop" | "mobile";
  closeControl?: React.ReactNode;
};

