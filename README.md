# Ajaia Docs

A lightweight collaborative document editor: create, format, import, and share documents.

**Live demo:** https://ajaia-docs-orcin-sigma.vercel.app · **Walkthrough video:** see `VIDEO_URL.txt`

## Demo accounts (mocked auth, no passwords)
| Name | Email |
|---|---|
| Alice | alice@ajaia.dev |
| Bob | bob@ajaia.dev |
| Carol | carol@ajaia.dev |

**Test sharing in 60 seconds:** sign in as Alice → **New document** → type something → **Share** → `bob@ajaia.dev`. Open a private/incognito window, sign in as Bob → the doc appears under **Shared with me**. Bob can edit; only Alice can rename, share or delete.

## Features
- **Documents:** create, rename (owner), open, delete (owner), autosave with saved/unsaved/error status
- **Rich text:** bold, italic, underline, headings 1–3, bulleted and numbered lists, undo/redo (keyboard shortcuts work)
- **File import:** `.txt`, `.md`, `.docx` up to **1 MB** → becomes a new editable document. Other types are rejected with a clear message. Try the files in `samples/`.
- **Sharing:** owner shares by email with another seeded user, sees who has access, can remove access. Docs list separates **Owned by me** and **Shared with me**.
- **Persistence:** Supabase Postgres. Content stored as editor JSON, so formatting survives reloads exactly.

## Run locally
Requires Node 20+ and a free Supabase project.

1. **Database:** in Supabase → SQL Editor, run `supabase/schema.sql` (creates tables + seeds 3 users).
2. **Env:** copy `.env.example` to `.env.local` and fill `SUPABASE_URL` and `SUPABASE_SECRET_KEY` (the `service_role` key).
3. **Install and run:**
   ```bash
   npm install
   npm run dev        # http://localhost:3000
   npm test           # 17 unit tests (access rules + file import)
   ```

## Deploy (Vercel)
Push to GitHub → Vercel → **Add New Project** → import repo → add the two env vars → **Deploy**. No other config needed.

## Project layout
```
src/lib/access.ts      access rules (pure, unit tested)
src/lib/import.ts      file → HTML conversion + limits (unit tested)
src/lib/docs.ts        data access; every query goes through access checks
src/lib/http.ts        mocked session + consistent JSON errors
src/app/api/*          REST route handlers
src/app/page.tsx       sign-in (pick a demo user)
src/app/docs/*         documents list + editor
supabase/schema.sql    database schema + seed
docs/                  plan, architecture, AI workflow notes
```

## Known limitations
- Mocked auth: anyone can pick any demo user. Fine for a demo; not for real data.
- No real-time co-editing: concurrent edits are last-write-wins.
- Shared users are editors; there's no viewer-only role yet.

See `ARCHITECTURE.md` for decisions and tradeoffs, and `AI_WORKFLOW.md` for how AI was used.
