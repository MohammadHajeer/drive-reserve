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

  if p_pickup_date < current_date then
    raise exception using
      errcode = '22023',
      message = 'PICKUP_DATE_IN_PAST';
  end if;

  v_rental_days := p_return_date - p_pickup_date;

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