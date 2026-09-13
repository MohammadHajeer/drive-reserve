"use client";

import { useState, useTransition } from "react";
import { Loader2, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type SmartMatcherWidgetProps = {
  onSearch: (query: string) => Promise<void> | void;
  onClear: () => void;
  isLoading: boolean;
  hasResults: boolean;
};

export function SmartMatcherWidget({ onSearch, onClear, isLoading, hasResults }: SmartMatcherWidgetProps) {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const loading = isLoading || isPending;
  const trimmed = query.trim();
  const canSearch = trimmed.length >= 3 && trimmed.length <= 500;

  const handleSearch = () => {
    if (!canSearch || loading) return;
    startTransition(async () => {
      await onSearch(trimmed);
    });
  };

  const handleClear = () => {
    setQuery("");
    onClear();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-2">
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-semibold">Smart Matcher</h2>
          <p className="text-xs text-muted-foreground">Describe your trip and we&apos;ll rank the best matches.</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Try: "Need an affordable automatic sedan for a 4-day road trip with 4 passengers"'
          rows={2}
          maxLength={500}
          aria-label="Describe your travel need for AI matching"
          disabled={loading}
          className="min-h-[72px] resize-none rounded-xl border-input bg-background px-3 py-2.5"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] text-muted-foreground">{trimmed.length}/500</span>

          <div className="flex items-center gap-2">
            {hasResults && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={loading}
                className="h-8 rounded-full"
              >
                <X className="size-3.5" />
                Clear
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={handleSearch}
              disabled={!canSearch || loading}
              className="h-8 rounded-full px-4"
            >
              {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
              {loading ? "Matching..." : "AI Match"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SmartMatchBadge({ snippet, score }: { snippet: string; score: number }) {
  const pct = Math.round(score * 100);
  const isTop = score >= 0.75;
  return (
    <div
      className={
        isTop
          ? "mt-2 rounded-lg border border-primary/20 bg-primary/[0.06] px-2.5 py-2 text-left"
          : "mt-2 rounded-lg border border-muted bg-muted/40 px-2.5 py-2 text-left"
      }
    >
      <p className={isTop ? "flex items-center gap-1.5 text-[11px] font-semibold text-primary" : "flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground"}>
        <Sparkles className="size-3" aria-hidden="true" />
        {isTop ? `AI Match • ${pct}% fit` : `Consider • ${pct}% fit`}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-foreground/80">{snippet}</p>
    </div>
  );
}
