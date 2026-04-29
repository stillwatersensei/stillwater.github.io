# Stillwater Sensei v18

Complete drop-in GitHub Pages bundle.

## What changed in v18

- No bottom sprite strip.
- The large Sage panda is animated from sprite frames.
- Idle sprite frames are included at `assets/sage/sprites/idle/frame-01.png` through `frame-12.png`.
- Voice triggers the large Sage animation.
- Music continues steadily and advances to the next song when a track ends.
- Sound defaults match the requested screenshot as closely as practical:
  - Voice + Music
  - Google UK English Male when available
  - Voice Speed 0.84
  - Voice Pitch 0.86
  - Voice Volume 0.78
  - Music Volume 0.21
- Settings are remembered in localStorage.
- Main page attempts to start voice and music automatically. Some browsers, especially iPad Safari, may still require a tap because of autoplay restrictions.
- Right resources panel uses a colored background to balance the left path panel.

## Local audio files

Place music files here:

- `assets/audio/breath.mp3`
- `assets/audio/flow.mp3`
- `assets/audio/stillness.mp3`
- `assets/audio/closing.mp3`

Place Sage voice files here:

- `assets/voice/01-awakening-breath.mp3`
- `assets/voice/02-lift-flow.mp3`
- `assets/voice/03-flowing-arms.mp3`
- `assets/voice/04-gather-qi.mp3`
- `assets/voice/05-stillness.mp3`
- `assets/voice/06-closing.mp3`
- `assets/voice/07-final-bow.mp3`

If local voice MP3 files are missing, the app falls back to browser speech synthesis.

## Sprite animation approach

The app currently uses individual PNG frames instead of a visible sprite sheet because that is simplest and most reliable for GitHub Pages and iPad Safari.

The current movement stages all use the included idle breathing frames until custom movement frame sets are created.
