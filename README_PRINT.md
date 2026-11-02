# ACIM Phase 1D/1E — Printable inventory form

## Deployment
1. Preserve your existing working `config.js` when replacing the deployed files. This package includes the previously supplied configuration, but it is safer to retain the working local copy.
2. Upload all files and folders to the root of `pwa-acim` (including `print.css` and `print.js`).
3. Deploy GitHub Pages and reload the app. If an installed PWA shows old content, close/reopen it or clear the site cache.
4. Select an associate, select one or more active clubs, and press **Preview / Print**. Use landscape, Letter, scale 100%, and disable browser headers/footers if offered.

## Behavior
- Only checked active clubs are printed; all six club categories remain visible as on the paper original.
- Multiple selected records within a category generate additional rows.
- Date is based on the America/Los_Angeles timezone, not the device's timezone.
- The manager's In/Out initials cells and both signature lines are blank for handwriting.
- Printing does not create a database visit record or change inventory.
- No database migration is needed.

## Testing
- One club, all clubs, no clubs, multiple wedges, a six-iron set (quantity=6), long shaft/grip text.
- Desktop Chrome and iPad Safari print preview; ensure no extra page and all footer signature lines are present.
- A high number of separately listed clubs can overflow a single page; consider condensing or a continuation sheet if that occurs.

The PGA TOUR SUPERSTORE header is typographic; no proprietary logo artwork is embedded. The printed layout follows the photographed form's table, category order, diagonal approvals and footer.
