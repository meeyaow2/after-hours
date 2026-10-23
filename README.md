# After Hours — A 3D Vinyl Listening Room

**Live site:** https://meeyaow2.github.io/ops-music-playground/

First-person-inspired 3D vinyl listening room built using Three.js and static HTML. Walk up to a wall of albums, choose a record, and move into a turntable view.

## Record collection

Twelve commercial song selections:
- Bruno Mars — When I Was Your Man
- keshi — LIMBO
- Billie Eilish — BIRDS OF A FEATHER
- Adele — Easy On Me
- Lady Gaga & Bruno Mars — Die With A Smile
- keshi — Soft Spot
- Billie Eilish — ocean eyes
- Adele — Someone Like You
- No Guidnce — Is It A Crime?
- OSA — Test Of Time (Spotify's *Quarter Life Crisis* album player)
- GIVĒON — Heartbreak Anniversary
- Joji — SLOW DANCING IN THE DARK

Commercial songs **are not hosted as MP3s in this repository**. Spotify embeds may play previews or require Spotify sign-in or app playback, and cannot be reliably started or controlled through a separate third-party play button.

## Directly playable Jazz Radio

On the turntable, select **Jazz Radio** to play a Creative Commons recording directly:
- "Lobby Time" — Kevin MacLeod (incompetech.com)
- "Airport Lounge" — Kevin MacLeod (incompetech.com)

Both are licensed under the **Creative Commons Attribution 4.0 International License**:
https://creativecommons.org/licenses/by/4.0/

Source and attribution:
- "Lobby Time" Kevin MacLeod (incompetech.com). Licensed under Creative Commons: By Attribution 4.0 License.
  https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1600054
- "Airport Lounge" Kevin MacLeod (incompetech.com). Licensed under Creative Commons: By Attribution 4.0 License.
  https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100806

The direct streams come from incompetech.com. Internet connectivity and the host's availability are required. When Jazz Radio or a local audio file is playing, the 3D record spins.

## Local audio files

Choose **+ ADD YOUR AUDIO FILE** to import an MP3/WAV/M4A you have the rights to use. Files are stored privately in browser IndexedDB (where storage is supported), not sent to GitHub. The turntable controls and progress slider control these files directly.

## Architecture

- `index.html`: Gameplay presentation, record library, audio imports and official Spotify player
- `scene3d.js`: Three.js 3D room, cabinet, shelves, albums, hand, record player, camera animation and raycasting
- CSS scene fallback if WebGL or Three.js fails to load
- GitHub Pages deploys the `main` branch from the repository root

## Caveats

The 3D models are procedurally modeled and not photorealistic scans. Album covers are recovered from Apple Music's song catalog where available, with text fallbacks when image services fail. The code passes JavaScript syntax checks, but full browser playback validation on every device remains outstanding.
