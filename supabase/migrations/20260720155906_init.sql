-- ============================================================================
-- DriveReserve - Initial Supabase / PostgreSQL Migration
-- Core model:
--   auth.users 1:1 profiles
--   profiles   1:N reservations
--   cars       1:N reservations
--   cars       1:N car_images
--
-- Important rule:
--   A customer may hold overlapping reservations for DIFFERENT cars.
--   The SAME car cannot have overlapping pending, confirmed, or active rentals.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. Extensions and private schema
-- ----------------------------------------------------------------------------

create extension if not exists btree_gist;

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 2. Enum types
-- ----------------------------------------------------------------------------

create type public.app_role as enum (
  'customer',
  'admin'
);

create type public.car_status as enum (
  'available',
  'maintenance',
  'inactive'
);

create type public.reservation_status as enum (
  'pending',
  'confirmed',
  'active',
  'completed',
  'cancelled',
  'rejected'
);

-- ----------------------------------------------------------------------------
-- 3. Tables
-- ----------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  role public.app_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_full_name_length
    check (char_length(full_name) <= 100),

  constraint profiles_phone_length
    check (phone is null or char_length(phone) <= 30)
);

create table public.cars (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  year integer not null,
  plate_number text not null,
  color text not null,
  category text not null,
  transmission text not null,
  fuel_type text not null,
  seats smallint not null,
  price_per_day numeric(10, 2) not null,
  description text,
  status public.car_status not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint cars_brand_not_blank
    check (char_length(trim(brand)) > 0),

  constraint cars_model_not_blank
    check (char_length(trim(model)) > 0),

  constraint cars_plate_number_not_blank
    check (char_length(trim(plate_number)) > 0),

  constraint cars_color_not_blank
    check (char_length(trim(color)) > 0),

  constraint cars_category_not_blank
    check (char_length(trim(category)) > 0),

  constraint cars_year_valid
    check (year between 1900 and 2100),

  constraint cars_transmission_valid
    check (transmission in ('automatic', 'manual')),

  constraint cars_fuel_type_valid
    check (fuel_type in ('petrol', 'diesel', 'hybrid', 'electric')),

  constraint cars_seats_valid
    check (seats between 1 and 20),

  constraint cars_price_per_day_positive
    check (price_per_day > 0),

  constraint cars_description_length
    check (description is null or char_length(description) <= 3000)
);

create table public.car_images (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  image_url text not null,
  is_primary boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),

  constraint car_images_url_not_blank
    check (char_length(trim(image_url)) > 0),

  constraint car_images_display_order_nonnegative
    check (display_order >= 0)
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete restrict,
  car_id uuid not null references public.cars(id) on delete restrict,

  pickup_date date not null,
  return_date date not null,

  -- [) means pickup is included and return is excluded.
  booking_period daterange generated always as (
    daterange(pickup_date, return_date, '[)')
  ) stored,

  rental_days integer generated always as (
    return_date - pickup_date
  ) stored,

  price_per_day_snapshot numeric(10, 2) not null,

  subtotal numeric(12, 2) generated always as (
    (return_date - pickup_date)::numeric * price_per_day_snapshot
  ) stored,

  total_price numeric(12, 2) generated always as (
    (return_date - pickup_date)::numeric * price_per_day_snapshot
  ) stored,

  status public.reservation_status not null default 'pending',
  cancellation_reason text,
  rejection_reason text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint reservations_date_range_valid
    check (return_date > pickup_date),

  constraint reservations_price_snapshot_positive
    check (price_per_day_snapshot > 0),

  constraint reservations_cancellation_reason_length
    check (
      cancellation_reason is null
      or char_length(cancellation_reason) <= 1000
    ),

  constraint reservations_rejection_reason_length
    check (
      rejection_reason is null
      or char_length(rejection_reason) <= 1000
    ),

  -- Blocks overlapping active reservations for the same car only.
  constraint reservations_no_overlapping_car_rentals
    exclude using gist (
      car_id with =,
      booking_period with &&
    )
    where (
      status in ('pending', 'confirmed', 'active')
    )
);

-- ----------------------------------------------------------------------------
-- 4. Indexes
-- ----------------------------------------------------------------------------

create unique index cars_plate_number_unique_ci
  on public.cars (lower(plate_number));

create index cars_status_idx
  on public.cars (status);

create index cars_category_idx
  on public.cars (category);

create index cars_brand_model_idx
  on public.cars (brand, model);

create index car_images_car_id_idx
  on public.car_images (car_id);

create index car_images_display_order_idx
  on public.car_images (car_id, display_order);

create unique index car_images_one_primary_per_car_idx
  on public.car_images (car_id)
  where is_primary;

create index reservations_customer_id_idx
  on public.reservations (customer_id);

create index reservations_car_id_idx
  on public.reservations (car_id);

create index reservations_status_idx
  on public.reservations (status);

create index reservations_pickup_date_idx
  on public.reservations (pickup_date);

create index reservations_return_date_idx
  on public.reservations (return_date);

create index reservations_customer_status_idx
  on public.reservations (customer_id, status);

-- ----------------------------------------------------------------------------
-- 5. Shared trigger functions
-- ----------------------------------------------------------------------------

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function private.set_updated_at();

create trigger cars_set_updated_at
before update on public.cars
for each row
execute function private.set_updated_at();

create trigger reservations_set_updated_at
before update on public.reservations
for each row
execute function private.set_updated_at();

-- ----------------------------------------------------------------------------
-- 6. Automatically create a profile after Supabase Auth registration
-- ----------------------------------------------------------------------------

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    phone,
    role
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.phone,
    'customer'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function private.handle_new_user();

-- ----------------------------------------------------------------------------
-- 7. Admin authorization helper
-- ----------------------------------------------------------------------------

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 8. Reservation lifecycle validation
-- ----------------------------------------------------------------------------

create or replace function private.validate_reservation_status_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  case old.status
    when 'pending' then
      if new.status not in ('confirmed', 'rejected', 'cancelled') then
        raise exception
          'Invalid reservation transition: pending -> %',
          new.status;
      end if;

    when 'confirmed' then
      if new.status not in ('active', 'cancelled') then
        raise exception
          'Invalid reservation transition: confirmed -> %',
          new.status;
      end if;

    when 'active' then
      if new.status <> 'completed' then
        raise exception
          'Invalid reservation transition: active -> %',
          new.status;
      end if;

    when 'completed', 'cancelled', 'rejected' then
      raise exception
        'Reservation status % is final and cannot be changed',
        old.status;
  end case;

  if new.status = 'rejected'
     and nullif(trim(new.rejection_reason), '') is null then
    raise exception 'A rejection reason is required';
  end if;

  if new.status = 'cancelled'
     and nullif(trim(new.cancellation_reason), '') is null then
    raise exception 'A cancellation reason is required';
  end if;

  if new.status <> 'rejected' then
    new.rejection_reason = null;
  end if;

  if new.status <> 'cancelled' then
    new.cancellation_reason = null;
  end if;

  return new;
end;
$$;

create trigger reservations_validate_status_transition
before update of status on public.reservations
for each row
execute function private.validate_reservation_status_transition();

-- ----------------------------------------------------------------------------
-- 9. Row Level Security
-- ----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.cars enable row level security;
alter table public.car_images enable row level security;
alter table public.reservations enable row level security;

-- Profiles

create policy "Users can view their profile"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
);

create policy "Admins can view all profiles"
on public.profiles
for select
to authenticated
using (
  (select private.is_admin())
);

create policy "Users can update their profile"
on public.profiles
for update
to authenticated
using (
  id = (select auth.uid())
)
with check (
  id = (select auth.uid())
);

-- Cars

create policy "Anyone can view available cars"
on public.cars
for select
to anon, authenticated
using (
  status = 'available'
);

create policy "Admins can view all cars"
on public.cars
for select
to authenticated
using (
  (select private.is_admin())
);

create policy "Admins can create cars"
on public.cars
for insert
to authenticated
with check (
  (select private.is_admin())
);

create policy "Admins can update cars"
on public.cars
for update
to authenticated
using (
  (select private.is_admin())
)
with check (
  (select private.is_admin())
);

create policy "Admins can delete cars"
on public.cars
for delete
to authenticated
using (
  (select private.is_admin())
);

-- Car images

create policy "Anyone can view images of available cars"
on public.car_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.cars
    where cars.id = car_images.car_id
      and cars.status = 'available'
  )
);

create policy "Admins can view all car images"
on public.car_images
for select
to authenticated
using (
  (select private.is_admin())
);

create policy "Admins can create car images"
on public.car_images
for insert
to authenticated
with check (
  (select private.is_admin())
);

create policy "Admins can update car images"
on public.car_images
for update
to authenticated
using (
  (select private.is_admin())
)
with check (
  (select private.is_admin())
);

create policy "Admins can delete car images"
on public.car_images
for delete
to authenticated
using (
  (select private.is_admin())
);

-- Reservations

create policy "Customers can view their reservations"
on public.reservations
for select
to authenticated
using (
  customer_id = (select auth.uid())
);

create policy "Admins can view all reservations"
on public.reservations
for select
to authenticated
using (
  (select private.is_admin())
);

-- ----------------------------------------------------------------------------
-- 10. Explicit table privileges
-- ----------------------------------------------------------------------------

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.cars from anon, authenticated;
revoke all on table public.car_images from anon, authenticated;
revoke all on table public.reservations from anon, authenticated;

grant select on table public.cars to anon, authenticated;
grant select on table public.car_images to anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (full_name, phone) on table public.profiles to authenticated;

grant select, insert, update, delete
  on table public.cars
  to authenticated;

grant select, insert, update, delete
  on table public.car_images
  to authenticated;

-- Reservation writes go through controlled RPC functions below.
grant select on table public.reservations to authenticated;

grant all on table public.profiles to service_role;
grant all on table public.cars to service_role;
grant all on table public.car_images to service_role;
grant all on table public.reservations to service_role;

-- ----------------------------------------------------------------------------
-- 11. Public availability helper
-- ----------------------------------------------------------------------------

create or replace function public.is_car_available(
  p_car_id uuid,
  p_pickup_date date,
  p_return_date date
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    p_pickup_date >= current_date
    and p_return_date > p_pickup_date
    and exists (
      select 1
      from public.cars
      where id = p_car_id
        and status = 'available'
    )
    and not exists (
      select 1
      from public.reservations
      where car_id = p_car_id
        and status in ('pending', 'confirmed', 'active')
        and booking_period
          && daterange(p_pickup_date, p_return_date, '[)')
    );
$$;

revoke all
  on function public.is_car_available(uuid, date, date)
  from public;

grant execute
  on function public.is_car_available(uuid, date, date)
  to anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 12. Customer reservation RPC
-- ----------------------------------------------------------------------------

create or replace function public.create_reservation(
  p_car_id uuid,
  p_pickup_date date,
  p_return_date date
)
returns public.reservations
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_user_role public.app_role;
  v_price numeric(10, 2);
  v_reservation public.reservations;
begin
  if v_user_id is null then
    raise exception 'Authentication is required';
  end if;

  select role
  into v_user_role
  from public.profiles
  where id = v_user_id;

  if v_user_role is distinct from 'customer' then
    raise exception 'Only customers can create reservations';
  end if;

  if p_pickup_date < current_date then
    raise exception 'Pickup date cannot be in the past';
  end if;

  if p_return_date <= p_pickup_date then
    raise exception 'Return date must be after pickup date';
  end if;

  select price_per_day
  into v_price
  from public.cars
  where id = p_car_id
    and status = 'available'
  for share;

  if v_price is null then
    raise exception 'The selected car is unavailable or does not exist';
  end if;

  if exists (
    select 1
    from public.reservations
    where car_id = p_car_id
      and status in ('pending', 'confirmed', 'active')
      and booking_period
        && daterange(p_pickup_date, p_return_date, '[)')
  ) then
    raise exception 'The selected car is unavailable for these dates';
  end if;

  insert into public.reservations (
    customer_id,
    car_id,
    pickup_date,
    return_date,
    price_per_day_snapshot,
    status
  )
  values (
    v_user_id,
    p_car_id,
    p_pickup_date,
    p_return_date,
    v_price,
    'pending'
  )
  returning *
  into v_reservation;

  return v_reservation;

exception
  when exclusion_violation then
    raise exception 'The selected car was just reserved for these dates';
end;
$$;

revoke all
  on function public.create_reservation(uuid, date, date)
  from public, anon;

grant execute
  on function public.create_reservation(uuid, date, date)
  to authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 13. Customer cancellation RPC
-- ----------------------------------------------------------------------------

create or replace function public.cancel_my_reservation(
  p_reservation_id uuid,
  p_reason text
)
returns public.reservations
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_reservation public.reservations;
begin
  if v_user_id is null then
    raise exception 'Authentication is required';
  end if;

  if nullif(trim(p_reason), '') is null then
    raise exception 'A cancellation reason is required';
  end if;

  select *
  into v_reservation
  from public.reservations
  where id = p_reservation_id
    and customer_id = v_user_id
  for update;

  if not found then
    raise exception 'Reservation not found';
  end if;

  if v_reservation.status not in ('pending', 'confirmed') then
    raise exception
      'Only pending or confirmed reservations can be cancelled';
  end if;

  update public.reservations
  set
    status = 'cancelled',
    cancellation_reason = trim(p_reason)
  where id = p_reservation_id
  returning *
  into v_reservation;

  return v_reservation;
end;
$$;

revoke all
  on function public.cancel_my_reservation(uuid, text)
  from public, anon;

grant execute
  on function public.cancel_my_reservation(uuid, text)
  to authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 14. Admin reservation-status RPC
-- ----------------------------------------------------------------------------

create or replace function public.admin_update_reservation_status(
  p_reservation_id uuid,
  p_status public.reservation_status,
  p_reason text default null
)
returns public.reservations
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reservation public.reservations;
begin
  if not (select private.is_admin()) then
    raise exception 'Administrator access is required';
  end if;

  if p_status not in (
    'confirmed',
    'active',
    'completed',
    'cancelled',
    'rejected'
  ) then
    raise exception 'Unsupported target reservation status';
  end if;

  update public.reservations
  set
    status = p_status,
    rejection_reason = case
      when p_status = 'rejected' then nullif(trim(p_reason), '')
      else null
    end,
    cancellation_reason = case
      when p_status = 'cancelled' then nullif(trim(p_reason), '')
      else null
    end
  where id = p_reservation_id
  returning *
  into v_reservation;

  if not found then
    raise exception 'Reservation not found';
  end if;

  return v_reservation;
end;
$$;

revoke all
  on function public.admin_update_reservation_status(
    uuid,
    public.reservation_status,
    text
  )
  from public, anon;

grant execute
  on function public.admin_update_reservation_status(
    uuid,
    public.reservation_status,
    text
  )
  to authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 15. Manual admin promotion
-- ----------------------------------------------------------------------------
-- Never accept the admin role from user-controlled sign-up metadata.
-- After creating the intended admin account, promote it manually:
--
-- update public.profiles
-- set role = 'admin'
-- where id = '<AUTH_USER_UUID>';

commit;
