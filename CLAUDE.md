# CLAUDE.md — Handoff context for Ajaia Docs

You are continuing a **timed take-home assessment** for Muhammad Zohaib Shahid (final-year Data Science student, Python/TS/React/Next.js/Supabase).
Previous work was done by Claude (cloud session) which could not run commands on this PC or reach Supabase/Vercel. **You (in VS Code) can run the terminal — do the remaining verification and deployment.**

**Hard deadline: ~02:45 PKT (Asia/Karachi), Wed 2026-11-11.** If time runs out, the latest submission is auto-submitted. Prefer shipping over polishing. No new features unless every item in "Remaining" is done.

---

## 1. The assignment (Ajaia LLC — AI-Native Full Stack Developer)
Build a lightweight **Google-Docs-style collaborative editor**. Required:
1. **Docs:** create, rename, edit in browser, save and reopen. Rich text: bold, italic, underline, headings, bulleted/numbered lists.
2. **File upload:** at least one product-relevant upload (we chose: import .txt/.md/.docx → new editable doc). Supported types must be stated in UI + README.
3. **Sharing:** document owner, grant access to another user, visible distinction owned vs shared. Mocked/seeded users allowed.
4. **Persistence:** survives refresh, formatting preserved, sharing demonstrable.
5. **Quality:** setup/run instructions, **working deployment**, validation + error handling, ≥1 meaningful automated test, short architecture note.
6. **AI workflow note:** tools used, where AI sped things up, what AI output was changed/rejected, how correctness was verified.
7. **Walkthrough video** 3–5 min (Loom/YouTube unlisted): main flow, what works, what was deprioritized, key decisions, how AI helped.

**Deliverables (one Google Drive folder):** source code, README.md, architecture note, AI workflow note, SUBMISSION.md, live URL, text file with video URL, screenshots if setup needs extra steps. Also give test accounts.
Reviewers must not need to pay for anything. Graded on: product judgment, full-stack execution, editor quality, upload + sharing, deployment, code clarity, prioritization, communication, mature AI use.

## 2. Stack and architecture
- **Next.js 15 (App Router) + TypeScript + Tailwind v4**, one repo/one deploy.
- **TipTap v3** editor (StarterKit already includes Underline — do NOT add `@tiptap/extension-underline`).
- **Supabase Postgres** via `@supabase/supabase-js`, **server-only** secret (service_role) key.
- **Zod** validation, **mammoth** (.docx→HTML), **marked** (.md→HTML), **Vitest** tests.
- Mocked auth: httpOnly cookie `ajaia_uid` = seeded user id, verified against DB each request.

```
Browser (React + TipTap) → /api/* route handlers → requireUser() → Zod → access.ts rules → Supabase
```
Content is stored as TipTap JSON in `documents.content` (jsonb). Import flow: server converts file → HTML; browser runs `generateJSON(html, extensions)` (editor schema = sanitizer) → POST /api/docs.

## 3. File map
```
src/lib/access.ts        pure permission rules: roleFor, can.*, validateShare   (tested)
src/lib/import.ts        fileToHtml, textToHtml, limits (1 MB, .txt/.md/.docx)   (tested)
src/lib/docs.ts          all DB access; every op calls loadWithRole → 404 if no access
src/lib/http.ts          requireUser (mocked auth), handle() error wrapper, HttpError
src/lib/db.ts            Supabase client (server-only)
src/lib/editor.ts        TipTap extensions (shared by editor + import)
src/lib/api.ts           client fetch helper (401 → redirect to /)
src/app/page.tsx         sign-in: pick Alice/Bob/Carol
src/app/docs/page.tsx    list: "Owned by me" / "Shared with me", New, Import
src/app/docs/[id]/page.tsx  editor: title rename (owner), autosave 800ms, share, delete
src/components/          Header, Toolbar, SharePanel
src/app/api/session      POST sign-in, GET me, DELETE sign-out
src/app/api/users        GET seeded users
src/app/api/docs         GET list, POST create
src/app/api/docs/[id]    GET, PATCH {title|content}, DELETE
src/app/api/docs/[id]/shares  GET, POST {email}, DELETE {userId}
src/app/api/import       POST multipart file → {title, html}   (runtime nodejs)
tests/access.test.ts, tests/import.test.ts, tests/fixtures/sample.docx
supabase/schema.sql      tables + RLS on (no policies) + seed users (idempotent)
samples/                 meeting-notes.md, care-plan-template.docx, plain.txt
docs/plan.md             plan from the first 45 min (process evidence)
README.md ARCHITECTURE.md AI_WORKFLOW.md SUBMISSION.md VIDEO_URL.txt
setup.bat                one-click local setup (Windows)
.vercelignore            keeps .env* and env.local.txt out of uploads
```

## 4. Permission model
| Role | read | edit content | rename | share/unshare | delete |
|---|---|---|---|---|---|
| owner | ✓ | ✓ | ✓ | ✓ | ✓ |
| editor (shared) | ✓ | ✓ | ✗ | ✗ | ✗ |
| no access | 404 | 404 | 404 | 404 | 404 |

## 5. Database (Supabase project ref `wdbomgcwdwheivbdhtwu`, already created)
Tables `users`, `documents`, `document_shares` exist; 3 seeded users: alice@ajaia.dev, bob@ajaia.dev, carol@ajaia.dev.
Env vars (in `.env.local`, gitignored — **never print, commit or upload the key**):
```
SUPABASE_URL=https://wdbomgcwdwheivbdhtwu.supabase.co
SUPABASE_SECRET_KEY=<service_role key, already in .env.local>
```

## 6. Status
**Done and verified in the cloud workspace:** `next build` passes with zero type errors; `npm test` = 17/17 passing; all features coded; docs written.
**Done on this PC:** `npm install` OK (Node v23 → harmless EBADENGINE warnings). `npm run dev` started.
**Last known bug:** `/api/users` returned 500 "SUPABASE_URL and SUPABASE_SECRET_KEY must be set" because the key file was still named `env.local.txt`. Fix: `Rename-Item env.local.txt .env.local` then restart `npm run dev`. **Verify this first.**
**NOT yet verified anywhere:** the real Supabase round-trip (create/save/share/import against the live DB).

## 7. Remaining tasks (in order)
1. **Local e2e check** (`npm run dev`, http://localhost:3000):
   - Alice → New document → type, bold/italic/underline, H1, both lists → wait for "All changes saved" → refresh → formatting persists.
   - Rename title (blur/Enter) → persists.
   - Import each file in `samples/` → becomes a new doc with formatting. Try a .pdf → clear "Unsupported file type" error.
   - Share with bob@ajaia.dev; try alice@ (own), a duplicate, and nobody@x.com → each gives a clear error.
   - Switch user → Bob → doc under "Shared with me" with "Shared by Alice" → Bob can edit text; title input disabled; no Delete button.
   - Carol → open the doc URL directly → "Document not found".
   - Fix any bug found; keep `npm test` and `npx next build` green.
2. **Deploy to Vercel** (Vercel CLI, no GitHub required):
   ```
   npx vercel login
   npx vercel --yes
   npx vercel env add SUPABASE_URL production
   npx vercel env add SUPABASE_SECRET_KEY production
   npx vercel --prod
   ```
   Then repeat the Alice→Bob check on the live URL (use a private window for Bob).
3. **Fill placeholders:** replace `<VERCEL_URL>` in README.md and SUBMISSION.md; `<GITHUB_URL>` in SUBMISSION.md (or remove that line if no GitHub); video URL in VIDEO_URL.txt once recorded.
4. Optional GitHub: `git init`, commit, push to a new public repo (confirm `.env.local` is NOT tracked: `git ls-files | findstr env` should show only `.env.example`).
5. **Video (user records)** — script in §9.
6. **Submission:** Google Drive folder with the project **without** `node_modules`, `.next`, `.env.local`, `env.local.txt`. Paste the Markdown submission (SUBMISSION.md content + live URL + Drive link + video URL) into the portal; portal limit 1000 lines.
7. **After grading:** rotate the Supabase service_role key (it was pasted into a chat once).

## 8. Rules for you
- Be concise; working code over explanations. Smallest fix that works.
- Do not add features (real-time, comments, versions, roles) unless all of §7 is done and >30 min remain. If so, best stretch = "Export to Markdown" (~20 min).
- Never log document content; never expose the secret key to the client (no `NEXT_PUBLIC_`).
- If you change behavior, update README/ARCHITECTURE accordingly and add a line to the AI_WORKFLOW "changed or rejected" table if it was an AI-caused fix.

## 9. Video script (3–5 min)
1. (20s) Who I am; what I built: lightweight doc editor, Next.js + Supabase on Vercel.
2. (90s) Demo: Alice signs in → new doc → formatting → autosave → refresh persists → rename → import `meeting-notes.md` and the .docx → share with Bob → private window as Bob → "Shared with me", edits, can't rename/delete → Carol gets "not found".
3. (45s) Decisions: TipTap JSON storage; import through editor schema (sanitizes); access rules as pure tested functions; 404 instead of 403; RLS on with no policies.
4. (30s) Deprioritized: real-time co-editing, comments, version history, real auth, viewer role — and why.
5. (40s) AI: planned with Claude (assumptions, MUST/NICE, timeline), generated modules in a build→test loop; what I changed: duplicate Underline extension removed, autosave race fixed, 404 vs 403, real .docx fixture; verified via build, 17 tests, manual e2e.
6. (15s) Next 2–4h: real auth + RLS policies, viewer role, stale-save detection, export.
