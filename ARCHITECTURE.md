# Architecture Note

## What I built
A Next.js app where seeded users create, format, import and share documents, backed by Supabase Postgres and deployed on Vercel.

```
Browser ── Next.js pages (React + TipTap editor + Tailwind)
   │ fetch JSON (cookie: demo user id)
   ▼
Next.js Route Handlers  /api/session /api/users /api/docs /api/docs/[id] /api/docs/[id]/shares /api/import
   │ requireUser() → Zod validation → access rules (src/lib/access.ts)
   ▼
Supabase Postgres (server-only secret key)
   users · documents(content jsonb) · document_shares(document_id, user_id)
```

## What I prioritized, and why
The brief rewards **depth in a few areas** and **working end-to-end** over breadth, so I ranked by "can a reviewer test it in 2 minutes":

1. **Editing that feels coherent:** toolbar with active states, keyboard shortcuts, heading dropdown, autosave with visible status, warning on leaving with unsaved changes.
2. **Sharing with real enforcement:** permissions are checked on the server on every request, not just hidden in the UI.
3. **Import that produces genuinely editable docs:** `.docx`, `.md` and `.txt` keep headings, bold/italic and lists.
4. **Tests on the logic most likely to break silently:** access rules and file conversion.

## Key decisions and tradeoffs
| Decision | Why | Tradeoff accepted |
|---|---|---|
| **Next.js full stack (one repo, one deploy)** | Fastest path to a live URL; API and UI share types | Not a separate scalable backend, which this scope doesn't need |
| **TipTap (ProseMirror)** | Required formatting comes built in; stores structured JSON | Larger client bundle (~240 KB first load on the editor page) |
| **Store content as editor JSON (jsonb)** | Formatting round-trips exactly; no HTML sanitizing on read | Not directly human-readable in the DB |
| **Import: server → HTML, browser → editor schema** | One pipeline for 3 formats; the editor schema drops scripts and unknown tags, which acts as a sanitizer | Complex Word features (tables, images, comments) are dropped |
| **Mocked auth (pick a seeded user, httpOnly cookie)** | The brief allows it; lets reviewers test sharing in seconds | Anyone can pick any user, so not for real data |
| **Access logic as pure functions (`access.ts`)** | Unit-testable with no database; one place to audit | DB queries must remember to call it (centralized in `docs.ts`) |
| **No-access returns 404, not 403** | Doesn't reveal that a document id exists | Slightly less specific error message |
| **RLS on with no policies** | Defense in depth: a leaked public anon key reads nothing | All access must go through our API |
| **Autosave: 800 ms debounce, last-write-wins** | Simple and predictable | Two people editing at the same moment can overwrite each other |
| **Shared users = editors** (no viewer role) | Smallest model that meets "grant access" | Can't share read-only yet |

## Deliberately cut
- **Real-time co-editing:** needs CRDT/Yjs plus a websocket server. It's the biggest effort item and wasn't required.
- **Comments, version history, attachments:** stretch items; core quality mattered more.
- **Real authentication:** documented as the first production step.

## Security and privacy (Ajaia's healthcare context)
- The secret key is server-only (`import "server-only"`), and `.env*` is gitignored.
- Logs carry error messages only, never document content.
- Inputs are validated with Zod. Size limits: 1 MB uploads, 500 KB documents, 200-char titles.
- **Not PHI-ready.** That would need real auth (SSO/MFA), RLS policies per user, audit logging, encryption review and a BAA with the hosting providers.

## Next 2–4 hours
1. Supabase Auth (magic link) replacing mocked login, with RLS policies mirroring `access.ts`.
2. Viewer vs editor roles. The `can.*` functions already make this a small change.
3. Optimistic concurrency: send `updated_at`, reject stale saves, and show a "doc changed, reload?" prompt.
4. Export to Markdown/PDF.
5. Playwright e2e test for the Alice → Bob share flow.
