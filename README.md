# Stillwater Sensei v16.1

Stillwater Sensei is an open-source, browser-based Chair Tai Chi + Qigong guided practice app led by Sage, a calm 2D panda guide.

## v16.1 updates

- Added four audio modes:
  - Play Voice + Music
  - Voice Only
  - Music Only
  - Silence
- Voice now tries local MP3 files first.
- If local voice MP3 files are missing, voice falls back to built-in browser speech synthesis.
- Added right-side Resources panel to balance the Stillwater Path panel.
- Added `history.html` with a quick overview of Tai Chi and Qigong.
- Bumped cache versions to `v=16.1` for CSS, JS, images, and page links.

## Required / expected music files

Place in `assets/audio/`:

- `breath.mp3`
- `flow.mp3`
- `stillness.mp3`
- `closing.mp3`

## Optional local voice files

Place in `assets/voice/`:

- `01-awakening-breath.mp3`
- `02-lift-flow.mp3`
- `03-flowing-arms.mp3`
- `04-gather-qi.mp3`
- `05-stillness.mp3`
- `06-closing.mp3`
- `07-final-bow.mp3`

If these are missing, the app uses browser speech synthesis as a temporary fallback.

## GitHub Pages testing

After upload, test with cache-busting URLs:

- `https://stillwatersensei.github.io/?v=16.1`
- `https://stillwatersensei.github.io/app.js?v=16.1`
- `https://stillwatersensei.github.io/style.css?v=16.1`
- `https://stillwatersensei.github.io/history.html?v=16.1`

Created by David Fliesen in 2026.
