"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function ToastTester() {
  function showDefaultToast() {
    toast("Reservation updated", {
      description: "Your reservation information has been updated.",
    });
  }

  function showSuccessToast() {
    toast.success("Reservation submitted", {
      description:
        "Your reservation is pending approval. You can track it from My Reservations.",
    });
  }

  function showInfoToast() {
    toast.info("Availability updated", {
      description:
        "The rental price has been recalculated for your selected dates.",
    });
  }

  function showWarningToast() {
    toast.warning("Rental period too long", {
      description:
        "A reservation cannot exceed the maximum rental period of 30 days.",
    });
  }

  function showErrorToast() {
    toast.error("Car unavailable", {
      description:
        "This vehicle already has a reservation that overlaps with the selected dates.",
    });
  }

  function showLoadingToast() {
    const toastId = toast.loading("Checking car availability...", {
      description: "Please wait while we check the selected dates.",
    });

    setTimeout(() => {
      toast.success("Car is available", {
        id: toastId,
        description: "The selected dates are available for reservation.",
      });
    }, 2500);
  }

  function showPromiseToast() {
    toast.promise(wait(2500), {
      loading: "Submitting your reservation...",
      success: {
        message: "Reservation submitted",
        description: "Your reservation was submitted and is awaiting approval.",
      },
      error: {
        message: "Reservation failed",
        description: "We could not submit your reservation. Please try again.",
      },
    });
  }

  function showActionToast() {
    toast.info("Reservation pending", {
      description: "You can review its current status from your reservations.",
      action: {
        label: "View",
        onClick: () => {
          window.location.href = "/my-reservations";
        },
      },
    });
  }

  return (
    <section className="mx-auto w-full max-w-3xl rounded-2xl border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-medium text-primary">Developer preview</p>

        <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
          Toast tester
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Test the different DriveReserve toast states and interactions.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Button variant="outline" onClick={showDefaultToast}>
          Default
        </Button>

        <Button variant="outline" onClick={showSuccessToast}>
          Success
        </Button>

        <Button variant="outline" onClick={showInfoToast}>
          Information
        </Button>

        <Button variant="outline" onClick={showWarningToast}>
          Warning
        </Button>

        <Button variant="destructive" onClick={showErrorToast}>
          Error
        </Button>

        <Button variant="outline" onClick={showLoadingToast}>
          Loading
        </Button>

        <Button onClick={showPromiseToast}>Promise</Button>

        <Button variant="secondary" onClick={showActionToast}>
          With action
        </Button>

        <Button variant="ghost" onClick={() => toast.dismiss()}>
          Dismiss all
        </Button>
      </div>
    </section>
  );
}
