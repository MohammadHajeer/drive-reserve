"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  Star,
  CheckCircle2,
  Clock,
  Shield,
  MapPin,
} from "lucide-react";

import { CARS_DETAILS_DATA } from "@/lib/mock-car-details";
import { CarGallery } from "@/components/car-details/car-gallery";
import { ReservationCard } from "@/components/car-details/reservation-card";
import { CarSpecs } from "@/components/car-details/car-specs";

export default function CarDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<"overview" | "features" | "reviews">("overview");

  const car = CARS_DETAILS_DATA[id] || CARS_DETAILS_DATA["1"];
  const similarCars = Object.values(CARS_DETAILS_DATA).filter((item) => item.id !== car.id);

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between pb-6">
          <Link
            href="/cars"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Listings
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Gallery & Details */}
          <div className="space-y-6 lg:col-span-7 xl:col-span-8">
            <CarGallery images={car.images} title={`${car.brand} ${car.model}`} />

            <div className="pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-accent/60 px-2.5 py-0.5 text-xs font-semibold uppercase text-secondary-foreground">
                  {car.category}
                </span>
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span>{car.rating}</span>
                  <span className="text-muted-foreground">({car.reviewsCount} reviews)</span>
                </div>
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {car.brand} {car.model} ({car.year})
              </h1>
            </div>

            <CarSpecs specs={car.specs} />

            {/* Navigation Tabs */}
            <div className="border-b border-border">
              <nav className="flex gap-6">
                {(["overview", "features", "reviews"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-medium capitalize transition ${
                      activeTab === tab
                        ? "border-b-2 border-primary font-semibold text-primary"
                        : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab === "features" ? "Features & Amenities" : tab}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Contents */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {car.description}
                </p>
                <div className="flex flex-wrap gap-4 pt-2 text-xs font-medium text-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" /> Instant Booking Available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-primary" /> Premium Insurance Included
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" /> Free Delivery within 10mi
                  </span>
                </div>
              </div>
            )}

            {activeTab === "features" && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
                {car.features.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                <p className="mb-1 font-semibold text-foreground">
                  {car.rating} Stars average based on {car.reviewsCount} customer rentals.
                </p>
                <p>&quot;Smooth pickup, exceptional vehicle cleanliness, and unmatched performance.&quot;</p>
              </div>
            )}
          </div>

          {/* Right Column: Reservation Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-6">
              <ReservationCard
                pricePerDay={car.pricePerDay}
                serviceFee={car.serviceFee}
                insurancePerDay={car.insurancePerDay}
                hostName={car.hostName}
                hostBadge={car.hostBadge}
                isAvailable={car.status === "available"}
              />
            </div>
          </div>
        </div>

        {/* Similar Vehicles Section */}
        <div className="mt-16 border-t border-border pt-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Explore Similar Vehicles</h2>
            <Link href="/cars" className="text-xs font-semibold text-primary hover:underline">
              View all &gt;
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similarCars.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                href={`/cars/${item.id}`}
                className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md"
              >
                <div className="relative h-48 w-full bg-muted">
                  <Image
                    src={item.images[0]}
                    alt={`${item.brand} ${item.model}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {item.category}
                  </span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <h3 className="text-sm font-bold text-foreground transition group-hover:text-primary">
                      {item.brand} {item.model}
                    </h3>
                    <div className="text-right">
                      <span className="font-bold text-foreground">${item.pricePerDay}</span>
                      <span className="text-xs text-muted-foreground"> / day</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}