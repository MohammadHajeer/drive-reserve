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
    rejection_reason =
      'Automatically rejected because the reservation was not reviewed within the allowed pending period.',
    updated_at = now()
  where status = 'pending'
    and now() >= least(
      created_at + interval '48 hours',
      pickup_date::timestamp at time zone 'Asia/Beirut'
    );

  get diagnostics affected_rows = row_count;

  return affected_rows;
end;
$$;