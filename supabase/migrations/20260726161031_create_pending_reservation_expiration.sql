create or replace function public.reject_expired_pending_reservations()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected_rows integer;
begin
  update public.reservations
  set
    status = 'rejected',
    updated_at = now()
  where status = 'pending'
    and now() >= least(
      created_at + interval '48 hours',

      -- Midnight at the beginning of the pickup date,
      -- interpreted using Beirut's timezone.
      pickup_date::timestamp at time zone 'Asia/Beirut'
    );

  get diagnostics affected_rows = row_count;

  return affected_rows;
end;
$$;

-- Customers and anonymous users should not manually execute this.
revoke execute
on function public.reject_expired_pending_reservations()
from public, anon, authenticated;