# ACIM Phase 1A + 1B

## Included
- Supabase PostgreSQL schema, RLS and authorization allowlist
- Email/password sign-in with one shared service-desk account
- Associate search and active inventory lookup, checkbox selection
- Installable PWA shell for GitHub Pages

**Not yet implemented:** associate/club editor, print form, visit recording, offline database editing. These are Phase 1C–1E. Checkboxes only select records on the current screen.

## Installation
1. Create a Supabase project (or use an existing one with an isolated ACIM schema/table prefix).
2. In SQL Editor run `sql/01_schema.sql` once.
3. In Authentication > Providers, enable Email. Create one shared service-desk user in Authentication > Users with a strong unique password. Disable public signups in Authentication settings. Do not put its password in repository files.
4. Copy that user's UUID from Authentication > Users. In `sql/02_setup.sql`, uncomment the allowlist `insert` statement, replace `REPLACE_WITH_AUTH_USER_UUID`, and run it in SQL Editor. The shared login cannot access data until this is done.
5. Optionally uncomment the test associate insert for employee 503451 and run it. The test associate has no clubs until records are added.
6. Copy Project URL and **publishable** key from Supabase project settings into `config.js`. The publishable key is intended for browser use; RLS provides access control. NEVER use service_role/secret key in frontend.
7. Upload the **contents** of this directory (including `icons/`) to the root of a new GitHub repository, e.g. `pwa-acim`.
8. GitHub repository Settings > Pages > Deploy from a branch > main / (root). Open the published URL and sign in.
9. Test a non-allowlisted account: it must not read associate or club records. Test the authorized shared account and confirm associate selection works.

## Adding a test club in SQL Editor
After optionally inserting the sample associate:
```sql
insert into public.acim_clubs(associate_id,club_type,quantity,head_model,loft_set_makeup,shaft_model,grip)
select associate_id,'Driver',1,'TaylorMade Qi10 LS','9°','Ventus TR Blue 60 S','Tour Velvet'
from public.acim_associates where employee_number='503451';
```

## Operational notes
- This initial release needs network access to authenticate and fetch records. Cached shell files do not mean the inventory is available offline.
- Service-worker updates may require closing/reopening the installed PWA. `config.js` is intentionally not cached.
- This phase has no print button: the original paper layout will be built and tested in Phase 1E.
- Shared account means all edits will appear as one login; individual accountability is not available.
- If GitHub Pages is public, `config.js` will be publicly readable. This is expected for the publishable key; never store passwords or secret keys there.
- The database's authorization allowlist is not accessible through the client. Maintain it from SQL Editor.
- For production use, confirm company authorization to store employee records in Supabase and use a shared login.
