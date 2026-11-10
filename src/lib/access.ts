// Pure access-control rules. No I/O, so they are easy to unit test.
export type Role = "owner" | "editor";

export interface DocAccessInput {
  ownerId: string;
  sharedWith: string[]; // user ids with access
}

/** Returns the user's role on a document, or null if they have no access. */
export function roleFor(doc: DocAccessInput, userId: string): Role | null {
  if (doc.ownerId === userId) return "owner";
  if (doc.sharedWith.includes(userId)) return "editor";
  return null;
}

export const can = {
  read: (r: Role | null) => r !== null,
  editContent: (r: Role | null) => r === "owner" || r === "editor",
  rename: (r: Role | null) => r === "owner",
  share: (r: Role | null) => r === "owner",
  delete: (r: Role | null) => r === "owner",
};

/** Validates a share request before it touches the database. */
export function validateShare(
  ownerId: string,
  target: { id: string } | null,
  alreadyShared: string[],
): { ok: true } | { ok: false; status: number; error: string } {
  if (!target) return { ok: false, status: 404, error: "No user with that email. Try one of the seeded accounts." };
  if (target.id === ownerId) return { ok: false, status: 400, error: "You already own this document." };
  if (alreadyShared.includes(target.id)) return { ok: false, status: 409, error: "Already shared with this user." };
  return { ok: true };
}
