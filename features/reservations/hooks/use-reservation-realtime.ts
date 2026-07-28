"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { createClient } from "@/lib/supabase/client";

import { reservationQueryKeys } from "../reservation-query-keys";

const carIdSchema = z.uuid();

export function useReservationRealtime(carId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!carIdSchema.safeParse(carId).success) {
      return;
    }

    const supabase = createClient();
    const channel = supabase
      .channel(`car:${carId}:availability`)
      .on("broadcast", { event: "availability_changed" }, ({ payload }) => {
        console.log("[reservation-realtime] availability changed", payload);

        void queryClient.invalidateQueries({
          queryKey: reservationQueryKeys.car(carId),
        });
      })
      .subscribe((status, error) => {
        if (
          process.env.NODE_ENV === "development" &&
          (status === "CHANNEL_ERROR" || status === "TIMED_OUT")
        ) {
          console.warn(
            `[reservation-realtime] ${status} for car ${carId}`,
            error,
          );
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [carId, queryClient]);
}
