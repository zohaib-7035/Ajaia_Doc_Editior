# AI Workflow Note

## Tools used
- **Claude (Opus, agentic mode):** planning, scaffolding, code generation, tests, docs. Worked as a "senior engineering partner" with a running time budget.
- **Me:** scope decisions, Supabase/Vercel setup, local end-to-end testing, final review of every file.

## How I used it (process, not volume)
1. **Plan before code.** I asked for: restate the task → list ambiguities with assumptions → MUST vs NICE → simplest architecture → time plan. Output: `docs/plan.md`. I accepted the cut list (no real-time, no LLM feature) because nothing in the brief needed AI *in the product*.
2. **Decompose by risk.** Pure logic first (`access.ts`, `import.ts`) with tests, then data layer, then API, then UI. The logic most likely to break silently was tested before any UI existed.
3. **Tight loops.** Generate a module → `next build` (type check) → `vitest` → fix. The production build and 17 tests passed before I ran anything against the real database.

## Where AI materially sped things up
- Scaffold, 6 API routes, the data layer and the 3 UI screens in about 1 hour instead of an estimated 3.
- Boilerplate I'd otherwise look up: TipTap v3 toolbar state (`useEditorState`), mammoth/marked conversion, Next 15 async route params.
- Test cases for edge conditions I might have skipped: self-share, duplicate share, empty file, oversized file, corrupt `.docx`.

## What I changed or rejected
| AI output or idea | What I did | Why |
|---|---|---|
| Planned a separate `@tiptap/extension-underline` package | **Removed** | Checked installed versions: TipTap v3's StarterKit already includes Underline. A duplicate would register the extension twice. |
| Autosave as a plain debounce | **Strengthened** with an in-flight guard and re-save of pending edits | A plain debounce can drop edits typed while a save is in progress |
| Convert imported files straight to stored HTML | **Rejected.** HTML goes through the editor schema (`generateJSON`) before saving. | Sanitizes scripts and unknown markup, and keeps one storage format |
| Return 403 when a user lacks access | **Changed to 404** | Avoids confirming that a private doc id exists |
| `.docx` test using a fake string only | **Added a real Word fixture** | A string test proves the error path, not that headings, bold and lists survive |
| Supabase query embedding `owner:users(...)` | **Fixed** to `users!documents_owner_id_fkey` | Passed build and unit tests but returned 500 against the live DB: `documents`→`users` is also reachable through `document_shares`, so PostgREST rejected the embed as ambiguous. Found by a scripted API e2e run (Alice/Bob/Carol, 29 checks). |
| Pasting the database secret into chat | **Flagged as a risk.** Key goes in a gitignored `.env.local`; rotate after grading. | Healthcare-minded hygiene, even for demo data |

## How I verified correctness, UX and reliability
- **Types and build:** `next build` with strict TypeScript, zero errors.
- **Unit tests (17):** permission matrix (owner / editor / stranger), share validation, Markdown/text/Word conversion, HTML escaping, size and type limits.
- **Manual end-to-end** (local, then on the live URL): create → format → reload (formatting persists) → import each sample in `samples/` → share Alice → Bob → Bob sees it under "Shared with me" and can edit but not rename/share/delete → Carol gets "Document not found" via a direct URL.
- **UX checks:** empty states, loading states, error messages for every failed request, unsaved-changes warning, supported file types shown in the UI.

## Honest limits of AI here
- The cloud AI workspace couldn't reach Supabase or Vercel (network allowlist), so database integration was verified by me locally, not by the AI.
- AI suggestions were treated as drafts: every architectural choice above is one I can defend without the AI.
