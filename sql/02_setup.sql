-- AFTER creating the shared login under Supabase Authentication > Users,
-- find its UUID and replace REPLACE_WITH_AUTH_USER_UUID below.
-- Run this as administrator in SQL Editor. Never put this UUID in the frontend.
-- insert into public.acim_authorized_users(user_id)
-- values ('REPLACE_WITH_AUTH_USER_UUID'::uuid)
-- on conflict (user_id) do update set enabled = true;

-- OPTIONAL test associate. Remove the comment marks to insert it.
-- insert into public.acim_associates(first_name,last_name,employee_number)
-- values ('Ken','Gerard','503451')
-- on conflict (employee_number) do nothing;

-- Verification (SQL Editor runs as admin, so this does not test RLS):
select 'associates' as table_name, count(*) as rows from public.acim_associates
union all select 'clubs', count(*) from public.acim_clubs
union all select 'visits', count(*) from public.acim_visits
union all select 'authorized_users', count(*) from public.acim_authorized_users;
