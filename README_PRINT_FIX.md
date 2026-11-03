# ACIM Print Fix 2 — iPad / 3-hole binder

- Print now uses two steps: **Preview / Print** displays the rendered form on screen; **Print Form** starts AirPrint in a separate tap. This avoids the common iPad Safari timing issue where printing immediately after injecting a hidden form produces a blank page.
- The top page margin is 0.78 inch, compared with the previous 0.36 inch. The other margins remain 0.36 inch. The layout remains US Letter landscape.
- The form preview remains visible until **Close Preview** is selected; it is no longer hidden automatically by the `afterprint` event.
- Service worker cache version bumped to refresh assets on installed PWAs.

## Deploy
Copy the package contents to the existing GitHub Pages repository, retaining your working `config.js` and any live Supabase configuration. No SQL migration required. On the iPad, fully close/reopen the installed PWA or reload Safari after deployment. Test **Preview / Print**, verify the on-screen form, then tap **Print Form**.

If iPad AirPrint still renders blank, try Safari (rather than the installed Home Screen PWA), and report the iPadOS version, browser, and whether the preview itself is visible. This is a compatibility fix, not a guarantee for every AirPrint configuration.
