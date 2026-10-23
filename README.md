# After Hours — First-person vinyl listening room

A small gameplay-inspired listening room. Stand in front of a wall of records, reach for a sleeve, put it on the turntable, and listen.

## Live website

https://meeyaow2.github.io/ops-music-playground/

## Music selection

The room currently contains eight selectable records featuring tracks by **Bruno Mars**, **keshi**, **Billie Eilish**, **Adele**, and Lady Gaga with Bruno Mars. Music plays through official **Spotify embeds** rather than being downloaded or rehosted.

A Spotify account, region, and playback entitlement can affect whether listeners hear previews or full tracks. Start playback inside the Spotify player when prompted. The turntable's **STOP** button removes the embed to halt its playback.

## Gameplay

1. Move over a sleeve on the record wall and click to pick it up.
2. Watch the album move toward the table and transition into the close-up turntable.
3. Press the turntable's **START** button to lower the needle and reveal the Spotify music player.
4. Start audio in the Spotify embed, or press **STOP** to lift the needle and stop the embedded player.
5. Return to the wall to select another record.

## Technical notes

- Static HTML sleeves remain visible even if the interaction script cannot run.
- HTML, CSS, JavaScript; responsive layout and no build step.
- Perspective-styled room and animated hand; **not yet photorealistic 3D or full character animation**.
- The turntable animation represents the needle state, not independently confirmed third-party audio playback.
- Github Pages deploys `index.html` from the main branch.
