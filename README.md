# VibePoint — Scrum Poker

Real-time story point estimation for agile teams. Dark-first, glassmorphism UI with Socket.IO multiplayer.

## Project structure

```
/app
  layout.tsx, page.tsx, globals.css, providers.tsx, icon.tsx
  session/[id]/page.tsx, loading.tsx
/components
  ui/button.tsx, input.tsx, card.tsx, toast.tsx
  session/session-view.tsx, session-bar.tsx, context-panel.tsx,
  voting-cards.tsx, player-list.tsx, host-controls.tsx,
  join-form.tsx, reveal-effect.tsx
/lib
  socket.ts, utils.ts, constants.ts
/server
  server.js (entry), store.js, socket-handler.js
  store.ts, socket-handler.ts (types)
/store
  session-store.ts
/hooks
  useSocket.ts
/types
  index.ts
server.js          # Custom Node server (Next + Socket.IO)
```

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Start a session, share the link, and vote.

## Scripts

- `npm run dev` — Custom server (Next + Socket.IO) on port 3000
- `npm run build` — Next.js production build
- `npm start` — Production server (set `NODE_ENV=production` first)

## Environment

Optional:

- `PORT` — Server port (default `3000`)
- `NEXT_PUBLIC_PORT` — Same as `PORT` when frontend and backend differ (e.g. dev proxy)

## Deployment

### Vercel (frontend) + Railway / Fly.io (Socket.IO server)

The app uses a **custom Node server** that runs both Next.js and Socket.IO. For production:

1. **Single-node (recommended for small teams)**  
   Deploy the whole repo to **Railway** or **Fly.io** as a Node app:
   - Build: `npm run build`
   - Start: `npm start` (or `NODE_ENV=production node server.js`)
   - Set `PORT` in the dashboard.

2. **Vercel + separate Socket server**  
   - Deploy **only** the Socket.IO + store logic to Railway/Fly.io (e.g. a small Express app that mounts the same `server/socket-handler.js` and `server/store.js`).
   - Deploy the Next.js app to Vercel (static/SSR only; no custom server on Vercel).
   - Point the frontend to the Socket server URL via `NEXT_PUBLIC_SOCKET_URL` (you’d need to add this env and update `lib/socket.ts` to use it when set).

For a single-command setup, use **Railway** or **Fly.io** and run the full custom server so Socket.IO and Next run together.

### Railway

- New project → Deploy from repo.
- Build: `npm run build`
- Start: `npm start`
- Add variable: `PORT` (Railway often sets this automatically).

### Fly.io

- `fly launch` in the repo.
- In `fly.toml`, set:
  - `[env]` with `PORT = "8080"` (or your chosen port).
- Start: `npm start`.
- Deploy: `fly deploy`.

## Tech

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind, Framer Motion, Zustand, Socket.IO client
- **Backend:** Node custom server, Socket.IO, in-memory store (replaceable with Redis later)
