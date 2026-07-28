"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PublicCarsPagination } from "@/lib/cars/public-cars";

import { useCarsUrl } from "./use-cars-url";

function visiblePages(currentPage: number, totalPages: number) {
  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function CarsPagination({
  pagination,
}: {
  pagination: PublicCarsPagination;
}) {
  const { replaceQuery } = useCarsUrl();
  if (pagination.totalPages <= 1) return null;

  function goToPage(page: number) {
    replaceQuery(
      [{ name: "page", values: page === 1 ? [] : [String(page)] }],
      false,
    );
  }

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-1 pt-2"
      aria-label="Vehicle results pages"
    >
      <Button
        type="button"
        size="icon-sm"
        variant="outline"
        disabled={!pagination.hasPreviousPage}
        aria-label="Previous page"
        onClick={() => goToPage(pagination.page - 1)}
      >
        <ChevronLeft aria-hidden="true" />
      </Button>
      {visiblePages(pagination.page, pagination.totalPages).map((page) => (
        <Button
          key={page}
          type="button"
          size="icon-sm"
          variant={page === pagination.page ? "default" : "ghost"}
          aria-label={`Page ${page}`}
          aria-current={page === pagination.page ? "page" : undefined}
          onClick={() => goToPage(page)}
        >
          {page}
        </Button>
      ))}
      <Button
        type="button"
        size="icon-sm"
        variant="outline"
        disabled={!pagination.hasNextPage}
        aria-label="Next page"
        onClick={() => goToPage(pagination.page + 1)}
      >
        <ChevronRight aria-hidden="true" />
      </Button>
    </nav>
  );
}
