# Supabase Setup for Codewords

Supabase provides free persistent user accounts. Without it, the app runs in guest-only mode (names are saved in sessionStorage, no cross-device scores).

---

## Step 1 – Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **Start your project** (free tier)
2. Sign in with GitHub
3. **New project** → choose a name (e.g. `codewords`) and a strong password → **Create project**
4. Wait ~2 minutes for the project to provision

---

## Step 2 – Get your API keys

In the Supabase dashboard:
1. Go to **Settings → API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Step 3 – Create the profiles table

In the Supabase dashboard → **SQL Editor** → **New query**, paste and run:

```sql
-- Profiles table (one row per user)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE NOT NULL,
  total_score int DEFAULT 0,
  games_played int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Row-level security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read profiles (for leaderboards)
CREATE POLICY "Public profiles are readable"
  ON profiles FOR SELECT USING (true);

-- Users can only write their own profile
CREATE POLICY "Users manage own profile"
  ON profiles FOR ALL USING (auth.uid() = id);
```

---

## Step 4 – Configure email auth (optional)

By default Supabase sends a confirmation email on sign-up.

- To **disable** email confirmation (easier for dev/testing):
  Go to **Authentication → Settings** → toggle off **Enable email confirmations**

- To **enable magic link** login instead of password:
  Go to **Authentication → Providers → Email** → enable **Magic Link**

---

## Step 5 – Add env vars to Railway (or .env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Redeploy the web service. The **Sign in / Create Account** button will appear on the home page.

---

## How it works in the app

- **Sign up**: creates a Supabase auth user + inserts a row in `profiles` with the chosen username
- **Sign in**: authenticates via Supabase, loads username from `profiles`
- **Guest mode**: if Supabase vars are missing or the user skips sign-in, a guest session is stored in `sessionStorage` — names work but scores don't persist
- **Scores**: tracked server-side per game session (not yet persisted to Supabase — coming soon)
