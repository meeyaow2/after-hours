# After Hours — Design Notes

## The concept
After Hours is an interactive, first-person listening room. Instead of choosing music from a conventional playlist, visitors explore a wall of record sleeves, reach for one, and move to a physical turntable.

## Experience principles
- **Physical first:** Album sleeves occupy 3D space. They move forward on hover and animate out from the wall on selection. The selected record's center label changes to match the song.
- **Focus over controls:** The player surfaces the track, main playback controls, progress and volume. Spotify, licensed Jazz Radio and privately imported audio are grouped in an optional listening drawer.
- **A room worth staying in:** Warm lighting, procedural woodgrain, speakers, an illuminated sideboard and a rug add material contrast and visual depth without heavy external 3D models.
- **Leave naturally:** Click outside the physical turntable table to return to the wall. Leaving stops playable audio and resets the visual turntable state. Escape also exits.
- **Purposeful animation:** Record pickup, tonearm motion and vinyl spin are gradual. A reduced-motion preference shortens the pickup animation.

## Constraints and honest behavior
Commercial music is not bundled or downloaded from YouTube. Official Spotify embeds are subject to account, licensing and preview limitations, and the custom turntable cannot independently control Spotify playback. Direct audio controls, seek and volume work with legally imported local files and compatible licensed streams; vinyl spinning follows those playback states.

## Accessibility and performance
- The main web UI uses semantic buttons, range sliders, a details disclosure for audio sources, and accessible labels.
- In the record wall, arrow keys navigate the collection and Enter selects the highlighted sleeve; Escape exits the player.
- On smaller viewports, render pixel ratio is capped to reduce WebGL cost, and the player becomes a compact responsive panel.
- Original HTML/CSS is kept as a fallback if the 3D module is unavailable.

## Next validation pass
Browser-level testing is still needed for 390px, 768px, 1440px and 1920px widths, as well as Safari and Firefox. Verify artwork CDN reliability, WebGL texture loading, reduced-motion mode, live audio streams, keyboard behavior and mobile touch targets.

## Portfolio presentation
Show the journey from an ordinary streaming interface to an immersive first-person interaction:
1. Initial interaction problem: music selection felt like choosing cards.
2. Design decision: records should be objects in a room and respond to hover and selection.
3. Playback limitation: an embedded commercial player cannot be controlled by custom hardware controls.
4. Solution: progressive source disclosure and direct-play modes where legal and technically supported.
5. Iterations: sleeve geometry, center alignment, human-hand artwork, camera transitions, and responsive controls.

## Refinement pass — interaction reliability and hardware feel
- Album transitions now have cancellation guards, helping avoid a stale camera transition after exiting.
- A selected sleeve reveals its title/artist in a subtle hover plaque.
- Direct audio Play switches to Pause while audio is running; the vinyl motor and needle are synchronized to supported HTMLAudioElement events.
- Selecting Spotify opens the Listening Options drawer and makes the official embedded player's limitations explicit.
- The turntable gained fine hardware detailing (metal rim, screws, standby indicator) and subtle undershelf lighting.
- The player's status and exit instructions are more discoverable and accessible.
