create or replace function public.advance_reservation_statuses()
returns table (
  activated_count integer,
  completed_count integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_beirut_date date :=
    (now() at time zone 'Asia/Beirut')::date;
begin
  /*
   * Confirmed → Active
   *
   * Use <= rather than = so the function catches reservations
   * missed because of downtime or a failed cron execution.
   */
  update public.reservations
  set
    status = 'active',
    updated_at = now()
  where status = 'confirmed'
    and pickup_date <= current_beirut_date;

  get diagnostics activated_count = row_count;

  /*
   * Active → Completed
   *
   * This runs after activation intentionally. An old confirmed
   * reservation whose entire rental period has passed can therefore
   * be corrected to completed during the same execution.
   */
  update public.reservations
  set
    status = 'completed',
    updated_at = now()
  where status = 'active'
    and return_date <= current_beirut_date;

  get diagnostics completed_count = row_count;

  return next;
end;
$$;

revoke execute
on function public.advance_reservation_statuses()
from public, anon, authenticated;