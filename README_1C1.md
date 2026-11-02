# ACIM Phase 1C.1 — HeadDB-assisted club entry

Based on the supplied deployed ACIM and CRG ZIP files. Includes 975 distinct CRG head reference rows.

## Deployment
1. In your existing Supabase project, run `sql/03_head_reference.sql` ONCE. It adds a nullable `head_id` field to ACIM clubs; it does not alter FIS tables or existing inventory.
2. Upload all package files and folders to your existing `pwa-acim` GitHub Pages repository. Preserve `data/heads.json`.
3. Force refresh / close and reopen the installed PWA if the old version is cached.
4. Select an associate, click Add club, and choose Club Type → OEM → Model → Release year → Variant. The head description fills automatically. Quantity, loft/set, shaft and grip remain editable.
5. Verify that editing a club retains its head reference and that manual entry works.

## Source and limitations
The head selectors read a bundled snapshot from your uploaded CRG `data/heads.json`, not a live Supabase HeadDB query. This avoids guessing the live FIS table name/columns or changing FIS RLS. Refresh `data/heads.json` from CRG when new heads are added, or supply the actual live HeadDB table schema for a subsequent read-only Supabase integration. The selected `HeadID` is stored in ACIM `head_id` as text; the descriptive model remains in `head_model` for resilience.

2015+ is the default; the checkbox enables earlier release years. Manual entry is always available. No existing clubs are rewritten.

Your deployed `config.js` was preserved from your supplied ZIP; it contains a publishable key, not a service-role key. Do not publish any secret keys.
