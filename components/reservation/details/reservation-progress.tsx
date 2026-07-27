import { Check, X } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReservationStatus } from "@/types/domain";

type LifecycleStepState = "complete" | "current" | "upcoming";
type SuccessfulReservationStatus = Exclude<
  ReservationStatus,
  "cancelled" | "rejected"
>;

type ProgressState = {
  fillPercent: number;
  steps: readonly [
    LifecycleStepState,
    LifecycleStepState,
    LifecycleStepState,
    LifecycleStepState,
  ];
};

export const RESERVATION_PROGRESS_STATES: Record<
  SuccessfulReservationStatus,
  ProgressState
> = {
  pending: {
    fillPercent: 0,
    steps: ["complete", "current", "upcoming", "upcoming"],
  },
  confirmed: {
    fillPercent: 33.333,
    steps: ["complete", "complete", "upcoming", "upcoming"],
  },
  active: {
    fillPercent: 66.667,
    steps: ["complete", "complete", "complete", "current"],
  },
  completed: {
    fillPercent: 100,
    steps: ["complete", "complete", "complete", "complete"],
  },
};

const lifecycleSteps = ["Booked", "Confirmed", "Pick-up", "Returned"] as const;

type ReservationProgressProps = {
  createdAt: string;
  pickupDate: string;
  returnDate: string;
  status: ReservationStatus;
};

export function ReservationProgress(props: ReservationProgressProps) {
  if (props.status === "cancelled" || props.status === "rejected") {
    return <TerminalProgress status={props.status} createdAt={props.createdAt} />;
  }

  const progress = RESERVATION_PROGRESS_STATES[props.status];
  const descriptions = getDescriptions(props);

  return (
    <Card>
      <CardContent>
        <div>
          <h2 className="text-lg font-bold">Booking progress</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Current position in the reservation lifecycle.
          </p>
        </div>

        <div className="mt-6 space-y-0 sm:hidden">
          {lifecycleSteps.map((label, index) => (
            <MobileStep
              key={label}
              index={index}
              label={label}
              description={descriptions[index]}
              state={progress.steps[index]}
              nextState={progress.steps[index + 1]}
              isLast={index === lifecycleSteps.length - 1}
            />
          ))}
        </div>

        <div className="relative mt-8 hidden sm:block">
          <div className="absolute top-4 right-[12.5%] left-[12.5%] h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${progress.fillPercent}%` }}
            />
          </div>
          <div className="relative grid grid-cols-4 gap-3">
            {lifecycleSteps.map((label, index) => (
              <Step
                key={label}
                label={label}
                description={descriptions[index]}
                state={progress.steps[index]}
                index={index}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Step({
  description,
  index,
  label,
  state,
}: {
  description: string;
  index: number;
  label: string;
  state: LifecycleStepState;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center text-center">
      <StepIcon state={state} index={index} />
      <p className="mt-3 text-sm font-semibold">{label}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
    </div>
  );
}

function MobileStep({
  description,
  index,
  isLast,
  label,
  nextState,
  state,
}: {
  description: string;
  index: number;
  isLast: boolean;
  label: string;
  nextState?: LifecycleStepState;
  state: LifecycleStepState;
}) {
  return (
    <div className="grid grid-cols-[2rem_1fr] gap-3">
      <div className="flex flex-col items-center">
        <StepIcon state={state} index={index} />
        {!isLast && (
          <span
            className={cn(
              "min-h-10 w-1 flex-1 bg-muted",
              nextState === "complete" && "bg-primary",
            )}
          />
        )}
      </div>
      <div className={cn("pb-5", isLast && "pb-0")}>
        <p className="font-semibold">{label}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function StepIcon({
  index,
  state,
}: {
  index: number;
  state: LifecycleStepState;
}) {
  return (
    <span
      className={cn(
        "relative z-10 flex size-8 items-center justify-center rounded-full border-2 bg-card text-xs font-bold",
        state === "complete" && "border-primary bg-primary text-primary-foreground",
        state === "current" && "border-primary text-primary ring-4 ring-primary/10",
        state === "upcoming" && "border-border text-muted-foreground",
      )}
      aria-label={state}
    >
      {state === "complete" ? <Check className="size-4" aria-hidden="true" /> : index + 1}
    </span>
  );
}

function TerminalProgress({
  createdAt,
  status,
}: {
  createdAt: string;
  status: "cancelled" | "rejected";
}) {
  const label = status === "rejected" ? "Rejected" : "Cancelled";

  return (
    <Card className="ring-destructive/20">
      <CardContent>
        <h2 className="text-lg font-bold">Reservation {status}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This reservation ended before pickup and will not progress further.
        </p>
        <div className="mt-7 grid grid-cols-[2rem_minmax(3rem,1fr)_2rem_minmax(0,1fr)] items-start gap-3 sm:max-w-xl">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="size-4" aria-hidden="true" />
          </span>
          <span className="mt-3 h-1 rounded-full bg-destructive" />
          <span
            className="flex size-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
            aria-label={`Reservation ${status}`}
          >
            <X className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold text-destructive">{label}</p>
            <p className="mt-1 text-xs text-muted-foreground">Terminal status</p>
          </div>
          <div className="col-span-2 text-sm">
            <p className="font-semibold">Booked</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Submitted {formatDateTime(createdAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getDescriptions(props: ReservationProgressProps) {
  const confirmedDescription =
    props.status === "pending" ? "Awaiting approval" : "Confirmed";
  const pickupDescription =
    props.status === "active" || props.status === "completed"
      ? props.status === "active"
        ? "In progress"
        : "Completed"
      : `Scheduled ${formatDate(props.pickupDate)}`;
  const returnDescription =
    props.status === "completed"
      ? "Completed"
      : props.status === "active"
        ? `Due ${formatDate(props.returnDate)}`
        : `Scheduled ${formatDate(props.returnDate)}`;

  return [
    `Submitted ${formatDateTime(props.createdAt)}`,
    confirmedDescription,
    pickupDescription,
    returnDescription,
  ] as const;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
