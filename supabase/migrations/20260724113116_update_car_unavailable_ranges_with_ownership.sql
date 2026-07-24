drop function if exists public.get_car_unavailable_ranges(
  uuid,
  date,
  date
);

create function public.get_car_unavailable_ranges(
  p_car_id uuid,
  p_from_date date,
  p_to_date date
)
returns table (
  start_date date,
  end_date_exclusive date,
  is_mine boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_from_date is null or p_to_date is null then
    raise exception using
      errcode = '22023',
      message = 'DATE_RANGE_REQUIRED';
  end if;

  if p_to_date < p_from_date then
    raise exception using
      errcode = '22023',
      message = 'INVALID_DATE_RANGE';
  end if;

  -- Prevent unnecessarily large calendar requests.
  if (p_to_date - p_from_date) > 92 then
    raise exception using
      errcode = '22023',
      message = 'DATE_RANGE_TOO_LARGE';
  end if;

  if not exists (
    select 1
    from public.cars
    where id = p_car_id
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'CAR_NOT_FOUND';
  end if;

  return query
  select
    greatest(
      reservation.pickup_date,
      p_from_date
    ) as start_date,

    least(
      reservation.return_date,
      p_to_date + 1
    ) as end_date_exclusive,

    coalesce(
      reservation.customer_id = (select auth.uid()),
      false
    ) as is_mine

  from public.reservations as reservation
  where reservation.car_id = p_car_id
    and reservation.status in (
      'pending',
      'confirmed',
      'active'
    )
    and reservation.booking_period
      && daterange(
        p_from_date,
        p_to_date + 1,
        '[)'
      )
  order by reservation.pickup_date;
end;
$$;

revoke all
  on function public.get_car_unavailable_ranges(uuid, date, date)
  from public;

grant execute
  on function public.get_car_unavailable_ranges(uuid, date, date)
  to anon, authenticated, service_role;