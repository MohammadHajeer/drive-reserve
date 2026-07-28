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
    p_pickup_date > (now() at time zone 'Asia/Beirut')::date
    and p_return_date > p_pickup_date
    and p_return_date - p_pickup_date <= 30
    and p_pickup_date <=
      (now() at time zone 'Asia/Beirut')::date + 180
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

create or replace function public.preview_reservation(
  p_car_id uuid,
  p_pickup_date date,
  p_return_date date
)
returns table (
  car_id uuid,
  pickup_date date,
  return_date date,
  rental_days integer,
  available boolean,
  price_per_day numeric(10, 2),
  total_price numeric(12, 2),
  unavailable_reason text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_price_per_day numeric(10, 2);
  v_car_status public.car_status;
  v_rental_days integer;
  v_has_overlap boolean;
  v_beirut_today date := (now() at time zone 'Asia/Beirut')::date;
begin
  if
    p_pickup_date is null
    or p_return_date is null
    or p_return_date <= p_pickup_date
  then
    raise exception using
      errcode = '22023',
      message = 'INVALID_RENTAL_DATES';
  end if;

  if not (p_pickup_date > (now() at time zone 'Asia/Beirut')::date) then
    raise exception using
      errcode = '22023',
      message = 'PICKUP_DATE_NOT_AFTER_TODAY';
  end if;

  if p_pickup_date > v_beirut_today + 180 then
    raise exception using
      errcode = '22023',
      message = 'BOOKING_HORIZON_EXCEEDED';
  end if;

  v_rental_days := p_return_date - p_pickup_date;

  if v_rental_days > 30 then
    raise exception using
      errcode = '22023',
      message = 'RENTAL_PERIOD_TOO_LONG';
  end if;

  select
    cars.price_per_day,
    cars.status
  into
    v_price_per_day,
    v_car_status
  from public.cars
  where cars.id = p_car_id;

  if not found then
    return query
    select
      p_car_id,
      p_pickup_date,
      p_return_date,
      v_rental_days,
      false,
      null::numeric(10, 2),
      null::numeric(12, 2),
      'CAR_NOT_FOUND'::text;

    return;
  end if;

  if v_car_status <> 'available' then
    return query
    select
      p_car_id,
      p_pickup_date,
      p_return_date,
      v_rental_days,
      false,
      v_price_per_day,
      null::numeric(12, 2),
      'CAR_NOT_AVAILABLE'::text;

    return;
  end if;

  select exists (
    select 1
    from public.reservations
    where reservations.car_id = p_car_id
      and reservations.status in (
        'pending'::public.reservation_status,
        'confirmed'::public.reservation_status,
        'active'::public.reservation_status
      )
      and reservations.pickup_date < p_return_date
      and reservations.return_date > p_pickup_date
  )
  into v_has_overlap;

  if v_has_overlap then
    return query
    select
      p_car_id,
      p_pickup_date,
      p_return_date,
      v_rental_days,
      false,
      v_price_per_day,
      null::numeric(12, 2),
      'DATES_UNAVAILABLE'::text;

    return;
  end if;

  return query
  select
    p_car_id,
    p_pickup_date,
    p_return_date,
    v_rental_days,
    true,
    v_price_per_day,
    round(v_price_per_day * v_rental_days, 2)::numeric(12, 2),
    null::text;
end;
$$;

revoke all
  on function public.preview_reservation(uuid, date, date)
  from public;

grant execute
  on function public.preview_reservation(uuid, date, date)
  to anon, authenticated;

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
  v_rental_days integer;
  v_upcoming_reservation_count integer;
  v_reservation public.reservations;
  v_beirut_today date := (now() at time zone 'Asia/Beirut')::date;

  v_max_rental_days constant integer := 30;
  v_max_concurrent_reservations constant integer := 2;
  v_max_upcoming_reservations constant integer := 5;
  v_max_booking_horizon_days constant integer := 180;
begin
  if v_user_id is null then
    raise exception 'Authentication is required';
  end if;

  select role
  into v_user_role
  from public.profiles
  where id = v_user_id
  for update;

  if v_user_role is distinct from 'customer' then
    raise exception 'Only customers can create reservations';
  end if;

  if
    p_pickup_date is null
    or not (p_pickup_date > (now() at time zone 'Asia/Beirut')::date)
  then
    raise exception 'Pickup date must be after today';
  end if;

  if p_return_date is null or p_return_date <= p_pickup_date then
    raise exception 'Return date must be after pickup date';
  end if;

  if p_pickup_date > v_beirut_today + v_max_booking_horizon_days then
    raise exception
      'Reservations cannot be created more than 180 days in advance';
  end if;

  v_rental_days := p_return_date - p_pickup_date;

  if v_rental_days > v_max_rental_days then
    raise exception 'A reservation cannot exceed 30 rental days';
  end if;

  select count(*)
  into v_upcoming_reservation_count
  from public.reservations
  where customer_id = v_user_id
    and status in ('pending', 'confirmed', 'active')
    and return_date > v_beirut_today;

  if v_upcoming_reservation_count >= v_max_upcoming_reservations then
    raise exception 'You can have at most 5 upcoming reservations';
  end if;

  select price_per_day
  into v_price
  from public.cars
  where id = p_car_id
    and status = 'available'
  for share;

  if v_price is null then
    raise exception
      'The selected car is unavailable or does not exist';
  end if;

  if exists (
    select 1
    from generate_series(
      0,
      v_rental_days - 1
    ) as rental_day(day_offset)
    where (
      select count(*)
      from public.reservations as reservation
      where reservation.customer_id = v_user_id
        and reservation.status in (
          'pending',
          'confirmed',
          'active'
        )
        and reservation.booking_period @>
          (p_pickup_date + rental_day.day_offset)
    ) >= v_max_concurrent_reservations
  ) then
    raise exception
      'You can have at most 2 concurrent reservations';
  end if;

  if exists (
    select 1
    from public.reservations
    where car_id = p_car_id
      and status in ('pending', 'confirmed', 'active')
      and booking_period
        && daterange(p_pickup_date, p_return_date, '[)')
  ) then
    raise exception
      'The selected car is unavailable for these dates';
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
    raise exception
      'The selected car was just reserved for these dates';
end;
$$;

revoke all
  on function public.create_reservation(uuid, date, date)
  from public, anon;

grant execute
  on function public.create_reservation(uuid, date, date)
  to authenticated, service_role;

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

  select *
  into v_reservation
  from public.reservations
  where id = p_reservation_id
  for update;

  if not found then
    raise exception 'Reservation not found';
  end if;

  if p_status = 'confirmed' and v_reservation.status <> 'pending' then
    raise exception 'Only pending reservations can be confirmed';
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
