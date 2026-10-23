# After Hours — First-Person Vinyl Listening Room

A small, atmospheric browser experience. You are standing in front of a wall of jazz records, with a turntable on the wooden table in front of you. Reach for a sleeve, place the record on the platter and lower the needle.

## Play

https://meeyaow2.github.io/ops-music-playground/

## How to interact

1. Move your cursor over one of the **12 records** on the wall and click to pick it up.
2. The record animates toward the turntable, transitioning into a close-up player view.
3. Use the turntable's **START**, **STOP** and **NEEDLE** buttons to control playback.
4. Adjust volume on the player, use **NEXT RECORD**, or return to the wall.
5. On keyboards, press **Space** to play/pause and **Escape** to return to the wall.

## Design

- First-person perspective instead of normal website tabs, drawers, cards or navigation.
- Visible sleeve wall, walnut furniture, physical turntable and hand-like mouse pointer.
- Responsive scene, including a 4-column shelf layout on smaller screens.
- Original Web Audio jazz-inspired synthesized instrument sketches, with no commercially licensed music.
- No login, API key, dependency installation or build step.

## Limitations

This is a self-contained **2.5D CSS-perspective** MVP, not yet a fully modeled first-person 3D world. Hands, record pickup and the camera transition are stylized rather than photorealistic, and the generated music is intentionally an early prototype. Browser audio needs a user gesture before it can play.

## Deploy

GitHub Pages serves the repository's root `index.html` from the `main` branch. Subsequent commits redeploy automatically.

## Project history

This repository originally hosted **Bops**, a browser beat sequencer, then an atmospheric jazz-bar concept. It now hosts the first-person vinyl-listening experience.
