import type { Metadata } from "next";

import { Categories } from "@/components/home/categories";
import { Cta } from "@/components/home/cta";
import { FeaturedCars } from "@/components/home/featured-cars";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { WhyChoose } from "@/components/home/why-choose";

export const metadata: Metadata = {
  title: "Car Rental & Reservations",
  description:
    "Browse available vehicles, compare rental options, and reserve your next car with DriveReserve.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedCars />
      <WhyChoose />
      <HowItWorks />
      <Cta />
    </>
  );
}
