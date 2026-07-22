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
  v_reservation public.reservations;

  v_max_rental_days constant integer := 30;
  v_max_concurrent_reservations constant integer := 2;
begin
  if v_user_id is null then
    raise exception 'Authentication is required';
  end if;

  /*
   * Lock the customer's profile row.
   * This prevents simultaneous reservation requests from the same customer
   * from bypassing the concurrent reservation limit.
   */
  select role
  into v_user_role
  from public.profiles
  where id = v_user_id
  for update;

  if v_user_role is distinct from 'customer' then
    raise exception 'Only customers can create reservations';
  end if;

  if p_pickup_date < current_date then
    raise exception 'Pickup date cannot be in the past';
  end if;

  if p_return_date <= p_pickup_date then
    raise exception 'Return date must be after pickup date';
  end if;

  v_rental_days := p_return_date - p_pickup_date;

  if v_rental_days > v_max_rental_days then
    raise exception 'A reservation cannot exceed 30 rental days';
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

  /*
   * Reject the request if the customer already has two reservations
   * covering any day inside the requested rental period.
   */
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