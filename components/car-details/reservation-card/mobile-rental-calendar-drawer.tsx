"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { RentalCalendarContent } from "./rental-calendar-content";
import type { RentalCalendarProps } from "./reservation-calendar.types";

type MobileRentalCalendarDrawerProps = RentalCalendarProps & {
  trigger: ReactNode;
};

export function MobileRentalCalendarDrawer({
  trigger,
  open,
  onOpenChange,
  ...contentProps
}: MobileRentalCalendarDrawerProps) {
  const closeControl = (
    <DrawerClose
      render={
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          aria-label="Close rental calendar"
        />
      }
    >
      <X className="size-5" aria-hidden="true" />
    </DrawerClose>
  );

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      modal
      showSwipeHandle
      swipeDirection="down"
    >
      <DrawerTrigger
        render={
          <button
            type="button"
            aria-label="Choose pickup and return dates"
            className="w-full text-left"
          />
        }
      >
        {trigger}
      </DrawerTrigger>
      <DrawerContent className="max-h-[90dvh] [--drawer-content-max-height:90dvh] [--drawer-inset:0px] rounded-b-none border-border/70">
        <DrawerTitle className="sr-only">Choose rental dates</DrawerTitle>
        <DrawerDescription className="sr-only">
          Select an available pickup and return date for this rental.
        </DrawerDescription>
        <RentalCalendarContent
          variant="mobile"
          closeControl={closeControl}
          {...contentProps}
        />
      </DrawerContent>
    </Drawer>
  );
}
