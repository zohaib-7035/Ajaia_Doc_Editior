# Submission — Ajaia Docs

**Candidate:** Muhammad Zohaib Shahid
**Live app:** https://ajaia-docs-orcin-sigma.vercel.app
**Video walkthrough:** https://drive.google.com/file/d/1M_nw_lPX7arHQmAg3aByxQDJxFzOXeXp/view?usp=sharing (also in `VIDEO_URL.txt`)
**Source:** this folder

## Test accounts (no passwords, pick on the sign-in screen)
- alice@ajaia.dev · bob@ajaia.dev · carol@ajaia.dev
- Sharing test: Alice creates and shares with bob@ajaia.dev → open an incognito window as Bob → see it under **Shared with me**.

## What's included
| File / folder | Contents |
|---|---|
| `README.md` | Features, local setup, run, test, deploy |
| `ARCHITECTURE.md` | Architecture, priorities, tradeoffs, next steps |
| `AI_WORKFLOW.md` | AI tools, where they helped, what I changed or rejected, verification |
| `SUBMISSION.md` | This file |
| `VIDEO_URL.txt` | Walkthrough video link |
| `docs/plan.md` | Plan written in the first 45 minutes (scope, timeline, risks) |
| `src/` | Next.js app: UI, API route handlers, access and import logic |
| `tests/` | 17 Vitest tests (access control, file import incl. a real .docx) |
| `supabase/schema.sql` | Database schema + seed users |
| `samples/` | .md / .docx / .txt files to try the import |
| `.env.example` | Required environment variables (no secrets) |

## Status
**Working end-to-end:** sign-in as a demo user · create / rename / delete · rich text (bold, italic, underline, H1–H3, bulleted and numbered lists, undo/redo) · autosave + reopen with formatting intact · import .txt/.md/.docx (≤1 MB) as a new doc · share by email, view and remove access · owned vs shared lists · server-side permission checks · validation and error states · automated tests · Vercel deployment.

**Intentionally not built:** real-time co-editing, comments, version history, viewer-only role, real auth. Reasons are in `ARCHITECTURE.md`.

**Next 2–4 hours:** real auth + RLS policies, viewer role, stale-save detection, Markdown/PDF export, Playwright e2e test of the share flow.
