# Daily Dice Roll

A daily dice roll web app built with Next.js, Supabase, Vercel, and Tailwind. Authenticated users roll 5 six-sided dice once per day — roll 5 of a kind to enter the winner pool.

## Setup

### 1. Environment variables

Copy the example env file:

```bash
cp .env.example .env.local
```

Fill in the values:

| Variable | Where to get it                                                                                                                                                                |
|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard > Project Settings > API > Project URL                                                                                                                      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard > Project Settings > API > Project API keys > `anon` `public`                                                                                               |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard > Project Settings > API > Project API keys > `service_role` `secret`                                                                                       |
| `ROLL_WINDOW_CLOSE_HOUR` | The UTC hour (0-23) when the daily roll window closes. Defaults to `7` (7 am UTC / 12 am PDT).                                                                                 |
| `CRON_SECRET` | A random secret string you generate (e.g. `openssl rand -hex 32`). Used to authenticate the daily cron job endpoint. Must match the value set in Vercel environment variables. |

The `NEXT_PUBLIC_` prefixed variables are exposed to the browser — this is intentional and safe. The anon key is designed to be public; it only grants access allowed by your Row Level Security policies. The `SUPABASE_SERVICE_ROLE_KEY` is **never** exposed to the browser and bypasses RLS — keep it secret.

### 2. Install dependencies

```bash
npm install
```

### 3. Run the dev server

```bash
npm run dev
```

This starts Next.js on `http://localhost:3000`.

## Network binding and security

By default, `npm run dev` runs with `--hostname localhost`, which binds the dev server to `127.0.0.1` only. This means the server is **not accessible** from other devices on your network. This is intentional — on public wifi or shared networks, an exposed dev server leaks your application, environment variables in server-rendered pages, and potentially your Supabase service role key through server actions.

### Exposing to your local network

If you need to access the dev server from another device (e.g. testing on a phone, or from a VM), change the dev script in `package.json`:

```json
"dev": "next dev --hostname 0.0.0.0",
```

`0.0.0.0` binds to all network interfaces, making the server accessible at your machine's local IP (e.g. `http://192.168.1.x:3000`).

**When this is useful:**
- Testing on a physical mobile device
- Accessing from a local VM or container
- Showing your work to someone on the same network

**When to avoid it:**
- On public or untrusted wifi (coffee shops, airports, coworking spaces)
- Any time your machine is on a network you don't control

Switch it back to `--hostname localhost` when you're done. Don't commit the `0.0.0.0` change.

## Tech stack

- [Next.js](https://nextjs.org) (App Router, TypeScript)
- [Supabase](https://supabase.com) (auth + Postgres)
- [Tailwind CSS](https://tailwindcss.com) v4
- [Vercel](https://vercel.com) (deployment target)
