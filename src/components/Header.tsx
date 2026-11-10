"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Avatar, DocGlyph } from "./icons";

export type Me = { id: string; name: string; email: string };

export function useMe() {
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => {
    api<{ user: Me }>("/api/session").then((d) => setMe(d.user)).catch(() => {});
  }, []);
  return me;
}

export function Header({ me, children, wide }: { me: Me | null; children?: React.ReactNode; wide?: boolean }) {
  async function signOut() {
    await api("/api/session", { method: "DELETE" }).catch(() => {});
    window.location.href = "/";
  }
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className={`mx-auto flex h-14 items-center gap-3 px-4 ${wide ? "" : "max-w-6xl"}`}>
        <Link href="/docs" className="flex shrink-0 items-center gap-2" title="All documents">
          <DocGlyph className="h-7 w-7" />
          <span className={`text-[17px] font-semibold tracking-tight text-slate-800 ${children ? "hidden sm:inline" : ""}`}>Ajaia Docs</span>
        </Link>
        <div className="flex min-w-0 flex-1 items-center gap-2">{children}</div>
        {me && (
          <div className="flex shrink-0 items-center gap-2 border-l border-slate-200 pl-3 text-sm">
            <Avatar name={me.name} />
            <div className="hidden leading-tight lg:block">
              <div className="font-medium text-slate-800">{me.name}</div>
              <div className="text-xs text-slate-500">{me.email}</div>
            </div>
            <button onClick={signOut} className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800">
              Switch user
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
