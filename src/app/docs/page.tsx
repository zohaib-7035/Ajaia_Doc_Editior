"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { generateJSON } from "@tiptap/core";
import { api, timeAgo } from "@/lib/api";
import { extensions } from "@/lib/editor";
import { Header, useMe } from "@/components/Header";
import { DocGlyph, IconPlus, IconUpload } from "@/components/icons";

type DocRow = { id: string; title: string; updated_at: string; owner?: { name: string } };

export default function DocsPage() {
  const router = useRouter();
  const me = useMe();
  const fileRef = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<{ owned: DocRow[]; shared: DocRow[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    api<{ owned: DocRow[]; shared: DocRow[] }>("/api/docs").then(setDocs).catch((e) => setError(e.message));
  }, []);

  async function createBlank() {
    setBusy("Creating…");
    try {
      const { id } = await api<{ id: string }>("/api/docs", { method: "POST", body: "{}" });
      router.push(`/docs/${id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  }

  async function importFile(file: File) {
    setError(null);
    setBusy(`Importing ${file.name}…`);
    try {
      const form = new FormData();
      form.append("file", file);
      const { title, html } = await api<{ title: string; html: string }>("/api/import", { method: "POST", body: form });
      // Parse HTML through the editor schema: keeps supported formatting, drops anything unsafe or unknown.
      const content = generateJSON(html, extensions);
      const { id } = await api<{ id: string }>("/api/docs", { method: "POST", body: JSON.stringify({ title, content }) });
      router.push(`/docs/${id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <>
      <Header me={me} />
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <h2 className="text-sm font-medium text-slate-600">Start a new document</h2>
          <div className="mt-3 flex flex-wrap gap-4">
            <Tile onClick={createBlank} disabled={!!busy} label="Blank document">
              <IconPlus className="h-10 w-10 text-blue-600" />
            </Tile>
            <Tile onClick={() => fileRef.current?.click()} disabled={!!busy} label="Import file" hint=".txt · .md · .docx">
              <IconUpload className="h-9 w-9 text-slate-500" />
            </Tile>
          </div>
          <p className="mt-3 text-xs text-slate-500">Import supports .txt, .md and .docx up to 1 MB. Each file becomes a new editable document.</p>
          <input ref={fileRef} type="file" accept=".txt,.md,.docx" className="hidden" onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])} />
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {busy && (
          <p className="mb-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /> {busy}
          </p>
        )}
        {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <Section title="Owned by me" empty="No documents yet. Create a blank one or import a file above." docs={docs?.owned} ownerLabel="me" />
        <Section title="Shared with me" empty="Nothing has been shared with you yet." docs={docs?.shared} shared />
      </main>
    </>
  );
}

function Tile({ onClick, disabled, label, hint, children }: { onClick: () => void; disabled: boolean; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled} className="group text-left disabled:opacity-60">
      <span className="flex h-36 w-28 items-center justify-center rounded-lg border border-slate-300 bg-white transition group-hover:border-blue-500 group-hover:shadow-md sm:h-40 sm:w-32">
        {children}
      </span>
      <span className="mt-2 block text-sm font-medium text-slate-800">{label}</span>
      {hint && <span className="block text-xs text-slate-500">{hint}</span>}
    </button>
  );
}

function Section({ title, docs, empty, shared, ownerLabel }: { title: string; docs?: DocRow[]; empty: string; shared?: boolean; ownerLabel?: string }) {
  return (
    <section className="mb-10">
      <div className="mb-3 flex items-baseline gap-2">
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        {docs && <span className="text-sm text-slate-400">{docs.length}</span>}
      </div>
      {!docs ? (
        <div className="space-y-2">
          {[0, 1].map((i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-200/60" />)}
        </div>
      ) : docs.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">{empty}</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="hidden grid-cols-[1fr_180px_140px] border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-500 sm:grid">
            <span>Name</span>
            <span>Owner</span>
            <span className="text-right">Last modified</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {docs.map((d) => (
              <li key={d.id}>
                <Link href={`/docs/${d.id}`} className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 hover:bg-blue-50/50 sm:grid-cols-[1fr_180px_140px]">
                  <span className="flex min-w-0 items-center gap-3">
                    <DocGlyph shared={shared} className="h-6 w-6 shrink-0" />
                    <span className="truncate font-medium text-slate-800">{d.title}</span>
                    {shared && (
                      <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 sm:hidden">Shared</span>
                    )}
                  </span>
                  <span className="hidden truncate text-sm text-slate-600 sm:block">
                    {shared ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Shared by {d.owner?.name}</span>
                      </span>
                    ) : (
                      ownerLabel
                    )}
                  </span>
                  <span className="text-right text-xs text-slate-500 sm:text-sm">{timeAgo(d.updated_at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
