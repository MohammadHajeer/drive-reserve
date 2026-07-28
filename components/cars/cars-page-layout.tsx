import type { ReactNode } from "react";

type CarsPageLayoutProps = {
  header: ReactNode;
  sidebar: ReactNode;
  search: ReactNode;
  results: ReactNode;
};

export function CarsPageLayout({
  header,
  sidebar,
  search,
  results,
}: CarsPageLayoutProps) {
  return (
    <main className="min-h-screen overflow-x-clip bg-background py-8 container-paddings lg:py-10">
      <div className="mx-auto max-w-7xl">
        {header}
        <div className="mt-7 grid min-w-0 gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          {sidebar}
          <section className="min-w-0 space-y-5" aria-label="Vehicle results">
            {search}
            {results}
          </section>
        </div>
      </div>
    </main>
  );
}
