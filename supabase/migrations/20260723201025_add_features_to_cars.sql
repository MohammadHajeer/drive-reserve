alter table public.cars
add column features text[] not null default '{}'::text[];

comment on column public.cars.features is
  'Display-only vehicle features such as Bluetooth, air conditioning, rear camera, and cruise control.';