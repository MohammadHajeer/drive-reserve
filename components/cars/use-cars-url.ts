"use client";

import { useCallback, useEffect, useRef, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type CarsQueryUpdate = {
  name: string;
  values: string[];
};

function canonicalQuery(searchParams: URLSearchParams) {
  return [...searchParams.entries()]
    .filter(([, value]) => value.trim())
    .sort(([firstName, firstValue], [secondName, secondValue]) => {
      const nameOrder = firstName.localeCompare(secondName);
      return nameOrder || firstValue.localeCompare(secondValue);
    })
    .map(
      ([name, value]) =>
        `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    )
    .join("&");
}

export function useCarsUrl() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.toString();
  const [isPending, startTransition] = useTransition();
  const latestIntendedQueryRef = useRef(currentQuery);
  const observedQueryRef = useRef(currentQuery);
  const pendingQueryKeysRef = useRef(new Set<string>());

  useEffect(() => {
    if (currentQuery === observedQueryRef.current) return;

    observedQueryRef.current = currentQuery;
    const currentKey = canonicalQuery(new URLSearchParams(currentQuery));
    const intendedKey = canonicalQuery(
      new URLSearchParams(latestIntendedQueryRef.current),
    );

    if (pendingQueryKeysRef.current.has(currentKey)) {
      pendingQueryKeysRef.current.delete(currentKey);

      if (currentKey === intendedKey) {
        pendingQueryKeysRef.current.clear();
        latestIntendedQueryRef.current = currentQuery;
      }

      return;
    }

    pendingQueryKeysRef.current.clear();
    latestIntendedQueryRef.current = currentQuery;
  }, [currentQuery]);

  useEffect(() => {
    function reconcileHistoryNavigation() {
      const historyQuery = window.location.search.replace(/^\?/, "");
      observedQueryRef.current = historyQuery;
      latestIntendedQueryRef.current = historyQuery;
      pendingQueryKeysRef.current.clear();
    }

    window.addEventListener("popstate", reconcileHistoryNavigation);
    return () =>
      window.removeEventListener("popstate", reconcileHistoryNavigation);
  }, []);

  const replaceQuery = useCallback(
    (updates: CarsQueryUpdate[], resetPage = true) => {
      const currentParams = new URLSearchParams(
        latestIntendedQueryRef.current,
      );
      const nextParams = new URLSearchParams(latestIntendedQueryRef.current);

      for (const update of updates) {
        nextParams.delete(update.name);
        for (const value of update.values
          .map((item) => item.trim())
          .filter(Boolean)) {
          nextParams.append(update.name, value);
        }
      }

      if (resetPage) nextParams.delete("page");

      const cleanedParams = new URLSearchParams();
      nextParams.forEach((value, name) => {
        if (value.trim()) cleanedParams.append(name, value);
      });

      const nextQuery = cleanedParams.toString();
      if (canonicalQuery(cleanedParams) === canonicalQuery(currentParams)) {
        return;
      }

      latestIntendedQueryRef.current = nextQuery;
      pendingQueryKeysRef.current.add(canonicalQuery(cleanedParams));

      startTransition(() => {
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
          scroll: false,
        });
        // Ensure the RSC payload is reconciled against the final replaced URL.
        router.refresh();
      });
    },
    [pathname, router],
  );

  return { isPending, replaceQuery };
}
