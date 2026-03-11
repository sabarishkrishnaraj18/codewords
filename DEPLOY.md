# Deploying Codewords on Railway

## Overview

Two services are deployed independently:

| Service | Directory | Port |
|---------|-----------|------|
| Socket server | `apps/socket-server` | 4000 |
| Web app (Next.js) | `apps/web` | 3000 |

---

## Prerequisites

- GitHub account with this repo pushed
- [Railway account](https://railway.app) (free tier works)
- Optional: Supabase project for persistent accounts (see [SUPABASE_SETUP.md](SUPABASE_SETUP.md))

---

## Step 1 – Push repo to GitHub

```bash
git add .
git commit -m "Deploy ready"
git remote add origin https://github.com/YOUR_USER/codewords.git
git push -u origin main
```

---

## Step 2 – Create Railway project

1. Go to [railway.app](https://railway.app) → **New Project**
2. Choose **Deploy from GitHub repo** → select your repo

---

## Step 3 – Socket server service

Railway creates one service automatically. Configure it:

1. Click the service → **Settings** tab
2. Set **Dockerfile Path**: `apps/socket-server/Dockerfile`
3. Set **Watch Paths**: `apps/socket-server/**`
4. Go to **Variables** tab and add:
   ```
   PORT=4000
   NEXT_ORIGIN=https://YOUR-WEB-APP.up.railway.app
   ```
   *(You'll update NEXT_ORIGIN after the web app is deployed)*
5. Go to **Settings → Networking** → **Generate Domain** — copy the URL

---

## Step 4 – Web app service

1. In the Railway project → **+ New Service** → **GitHub Repo** (same repo)
2. Click the new service → **Settings**
3. Set **Dockerfile Path**: `apps/web/Dockerfile`
4. Set **Watch Paths**: `apps/web/**`
5. Go to **Variables** tab and add:
   ```
   NEXT_PUBLIC_SOCKET_URL=https://YOUR-SOCKET-SERVER.up.railway.app
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
   *(Omit Supabase vars to run in guest-only mode)*
6. Go to **Settings → Networking** → **Generate Domain** — this is your game URL

---

## Step 5 – Update CORS on socket server

Go back to the socket server service → **Variables** and update:
```
NEXT_ORIGIN=https://YOUR-ACTUAL-WEB-URL.up.railway.app
```

Trigger a redeploy (Railway does this automatically on variable changes).

---

## Step 6 – Verify

1. Open your web URL — you should see the Codewords home screen
2. Create a game, share the room code, join from another tab/device
3. Play a full game to confirm clues, guesses, blind bonus, and game-over all work

---

## Local Docker test (optional)

```bash
# From repo root:

# Build and run socket server
docker build -f apps/socket-server/Dockerfile -t codewords-socket .
docker run -p 4000:4000 -e PORT=4000 -e NEXT_ORIGIN=http://localhost:3000 codewords-socket

# Build and run web app
docker build -f apps/web/Dockerfile -t codewords-web .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SOCKET_URL=http://localhost:4000 \
  codewords-web
```

Then open http://localhost:3000.
