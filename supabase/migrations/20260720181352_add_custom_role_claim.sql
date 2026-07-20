create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  claims jsonb;
  current_user_role public.app_role;
begin
  select role
  into current_user_role
  from public.profiles
  where id = (event ->> 'user_id')::uuid;

  claims := event -> 'claims';

  claims := jsonb_set(
    claims,
    '{user_role}',
    to_jsonb(
      coalesce(
        current_user_role,
        'customer'::public.app_role
      )
    )
  );

  return jsonb_set(event, '{claims}', claims);
end;
$$;

-- Supabase Auth executes hooks using this database role.
grant usage on schema public to supabase_auth_admin;

grant execute
on function public.custom_access_token_hook(jsonb)
to supabase_auth_admin;

-- Prevent normal application users from calling the function.
revoke execute
on function public.custom_access_token_hook(jsonb)
from public, anon, authenticated;