# ACIM Phase 1C.3 — Manual club entry

## Deploy
Replace **app.js**, **index.html**, and **service-worker.js** in your existing `pwa-acim` GitHub Pages repository. Leave `config.js`, `print.css`, `print.js`, database tables and Supabase functions unchanged.

This package includes the latest Phase 1C.2 paginated live HeadDB lookup and the existing iPad print CSS. No SQL migration is required.

## Test
1. Sign in and select an associate. Choose **Add club**.
2. For a putter, change Club type to **Putter**; Manual entry is selected automatically. Enter a manufacturer and model in **Head model / description** (for example, `Scotty Cameron Phantom 5.5`), quantity, optional loft/set, shaft and grip. Save.
3. Edit the new club. It should open in Manual entry with the description intact.
4. Add a driver using **Select from FIS HeadDB**. Confirm the complete OEM list (pagination fix), choose a head, save and edit it again.
5. Switch a linked club to Manual entry and save; this deliberately clears its HeadID while retaining its description.
6. Confirm the printed form and existing inventory are unchanged.

## Notes
- Manual records save `head_id = NULL` and use existing `acim_clubs` fields.
- Editing a linked club keeps the saved HeadID unless you explicitly change to manual entry or alter the head description.
- If FIS reference loading fails, manual entry still works.
- Do not upload the example `config.js` over your working configuration.
