# Stillwater v20

Full drop-in GitHub Pages bundle.

## Main update

v20 restores the opening/home screen and makes the home Sage use a real image-sequence sprite animation:

`assets/sage/idle-frames/frame-01.png` through `frame-12.png`

The app swaps those frame images with JavaScript. This is different from the older CSS-only swelling effect.

## Behavior

- Home screen uses animated idle sprite frames.
- Practice screen uses the stable Sage image fallback.
- Music is steady and does not change when sections change.
- Music advances to the next local MP3 when a track ends.
- After Final Bow completes, music stops, sound mode is set to Silence, and the app returns home.
- Sound settings are remembered with localStorage.
- CSS/JS cache busting is set to v=20.

## Audio files expected

Place local music MP3 files here:

- assets/music/breath.mp3
- assets/music/flow.mp3
- assets/music/stillness.mp3
- assets/music/closing.mp3

Optional future Sage voice files can go here:

- assets/voice/awakening-breath.mp3
- assets/voice/lift-flow.mp3
- assets/voice/flowing-arms.mp3
- assets/voice/gather-qi.mp3
- assets/voice/stillness.mp3
- assets/voice/closing.mp3
- assets/voice/final-bow.mp3

## Upload instructions

Upload the contents of this folder to the root of the GitHub Pages repo:

`stillwatersensei/stillwatersensei.github.io`
