# ACIM 1C.2 — HeadDB pagination correction

The live `acim_list_fis_heads` RPC was being read in a single request, which Supabase/PostgREST typically caps at 1,000 rows. The OEM list was therefore incomplete.

Replace only `app.js` and `service-worker.js` in the existing GitHub Pages repository. Preserve `config.js`, all other files, and the working print layout. No SQL changes are required.

This version requests the read-only RPC in 500-row pages and deduplicates by HeadID. It uses a 20,000-row safety cap. Once deployed, refresh/reopen the PWA, select an associate, then Add Club and verify TaylorMade, Titleist, etc. appear in OEM choices.

If the catalog is still incomplete, check Supabase API > Max Rows (must be at least 500) and inspect the RPC results. The RPC currently has no explicit ORDER BY, so pagination may be nondeterministic as the database changes; a future server-side ordered paging RPC would be more robust.
