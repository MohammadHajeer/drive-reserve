-- DriveReserve development seed data
-- Suggested location: supabase/seed.sql
-- Seeds demo cars only. Add car_images after uploading files to Supabase Storage.

insert into public.cars (
  brand,
  model,
  year,
  plate_number,
  color,
  category,
  transmission,
  fuel_type,
  seats,
  price_per_day,
  description,
  status
)
values
  ('Toyota', 'Corolla', 2023, 'DRV-1001', 'White', 'Sedan', 'automatic', 'petrol', 5, 45.00,
   'A reliable and fuel-efficient sedan suited for city driving, daily commuting, and comfortable weekend trips.',
   'available'),

  ('Honda', 'CR-V', 2022, 'DRV-1002', 'Black', 'SUV', 'automatic', 'petrol', 5, 78.00,
   'A spacious compact SUV with comfortable seating, generous luggage room, and a smooth automatic transmission.',
   'available'),

  ('Hyundai', 'Accent', 2021, 'DRV-1003', 'Silver', 'Sedan', 'manual', 'petrol', 5, 34.00,
   'An economical manual sedan that is easy to drive and ideal for affordable everyday transportation.',
   'available'),

  ('Kia', 'Sportage', 2024, 'DRV-1004', 'Gray', 'SUV', 'automatic', 'hybrid', 5, 85.00,
   'A modern hybrid SUV offering a comfortable cabin, practical cargo capacity, and efficient performance.',
   'available'),

  ('BMW', '320i', 2022, 'DRV-1005', 'Blue', 'Luxury Sedan', 'automatic', 'petrol', 5, 115.00,
   'A premium sports sedan with refined styling, responsive handling, and a high-quality interior.',
   'available'),

  ('Mercedes-Benz', 'C-Class', 2023, 'DRV-1006', 'Black', 'Luxury Sedan', 'automatic', 'petrol', 5, 130.00,
   'A polished luxury sedan designed for business travel, special occasions, and comfortable long-distance driving.',
   'maintenance'),

  ('Nissan', 'Sunny', 2020, 'DRV-1007', 'White', 'Sedan', 'automatic', 'petrol', 5, 38.00,
   'A practical and affordable sedan with a roomy cabin, simple controls, and low daily rental cost.',
   'available'),

  ('Renault', 'Duster', 2021, 'DRV-1008', 'Orange', 'SUV', 'manual', 'petrol', 5, 58.00,
   'A versatile SUV with good ground clearance and a manual transmission, suitable for city roads and countryside trips.',
   'available'),

  ('Peugeot', '3008', 2023, 'DRV-1009', 'Green', 'SUV', 'automatic', 'diesel', 5, 82.00,
   'A stylish family SUV featuring a comfortable interior, efficient diesel performance, and useful luggage space.',
   'available'),

  ('Tesla', 'Model 3', 2023, 'DRV-1010', 'Red', 'Electric Sedan', 'automatic', 'electric', 5, 125.00,
   'A fully electric sedan with instant acceleration, a minimalist cabin, and a quiet modern driving experience.',
   'inactive'),

  ('Chevrolet', 'Tahoe', 2022, 'DRV-1011', 'Black', 'Full-Size SUV', 'automatic', 'petrol', 7, 145.00,
   'A large seven-seat SUV with strong road presence, extensive cabin space, and room for group travel.',
   'available'),

  ('Volkswagen', 'Golf', 2021, 'DRV-1012', 'Blue', 'Hatchback', 'automatic', 'petrol', 5, 55.00,
   'A compact hatchback combining easy city handling, a quality interior, and practical rear storage.',
   'available')

on conflict (lower(plate_number))
do update set
  brand = excluded.brand,
  model = excluded.model,
  year = excluded.year,
  color = excluded.color,
  category = excluded.category,
  transmission = excluded.transmission,
  fuel_type = excluded.fuel_type,
  seats = excluded.seats,
  price_per_day = excluded.price_per_day,
  description = excluded.description,
  status = excluded.status,
  updated_at = now();


insert into public.car_images (
  car_id,
  image_url,
  is_primary,
  display_order
)
select
  c.id,
  i.image_path,
  true,
  0
from (
  values
    ('DRV-1001', 'cars/car-01.jpg'),
    ('DRV-1002', 'cars/car-02.jpg'),
    ('DRV-1003', 'cars/car-03.jpg'),
    ('DRV-1004', 'cars/car-04.jpg'),
    ('DRV-1005', 'cars/car-05.jpg'),
    ('DRV-1006', 'cars/car-06.jpg'),
    ('DRV-1007', 'cars/car-07.jpg'),
    ('DRV-1008', 'cars/car-08.jpg'),
    ('DRV-1009', 'cars/car-09.jpg'),
    ('DRV-1010', 'cars/car-10.jpg')
) as i(plate_number, image_path)
join public.cars c
  on lower(c.plate_number) = lower(i.plate_number)

on conflict (car_id) where is_primary
do update set
  image_url = excluded.image_url,
  display_order = excluded.display_order;