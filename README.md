# After Hours — 3D Vinyl Listening Room

**Live website:** https://meeyaow2.github.io/ops-music-playground/

After Hours is an interactive music playground built with HTML, CSS, JavaScript and Three.js. Browse twelve records, pick one up from the 3D shelves, and play it at the turntable.

## Structure

- `index.html` — catalog, interface, playback and responsive fallback
- `scene3d.js` — 3D room, record extraction, turntable and camera
- `assets/audio/` — MP3 assets for three selected tracks
- `tests/after-hours.spec.mjs` — Playwright browser tests
- `.github/workflows/after-hours-qa.yml` — manually triggered browser QA
- `DESIGN_NOTES.md` — design history and decisions

## Audio

Direct-play MP3s are configured for Bruno Mars — When I Was Your Man, keshi — LIMBO, and Billie Eilish — ocean eyes. Other records offer Spotify listening options. An independent ambient jazz player uses external licensed music. The former file importer and hand cursor have been removed.

The site is published by GitHub Pages from `main`. Browser QA remains manual-only while 3D interaction regressions are investigated.

**Note:** Public GitHub Pages websites and their MP3 files can be accessed by others even if the site is intended as a personal portfolio playground. Hosting commercial recordings requires appropriate rights.
