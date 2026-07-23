import type { PublicCarListItem } from "@/lib/cars/public-cars";

export interface CarSpec {
  label: string;
  value: string;
  iconName: "transmission" | "fuel" | "horsepower" | "passengers";
}

export interface DetailedCar extends PublicCarListItem {
  rating: number;
  reviewsCount: number;
  serviceFee: number;
  insurancePerDay: number;
  hostName: string;
  hostBadge: string;
  description: string;
  images: string[];
  specs: CarSpec[];
  features: string[];
}

export const CARS_DETAILS_DATA: Record<string, DetailedCar> = {
  "1": {
    id: "1",
    brand: "Mercedes-Benz",
    model: "EQS 580",
    year: 2024,
    color: "Obsidian Black",
    category: "luxury",
    transmission: "automatic",
    fuelType: "electric",
    seats: 5,
    pricePerDay: 245,
    status: "available",
    primaryImageUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80",
    rating: 4.9,
    reviewsCount: 128,
    serviceFee: 45,
    insurancePerDay: 82,
    hostName: "Professional Fleet Manager",
    hostBadge: "Verified Host • 2,400+ Rentals Completed",
    description:
      "The EQS 580 4MATIC is the pinnacle of electric luxury. Experience unparalleled silence, cutting-edge technology, and a driving range that redefines electric mobility.",
    images: [
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    ],
    specs: [
      { label: "TRANSMISSION", value: "Automatic", iconName: "transmission" },
      { label: "FUEL TYPE", value: "Electric", iconName: "fuel" },
      { label: "HORSEPOWER", value: "516 hp", iconName: "horsepower" },
      { label: "PASSENGERS", value: "5 People", iconName: "passengers" },
    ],
    features: [
      "Instant Booking Available",
      "Premium Insurance Included",
      "Free Delivery within 10mi",
      "Burmester 3D Surround Sound",
      "MBUX Hyperscreen",
    ],
  },
  "2": {
    id: "2",
    brand: "Tesla",
    model: "Model S Plaid",
    year: 2024,
    color: "Pearl White",
    category: "electric",
    transmission: "automatic",
    fuelType: "electric",
    seats: 5,
    pricePerDay: 210,
    status: "available",
    primaryImageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80",
    rating: 4.95,
    reviewsCount: 94,
    serviceFee: 40,
    insurancePerDay: 70,
    hostName: "Apex Motors",
    hostBadge: "Superhost • 850+ Rentals",
    description:
      "Tri-motor all-wheel drive featuring torque vectoring and three independent carbon-sleeved rotors. Insane acceleration and range.",
    images: [
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
    ],
    specs: [
      { label: "TRANSMISSION", value: "Single-Speed", iconName: "transmission" },
      { label: "FUEL TYPE", value: "Electric", iconName: "fuel" },
      { label: "HORSEPOWER", value: "1020 hp", iconName: "horsepower" },
      { label: "PASSENGERS", value: "5 People", iconName: "passengers" },
    ],
    features: ["Autopilot", "Yoke Steering", "Wireless Charging"],
  },
  "3": {
    id: "3",
    brand: "BMW",
    model: "i7 xDrive60",
    year: 2023,
    color: "Mineral White",
    category: "luxury",
    transmission: "automatic",
    fuelType: "electric",
    seats: 5,
    pricePerDay: 235,
    status: "occupied",
    primaryImageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80",
    rating: 4.88,
    reviewsCount: 62,
    serviceFee: 45,
    insurancePerDay: 75,
    hostName: "Bavarian Elite",
    hostBadge: "Verified Host • 500+ Rentals",
    description:
      "The all-electric BMW i7 combines electric performance and multisensory entertainment to produce an unforgettable experience.",
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
    ],
    specs: [
      { label: "TRANSMISSION", value: "Automatic", iconName: "transmission" },
      { label: "FUEL TYPE", value: "Electric", iconName: "fuel" },
      { label: "HORSEPOWER", value: "536 hp", iconName: "horsepower" },
      { label: "PASSENGERS", value: "5 People", iconName: "passengers" },
    ],
    features: ["Theater Screen", "Executive Lounge Seating", "BMW Interaction Bar"],
  },
};