"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { CarCard } from "@/components/cars/car-card";
import { CarsPagination } from "@/components/cars/cars-pagination";
import { ClearCarsFilters } from "@/components/cars/clear-cars-filters";
import { CarFront } from "lucide-react";
import type { PublicCarListItem, PublicCarsPagination, PublicCarView } from "@/lib/cars/public-cars";
import { cn } from "@/lib/utils";

import { SmartMatcherWidget } from "./smart-matcher-widget";

type SmartMatch = {
  id: string;
  score: number;
  snippet: string;
  rank?: number;
};

type CarsResultsWithAIProps = {
  cars: PublicCarListItem[];
  pagination: PublicCarsPagination;
  view: PublicCarView;
  errorMessage?: string;
};

export function SmartCarsResults({ cars, pagination, view, errorMessage }: CarsResultsWithAIProps) {
  const [matches, setMatches] = useState<SmartMatch[] | null>(null);
  const [enrichedCars, setEnrichedCars] = useState<PublicCarListItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [lastQuery, setLastQuery] = useState<string>("");

  const matchMap = useMemo(() => {
    if (!matches) return null;
    return new Map(matches.map((m) => [m.id, m]));
  }, [matches]);

  const RELEVANCE_THRESHOLD = 0.5;

  // Detect explicitly requested categories/brands/models/fuel/transmission (strict filtering)
  const requestedCategories = useMemo(() => {
    const q = lastQuery.toLowerCase();
    const known = ["economy", "sedan", "suv", "luxury", "electric", "hatchback", "compact", "coupe"];
    return known.filter((c) => q.includes(c) || q.includes(c + "s"));
  }, [lastQuery]);
  const requestedFuels = useMemo(() => {
    const q = lastQuery.toLowerCase();
    const qWords = q.split(/[\s,\-_]+/).filter(Boolean);
    const lev = (a: string, b: string) => {
      if (a === b) return 0;
      if (Math.abs(a.length - b.length) > 1) return 2;
      let i = 0, j = 0, d = 0;
      while (i < a.length && j < b.length) {
        if (a[i] === b[j]) { i++; j++; } else { d++; if (d > 1) return d; if (a.length === b.length) { i++; j++; } else if (a.length > b.length) i++; else j++; }
      }
      return d + (a.length - i) + (b.length - j);
    };
    const known = ["petrol", "diesel", "hybrid", "electric"];
    let fuels = known.filter((f) => q.includes(f) || qWords.some((w) => w.length >= 3 && (w === f || lev(w, f) <= 1)));
    if (qWords.some((w) => w === "diesil" || w === "deasel" || lev(w, "diesel") <= 1) && !fuels.includes("diesel")) fuels = [...fuels, "diesel"];
    return fuels;
  }, [lastQuery]);
  const requestedTrans = useMemo(() => {
    const q = lastQuery.toLowerCase();
    const qWords = q.split(/[\s,\-_]+/).filter(Boolean);
    const lev = (a: string, b: string) => {
      if (a === b) return 0;
      if (Math.abs(a.length - b.length) > 1) return 2;
      let i = 0, j = 0, d = 0;
      while (i < a.length && j < b.length) {
        if (a[i] === b[j]) { i++; j++; } else { d++; if (d > 1) return d; if (a.length === b.length) { i++; j++; } else if (a.length > b.length) i++; else j++; }
      }
      return d + (a.length - i) + (b.length - j);
    };
    const known = ["automatic", "manual"];
    return known.filter((t) => q.includes(t) || qWords.some((w) => w.length >= 3 && (w === t || lev(w, t) <= 1)));
  }, [lastQuery]);
  const requestedBrands = useMemo(() => {
    const q = lastQuery.toLowerCase();
    const qWords = q.split(/[\s,\-_]+/).filter(Boolean);
    const brands = [...new Set(cars.map((c) => c.brand.toLowerCase()))];
    const lev = (a: string, b: string) => {
      if (a === b) return 0;
      if (Math.abs(a.length - b.length) > 1) return 2;
      let i = 0, j = 0, d = 0;
      while (i < a.length && j < b.length) {
        if (a[i] === b[j]) { i++; j++; } else { d++; if (d > 1) return d; if (a.length === b.length) { i++; j++; } else if (a.length > b.length) i++; else j++; }
      }
      return d + (a.length - i) + (b.length - j);
    };
    return brands.filter((b) => {
      if (q.includes(b)) return true;
      const parts = b.split(/[\s\-_]+/).filter(Boolean);
      return parts.some((p) => qWords.some((w) => w.length >= 3 && (p === w || p.startsWith(w) || w.startsWith(p) || lev(p, w) <= 1)));
    });
  }, [lastQuery, cars]);
  const requestedModels = useMemo(() => {
    const q = lastQuery.toLowerCase();
    const qWords = q.split(/[\s,\-_]+/).filter(Boolean);
    const models = [...new Set(cars.map((c) => c.model.toLowerCase()))];
    const lev2 = (a: string, b: string) => {
      if (a === b) return 0;
      if (Math.abs(a.length - b.length) > 1) return 2;
      let i = 0, j = 0, d = 0;
      while (i < a.length && j < b.length) {
        if (a[i] === b[j]) { i++; j++; } else { d++; if (d > 1) return d; if (a.length === b.length) { i++; j++; } else if (a.length > b.length) i++; else j++; }
      }
      return d + (a.length - i) + (b.length - j);
    };
    return models.filter((m) => {
      if (q.includes(m)) return true;
      const parts = m.split(/[\s\-_]+/).filter(Boolean);
      return parts.some((p) => p.length >= 2 && qWords.some((w) => w.length >= 2 && (p === w || p.startsWith(w) || w.startsWith(p) || lev2(p, w) <= 1))) || qWords.includes(m);
    });
  }, [lastQuery, cars]);
  const hasStrictCategory = requestedCategories.length > 0;
  const hasStrictBrandOrModel = requestedBrands.length > 0 || requestedModels.length > 0;
  const hasStrictFuel = requestedFuels.length > 0;
  const hasStrictTrans = requestedTrans.length > 0;
  const requestedMaxPrice = useMemo(() => {
    const m = lastQuery.toLowerCase().match(/(?:under|below|max|up to|less than|budget)\s*\$?\s*(\d{2,3})/);
    return m ? Number(m[1]) : undefined;
  }, [lastQuery]);
  const requestedSeats = useMemo(() => {
    const m = lastQuery.toLowerCase().match(/(\d+)\s*(?:seat|passenger|people)/);
    return m ? Number(m[1]) : undefined;
  }, [lastQuery]);
  const requestedSort = useMemo(() => {
    const q = lastQuery.toLowerCase();
    if (q.includes("low to high price") || q.includes("cheap to expensive") || q.includes("lowest price") || (q.includes("low") && q.includes("price") && q.includes("to high"))) return "price-asc" as const;
    if (q.includes("high to low price") || q.includes("expensive to cheap") || q.includes("highest price") || (q.includes("high") && q.includes("price") && q.includes("to low"))) return "price-desc" as const;
    if (q.includes("alphabetical") || q.includes("a to z")) return "brand-asc" as const;
    if (q.includes("newest")) return "newest" as const;
    if (q.includes("year") && !q.includes("fuel")) return "year-desc" as const;
    return null;
  }, [lastQuery]);
  const hasStrictFilter = hasStrictCategory || hasStrictBrandOrModel || hasStrictFuel || hasStrictTrans || requestedMaxPrice !== undefined || requestedSeats !== undefined || !!requestedSort;

  // When AI did full-catalog search, base list is enrichedCars; otherwise it's the page's cars re-ordered
  const baseCars = useMemo(() => {
    if (enrichedCars) return enrichedCars;
    return null;
  }, [enrichedCars]);

  const orderedCars = useMemo(() => {
    if (!matchMap) return cars;
    const source = baseCars ?? cars;
    return [...source].sort((a, b) => {
      const sa = matchMap.get(a.id)?.score ?? -1;
      const sb = matchMap.get(b.id)?.score ?? -1;
      return sb - sa;
    });
  }, [cars, baseCars, matchMap]);

  const visibleCars = useMemo(() => {
    if (!matchMap) return orderedCars;
    if (hasStrictFilter) {
      let strict = orderedCars;
      if (hasStrictCategory) {
        strict = strict.filter((c) =>
          requestedCategories.some((r) => {
            if (r === "electric") return c.category.toLowerCase().includes("electric") || c.fuelType.toLowerCase() === "electric";
            return c.category.toLowerCase().includes(r);
          }),
        );
      }
      if (hasStrictBrandOrModel) {
        strict = strict.filter((c) => {
          const brandOk = requestedBrands.length === 0 || requestedBrands.some((b) => c.brand.toLowerCase().includes(b));
          const modelOk = requestedModels.length === 0 || requestedModels.some((m) => c.model.toLowerCase().includes(m));
          return brandOk && modelOk;
        });
      }
      if (hasStrictFuel) {
        strict = strict.filter((c) => requestedFuels.includes(c.fuelType.toLowerCase()));
      }
      if (hasStrictTrans) {
        strict = strict.filter((c) => requestedTrans.includes(c.transmission.toLowerCase()));
      }
      if (requestedMaxPrice !== undefined) {
        strict = strict.filter((c) => c.pricePerDay <= requestedMaxPrice);
      }
      if (requestedSeats !== undefined) {
        strict = strict.filter((c) => c.seats >= requestedSeats);
      }
      // Sort hints compatible with normal filters: low to high price, alphabetical, etc.
      if (requestedSort) {
        strict = [...strict].sort((a, b) => {
          if (requestedSort === "price-asc") return a.pricePerDay - b.pricePerDay;
          if (requestedSort === "price-desc") return b.pricePerDay - a.pricePerDay;
          if (requestedSort === "brand-asc") return a.brand.localeCompare(b.brand);
          if (requestedSort === "year-desc") return b.year - a.year;
          return 0;
        });
        return strict;
      }
      if (strict.length > 0) return strict;
    }
    if (showAll) return orderedCars;
    const filtered = orderedCars.filter((c) => (matchMap.get(c.id)?.score ?? 0) >= RELEVANCE_THRESHOLD);
    return filtered.length > 0 ? filtered : orderedCars;
  }, [orderedCars, matchMap, showAll, hasStrictFilter, hasStrictCategory, hasStrictBrandOrModel, hasStrictFuel, hasStrictTrans, requestedCategories, requestedBrands, requestedModels, requestedFuels, requestedTrans, requestedMaxPrice, requestedSeats, requestedSort]);

  const handleSearch = useCallback(
    async (query: string) => {
      if (cars.length === 0) {
        toast.info("No vehicles to match right now.");
        return;
      }
      let lastResText = "";
      setIsLoading(true);
      try {
        let json: any = null;
      let resOk = false;
      for (let attempt = 0; attempt < 2; attempt++) {
        const res = await fetch("/api/ai/smart-matcher", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ query }),
        });
        const text = await res.text();
        lastResText = text;
        try {
          json = JSON.parse(text) as typeof json;
        } catch {
          if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
            console.warn(`AI smart-matcher returned HTML (attempt ${attempt + 1}), retrying silently`);
            if (attempt === 0) {
              await new Promise((r) => setTimeout(r, 400));
              continue;
            }
            json = null;
            break;
          }
          console.warn("AI JSON parse failed, retrying", text.slice(0, 200));
          if (attempt === 0) {
            await new Promise((r) => setTimeout(r, 300));
            continue;
          }
          json = null;
          break;
        }
        if (!res.ok || !json || !json.success || !json.data) {
          const msg = (json as { error?: { message: string } } | null)?.error?.message || "AI matching failed";
          if (msg.includes("<!DOCTYPE") || msg.includes("Unexpected token")) {
            console.warn(`AI error looks like HTML (attempt ${attempt + 1}), retrying`);
            if (attempt === 0) {
              await new Promise((r) => setTimeout(r, 400));
              continue;
            }
          }
          throw new Error(msg);
        }
        resOk = true;
        break;
      }
      if (!resOk || !json || !json.success || !json.data) {
        // If we have no valid JSON after retries, throw a generic error that will be caught and shown as friendly toast once
        if (!json) throw new Error("AI matching failed");
        throw new Error(json.error?.message || "AI matching failed");
      }

        let enrichedList: PublicCarListItem[] | null = null;
        if (json.data.enriched && Array.isArray(json.data.enriched)) {
          enrichedList = json.data.enriched.map((e: any) => e.car).filter(Boolean) as PublicCarListItem[];
          if (enrichedList.length > 0) setEnrichedCars(enrichedList);
          else setEnrichedCars(null);
        } else {
          setEnrichedCars(null);
        }
        setLastQuery(query);
        setMatches(json.data.matches);
        setShowAll(false);
        const qLower = query.toLowerCase();
        const unsupportedKeywords = ["fuel consumption", "mpg", "horsepower", "hp ", " torque", "mileage", "0-60", "top speed", "engine", "cylinder", "displacement", "acceleration"];
        const isUnsupportedQuery = unsupportedKeywords.some((k) => qLower.includes(k));
        const qWordsToast = qLower.split(/[\s,\-_]+/).filter(Boolean);
        const levT = (a: string, b: string) => {
          if (a === b) return 0;
          if (Math.abs(a.length - b.length) > 1) return 2;
          let i = 0, j = 0, d = 0;
          while (i < a.length && j < b.length) {
            if (a[i] === b[j]) { i++; j++; } else { d++; if (d > 1) return d; if (a.length === b.length) { i++; j++; } else if (a.length > b.length) i++; else j++; }
          }
          return d + (a.length - i) + (b.length - j);
        };
        const knownForToast = ["economy", "sedan", "suv", "luxury", "electric", "hatchback", "compact", "coupe"];
        const reqCatToast = knownForToast.filter((c) => qLower.includes(c) || qLower.includes(c + "s"));
        const knownFuelsToast = ["petrol", "diesel", "hybrid", "electric"];
        const knownTransToast = ["automatic", "manual"];
        const reqFuelToast = (() => {
          let f = knownFuelsToast.filter((fu) => qLower.includes(fu) || qWordsToast.some((w) => w.length >= 3 && (w === fu || levT(w, fu) <= 1)));
          if (qWordsToast.some((w) => w === "diesil" || w === "deasel" || levT(w, "diesel") <= 1) && !f.includes("diesel")) f = [...f, "diesel"];
          return f;
        })();
        const reqTransToast = knownTransToast.filter((t) => qLower.includes(t) || qWordsToast.some((w) => w.length >= 3 && (w === t || levT(w, t) <= 1)));
        const maxPriceToast = (() => {
          const m = qLower.match(/(?:under|below|max|up to|less than|budget)\s*\$?\s*(\d{2,3})/);
          return m ? Number(m[1]) : undefined;
        })();
        const seatsToast = (() => {
          const m = qLower.match(/(\d+)\s*(?:seat|passenger|people)/);
          return m ? Number(m[1]) : undefined;
        })();
        const sortToast = (() => {
          const q = qLower;
          if (q.includes("low to high") || q.includes("cheap to expensive") || q.includes("lowest price") || (q.includes("low") && q.includes("price"))) return "price-asc";
          if (q.includes("high to low") || q.includes("expensive to cheap") || q.includes("highest price") || (q.includes("high") && q.includes("price"))) return "price-desc";
          if (q.includes("alphabetical") || q.includes("a to z") || q.includes("brand")) return "brand-asc";
          if (q.includes("newest")) return "newest";
          if (q.includes("year")) return "year-desc";
          return null;
        })();
        const sourceForToast = enrichedList ?? cars;
        const brandsToast = [...new Set(sourceForToast.map((c) => c.brand.toLowerCase()))].filter((b) => {
          if (qLower.includes(b)) return true;
          const parts = b.split(/[\s\-_]+/).filter(Boolean);
          return parts.some((p) => qWordsToast.some((w) => w.length >= 3 && (p === w || p.startsWith(w) || w.startsWith(p) || levT(p, w) <= 1)));
        });
        const modelsToast = [...new Set(sourceForToast.map((c) => c.model.toLowerCase()))].filter((m) => {
          if (qLower.includes(m)) return true;
          const parts = m.split(/[\s\-_]+/).filter(Boolean);
          return parts.some((p) => p.length >= 2 && qWordsToast.some((w) => w.length >= 2 && (p === w || p.startsWith(w) || w.startsWith(p) || levT(p, w) <= 1))) || qWordsToast.includes(m);
        });
        const isStrictToast = reqCatToast.length > 0 || brandsToast.length > 0 || modelsToast.length > 0 || reqFuelToast.length > 0 || reqTransToast.length > 0 || maxPriceToast !== undefined || seatsToast !== undefined || !!sortToast;
        let relevant: number;
        if (isStrictToast) {
          relevant = sourceForToast.filter((c) => {
            const catOk =
              reqCatToast.length === 0 ||
              reqCatToast.some((r) => {
                if (r === "electric") return c.category.toLowerCase().includes("electric") || c.fuelType.toLowerCase() === "electric";
                return c.category.toLowerCase().includes(r);
              });
            const brandOk = brandsToast.length === 0 || brandsToast.some((b) => c.brand.toLowerCase().includes(b));
            const modelOk = modelsToast.length === 0 || modelsToast.some((mo) => c.model.toLowerCase().includes(mo));
            const fuelOk = reqFuelToast.length === 0 || reqFuelToast.includes(c.fuelType.toLowerCase());
            const transOk = reqTransToast.length === 0 || reqTransToast.includes(c.transmission.toLowerCase());
            const priceOk = maxPriceToast === undefined || c.pricePerDay <= maxPriceToast;
            const seatsOk = seatsToast === undefined || c.seats >= seatsToast;
            return catOk && brandOk && modelOk && fuelOk && transOk && priceOk && seatsOk;
          }).length;
          const labelParts = [...brandsToast, ...modelsToast, ...reqCatToast, ...reqFuelToast, ...reqTransToast];
          if (maxPriceToast !== undefined) labelParts.push(`under $${maxPriceToast}`);
          if (seatsToast !== undefined) labelParts.push(`${seatsToast} seats`);
          const label = labelParts.join("/") || "matching";
          if (isUnsupportedQuery) {
            toast.success(`Found ${relevant} ${label} vehicles — Tip: detailed specs like fuel consumption aren't listed, showing similar vehicles by fuel type and category.`);
          } else {
            toast.success(`Found ${relevant} ${label} vehicles`);
          }
        } else {
          relevant = (json.data.matches as SmartMatch[]).filter((m: SmartMatch) => m.score >= RELEVANCE_THRESHOLD).length;
          if (isUnsupportedQuery) {
            toast.success(`Found ${relevant} relevant vehicles — Tip: detailed specs like fuel consumption aren't listed, showing closest available matches.`);
          } else {
            toast.success(`Found ${relevant} relevant vehicles`);
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "AI matching failed";
        if (msg.includes("<!DOCTYPE") || msg.includes("Unexpected token") || msg.includes("is not valid JSON")) {
          console.warn("AI HTML/JSON error suppressed, no toast to client:", msg, lastResText.slice(0, 200));
          return;
        }
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [cars],
  );

  const handleClear = useCallback(() => {
    setMatches(null);
    setEnrichedCars(null);
    setIsLoading(false);
    setShowAll(false);
    setLastQuery("");
  }, []);

  if (errorMessage) {
    return (
      <div role="alert" className="rounded-xl border bg-card p-8 text-center">
        <CarFront className="mx-auto size-9 text-muted-foreground" aria-hidden="true" />
        <h2 className="mt-3 font-semibold">Vehicles could not be loaded</h2>
        <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center">
        <CarFront className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
        <h2 className="mt-4 text-lg font-semibold">No vehicles found</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Try a broader search or clear the selected filters to see more vehicles.
        </p>
        <ClearCarsFilters />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SmartMatcherWidget
        onSearch={handleSearch}
        onClear={handleClear}
        isLoading={isLoading}
        hasResults={!!matches}
      />



      {matches && visibleCars.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <p className="text-sm font-medium">No matching vehicles</p>
          <p className="mt-1 text-xs text-muted-foreground">Try a broader query or clear filters.</p>
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="mt-3 text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            Show all {orderedCars.length} vehicles
          </button>
        </div>
      ) : (
        <>
          <div className={cn("grid min-w-0 gap-4", view === "grid" && "sm:grid-cols-2 xl:grid-cols-3", view === "list" && "grid-cols-1")}>
            {(() => {
              const start = (pagination.page - 1) * pagination.limit;
              const pageCars = matches ? visibleCars.slice(start, start + pagination.limit) : visibleCars;
              return pageCars.map((car) => {
                const m = matchMap?.get(car.id) ?? null;
                return <CarCard key={car.id} car={car} view={view} aiMatch={m} />;
              });
            })()}
          </div>
          {(() => {
            const total = matches ? visibleCars.length : pagination.total;
            const totalPages = Math.max(1, Math.ceil(total / pagination.limit));
            const page = Math.min(pagination.page, totalPages);
            const displayPagination: PublicCarsPagination = {
              ...pagination,
              page,
              total,
              totalPages,
              hasNextPage: page < totalPages,
              hasPreviousPage: page > 1,
            };
            return <CarsPagination pagination={displayPagination} />;
          })()}
        </>
      )}
    </div>
  );
}
