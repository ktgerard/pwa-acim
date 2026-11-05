# ACIM Phase 1C.2 — Live FIS HeadDB

1. Run `sql/04_live_fis_reference.sql` in Supabase SQL Editor using project administrator permissions. This creates two read-only RPC functions, without changing existing FIS table policies.
2. Upload the PWA files to the existing `pwa-acim` GitHub Pages repository. **Keep your working `config.js`**; the included placeholder must not overwrite it. Retain `print.css` from this package (includes v3 horizontal margins).
3. Refresh the installed PWA or reopen Safari after deployment. Confirm your R7 Quad Mini Driver appears under Driver > TaylorMade; select its loft from the optional live specs dropdown.
4. Existing ACIM records and print behavior are preserved. `data/heads.json` is no longer queried and can be left in place.

Notes: The authorized ACIM shared account can call the functions; unauthenticated or non-authorized accounts cannot. Functions return only head identity fields and loft values. Supabase function execution is protected by the allowlist check. SQL assumes the two FIS tables are in the `public` schema and that `acim_is_authorized()` already exists. If a HeadDB value uses a noncanonical club type, it will not be returned.

Manual entry remains available if live lookup fails. Existing selected head IDs remain intact when editing. Test on a noncritical record first.
