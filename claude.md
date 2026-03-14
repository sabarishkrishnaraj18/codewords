# codewords — Claude Project Instructions

## Project
Web-based Codenames multiplayer game. Players join rooms, pick teams/roles, spymaster gives clues, operatives guess word cards. Individual scoring, persistent accounts via Supabase.

**Stack:** Next.js 14 App Router + TypeScript | Tailwind CSS + Framer Motion | Socket.io standalone server | Supabase auth+DB (optional, graceful guest fallback) | api.dictionaryapi.dev dictionary

---

## How to run
```bash
cd "/Volumes/TOSHIBA EXT/claude_wd"
./start.sh        # starts socket server (port 4000) + Next.js (port 3000)
```
exFAT drive — npm `.bin` symlinks DON'T work. Always use `node path/to/bin.js` directly.

### Dev server commands (use these exactly)
```bash
# Next.js
cd apps/web && node ../../node_modules/next/dist/bin/next dev
cd apps/web && node ../../node_modules/next/dist/bin/next build

# Socket server
cd apps/socket-server && node ../../node_modules/ts-node-dev/lib/bin.js --respawn --transpile-only src/index.ts

# Install packages
npm install <package>   # from workspace root only
```

### Screenshots (verification tool)
```bash
cd /tmp/pup-test && node game_screenshot.mjs
# Uses puppeteer-core + system Chrome (installed in /tmp/pup-test — NOT in workspace, exFAT limitation)
# Outputs to /tmp/codewords_*.png — copy to workspace to view
cp /tmp/codewords_*.png "/Volumes/TOSHIBA EXT/claude_wd/"
```

---

## Permissions

### Auto-approved (do without asking)
- Edit/create files freely
- `git status` / `git diff`
- Run dev server, build, npm install
- Take screenshots, read browser console logs
- Open two tabs to test multiplayer

### Always ask first
- `git commit` or `git push`
- Delete files or folders
- Modify `.env.local` secrets
- Deploy to production
- Modify Supabase tables in production

---

## Architecture

### Pages & routing
- `/` — home (create game, join game, rejoin last room, sign-in prompt)
- `/auth` — email/password sign-up and sign-in
- `/lobby/[code]` — waiting room, role/team selection, host controls
- `/game/[code]` — active game board

### Identity & Auth
- **Per-tab session ID**: `sessionStorage` → two tabs = two independent players
- **Username**: `localStorage` (persists within a tab across refreshes)
- **Supabase (optional)**: set `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `apps/web/.env.local`
  - Without vars → guest mode (no accounts)
  - With vars → email/password auth, scores persisted to DB
- Key files: `src/contexts/AuthContext.tsx`, `src/lib/identity.ts`, `src/lib/supabase/client.ts`

### Socket server (`apps/socket-server/`)
- Standalone Node.js + Socket.io on port 4000 — ALWAYS ON, not serverless
- All game state in memory (`roomManager.ts`)
- Server-authoritative: spymaster gets real card colors, operatives get masked state
- Key files: `gameEngine.ts`, `roomManager.ts`, `timerManager.ts`, `handlers/`
- CORS: controlled by `NEXT_ORIGIN` env var

### Web app (`apps/web/`)
- State: `useGameState` hook + `gameReducer.ts`, synced via socket events
- Key hooks: `useSocket`, `useGameState`, `useRole`, `useWordDefinition`, `useLongPress`
- Socket URL: `src/lib/socket-client.ts` — reads `NEXT_PUBLIC_SOCKET_URL` env var first

### Supabase DB schema (production)
```sql
-- profiles: one row per user
profiles(id uuid PK → auth.users, username text UNIQUE, total_score int, games_played int, wins int, created_at)

-- user_game_scores: one row per player per game
user_game_scores(id bigint PK, user_id uuid → auth.users, room_code text, team text, role text, score int, won bool, created_at)
```
RLS enabled on both. Stats are queried live from `user_game_scores` (not profiles) via `useUserStats` hook.

---

## Deployment

**Platform: Railway (NOT Vercel)**
Reason: Socket.io needs persistent WebSocket connections. Vercel is serverless — functions time out, can't hold sockets.

- Two Railway services: `web` (Next.js, port 3000) and `socket-server` (port 4000)
- Each has its own Dockerfile in `apps/web/` and `apps/socket-server/`
- Environment vars to set on Railway web service:
  ```
  NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.up.railway.app
  NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
  ```
- Socket server needs: `PORT=4000`, `NEXT_ORIGIN=https://your-web-app.up.railway.app`
- **Custom domain**: Railway supports free CNAME custom domains — add in Railway dashboard → service → Settings → Domains. User needs to own a domain.

---

## Game mechanics

### Teams & roles
- Two teams: blue, red
- Roles: spymaster (gives clues, sees all card colors) or operative (guesses)
- **One spymaster per team** — enforced server-side in `lobbyHandler.ts`
- Players can freely switch teams and operative slots; spymaster slot locks when taken
- Host can kick players from lobby (× button, `kick-player` socket event)

### Card selection (two-step UX)
1. Operative taps card → highlights with gold ring (scale 1.06, `#fbbf24` shadow)
2. Green ✓ confirm button appears on card → tap to confirm guess
3. Tap again to deselect. Selection clears on card reveal.

### Blind guess mechanic
After all clue-related cards guessed → operatives get one free guess on any unrevealed card.
Individual scoring: own team +2 | opponent -1 | neutral 0 | assassin -2

### Word modes
- Standard: 400-word list (`public/words/standard.json`)
- Mix: custom + standard pooled
- Custom only: ≥25 words required

### Rejoin session
- `codewords_last_room` saved to localStorage on lobby/game entry
- Cleared from localStorage on game over
- Home page shows "Rejoin [CODE]" button when value exists

---

## Card colors (exact values — do not change)
- Unrevealed operative: `#e8d5b0` warm beige, bottom shadow `#b8a080`
- Blue revealed: `#5ba3d4`
- Red revealed: `#cd4d3c`
- Neutral revealed: `#c8a97a`
- Assassin revealed: `#2d2d2d`
- Spymaster overlay: blue `rgba(0,120,210,0.82)`, red `rgba(220,60,45,0.82)`, neutral `rgba(170,130,80,0.75)`, assassin `rgba(30,30,30,0.90)`

---

## UI/UX rules (enforced)
- **No emojis** anywhere in the UI — use inline SVG icons only
- Font: `Russo One` (font-display) for headings and card words; `Inter` for UI text
- Dark warm background: `#1e1610`, radial gradient from `#2a1e0e`
- Team panels (`TeamPanel.tsx`): `hidden md:block` — desktop only; mobile uses `MobileTeamStrip`
- All touch targets ≥ 44×44px
- Game must be fully playable on iPhone (375px), iPad (768px), desktop

---

## Key component map

| Component | File | Purpose |
|-----------|------|---------|
| Home | `src/app/page.tsx` | Create/join/rejoin, user card, sign-in prompt |
| Auth | `src/app/auth/page.tsx` | Email sign-up/sign-in |
| Lobby | `src/app/lobby/[code]/page.tsx` | Role selection, kick players, start game |
| WaitingRoom | `src/components/lobby/WaitingRoom.tsx` | Role cards UI, player list, host controls |
| Game | `src/app/game/[code]/page.tsx` | Full game page, panels, board, clue input |
| GameBoard | `src/components/game/GameBoard.tsx` | 5×4 card grid |
| WordCard | `src/components/game/WordCard.tsx` | Individual card with two-step confirm UX |
| TeamPanel | `src/components/game/TeamPanel.tsx` | Desktop side panel (players, score, clue) |
| MobileTeamStrip | `src/components/game/MobileTeamStrip.tsx` | Mobile compact team bar |
| ClueInput | `src/components/game/ClueInput.tsx` | Spymaster clue word + number entry |
| AuthContext | `src/contexts/AuthContext.tsx` | User state, sign-in/up/out, guest fallback |
| useUserStats | `src/hooks/useUserStats.ts` | Query user scores from Supabase |
| gameReducer | `src/store/gameReducer.ts` | Client-side game state reducer |
| socket-client | `src/lib/socket-client.ts` | Socket.io client singleton, URL resolution |

---

## Pending work (as of 2026-03-13)

### 1. Supabase auth — code change needed
**File:** `apps/web/src/contexts/AuthContext.tsx`
In `signUp()`, after `supabase.auth.signUp()` succeeds, upsert a row into `profiles`:
```ts
if (!error && data.user) {
  await supabase.from('profiles').upsert({ id: data.user.id, username })
}
```
Without this, new users have no profile row and scores won't aggregate correctly.

**Manual setup required by user (not code):**
1. Create free Supabase project at supabase.com
2. Run SQL from the plan to create `profiles` and `user_game_scores` tables
3. Add `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Railway web service env vars → redeploy

### 2. Mobile responsive fixes needed
- **`GameBoard.tsx` line 34**: Change `gap-2` → `gap-x-2 gap-y-4 sm:gap-2` (more row gap for confirm button clearance on mobile)
- **`WordCard.tsx` line 169**: Move confirm button from `-bottom-3 left-1/2 -translate-x-1/2` to `bottom-1.5 right-1.5` (overlay inside card, no row overflow)
- **`game/[code]/page.tsx` lines 185, 239**: Change panel `w-64` → `w-52 lg:w-64` (better fit on iPad 768px)

---

## When user provides a screenshot
1. Compare against the reference codenames.game style (warm dark bg, beige cards, Russo One font, blue/red panels)
2. Fix differences in card colors, layout, fonts, spacing
3. Verify build passes, take fresh puppeteer screenshot to confirm

## When starting a new session
1. Read this file
2. Check `git log --oneline -5` for recent work
3. Check pending work section above for what's next
4. Run `./start.sh` if dev server not running before making UI changes
