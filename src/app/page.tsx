"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Avatar, DocGlyph } from "@/components/icons";

type User = { id: string; name: string; email: string };

export default function LoginPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    api<{ users: User[] }>("/api/users")
      .then((d) => setUsers(d.users))
      .catch((e) => setError(e.message));
  }, []);

  async function signIn(id: string) {
    setBusy(id);
    try {
      await api("/api/session", { method: "POST", body: JSON.stringify({ userId: id }) });
      router.push("/docs");
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <DocGlyph className="h-12 w-12" />
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">Ajaia Docs</h1>
          <p className="mt-1 text-slate-600">Write, format and share documents.</p>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-medium text-slate-800">Choose a demo account</h2>
          <p className="mt-1 text-sm text-slate-500">To test sharing, sign in as a different user in a second browser or a private window.</p>
          <div className="mt-4 space-y-2">
            {!users && !error && [0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}
            {users?.map((u) => (
              <button
                key={u.id}
                onClick={() => signIn(u.id)}
                disabled={busy !== null}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-blue-400 hover:bg-blue-50/40 disabled:opacity-60"
              >
                <Avatar name={u.name} className="h-10 w-10" />
                <span className="min-w-0">
                  <span className="block font-medium text-slate-800">{u.name}</span>
                  <span className="block truncate text-sm text-slate-500">{u.email}</span>
                </span>
                <span className="ml-auto text-sm text-slate-400">{busy === u.id ? "Signing in…" : "→"}</span>
              </button>
            ))}
          </div>
          {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">Demo only: mocked sign-in, no passwords. Do not store patient or personal data.</p>
      </div>
    </main>
  );
}
