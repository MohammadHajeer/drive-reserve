import { Quote, Star } from "lucide-react";

export function Testimonials() {
  return (
    <section className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
        <article className="relative overflow-hidden rounded-[2rem] border bg-card p-7 shadow-xl shadow-slate-900/5 sm:p-12">
          <Quote className="absolute right-8 top-6 size-24 text-primary/8" />
          <div className="relative">
            <div className="flex gap-1 text-amber-400" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="size-5 fill-current" />
              ))}
            </div>
            <blockquote className="mt-7 text-2xl font-semibold leading-10 tracking-tight text-foreground sm:text-3xl sm:leading-12">
              “The reservation process was clear from beginning to end. I found the right car quickly, understood the price, and could easily follow my reservation status.”
            </blockquote>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex size-13 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">RK</div>
              <div>
                <p className="font-bold">Rami Khalil</p>
                <p className="text-sm text-muted-foreground">DriveReserve customer</p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
