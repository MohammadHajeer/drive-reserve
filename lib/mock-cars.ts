export type CarListItem = {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  pricePerDay: number;
  transmission: "Automatic" | "Manual";
  fuelType: "Petrol" | "Diesel" | "Hybrid" | "Electric";
  seats: number;
  status: "Available" | "Occupied";
  imageUrl: string;
  location: string;
};

export const carCategories = [
  "Economy",
  "Sedan",
  "SUV",
  "Luxury",
  "Electric",
  "Hatchback",
] as const;

export const transmissions = ["Automatic", "Manual"] as const;
export const fuelTypes = ["Petrol", "Diesel", "Hybrid", "Electric"] as const;
export const seatFilters = ["2-4", "5", "7+"] as const;

export const mockCars: CarListItem[] = [
  {
    id: "toyota-corolla-2023",
    brand: "Toyota",
    model: "Corolla",
    year: 2023,
    category: "Sedan",
    pricePerDay: 55,
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 5,
    status: "Available",
    imageUrl:
      "https://images.unsplash.com/photo-1549921296-3f13d67fa2b1?auto=format&fit=crop&w=1200&q=80",
    location: "Beirut",
  },
  {
    id: "nissan-xtrail-2022",
    brand: "Nissan",
    model: "X-Trail",
    year: 2022,
    category: "SUV",
    pricePerDay: 90,
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 5,
    status: "Available",
    imageUrl:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    location: "Jounieh",
  },
  {
    id: "hyundai-tucson-2024",
    brand: "Hyundai",
    model: "Tucson",
    year: 2024,
    category: "SUV",
    pricePerDay: 120,
    transmission: "Automatic",
    fuelType: "Hybrid",
    seats: 5,
    status: "Occupied",
    imageUrl:
      "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1200&q=80",
    location: "Tripoli",
  },
  {
    id: "mercedes-c-class-2023",
    brand: "Mercedes-Benz",
    model: "C-Class",
    year: 2023,
    category: "Luxury",
    pricePerDay: 150,
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 5,
    status: "Available",
    imageUrl:
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80",
    location: "Beirut",
  },
  {
    id: "bmw-x5-2024",
    brand: "BMW",
    model: "X5",
    year: 2024,
    category: "Luxury",
    pricePerDay: 210,
    transmission: "Automatic",
    fuelType: "Hybrid",
    seats: 5,
    status: "Occupied",
    imageUrl:
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80",
    location: "Zahle",
  },
  {
    id: "audi-q5-2023",
    brand: "Audi",
    model: "Q5",
    year: 2023,
    category: "Luxury",
    pricePerDay: 140,
    transmission: "Automatic",
    fuelType: "Diesel",
    seats: 5,
    status: "Available",
    imageUrl:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
    location: "Sidon",
  },
  {
    id: "tesla-model-y-2024",
    brand: "Tesla",
    model: "Model Y",
    year: 2024,
    category: "Electric",
    pricePerDay: 160,
    transmission: "Automatic",
    fuelType: "Electric",
    seats: 5,
    status: "Available",
    imageUrl:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
    location: "Beirut",
  },
  {
    id: "peugeot-208-2022",
    brand: "Peugeot",
    model: "208",
    year: 2022,
    category: "Hatchback",
    pricePerDay: 45,
    transmission: "Manual",
    fuelType: "Petrol",
    seats: 5,
    status: "Available",
    imageUrl:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    location: "Jounieh",
  },
  {
    id: "kia-cerato-2023",
    brand: "Kia",
    model: "Cerato",
    year: 2023,
    category: "Sedan",
    pricePerDay: 65,
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 5,
    status: "Available",
    imageUrl:
      "https://images.unsplash.com/photo-1563729784472-1aee6b8d45ce?auto=format&fit=crop&w=1200&q=80",
    location: "Beirut",
  },
  {
    id: "mitsubishi-pajero-2023",
    brand: "Mitsubishi",
    model: "Pajero",
    year: 2023,
    category: "SUV",
    pricePerDay: 180,
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 7,
    status: "Occupied",
    imageUrl:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    location: "Byblos",
  },
];
