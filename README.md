## MoonMuse

This web app is an aesthetic self-care and wellness platform designed to provide users with a calming digital safe space. It combines features like music playlists, journaling, mood tracking, vision boards, memory calendars, daily fortune cards, and photo memories into one immersive experience. The platform helps users relax, express emotions, organize thoughts, preserve memories, and practice mindfulness through an interactive and visually soothing interface. The goal of the app is to improve emotional well-being and create a personalized comfort space for users in their daily lives.  

*Disclaimer* : This is small scale deployment only. for large scale deployment, always use royalty free music track.

Deployed Link: https://moonmuses.vercel.app/

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

By default, these files exist:
- `public/audio/song1.mp3`
- `public/audio/song2.mp3`
- …
- `public/audio/song11.mp3`

To change filenames or track titles, edit the `TRACKS` array and commit your mp3 files (if you want them to be available after pushing to GitHub / deploying).
You can replace the audio/songs with your own tracks. Use royalty-free music track for safety.

## Project scripts
- **dev**: `npm run dev`
- **build**: `npm run build`
- **lint**: `npm run lint`
- **test**: `npm run test`

## About User data
- It uses Client side storage
- On the same device/browser profile: anyone who opens the site in that same browser profile can see that local data (because it’s stored in that browser’s localStorage).
- On different devices / different browser profiles: they cannot read each other’s local data through the app, because it’s not being uploaded.

## Tech stack
- React 18
- Vite 5
- TypeScript
- Tailwind CSS
- shadcn/ui (Radix UI primitives)

