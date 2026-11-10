"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Avatar, IconX } from "./icons";

type Person = { id: string; name: string; email: string };

export function SharePanel({ docId, ownerName, onClose }: { docId: string; ownerName: string; onClose: () => void }) {
  const [people, setPeople] = useState<Person[] | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const d = await api<{ canManage: boolean; people: Person[] }>(`/api/docs/${docId}/shares`);
    setPeople(d.people);
    setCanManage(d.canManage);
  }
  useEffect(() => {
    load().catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId]);

  async function share(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api(`/api/docs/${docId}/shares`, { method: "POST", body: JSON.stringify({ email }) });
      setEmail("");
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function revoke(userId: string) {
    setError(null);
    try {
      await api(`/api/docs/${docId}/shares`, { method: "DELETE", body: JSON.stringify({ userId }) });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-start justify-center bg-slate-900/40 p-4 pt-20 backdrop-blur-[1px]" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Share document">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-slate-900">{canManage ? "Share document" : "People with access"}</h2>
          <button onClick={onClose} className="ml-auto rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Close"><IconX /></button>
        </div>

        {canManage && (
          <form onSubmit={share} className="mt-5 flex gap-2">
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Add people by email, e.g. bob@ajaia.dev"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <button disabled={busy} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
              {busy ? "Sharing…" : "Share"}
            </button>
          </form>
        )}
        {canManage && <p className="mt-2 text-xs text-slate-500">Demo accounts: alice@, bob@, carol@ajaia.dev. People you share with can edit, but can&apos;t rename, share or delete.</p>}
        {error && <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <h3 className="mt-6 text-sm font-medium text-slate-800">People with access</h3>
        <ul className="mt-2 divide-y divide-slate-100">
          <li className="flex items-center gap-3 py-2.5 text-sm">
            <Avatar name={ownerName} />
            <span className="font-medium text-slate-800">{ownerName}</span>
            <span className="ml-auto text-slate-500">Owner</span>
          </li>
          {people?.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-2.5 text-sm">
              <Avatar name={p.name} />
              <span className="min-w-0">
                <span className="block font-medium text-slate-800">{p.name}</span>
                <span className="block truncate text-xs text-slate-500">{p.email}</span>
              </span>
              <span className="ml-auto text-slate-500">Editor</span>
              {canManage && (
                <button onClick={() => revoke(p.id)} className="rounded-md px-2 py-1 text-red-600 hover:bg-red-50">Remove</button>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">Done</button>
        </div>
      </div>
    </div>
  );
}
