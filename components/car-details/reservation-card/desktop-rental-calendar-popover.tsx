"use client";

import type { ReactNode } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { RentalCalendarContent } from "./rental-calendar-content";
import type { RentalCalendarProps } from "./reservation-calendar.types";

type DesktopRentalCalendarPopoverProps = RentalCalendarProps & {
  trigger: ReactNode;
};

export function DesktopRentalCalendarPopover({
  trigger,
  open,
  onOpenChange,
  ...contentProps
}: DesktopRentalCalendarPopoverProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange} modal={false}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label="Choose pickup and return dates"
            className="w-full text-left"
          />
        }
      >
        {trigger}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={10}
        collisionPadding={16}
        className="w-auto max-w-[calc(100vw-2rem)] gap-0 overflow-hidden rounded-2xl border border-border/70 p-0 shadow-xl"
      >
        <RentalCalendarContent variant="desktop" {...contentProps} />
      </PopoverContent>
    </Popover>
  );
}
