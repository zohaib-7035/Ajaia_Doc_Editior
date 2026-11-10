"use client";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EditorContent, JSONContent, useEditor } from "@tiptap/react";
import { api } from "@/lib/api";
import { extensions } from "@/lib/editor";
import { Header, useMe } from "@/components/Header";
import { Toolbar } from "@/components/Toolbar";
import { SharePanel } from "@/components/SharePanel";
import { IconArrowLeft, IconCloudCheck, IconLock, IconTrash, IconUsers } from "@/components/icons";

type Doc = { id: string; title: string; content: JSONContent; role: "owner" | "editor"; owner: { name: string } };
type SaveState = "saved" | "unsaved" | "saving" | "error";

const AUTOSAVE_MS = 800;

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const me = useMe();
  const [doc, setDoc] = useState<Doc | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [save, setSave] = useState<SaveState>("saved");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<JSONContent | null>(null);
  const inFlight = useRef(false);

  // Save the latest content; if edits arrive mid-save, save again afterwards.
  const flush = useCallback(async () => {
    if (inFlight.current || !pending.current) return;
    const content = pending.current;
    pending.current = null;
    inFlight.current = true;
    setSave("saving");
    try {
      await api(`/api/docs/${id}`, { method: "PATCH", body: JSON.stringify({ content }) });
      setSaveError(null);
      setSave(pending.current ? "unsaved" : "saved");
    } catch (e) {
      pending.current ??= content; // keep it so the next edit or retry resends
      setSave("error");
      setSaveError((e as Error).message);
    } finally {
      inFlight.current = false;
      if (pending.current) timer.current = setTimeout(flush, AUTOSAVE_MS);
    }
  }, [id]);

  const editor = useEditor({
    extensions,
    immediatelyRender: false,
    editorProps: { attributes: { class: "prose-doc", "aria-label": "Document body" } },
    onUpdate: ({ editor: e }) => {
      pending.current = e.getJSON();
      setSave("unsaved");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, AUTOSAVE_MS);
    },
  });

  useEffect(() => {
    api<Doc>(`/api/docs/${id}`)
      .then((d) => {
        setDoc(d);
        setTitle(d.title);
      })
      .catch((e) => setLoadError(e.message));
  }, [id]);

  // Load content once both the doc and the editor exist (no autosave triggered).
  useEffect(() => {
    if (doc && editor && editor.isEmpty) editor.commands.setContent(doc.content, { emitUpdate: false });
  }, [doc, editor]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (save !== "saved") e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [save]);

  async function saveTitle() {
    if (!doc || title.trim() === doc.title) return setTitle(doc?.title ?? title);
    try {
      await api(`/api/docs/${id}`, { method: "PATCH", body: JSON.stringify({ title }) });
      setDoc({ ...doc, title: title.trim() });
      setTitle(title.trim());
    } catch (e) {
      setSaveError((e as Error).message);
      setTitle(doc.title);
    }
  }

  async function remove() {
    if (!confirm("Delete this document for everyone? This cannot be undone.")) return;
    try {
      await api(`/api/docs/${id}`, { method: "DELETE" });
      router.push("/docs");
    } catch (e) {
      setSaveError((e as Error).message);
    }
  }

  if (loadError)
    return (
      <>
        <Header me={me} />
        <main className="mx-auto max-w-md px-4 py-24 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <IconLock className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-semibold">{loadError}</h1>
          <p className="mt-2 text-slate-500">It may have been deleted, or it hasn&apos;t been shared with you. Ask the owner for access.</p>
          <button onClick={() => router.push("/docs")} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
            <IconArrowLeft /> Back to documents
          </button>
        </main>
      </>
    );

  const isOwner = doc?.role === "owner";
  const statusText = { saved: "All changes saved", unsaved: "Unsaved changes", saving: "Saving…", error: "Save failed. Retrying on next edit" }[save];
  const statusColor = save === "error" ? "text-red-600" : save === "saved" ? "text-slate-500" : "text-amber-600";

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <Header me={me} wide>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <input
            aria-label="Document title"
            value={title}
            disabled={!isOwner}
            title={isOwner ? "Rename document" : "Only the owner can rename"}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            maxLength={200}
            className="-ml-1.5 w-full max-w-md truncate rounded-md border border-transparent px-1.5 py-0.5 text-[15px] font-medium text-slate-800 hover:border-slate-300 focus:border-blue-500 focus:outline-none disabled:hover:border-transparent"
          />
          <div className="flex items-center gap-2 text-xs">
            <span className={`flex items-center gap-1 ${statusColor}`} aria-live="polite">
              {save === "saved" && doc && <IconCloudCheck className="h-3.5 w-3.5" />}
              {doc ? statusText : "Loading…"}
            </span>
            {doc && !isOwner && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800">Shared by {doc.owner.name} · can edit</span>
            )}
          </div>
        </div>
        {isOwner && (
          <button onClick={remove} title="Delete document" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600">
            <IconTrash /> <span className="hidden sm:inline">Delete</span>
          </button>
        )}
        {doc && (
          <button onClick={() => setSharing(true)} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
            {isOwner ? <IconLock /> : <IconUsers />} {isOwner ? "Share" : "People"}
          </button>
        )}
      </Header>

      <div className="sticky top-14 z-10 border-b border-slate-200 bg-white px-3 py-1.5">
        <div className="mx-auto flex max-w-[850px] justify-center sm:justify-start">{editor && <Toolbar editor={editor} />}</div>
      </div>

      {saveError && (
        <p className="mx-auto mt-3 w-full max-w-[816px] rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</p>
      )}

      <main className="flex-1 px-2 py-6 sm:px-4 sm:py-8">
        <div
          className="mx-auto min-h-[1056px] w-full max-w-[816px] cursor-text rounded-sm bg-white px-6 py-10 shadow-[0_1px_3px_rgba(15,23,42,0.12),0_1px_2px_rgba(15,23,42,0.06)] ring-1 ring-slate-200 sm:px-[72px] sm:py-[72px]"
          onClick={() => editor?.commands.focus()}
        >
          {!doc && <p className="text-slate-400">Loading document…</p>}
          <EditorContent editor={editor} className={doc ? "" : "hidden"} />
        </div>
      </main>

      {sharing && doc && <SharePanel docId={id} ownerName={doc.owner.name} onClose={() => setSharing(false)} />}
    </div>
  );
}
