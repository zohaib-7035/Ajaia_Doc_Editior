# Project Plan — Ajaia Docs (lightweight collaborative editor)

**Timebox:** 4h (≈22:45 → 02:45 PKT). Rule: core first, stretch only if core is green by 01:35.

## 1. Scope
| | Feature | Status target |
|---|---|---|
| MUST | Mocked login: pick a seeded user (Alice / Bob / Carol) | core |
| MUST | Docs list split into **Owned by me** and **Shared with me** | core |
| MUST | Create, rename (owner), open, delete (owner) | core |
| MUST | Rich text: bold, italic, underline, H1–H3, bullet + numbered lists, undo/redo | core |
| MUST | Autosave (debounced) with Saving / Saved / Error indicator | core |
| MUST | Import `.txt` / `.md` / `.docx` (≤ 1 MB) → new editable doc | core |
| MUST | Share by email with seeded user, list + revoke access (owner only) | core |
| MUST | Server-side access checks, Zod validation, friendly errors | core |
| MUST | Vitest tests: access rules + file import | core |
| MUST | Deployed on Vercel, README, architecture note, AI note, SUBMISSION.md, video link | delivery |
| NICE | Export to Markdown | stretch #1 |
| NICE | Viewer vs editor roles | stretch #2 |
| CUT | Real-time co-editing, comments, version history, real auth, attachments | documented as next steps |

## 2. Architecture
```
Browser (Next.js + TipTap editor, Tailwind)
   │  fetch JSON
   ▼
Next.js Route Handlers (/api/*)  ── cookie = seeded user id (mocked auth)
   │  requireUser() → access.ts rules → Zod validation
   ▼
Supabase Postgres (server-only secret key; RLS on, no policies → anon key reads nothing)
   tables: users, documents(content jsonb), document_shares
```
- Content stored as **TipTap JSON** (jsonb) → formatting preserved exactly.
- Import: server converts file → HTML (mammoth / marked / escaped text) → browser turns HTML into TipTap JSON through the editor schema (strips unsafe markup) → saved as a new doc.
- No access → **404** (not 403) so document ids don't leak.

## 3. File map
```
src/lib/access.ts   pure access rules (tested)
src/lib/import.ts   file → HTML conversion + limits (tested)
src/lib/docs.ts     data access + permission enforcement
src/lib/http.ts     mocked auth, error wrapper
src/app/api/...     route handlers
src/app/page.tsx    login (pick user)
src/app/docs/...    list + editor pages
docs/               plan, decisions, AI log
```

## 4. Timeline
| By (PKT) | Milestone |
|---|---|
| 23:35 | Plan + Supabase schema ✅ |
| 00:20 | API + lib done, unit tests passing |
| 00:55 | UI: login, list, editor, autosave |
| 01:20 | Import + sharing UI |
| 01:35 | **Core complete** → zip to user |
| 02:00 | User runs locally → GitHub → Vercel; smoke test Alice→Bob share |
| 02:25 | README, ARCHITECTURE, AI_WORKFLOW, SUBMISSION |
| 02:45 | Video recorded, submitted |

## 5. Risks & mitigations
| Risk | Mitigation |
|---|---|
| Cloud workspace can't reach Supabase/Vercel | Build + test here with unit tests; user runs e2e locally and deploys |
| Mocked auth = anyone can pick any user | Stated clearly; real Supabase Auth is next step |
| Imported HTML XSS | Never render raw HTML; TipTap schema filters it |
| Secret key leakage | Server-only module, `.env*` gitignored; rotate key after grading |
| Autosave races | Debounce 800ms, last-write-wins (documented) |
| Healthcare context | Demo data only, no PHI; logs carry error messages, never document content |
