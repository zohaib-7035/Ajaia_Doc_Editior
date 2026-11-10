import "server-only";
import { z } from "zod";
import { db } from "./db";
import { HttpError, User } from "./http";
import { can, Role, roleFor, validateShare } from "./access";

const MAX_CONTENT_BYTES = 500_000;

export const titleSchema = z.string().trim().min(1, "Title cannot be empty").max(200, "Title is too long");

// TipTap JSON document. We check the shape and size; the editor schema handles the rest.
export const contentSchema = z
  .object({ type: z.literal("doc"), content: z.array(z.any()).optional() })
  .passthrough()
  .refine((c) => JSON.stringify(c).length <= MAX_CONTENT_BYTES, "Document is too large");

export const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] };

function check(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

/** Loads a document and the caller's role. 404 (not 403) when no access, so ids don't leak. */
async function loadWithRole(docId: string, user: User) {
  const { data: doc, error } = await db()
    .from("documents")
    // Explicit FK: documents↔users is also reachable via document_shares, which makes a bare embed ambiguous.
    .select("id,title,content,owner_id,updated_at,owner:users!documents_owner_id_fkey(name,email)")
    .eq("id", docId)
    .maybeSingle();
  check(error);
  if (!doc) throw new HttpError(404, "Document not found");
  const { data: shares, error: sErr } = await db()
    .from("document_shares")
    .select("user_id")
    .eq("document_id", docId);
  check(sErr);
  const sharedWith = (shares ?? []).map((s) => s.user_id as string);
  const role = roleFor({ ownerId: doc.owner_id, sharedWith }, user.id);
  if (!can.read(role)) throw new HttpError(404, "Document not found");
  return { doc, role: role as Role, sharedWith };
}

export async function listDocs(user: User) {
  const [owned, shared] = await Promise.all([
    db()
      .from("documents")
      .select("id,title,updated_at")
      .eq("owner_id", user.id)
      .order("updated_at", { ascending: false }),
    db()
      .from("document_shares")
      .select("documents(id,title,updated_at,owner:users!documents_owner_id_fkey(name,email))")
      .eq("user_id", user.id),
  ]);
  check(owned.error);
  check(shared.error);
  const sharedDocs = (shared.data ?? [])
    .map((r) => r.documents as unknown as { id: string; title: string; updated_at: string; owner: { name: string } })
    .filter(Boolean)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  return { owned: owned.data ?? [], shared: sharedDocs };
}

export async function getDoc(docId: string, user: User) {
  const { doc, role } = await loadWithRole(docId, user);
  return { ...doc, role };
}

export async function createDoc(user: User, title: string, content: unknown) {
  const { data, error } = await db()
    .from("documents")
    .insert({ owner_id: user.id, title, content })
    .select("id")
    .single();
  check(error);
  return data!;
}

export async function updateDoc(docId: string, user: User, patch: { title?: string; content?: unknown }) {
  const { role } = await loadWithRole(docId, user);
  if (patch.title !== undefined && !can.rename(role)) throw new HttpError(403, "Only the owner can rename");
  if (patch.content !== undefined && !can.editContent(role)) throw new HttpError(403, "You cannot edit this document");
  const { data, error } = await db()
    .from("documents")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", docId)
    .select("updated_at")
    .single();
  check(error);
  return data!;
}

export async function deleteDoc(docId: string, user: User) {
  const { role } = await loadWithRole(docId, user);
  if (!can.delete(role)) throw new HttpError(403, "Only the owner can delete");
  check((await db().from("documents").delete().eq("id", docId)).error);
}

export async function listShares(docId: string, user: User) {
  const { role } = await loadWithRole(docId, user);
  const { data, error } = await db()
    .from("document_shares")
    .select("user:users(id,name,email)")
    .eq("document_id", docId);
  check(error);
  return { canManage: can.share(role), people: (data ?? []).map((r) => r.user) };
}

export async function shareDoc(docId: string, user: User, email: string) {
  const { role, sharedWith } = await loadWithRole(docId, user);
  if (!can.share(role)) throw new HttpError(403, "Only the owner can share");
  const { data: target, error } = await db()
    .from("users")
    .select("id,name,email")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  check(error);
  const v = validateShare(user.id, target, sharedWith);
  if (!v.ok) throw new HttpError(v.status, v.error);
  check((await db().from("document_shares").insert({ document_id: docId, user_id: target!.id })).error);
  return target!;
}

export async function unshareDoc(docId: string, user: User, targetId: string) {
  const { role } = await loadWithRole(docId, user);
  if (!can.share(role)) throw new HttpError(403, "Only the owner can change sharing");
  check((await db().from("document_shares").delete().eq("document_id", docId).eq("user_id", targetId)).error);
}
