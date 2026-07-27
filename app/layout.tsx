import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { cn } from "@/lib/utils";

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DriveReserve",
    template: "%s | DriveReserve",
  },
  description:
    "Browse available vehicles, compare rental options, and reserve your next car with DriveReserve.",
  applicationName: "DriveReserve",
  keywords: [
    "car rental",
    "car reservation",
    "vehicle rental",
    "online car booking",
    "DriveReserve",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={cn(
        "h-full font-sans antialiased",
        geistSans.variable,
        geistMono.variable,
      )}
    >
      <body
        className="flex min-h-svh flex-col bg-background text-foreground"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <main>{children}</main>
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
