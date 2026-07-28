create or replace function private.broadcast_reservation_availability_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_car_id uuid;
begin
  if tg_op = 'UPDATE'
    and new.car_id is not distinct from old.car_id
    and new.status is not distinct from old.status
    and new.pickup_date is not distinct from old.pickup_date
    and new.return_date is not distinct from old.return_date
  then
    return new;
  end if;

  current_car_id :=
    case
      when tg_op = 'DELETE' then old.car_id
      else new.car_id
    end;

  perform realtime.send(
    jsonb_build_object('operation', tg_op),
    'availability_changed',
    'car:' || current_car_id::text || ':availability',
    false
  );

  -- Refresh the old car too if a reservation moves between cars.
  if tg_op = 'UPDATE'
    and new.car_id is distinct from old.car_id
  then
    perform realtime.send(
      jsonb_build_object('operation', tg_op),
      'availability_changed',
      'car:' || old.car_id::text || ':availability',
      false
    );
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists broadcast_reservation_availability_change
on public.reservations;

create trigger broadcast_reservation_availability_change
after insert or update or delete
on public.reservations
for each row
execute function private.broadcast_reservation_availability_change();