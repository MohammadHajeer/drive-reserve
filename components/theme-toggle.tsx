"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

const subscribeToHydration = () => () => undefined;

type ThemeToggleProps = {
  className?: string;
  menuAlign?: "start" | "center" | "end";
};

export function ThemeToggle({
  className,
  menuAlign = "end",
}: ThemeToggleProps) {
  const { setTheme, theme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  const selectedTheme = mounted ? theme : undefined;
  const SelectedIcon =
    themes.find((option) => option.value === selectedTheme)?.icon ?? Monitor;
  const selectedLabel =
    themes.find((option) => option.value === selectedTheme)?.label ?? "System";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={
              mounted
                ? `Color theme: ${selectedLabel}. Choose theme`
                : "Choose color theme"
            }
            className={cn("size-10 shrink-0 rounded-xl", className)}
          />
        }
      >
        <SelectedIcon
          className={cn("size-4.5", !mounted && "opacity-60")}
          aria-hidden="true"
        />
        <span className="sr-only">Choose color theme</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={menuAlign}
        sideOffset={8}
        className="w-44 rounded-xl"
      >
        <DropdownMenuRadioGroup
          value={selectedTheme}
          onValueChange={setTheme}
        >
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          {themes.map(({ value, label, icon: Icon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
