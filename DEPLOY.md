# Deploying Recruit Ready

The app is a static Vite build (`npm run build` → `dist/`) with client-side
routing. `vercel.json` configures the build and an SPA fallback so deep links
like `/schools` resolve to `index.html` instead of 404ing.

## Vercel (one-time setup)

1. In Vercel, "Add New Project" and import `owenwilson-ops/capture_market`.
2. Pick the branch to deploy (`claude/gallant-knuth-Qwwau`, or `main` after merge).
   Vercel auto-detects the Vite settings from `vercel.json`.
3. Add Environment Variables (Project Settings → Environment Variables):
   - `VITE_SUPABASE_URL` — your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — your Supabase anon key
   - `VITE_PARSE_API_KEY` — your parse.bot key (optional; enables live Stat Leaders)
4. Deploy. Vercel gives you the app link (`https://<project>.vercel.app`).

Without the Supabase variables the app builds and loads but cannot get past the
login screen, since auth runs through Supabase.

## Refreshing the data before a deploy

Roster and coaching data are baked into `src/data/rosterData.js` at build time.
To pull the latest from the school athletics sites, run `npm run refresh-data`
and commit the regenerated file. For stat leaders, set `PARSE_API_KEY` and run
`npm run fetch-stats`.

## Netlify alternative

Same `dist` output. Set build command `npm run build`, publish directory
`dist`, the same environment variables, and add an SPA redirect
(`/* /index.html 200`).
