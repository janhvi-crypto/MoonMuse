## Dreamscape Jukebox (Moonlit)

A dreamy, ambient “night desk” web app built with React + Vite + Tailwind + shadcn/ui.  
It includes a compact **Mixtape** mini-player (predefined tracks), plus cozy interactive sections like a scrapbook, fortunes, soundscapes, and more.

## Run locally

### Requirements
- **Node.js** (recommended: 18+)
- **npm** (comes with Node)

### Install + start dev server

```bash
npm install
npm run dev
```

Open the URL printed in the terminal (usually `http://localhost:5173/`).

## Build for production

```bash
npm run build
npm run preview
```

## Mixtape: permanent songs (no upload UI)

The Mixtape player uses hardcoded tracks from:
- `src/components/dreamscape/MyMusicPlayer.tsx` (`TRACKS`)

Audio files are loaded from:
- `public/audio/`

By default, the player expects these files to exist:
- `public/audio/song1.mp3`
- `public/audio/song2.mp3`
- …
- `public/audio/song11.mp3`

To change filenames or track titles, edit the `TRACKS` array and commit your mp3 files (if you want them to be available after pushing to GitHub / deploying).

## Project scripts
- **dev**: `npm run dev`
- **build**: `npm run build`
- **lint**: `npm run lint`
- **test**: `npm run test`

## Tech stack
- React 18
- Vite 5
- TypeScript
- Tailwind CSS
- shadcn/ui (Radix UI primitives)

## Notes
- Large mp3 files can make the repo heavy. If needed, use Git LFS or host audio elsewhere.
- Only commit audio you’re allowed to distribute.
