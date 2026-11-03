# ACIM iPad print correction v2

Changes:
- Print form has 0.55 inch internal top spacing plus a requested 0.25 inch @page top margin (nominal 0.80 inch total). iPad may ignore @page but will preserve the internal spacing.
- Check-in/out diagonals are inline SVG strokes rather than CSS gradients, for better Safari/AirPrint reliability.
- Service worker cache bumped to printfix3.

Deploy: Replace index.html, print.js, print.css, service-worker.js (other files unchanged). Keep your existing config.js. Refresh the PWA, close/reopen it if installed, and inspect the iPad print preview before printing.

Notes: Landscape printing remains controlled by the browser/printer. With many additional club rows, a second page may be necessary. No Supabase migration.
