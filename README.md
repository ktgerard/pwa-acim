# ACIM Phase 1C — Upgrade instructions

This is an **incremental upgrade** of the deployed Phase 1A/1B app. It retains the existing Supabase schema, data, RLS and shared service desk login. **Do not rerun the initial setup or recreate the tables.** No SQL migrations are needed for this release.

1. Unzip this package. Open `config.js` and copy your existing working Supabase project URL and **publishable/anon** key from the deployed app. Never use a service-role or secret key.
2. Upload the contents of the `ACIM_Phase1C` folder (not the folder itself) to the root of your `pwa-acim` GitHub Pages repository, replacing matching files. Keep the `icons` and `sql` folders.
3. Wait for GitHub Pages deployment; reload the app. If the old interface persists, close and reopen the installed PWA or clear its site cache. The service worker cache version was updated.
4. Sign in using the same shared service desk account. Confirm your existing associate is listed. Use **Add associate**, **Edit selected associate**, **Deactivate / Restore selected**, **Add club**, and club-level **Edit / Deactivate / Restore**.
5. Check **Show inactive associates** to restore deactivated associates. Check **Show inactive clubs** to restore deactivated clubs. Inactive clubs never appear in the selection list.

## Validation checklist

- Existing associate data remains intact.
- Add a temporary associate, edit its name, deactivate and restore it.
- Add a driver and an iron set; select and clear their checkboxes.
- Edit a club; deactivate and restore it.
- Confirm edits appear on a second signed-in device after refreshing.
- Confirm users who are not on `acim_authorized_users` cannot read or modify the records.

## Scope

This release implements Phase 1C associate and club management. It does **not** yet print the original form, save visits, or record digital approvals. RLS policies and database schema remain unchanged from Phase 1A.

## Security

The shared account can read and write ACIM tables under the existing RLS policy. The shared credential is not an individual audit trail; use store-approved credential handling. The Supabase project URL and publishable key are intended to be public, but passwords and service-role keys must never go into the repository.
