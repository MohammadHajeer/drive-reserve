import { CalendarCheck, CarFront, ClipboardCheck } from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";

const steps = [
  { number: "01", title: "Choose Your Dates", description: "Enter your pickup and return dates to start your search.", icon: CalendarCheck },
  { number: "02", title: "Browse & Select", description: "Compare available vehicles, details, features, and prices.", icon: CarFront },
  { number: "03", title: "Complete Reservation", description: "Submit your reservation details and track its approval status.", icon: ClipboardCheck },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="overflow-hidden bg-slate-950 py-20 text-white sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <SectionHeading
          eyebrow="How it works"
          title="Reserve your car in three simple steps"
          description="A straightforward process from searching to submitting your reservation."
          className="[&_h2]:text-white [&_p:last-child]:text-slate-400"
        />

        <div className="relative mt-14 grid gap-6 lg:grid-cols-3">
          <div className="absolute left-[16.66%] right-[16.66%] top-12 hidden border-t border-dashed border-white/15 lg:block" />
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <article key={step.number} className="relative rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur transition-transform hover:-translate-y-1">
                <div className="relative z-10 flex items-center justify-between">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                    <Icon className="size-6" />
                  </span>
                  <span className="text-4xl font-black text-white/10">{step.number}</span>
                </div>
                <h3 className="mt-7 text-xl font-bold">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{step.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
