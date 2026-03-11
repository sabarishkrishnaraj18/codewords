# codewords — Claude Project Instructions

## Project
Web-based Codenames game (Next.js 14, Supabase, Socket.io, Tailwind, Framer Motion).

## How to run
```bash
cd "/Volumes/TOSHIBA EXT/claude_wd"
./start.sh        # starts both socket server (port 4000) and Next.js (port 3000)
```
Since the project is on an exFAT drive, npm `.bin` symlinks don't work.
All scripts use direct `node path/to/bin.js` invocations.

## Permissions — Claude may do these automatically without asking each time

### Dev Server
- Run `node ../../node_modules/next/dist/bin/next build` in apps/web to check build
- Run `node ../../node_modules/next/dist/bin/next dev` in apps/web to start Next.js
- Run `node ../../node_modules/ts-node-dev/lib/bin.js --respawn --transpile-only src/index.ts` in apps/socket-server to start socket server
- Run `npm install <package>` from workspace root to install a dependency

### Testing & Verification
- Open two different browser tabs to test multiplayer (each tab = different user via sessionStorage)
- Take screenshots to verify UI against the reference screenshot
- Read browser console logs to debug errors

### Code
- Edit and create files freely within this project
- Run git status / git diff to check changes (do NOT commit without being asked)

## Permissions — always ask before doing
- `git commit` or `git push`
- Deleting files or folders
- Modifying .env.local secrets
- Deploying to production
- Creating or modifying Supabase tables in production

## Architecture

### Identity & Auth
- Each browser **tab** gets its own session ID via `sessionStorage` (so two tabs = two players)
- Username saved in `localStorage` (persists across refreshes within a tab)
- Optional Supabase auth: add NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY to apps/web/.env.local
  - Without Supabase: guest mode (no persistent accounts)
  - With Supabase: email/password accounts, username persisted on profile
- Auth context: `src/contexts/AuthContext.tsx`
- Identity utils: `src/lib/identity.ts`

### Socket server (apps/socket-server)
- Standalone Node.js + Socket.io server on port 4000
- Holds game state in memory (roomManager.ts)
- Server-authoritative: spymaster sees real colors, operatives see masked state
- Turn timer lives on server (timerManager.ts)
- Key files: gameEngine.ts, roomManager.ts, timerManager.ts, handlers/

### Web app (apps/web)
- Next.js 14 App Router
- Pages: `/` (home), `/auth` (login/signup), `/lobby/[code]`, `/game/[code]`
- State: useGameState hook + gameReducer, synced via socket events
- Key hooks: useSocket, useGameState, useRole, useWordDefinition, useLongPress
- Dictionary lookups: api.dictionaryapi.dev — long press or right-click any card

### Card colors (matching reference screenshot)
- Unrevealed: `#e8d5b0` warm beige, dark bottom border
- Blue revealed: `#5090c8`
- Red revealed: `#c0392b`
- Neutral revealed: `#c8a97a`
- Assassin revealed: `#2d2d2d`

### npm / exFAT workaround
Root node_modules are at `/Volumes/TOSHIBA EXT/claude_wd/node_modules/`.
Symlinks in `.bin/` do NOT work on exFAT. Always call `node path/to/bin.js` directly.
webpack alias in next.config.mjs forces socket.io CJS build.

## Game-specific context

### Blind guess mechanic
After all clue cards guessed: operatives get a blind guess on any unrevealed card.
Scoring is INDIVIDUAL:
- Own team card: +2 pts
- Opponent card: -1 pt
- Neutral: 0 pts
- Assassin: -2 pts

### Word modes
- Standard: 400-word default list (public/words/standard.json)
- Mix: custom + standard pooled
- Custom only: ≥ 25 words required

### Stack
- Frontend: Next.js 14 App Router + TypeScript
- Styling: Tailwind CSS + Framer Motion
- Realtime: Socket.io (standalone Node server on port 4000)
- Auth/DB: Supabase (optional — graceful guest fallback)
- Dictionary: api.dictionaryapi.dev/api/v2/entries/en/{word}

## When user provides a screenshot
1. Analyze it carefully against the reference codenames.game screenshot
2. Identify differences in: card colors, layout, panels, clue input style, fonts
3. Fix the differences, verify build, iterate until it matches
