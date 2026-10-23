# After Hours — A first-person vinyl listening room

**Live website:** https://meeyaow2.github.io/ops-music-playground/

A gameplay-inspired listening room. Choose a sleeve from the record wall, put it on the turntable, and listen.

## Featured artists

Bruno Mars, keshi, Billie Eilish, Adele, plus a Lady Gaga / Bruno Mars collaboration. These commercial songs are **not bundled as MP3s**. Official Spotify track embeds may provide previews or full playback subject to the listener's account and region.

## Play your own audio directly

1. Pick a record from the wall.
2. On the turntable screen choose **+ ADD YOUR AUDIO FILE**.
3. Select an MP3, WAV, M4A or other supported audio file **you have permission to use**.
4. Press the physical **▶** button to play; **■** stops and resets playback.
5. Seek with the progress slider. Your imported audio is associated with the selected record.
6. Use **REMOVE IMPORTED AUDIO** to delete a file from this browser's saved collection.

Local audio uses the browser’s HTML audio engine, not Spotify. Imported audio is stored privately in **IndexedDB** on the user's device (subject to browser storage availability/quotas), not uploaded to GitHub or the server. Clearing browser data removes the imports. Importing a file doesn't grant rights to share or redistribute it.

## Spotify fallback

If no local file has been imported, pressing ▶ shows an official Spotify embed. Spotify imposes its own playback policies. You may need to press Play inside the embed, and the turntable cannot control the Spotify iframe's internal transport. **STOP** removes the embedded player.

## Technology

Single-file static HTML/CSS/JavaScript, local IndexedDB and native Audio, CSS perspective stage and responsive layout. No build step. This remains a stylized 2.5D scene, not full photorealistic 3D. Published via GitHub Pages from `main`.
