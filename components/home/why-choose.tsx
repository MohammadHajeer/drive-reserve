import { BadgeDollarSign, CarFront, LockKeyhole, Zap } from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";

const benefits = [
  { title: "Wide Selection", description: "Choose from economy, sedan, SUV, luxury, and electric vehicles.", icon: CarFront },
  { title: "Transparent Pricing", description: "See clear daily rates and reservation costs without hidden surprises.", icon: BadgeDollarSign },
  { title: "Secure Booking", description: "Your account and reservation information are handled through a secure platform.", icon: LockKeyhole },
  { title: "Fast Reservation", description: "Search, compare, and submit your reservation in a few simple steps.", icon: Zap },
];

export function WhyChoose() {
  return (
    <section id="benefits" className="bg-background py-20 sm:py-24 container-paddings">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Why DriveReserve"
          title="Car rental made clearer and easier"
          description="Everything you need to confidently choose and reserve your next vehicle."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <article key={benefit.title} className="rounded-3xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-slate-900/5">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{benefit.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
